## Visão geral

22 subcategorias × 3 grupos no Tópico 7. Para cada uma:
- Hoje: 4 subtasks (`video` + `product_links` + `practice` 7q + `inline_html` apostila)
- Novo: 3 subtasks (`video` + **`product_block`** unificado + `practice` 12q)

Nenhuma URL de produto, link de vídeo ou texto de apostila é descartado — tudo é redirecionado pro novo bloco unificado e/ou pro banco de questões expandido.

---

## 1. Novo subtype: `product_block`

Criar `kind: "product_block"` em `src/data/topics.ts` (extensão do union de `Subtask`). Estrutura:

```ts
{
  id: "produtos.excitantes.bloco",
  kind: "product_block",
  title: "1. Cosméticos — Excitantes — Conteúdo e produtos",
  apostilaSource: "produtos_excitantes",   // reusa HTML existente para "o que é/pontos/fala/cuidados"
  products: [
    { name: "...", url: "https://sexshopsantabronx.com.br/produto/..." }
    // copiados dos links atuais
  ],
  confirmLabel: "Estudei o conteúdo e revisei todos os produtos."
}
```

A apostila HTML existente já contém todas as seções (✨ O que é, 🧠 Pontos para decorar, 💬 Como falar, ⚠️ Cuidados). O novo componente extrai/renderiza essas seções inline (sem o link "abrir em nova aba"), seguidas do grid de cards de produtos.

## 2. Componente `ProductBlockSubtask`

Novo arquivo `src/components/ProductBlockSubtask.tsx`. Renderiza:

1. Botão "Atualizar preços" no topo (loading state, "atualizado há X").
2. Seções extraídas da apostila (parsing leve do HTML para pegar as `<section>`).
3. Grid responsivo de cards: imagem | nome | preço | resumo features | botão "Ver no site".
4. Checkbox de confirmação no final, que marca o subtask como concluído.

Cada card consulta `usePriceData(url)` (cache em React Query, chave = URL). Primeira render = placeholder até clicar em "Atualizar preços" (ou se já tiver cache fresco).

## 3. Server function de scraping

`src/lib/productScrape.functions.ts`:

```ts
export const scrapeProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { urls: string[] }) => d)
  .handler(async ({ data }) => {
    return Promise.all(data.urls.map(scrapeOne));
  });
```

Cada `scrapeOne(url)`:
- `fetch(url)` no servidor (Cloudflare Worker permite fetch externo).
- Parse via regex/cheerio-leve do HTML do WooCommerce padrão da Santa Bronx:
  - **Preço**: `<p class="price">` → pega `<bdi>` da promoção (`ins`) se existir, senão o único.
  - **Imagem**: `<meta property="og:image">` (sempre presente em WooCommerce).
  - **Features**: `<div class="woocommerce-product-details__short-description">` → primeiras 2-3 linhas / 280 chars.
- Retorna `{ url, price, imageUrl, summary, fetchedAt }`.
- Erros individuais não derrubam o lote — devolve `{ url, error: "..." }` no item.

Sem cache em DB (escolha do usuário: "scraping ao vivo"). React Query mantém o resultado em memória durante a sessão.

## 4. Expansão 7 → 12 questões via IA

Botão no painel admin (`/admin`): **"Gerar questões M7"**.

Fluxo:
1. Server fn `generateProductQuestions({ subcategoryKey })`:
   - Carrega o HTML da apostila correspondente.
   - Chama Lovable AI Gateway (`google/gemini-3-flash-preview`) com prompt instruindo: gerar exatamente 12 questões de múltipla escolha (4 opções, distratores plausíveis), baseadas SOMENTE no conteúdo da apostila, no formato JSON estruturado (`Output.object` com Zod).
   - Retorna `OpenQuestion[]` (12 itens).
2. UI no admin lista as 22 subcategorias, com "Gerar" + preview/edit + "Salvar".
3. Salva em nova tabela `generated_questions(subcategory_key text PK, questions jsonb, generated_at timestamptz, approved_by uuid)`.
4. Em runtime, `PracticeSubtask` para subtasks do M7 puxa as questões do banco se existirem; cai no array embutido (atualmente 7) como fallback.

Por que tabela e não hard-code: permite regerar/editar sem republish, e o usuário pediu pra ser sob demanda.

## 5. Migração de schema

```sql
CREATE TABLE public.generated_questions (
  subcategory_key text PRIMARY KEY,
  questions jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.generated_questions TO authenticated;
GRANT ALL ON public.generated_questions TO service_role;
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON public.generated_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON public.generated_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

## 6. Refactor de `topics.ts`

Script Python que, para cada uma das 22 subcategorias:
- Remove os subtasks `.produtos` e `.apostila`.
- Substitui por um único `.bloco` (`kind: "product_block"`) carregando os mesmos links e o mesmo `source`.
- Mantém `.video` e `.fixacao` intactos por enquanto (questões expandidas vêm do banco em runtime).
- Atualiza títulos: "1. Cosméticos — Excitantes — Conteúdo e produtos" e mantém "Exercício de fixação (12 questões)".

## 7. Roteamento no `SubtaskGroupCard` / `topico.$topicId.tsx`

Adicionar branch para `kind === "product_block"` que renderiza `<ProductBlockSubtask />` no lugar onde hoje são renderizados `product_links` + `inline_html`.

---

## Detalhes técnicos

**Stack:**
- Server fns em `src/lib/productScrape.functions.ts` e `src/lib/aiQuestions.functions.ts` (client-safe path).
- `cheerio` NÃO funciona no Worker — usar regex direto no HTML (suficiente pro WooCommerce padrão).
- IA via `@ai-sdk/openai-compatible` + helper `createLovableAiGatewayProvider` (skill ai-sdk-lovable-gateway).
- Output estruturado: `generateText({ output: Output.object({ schema: z.object({ questions: z.array(...) }) }) })`.

**Escopo desta entrega:**
- 1 migração + 2 server fns + 1 componente novo + 1 página admin de gerenciamento + refactor do `topics.ts` + integração no router de subtasks.

**Não incluso (a confirmar depois):**
- Não vou pré-gerar as 264 questões automaticamente — o admin gera sob demanda (sua escolha "sob demanda"). Até gerar, o `.fixacao` continua mostrando as 7 originais. Quer que eu já dispare a geração de todas após mergear?

---

## Pergunta antes de executar

Confirma escopo + a pergunta acima (pré-gerar todas as 264 questões automaticamente, ou deixar você acionar no admin uma a uma)?