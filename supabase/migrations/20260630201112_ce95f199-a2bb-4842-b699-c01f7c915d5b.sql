CREATE TABLE IF NOT EXISTS public.product_price_cache (
  url text PRIMARY KEY,
  name text,
  price text,
  image_url text,
  summary text,
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE ON public.product_price_cache TO authenticated;
GRANT ALL ON public.product_price_cache TO service_role;

ALTER TABLE public.product_price_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_price_cache_select" ON public.product_price_cache;
CREATE POLICY "product_price_cache_select"
  ON public.product_price_cache FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "product_price_cache_insert" ON public.product_price_cache;
CREATE POLICY "product_price_cache_insert"
  ON public.product_price_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "product_price_cache_update" ON public.product_price_cache;
CREATE POLICY "product_price_cache_update"
  ON public.product_price_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
