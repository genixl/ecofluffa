-- Ecofluffa feature migrations
-- Run these statements in Supabase SQL Editor (in order).

-- ── 1. Provider account approval workflow ────────────────────────────────────
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'disabled'::text));

-- Existing listed providers are treated as already approved
UPDATE public.providers
SET approval_status = 'approved'
WHERE is_listed = true;

UPDATE public.providers
SET approval_status = 'pending'
WHERE is_listed = false AND approval_status IS DISTINCT FROM 'disabled';

-- ── 2. Custom service approval workflow ──────────────────────────────────────
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved'
    CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text));

-- Catalog (default) services are always approved
UPDATE public.services
SET approval_status = 'approved'
WHERE provider_id IS NULL;

-- Provider-owned custom services require admin review
UPDATE public.services
SET approval_status = 'pending'
WHERE provider_id IS NOT NULL;

-- ── 3. Richer customer profile fields ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_pickup_notes text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS alternate_phone text NOT NULL DEFAULT ''::text;

-- ── 4. Snapshot customer contact on each order ───────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT ''::text;

-- Backfill existing orders from profiles where possible
UPDATE public.orders o
SET
  customer_phone = COALESCE(NULLIF(p.phone, ''), o.customer_phone),
  customer_name = COALESCE(NULLIF(p.full_name, ''), o.customer_name)
FROM public.profiles p
WHERE p.id = o.customer_id
  AND (o.customer_phone = '' OR o.customer_name = '');

-- ── 5. Keep provider aggregate rating in sync (if not already present) ───────
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.providers p
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(r.score)::numeric, 1)
      FROM public.ratings r
      WHERE r.provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    ), 4.5),
    review_count = (
      SELECT COUNT(*)::integer
      FROM public.ratings r
      WHERE r.provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    )
  WHERE p.id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS ratings_update_provider_stats ON public.ratings;
CREATE TRIGGER ratings_update_provider_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_rating();
