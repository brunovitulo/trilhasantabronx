
-- Reset old daily review completions table
DROP TABLE IF EXISTS public.daily_review_completions CASCADE;

CREATE TABLE public.daily_review_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_key text NOT NULL, -- ex: "apresentacao", "produtos:cosmeticos"
  review_date date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  score_total integer DEFAULT 0,
  score_correct integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, review_key, review_date)
);

CREATE INDEX daily_review_completions_user_date_idx
  ON public.daily_review_completions (user_id, review_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_review_completions TO authenticated;
GRANT ALL ON public.daily_review_completions TO service_role;
ALTER TABLE public.daily_review_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own daily review completions"
  ON public.daily_review_completions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Product revision cycle tracker (Module 7 groups)
CREATE TABLE public.product_revision_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id text NOT NULL CHECK (group_id IN ('cosmeticos','acessorios','vibradores')),
  cycle integer NOT NULL DEFAULT 1,
  phase smallint NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 3),
  cycle_anchor_date date NOT NULL, -- D+0 do ciclo atual
  sessions_done integer NOT NULL DEFAULT 0,
  last_session_at timestamptz,
  phase3_score numeric, -- 0 a 1
  group_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, group_id)
);

CREATE INDEX product_revision_progress_user_idx
  ON public.product_revision_progress (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_revision_progress TO authenticated;
GRANT ALL ON public.product_revision_progress TO service_role;
ALTER TABLE public.product_revision_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own product revision progress"
  ON public.product_revision_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.product_revision_progress_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER product_revision_progress_updated_at
  BEFORE UPDATE ON public.product_revision_progress
  FOR EACH ROW EXECUTE FUNCTION public.product_revision_progress_set_updated_at();
