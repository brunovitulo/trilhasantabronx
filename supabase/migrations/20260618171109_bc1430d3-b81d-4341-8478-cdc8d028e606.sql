ALTER TABLE public.open_evaluation_submissions
  ADD COLUMN IF NOT EXISTS retry_allowed boolean NOT NULL DEFAULT false;

-- Allow admin trigger guard to permit retry_allowed updates from admins.
CREATE OR REPLACE FUNCTION public.guard_open_evaluation_submission_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.score IS DISTINCT FROM OLD.score
       OR NEW.general_feedback IS DISTINCT FROM OLD.general_feedback
       OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.subtask_id IS DISTINCT FROM OLD.subtask_id
       OR NEW.retry_allowed IS DISTINCT FROM OLD.retry_allowed THEN
      RAISE EXCEPTION 'Atendente não pode alterar campos de revisão';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;