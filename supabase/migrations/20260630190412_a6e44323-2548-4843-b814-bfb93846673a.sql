-- Tabela: cache de funcionalidades geradas por IA para cada produto individual do M7.
CREATE TABLE public.product_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  subcategory_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  functionality TEXT NOT NULL,
  generated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subcategory_id, product_slug)
);

GRANT SELECT ON public.product_flashcards TO authenticated;
GRANT ALL ON public.product_flashcards TO service_role;

ALTER TABLE public.product_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read flashcard cache"
  ON public.product_flashcards FOR SELECT TO authenticated USING (true);

CREATE TRIGGER product_flashcards_touch_updated_at
  BEFORE UPDATE ON public.product_flashcards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Tabela: rastreio por usuário de quais produtos individuais já foram dominados (acertou ambos).
CREATE TABLE public.product_flashcard_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  subcategory_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  mastered_at DATE,
  next_review_date DATE,
  last_attempt_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, subcategory_id, product_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_flashcard_mastery TO authenticated;
GRANT ALL ON public.product_flashcard_mastery TO service_role;

ALTER TABLE public.product_flashcard_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own flashcard mastery"
  ON public.product_flashcard_mastery FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER product_flashcard_mastery_touch_updated_at
  BEFORE UPDATE ON public.product_flashcard_mastery
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX product_flashcard_mastery_user_group_idx
  ON public.product_flashcard_mastery (user_id, group_id);