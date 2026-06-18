
DO $$ BEGIN
  CREATE TYPE public.exam_permission_status AS ENUM ('pending','approved','rejected','expired','consumed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.exam_permission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subtask_id text NOT NULL,
  status public.exam_permission_status NOT NULL DEFAULT 'pending',
  decided_at timestamptz,
  decided_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX exam_permission_requests_user_subtask_idx
  ON public.exam_permission_requests (user_id, subtask_id, status);
CREATE INDEX exam_permission_requests_status_idx
  ON public.exam_permission_requests (status, created_at);

GRANT SELECT, INSERT, UPDATE ON public.exam_permission_requests TO authenticated;
GRANT ALL ON public.exam_permission_requests TO service_role;

ALTER TABLE public.exam_permission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own permission requests"
  ON public.exam_permission_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own permission requests"
  ON public.exam_permission_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins decide permission requests"
  ON public.exam_permission_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER exam_permission_requests_touch
  BEFORE UPDATE ON public.exam_permission_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_permission_requests;
ALTER TABLE public.exam_permission_requests REPLICA IDENTITY FULL;
