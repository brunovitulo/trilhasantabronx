
ALTER TABLE public.open_evaluation_submissions
  ADD COLUMN IF NOT EXISTS retry_requires_module_redo BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.guard_open_evaluation_submission_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.score IS DISTINCT FROM OLD.score
       OR NEW.general_feedback IS DISTINCT FROM OLD.general_feedback
       OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.subtask_id IS DISTINCT FROM OLD.subtask_id
       OR NEW.retry_allowed IS DISTINCT FROM OLD.retry_allowed
       OR NEW.retry_requires_module_redo IS DISTINCT FROM OLD.retry_requires_module_redo THEN
      RAISE EXCEPTION 'Atendente não pode alterar campos de revisão';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Libera nova tentativa direta para a atendente travada na prova de Vendas.
UPDATE public.open_evaluation_submissions
SET retry_allowed = true,
    retry_requires_module_redo = false
WHERE id = '53ec3ae2-0805-406e-a416-35ebff68aa88'
  AND status = 'rejected';
