DROP TABLE IF EXISTS public.review_answers CASCADE;
DROP TABLE IF EXISTS public.scheduled_reviews CASCADE;

CREATE TABLE public.daily_review_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_date date NOT NULL,
  module_ids text[] NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_review_completions TO authenticated;
GRANT ALL ON public.daily_review_completions TO service_role;

ALTER TABLE public.daily_review_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own daily review completions"
ON public.daily_review_completions
FOR ALL
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_daily_review_completions_updated_at
BEFORE UPDATE ON public.daily_review_completions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX daily_review_completions_user_date_idx
ON public.daily_review_completions (user_id, review_date DESC);