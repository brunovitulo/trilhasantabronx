# Nova estrutura de Revisão do Dia

Apagar a estrutura atual (rotas `revisao.tsx` e `revisao-do-dia.tsx`, `src/lib/reviews.ts`, `src/lib/reviews.functions.ts`, tabelas `scheduled_reviews` e `review_answers`) e construir uma fila de revisão dirigida pela data de conclusão dos módulos.

## 1. Regra de fila (sem agendamento prévio)

Em vez de pré-agendar entradas em uma tabela, a fila do dia é calculada em tempo real a partir de `subtask_progress.completed_at`:

- Para cada tópico principal (Apresentação, Embalar, Responsabilidade, Vendas, Objeções, Dores, Produtos, Presencial), pegar a maior `completed_at` entre as subtarefas do tópico.
- Considerar o tópico "concluído em D" quando todas as suas subtarefas atendem à regra atual de conclusão (`isTopicComplete`, já existente em `src/lib/progress.ts`).
- Um tópico entra na fila nos dias **D+1** e **D+2** (fuso `America/Sao_Paulo`). A partir de D+3 some.
- Se o usuário concluir o mesmo tópico mais de uma vez (ex: progresso resetado pelo admin), considerar a `completed_at` mais recente.

Isso elimina a tabela `scheduled_reviews` e simplifica tudo: nada de cron, nada de backfill, nada de divergência entre agendamento e progresso.

## 2. Persistência da revisão concluída

Nova tabela `daily_review_completions`:

- `user_id uuid`
- `review_date date` (data local SP)
- `module_ids text[]` (lista dos tópicos revisados no dia)
- `completed_at timestamptz`
- UNIQUE `(user_id, review_date)`
- RLS escoposado por `auth.uid()` + admin via `has_role`
- GRANTs: `SELECT, INSERT, UPDATE, DELETE` para `authenticated`; `ALL` para `service_role`

A tarefa "Fazer revisão do dia" aparece como concluída na aba de tarefas do dia quando existe uma linha para o `review_date` de hoje.

## 3. Conteúdo das revisões

Adicionar em `src/data/topics.ts` (ou novo `src/data/revisao.ts`) um mapa por `topicId`:

```ts
type RevisionQuiz = { question: string; options: string[]; correctIndex: number }[];
type RevisionContent = {
  apostilaHtml: string;        // já existe via ?raw imports
  checklistHtml: string;       // idem
  quiz: RevisionQuiz;          // 8 perguntas
};
```

Bancos de quiz a serem cadastrados nesta entrega, com as 8 perguntas exatas do prompt:
- `apresentacao` (Módulo 1)
- `embalar` (Módulo 2)
- `responsabilidade` (Módulo 3)
- `vendas` (Módulo 5 do prompt = 4º tópico da home)

Tópicos sem banco de perguntas ainda (`objecoes`, `dores`, `produtos`, `presencial`): entram na fila normalmente e mostram apenas Etapa 1 (apostila) + Etapa 2 (checklist). A Etapa 3 fica desabilitada com aviso "Quiz de revisão em breve". Quando o usuário fornecer as perguntas, basta adicionar ao mapa.

Reaproveitar os HTMLs já importados (`@/content/<modulo>/apostila.html?raw` e `checklist.html?raw`) — para tópicos que usam apostila estruturada em React (`apresentacao`), abrir o componente `ApostilaView` correspondente no popup.

## 4. UI

### Tarefa do dia
- `DailyTasksButton.tsx` recebe a nova entrada "Fazer revisão do dia" sempre na **última posição**.
- Estado: pendente se a fila do dia não está vazia e ainda não há `daily_review_completions` para hoje; concluída se há registro; oculta se fila vazia.
- Clicar abre a rota `/revisao-do-dia`.

### Rota `/revisao-do-dia`
Reescrita do zero. Layout: modal/tela cheia com stepper.

Para cada módulo da fila, em sequência:

1. **Etapa 1 — Reler apostila**
   - Botão "Abrir apostila" → `Dialog` centralizado com a apostila do módulo.
   - Checkbox de confirmação: "Reli a apostila deste módulo."
2. **Etapa 2 — Checklist**
   - Botão "Abrir checklist" → `Dialog` centralizado com o checklist HTML.
   - Checkbox: "Marquei os principais pontos do checklist."
3. **Etapa 3 — 8 perguntas**
   - Renderizar uma pergunta por vez, com 4 alternativas.
   - Ao responder, marcar imediatamente certo/errado e mostrar a alternativa correta + curto reforço.
   - Botão "Próxima" libera após resposta.
   - Final: card "X/8 corretas" + botão "Próximo módulo".

Botão "Concluir revisão do dia" no fim:
- Insere linha em `daily_review_completions` com `module_ids` = fila do dia.
- Mostra popup: "Revisão do dia concluída! Conteúdo revisado: [nomes dos módulos]." e volta para a home.
- Marca a tarefa do dia como concluída.

Progresso da sessão fica em estado de React (não persistir parciais). Se o usuário recarregar, recomeça — aceitável porque a sessão inteira dura poucos minutos.

### Home (`index.tsx`)
- Remover o card/atalho atual de revisão (qualquer referência a `/revisao` e ao banner antigo).

### Header (`AppHeader.tsx`)
- Remover links para `/revisao` e `/revisao-do-dia` da navegação direta (o acesso passa a ser exclusivamente pela aba de tarefas do dia).

## 5. Migração de dados

- Migration: criar `daily_review_completions` (+ GRANTs + RLS + trigger updated_at).
- Migration: `DROP TABLE public.review_answers; DROP TABLE public.scheduled_reviews;` (depende uma da outra via FK — dropar `review_answers` primeiro).
- Remover qualquer `cron.unschedule` se houver job antigo apontando para as rotas removidas. Verificar `cron.job` antes da remoção.

## 6. Arquivos removidos / criados / editados

Removidos:
- `src/routes/_authenticated/revisao.tsx`
- `src/lib/reviews.ts`
- `src/lib/reviews.functions.ts`

Criados:
- `src/data/revisao.ts` (banco de quizzes + helper de conteúdo por módulo)
- `src/lib/dailyReview.ts` (cálculo da fila do dia + helpers de data SP)
- `src/lib/dailyReview.functions.ts` (`getTodayQueue`, `completeTodayReview`, `getTodayCompletion` com `requireSupabaseAuth`)
- Migration SQL para `daily_review_completions` e drop das tabelas antigas.

Editados:
- `src/routes/_authenticated/revisao-do-dia.tsx` (reescrita total)
- `src/components/DailyTasksButton.tsx` (adicionar tarefa final + estado)
- `src/components/AppHeader.tsx` (limpar links antigos)
- `src/routes/_authenticated/index.tsx` (remover card antigo de revisão, se houver)

## Detalhes técnicos

- Datas em fuso `America/Sao_Paulo`: usar `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date)` para obter `YYYY-MM-DD` consistente entre cliente e servidor.
- Server functions usam `requireSupabaseAuth` e leem `subtask_progress` + `daily_review_completions` pelo client do contexto (RLS como usuário).
- A `getTodayQueue` retorna `Array<{ topicId, topicTitle, dayInWindow: 1 | 2, hasQuiz: boolean }>`.
- O quiz é autocorrigido no cliente; nada é gravado por resposta. Apenas a conclusão final grava em `daily_review_completions`.
- Sem cron job — toda a lógica é derivada em request-time.

## Suposições aplicadas (questões puladas pelo usuário)

- "Módulo 5 — Fundamentos de Vendas" = tópico `vendas` (4º card da home).
- Tópicos sem perguntas (`objecoes`, `dores`, `produtos`, `presencial`) entram na fila com Etapas 1 e 2 funcionais e Etapa 3 desabilitada até que as perguntas sejam fornecidas.
- Dados antigos de `scheduled_reviews` e `review_answers` são descartados completamente; a nova fila é recalculada a partir do histórico de `subtask_progress`, então usuários que concluíram um módulo ontem ou hoje vão ver esse módulo na revisão automaticamente.
