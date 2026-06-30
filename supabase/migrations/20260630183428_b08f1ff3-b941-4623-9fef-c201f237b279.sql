CREATE TABLE public.generated_questions (
  subcategory_key text PRIMARY KEY,
  questions jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.generated_questions TO authenticated;
GRANT ALL ON public.generated_questions TO service_role;

ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read generated questions"
  ON public.generated_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage generated questions"
  ON public.generated_questions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER generated_questions_touch_updated_at
  BEFORE UPDATE ON public.generated_questions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();