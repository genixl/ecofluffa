-- Add delivery confirmation fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_confirmed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_confirmed_at timestamp with time zone;
