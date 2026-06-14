-- ============================================================
-- EcoFluffa — Ratings Schema
-- Run this in Supabase SQL editor AFTER running.sql
-- ============================================================

-- 1. Ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id            uuid        NOT NULL DEFAULT uuid_generate_v4(),
  order_id      text        NOT NULL,
  provider_id   uuid        NOT NULL,
  customer_id   uuid        NOT NULL,
  score         integer     NOT NULL,
  comment       text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ratings_pkey             PRIMARY KEY (id),
  CONSTRAINT ratings_order_id_unique  UNIQUE (order_id),           -- one rating per order
  CONSTRAINT ratings_score_range      CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT ratings_order_id_fkey    FOREIGN KEY (order_id)    REFERENCES public.orders(id)    ON DELETE CASCADE,
  CONSTRAINT ratings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE,
  CONSTRAINT ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id)  ON DELETE CASCADE
);

-- 2. RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings (for the browse / provider card)
CREATE POLICY "ratings_select_all"
  ON public.ratings FOR SELECT
  USING (true);

-- Only the order's customer can insert their own rating
CREATE POLICY "ratings_insert_own"
  ON public.ratings FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
        AND orders.customer_id = auth.uid()
        AND orders.status = 'delivered'
    )
  );

-- Customers can update their own rating (e.g. edit within 24 h — optional)
CREATE POLICY "ratings_update_own"
  ON public.ratings FOR UPDATE
  USING (customer_id = auth.uid());

-- 3. Function: recompute provider aggregate rating after each insert/update/delete
CREATE OR REPLACE FUNCTION public.refresh_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_provider_id uuid;
BEGIN
  -- Determine which provider to refresh
  IF TG_OP = 'DELETE' THEN
    target_provider_id := OLD.provider_id;
  ELSE
    target_provider_id := NEW.provider_id;
  END IF;

  UPDATE public.providers
  SET
    rating       = COALESCE((
                     SELECT ROUND(AVG(score)::numeric, 1)
                     FROM   public.ratings
                     WHERE  provider_id = target_provider_id
                   ), 0),
    review_count = (
                     SELECT COUNT(*)
                     FROM   public.ratings
                     WHERE  provider_id = target_provider_id
                   )
  WHERE id = target_provider_id;

  RETURN NULL;
END;
$$;

-- 4. Trigger — fire after any rating change
DROP TRIGGER IF EXISTS trg_refresh_provider_rating ON public.ratings;

CREATE TRIGGER trg_refresh_provider_rating
  AFTER INSERT OR UPDATE OR DELETE
  ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_provider_rating();
