CREATE TABLE public.daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_date, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_task_completions TO authenticated;
GRANT ALL ON public.daily_task_completions TO service_role;
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own daily task completions"
  ON public.daily_task_completions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all daily task completions"
  ON public.daily_task_completions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_daily_task_completions_user_date ON public.daily_task_completions(user_id, task_date);