## Visão geral

Reformular a lógica e o conteúdo da Revisão do Dia para todos os módulos. As mudanças tocam 5 arquivos principais e exigem ajuste no modo "preview" do admin para refletir o novo formato.

---

## 1. Módulos 1, 2 e 3 — Apresentação / Embalar / Responsabilidade

**`src/lib/dailyReview.ts`** — atualizar `MODULE_REVIEW_PLANS`:
- `dayOffsets: [1]` (somente D+1, sai da fila depois)
- `hasApostila: false`
- `hasChecklist: true`
- `quizCount: 5` (mantém)
- `estimatedMinutes: "5-7"`

Fluxo: checklist → 5 perguntas. Aparece uma única vez no dia seguinte.

---

## 2. Módulo 4 — Principais Objeções

**`src/lib/dailyReview.ts`**:
- `dayOffsets: [1, 3, 5]` (mantém)
- `hasApostila: true` (volta)
- `hasChecklist: true`
- `quizCount: 10`

**`src/data/revisao.ts`** — expandir `QUIZ_OBJECOES` para 12 perguntas (banco maior que o `quizCount=10`, igual aos outros módulos). Conteúdo cobre: quebrar objeções comuns, discrição na entrega, medo de ser visto, experiência presencial na loja, sigilo no atendimento, postura consultiva ao receber objeção.

---

## 3. Módulo 5 — Fundamentos de Vendas

**`src/lib/dailyReview.ts`**:
- `quizCount: 10` (era 5)

**`src/data/revisao.ts`** — expandir `QUIZ_VENDAS` para 12 perguntas. Pontos cobertos: tempo de resposta < 1 min, mentalidade consultora vs vendedora, perguntar antes de indicar, explicar o porquê, antecipar e quebrar objeções, simpatia como pré-requisito.

---

## 4. Módulo 6 — Principais Dores e Soluções

**`src/lib/dailyReview.ts`**:
- `quizCount: 10` (era 6)

**`src/data/revisao.ts`** — expandir `QUIZ_DORES` para 12 perguntas cobrindo os principais pares dor → produto/solução e notas clínicas relevantes (ressecamento, libido baixa, ejaculação precoce, dificuldade de orgasmo, dor anal, monotonia do casal, etc.).

---

## 5. Módulo 7 — Revisão de Produtos (Flashcards)

### 5.1 Restringir produtos elegíveis para revisão

**`src/data/produtosRevisao.ts`**:
- Grupo **Cosméticos** passa a conter apenas `EXCITANTES` + `LUBRIFICANTE`. Remover Perfumes, Adstringente, Estimulantes, Retardante, Anestésicos do array.
- Grupo **Vibradores**: mantém todos.
- Remover o grupo **Acessórios** de `PRODUCT_REVISION_GROUPS`.

### 5.2 Filtrar `M7_PRODUCTS` na fila de flashcards

**`src/lib/flashcards.functions.ts`** — em `getFlashcardSession`, filtrar `products` para incluir apenas as subcategorias permitidas:
- Cosméticos: `excitantes`, `lubrificante`
- Vibradores: todas as subcategorias do grupo

Os distratores e a contagem de total/mastered também passam a usar essa lista filtrada.

### 5.3 Progressão sequencial entre grupos

**`src/lib/dailyReview.functions.ts`** — em `getTodayReview`:
- Iterar `PRODUCT_REVISION_GROUPS` na ordem (Cosméticos → Vibradores).
- Calcular `total` e `masteredCount` usando apenas os produtos filtrados (5.2).
- Quando Cosméticos ainda tem produto não-dominado, NÃO enfileirar Vibradores nesse dia, mesmo se o exame de Vibradores já estiver concluído.
- Reescrever a função auxiliar `totalByGroup` para respeitar o filtro de subcategorias permitidas.

### 5.4 Lógica por produto (sem bloqueio)

Já é o comportamento atual: a sessão percorre todos os flashcards; quem acerta as duas perguntas (funcionalidade + preço) vira `mastered` e sai da fila; quem erra reaparece no dia seguinte. **Nenhuma mudança necessária** em `recordFlashcardResult`.

### 5.5 Tela de resumo + download (HTML)

**`src/routes/_authenticated/revisao-do-dia.tsx`** — substituir a tela "Sessão de flashcards pronta!" do `ProductGroupFlow` por uma tela de resumo que:
- Lista todos os produtos errados na sessão (rastreados em estado local: `wrongItems: FlashcardItem[]`).
- Mostra imagem, nome, funcionalidade correta (chips) e preço correto de cada produto errado.
- Mensagem positiva se a lista estiver vazia.
- Botão **"Baixar resumo"** que gera um HTML standalone (`Blob` + `URL.createObjectURL`) com os produtos errados e dispara download. HTML é imprimível no navegador (Ctrl+P → "Salvar como PDF"), atendendo "PDF ou HTML".
- Botão "Concluir este item" para finalizar.

Implementação puramente client-side, sem nova dependência.

### 5.6 Limpeza

- Remover tela `phase3Result` (não há mais fases 2/3 — a sessão é diária até dominar).
- Simplificar `initProductState`: percorre todos os flashcards do grupo, sem cards intermediários.

---

## Detalhes técnicos

- **Sem migração de schema**: `product_flashcard_mastery` já suporta o fluxo (mastered_at + reset diário implícito).
- **`product_revision_progress`**: a flag `group_completed` continua sendo setada quando todos os produtos filtrados são dominados.
- **Preview admin** (`buildPreviewState`): remover `group:acessorios` da lista — feito implicitamente porque o grupo deixa de existir em `PRODUCT_REVISION_GROUPS`.

---

## Arquivos alterados

1. `src/lib/dailyReview.ts` — `MODULE_REVIEW_PLANS`
2. `src/data/revisao.ts` — expansão dos quizzes M4/M5/M6
3. `src/data/produtosRevisao.ts` — remoção de produtos/grupos
4. `src/lib/flashcards.functions.ts` — filtro de subcategorias permitidas
5. `src/lib/dailyReview.functions.ts` — progressão sequencial entre grupos M7
6. `src/routes/_authenticated/revisao-do-dia.tsx` — tela de resumo + download, simplificação

Confirma que posso seguir com tudo nesse formato?
