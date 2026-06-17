
-- Submissions table
CREATE TABLE public.open_evaluation_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subtask_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected')),
  score numeric,
  general_feedback text,
  reviewer_id uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.open_evaluation_submissions TO authenticated;
GRANT ALL ON public.open_evaluation_submissions TO service_role;

ALTER TABLE public.open_evaluation_submissions ENABLE ROW LEVEL SECURITY;

-- Read: own or admin
CREATE POLICY "submissions_select_own_or_admin"
ON public.open_evaluation_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Insert: only as self, only with pending_review (not pre-approving)
CREATE POLICY "submissions_insert_own_pending"
ON public.open_evaluation_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending_review');

-- Update: owner can update only their own and only safe fields (enforced via trigger),
-- admin can update anything.
CREATE POLICY "submissions_update_own_or_admin"
ON public.open_evaluation_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Trigger: prevent non-admins from changing review fields
CREATE OR REPLACE FUNCTION public.guard_open_evaluation_submission_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.score IS DISTINCT FROM OLD.score
       OR NEW.general_feedback IS DISTINCT FROM OLD.general_feedback
       OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.subtask_id IS DISTINCT FROM OLD.subtask_id THEN
      RAISE EXCEPTION 'Atendente não pode alterar campos de revisão';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_open_evaluation_submission_update
BEFORE UPDATE ON public.open_evaluation_submissions
FOR EACH ROW EXECUTE FUNCTION public.guard_open_evaluation_submission_update();

CREATE INDEX idx_open_eval_subm_user ON public.open_evaluation_submissions(user_id);
CREATE INDEX idx_open_eval_subm_status ON public.open_evaluation_submissions(status);
CREATE INDEX idx_open_eval_subm_subtask ON public.open_evaluation_submissions(subtask_id);

-- Answers table
CREATE TABLE public.open_evaluation_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.open_evaluation_submissions(id) ON DELETE CASCADE,
  question_index int NOT NULL,
  question_text text NOT NULL,
  answer_text text NOT NULL DEFAULT '',
  is_correct boolean,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, question_index)
);

GRANT SELECT, INSERT, UPDATE ON public.open_evaluation_answers TO authenticated;
GRANT ALL ON public.open_evaluation_answers TO service_role;

ALTER TABLE public.open_evaluation_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_select_own_or_admin"
ON public.open_evaluation_answers FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.open_evaluation_submissions s
    WHERE s.id = submission_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "answers_insert_own"
ON public.open_evaluation_answers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.open_evaluation_submissions s
    WHERE s.id = submission_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "answers_update_own_or_admin"
ON public.open_evaluation_answers FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.open_evaluation_submissions s
    WHERE s.id = submission_id AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.open_evaluation_submissions s
    WHERE s.id = submission_id AND s.user_id = auth.uid()
  )
);

-- Guard: only admins set is_correct / feedback
CREATE OR REPLACE FUNCTION public.guard_open_evaluation_answer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.is_correct IS DISTINCT FROM OLD.is_correct
       OR NEW.feedback IS DISTINCT FROM OLD.feedback
       OR NEW.question_index IS DISTINCT FROM OLD.question_index
       OR NEW.question_text IS DISTINCT FROM OLD.question_text
       OR NEW.submission_id IS DISTINCT FROM OLD.submission_id THEN
      RAISE EXCEPTION 'Atendente não pode alterar campos de correção';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_open_evaluation_answer_update
BEFORE UPDATE ON public.open_evaluation_answers
FOR EACH ROW EXECUTE FUNCTION public.guard_open_evaluation_answer_update();

CREATE INDEX idx_open_eval_answers_submission ON public.open_evaluation_answers(submission_id);
