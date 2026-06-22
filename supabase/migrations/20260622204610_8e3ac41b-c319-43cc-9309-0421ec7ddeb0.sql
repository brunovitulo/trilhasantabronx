
-- =========================
-- scheduled_reviews
-- =========================
CREATE TABLE public.scheduled_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  weight SMALLINT NOT NULL CHECK (weight IN (1,2,3)),
  due_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired','skipped')),
  question_count INT NOT NULL DEFAULT 0,
  estimated_minutes INT NOT NULL DEFAULT 5,
  score_percent INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, module_id, due_date, reason)
);

CREATE INDEX scheduled_reviews_user_due_idx
  ON public.scheduled_reviews (user_id, due_date, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reviews TO authenticated;
GRANT ALL ON public.scheduled_reviews TO service_role;

ALTER TABLE public.scheduled_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own scheduled reviews — select"
  ON public.scheduled_reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own scheduled reviews — insert"
  ON public.scheduled_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own scheduled reviews — update"
  ON public.scheduled_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own scheduled reviews — delete"
  ON public.scheduled_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER scheduled_reviews_touch_updated_at
  BEFORE UPDATE ON public.scheduled_reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- review_answers
-- =========================
CREATE TABLE public.review_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.scheduled_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  theme TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  question_type TEXT NOT NULL DEFAULT 'mcq',
  answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX review_answers_user_module_theme_idx
  ON public.review_answers (user_id, module_id, theme);
CREATE INDEX review_answers_review_idx
  ON public.review_answers (review_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_answers TO authenticated;
GRANT ALL ON public.review_answers TO service_role;

ALTER TABLE public.review_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own review answers — select"
  ON public.review_answers FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own review answers — insert"
  ON public.review_answers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own review answers — update"
  ON public.review_answers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own review answers — delete"
  ON public.review_answers FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- =========================
-- theme_performance
-- =========================
CREATE TABLE public.theme_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  theme TEXT NOT NULL,
  total_answered INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  total_wrong INT NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_wrong_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id, theme)
);

CREATE INDEX theme_performance_user_idx
  ON public.theme_performance (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.theme_performance TO authenticated;
GRANT ALL ON public.theme_performance TO service_role;

ALTER TABLE public.theme_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own theme performance — select"
  ON public.theme_performance FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own theme performance — insert"
  ON public.theme_performance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own theme performance — update"
  ON public.theme_performance FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER theme_performance_touch_updated_at
  BEFORE UPDATE ON public.theme_performance
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
