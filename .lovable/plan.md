# Revisão Inteligente — Plano de implementação

Funcionalidade grande. Vou implementar em fases para não quebrar o app. Confirme antes de eu começar a codar.

## Visão geral

Criar um sistema de revisão espaçada (D+1, D+3, D+7…) que aparece como **última tarefa** dentro do botão "Tarefas do dia". Cada revisão = mini resumo + perguntas com feedback imediato + geração automática de reforço quando a atendente erra.

## Arquitetura de dados (Lovable Cloud)

Três tabelas novas:

**`scheduled_reviews`** — fila de revisões
- `id, user_id, module_id, module_name, weight (1|2|3), due_date, reason, status (pending|completed|expired), question_count, estimated_minutes, created_at, completed_at`
- Únicos: `(user_id, module_id, due_date, reason)` para não duplicar
- RLS: dono lê/escreve; admin lê tudo

**`review_answers`** — log de respostas
- `id, review_id, user_id, question_id, module_id, theme, tags[], question_type, answer, correct_answer, is_correct, is_critical, answered_at`
- RLS: dono lê/escreve; admin lê

**`theme_performance`** — desempenho por tema (agregado)
- `id, user_id, module_id, theme, total_answered, total_correct, total_wrong, accuracy, last_wrong_at, last_reviewed_at`
- Único: `(user_id, module_id, theme)`
- RLS: dono lê; admin lê

Todas com `GRANT` para `authenticated` + `service_role`.

## Banco de perguntas

Estender o tipo `QuizQuestion` em `src/data/topics.ts` com campos opcionais:
`theme, tags, isCritical, explanation, wrongAnswerExplanation, memoryTip`.

Adicionar `miniReviewSummary` por módulo (3-5 bullets curtos, ≤100 palavras).

Reaproveitar as perguntas que já existem nos `practice`/`evaluation` subtasks — nada de criar banco paralelo. Só anotar `theme`/`tags`/`isCritical` nas que precisarem.

## Pesos e matriz de revisão

```
Peso 1 (operacional): organizacao, embalar, app_pedidos
  → D+1, D+3, D+7 — 3-5 perguntas — 3-5 min
Peso 2 (comportamento): responsabilidade, vendas
  → D+1, D+2, D+4, D+7, D+15 — 5-6 perguntas — 5-7 min
Peso 3 (consultiva): objecoes, dores, produtos
  → D+1, D+2, D+3, D+5, D+7, D+10, D+15, D+30 — 8-10 perguntas — 8-12 min
```

Definido em constante `REVIEW_MATRIX` em `src/lib/reviews.ts`.

## Geração automática

Server function `scheduleReviewsForModule({ moduleId })` chamada quando a atendente conclui um módulo (hook no fluxo de subtarefas em `topico.$topicId.tsx`). Insere todas as datas da matriz com `ON CONFLICT DO NOTHING`.

Server function `scheduleExtraReview({ moduleId, reason, theme? })` para reforço:
- acerto < 70%, OU
- 2+ erros no mesmo tema, OU
- 1 erro em questão crítica
Cria revisão para `due_date = amanhã` com motivo "Reforço por erro" ou "Ponto crítico".

## Revisão inicial (primeiros 15 dias)

Server function `ensureDailyOnboardingReview()` chamada ao abrir Tarefas do Dia. Se `profiles.created_at` < 15 dias e há ≥1 módulo iniciado e não há revisão pendente para hoje, cria uma curta com motivo "Revisão inicial — primeiros 15 dias".

## UI

**`DailyTasksButton.tsx`** — adicionar terceira tarefa "Revisão do dia" quando há revisões pendentes (`due_date <= hoje`, status pending). Badge mostra contagem. Marca concluída só quando todas terminam no dia.

**Nova rota `/_authenticated/revisao-do-dia.tsx`** — sequência de revisões:
1. Tela de intro (motivo, módulo, tempo estimado, nº perguntas) → botão "Iniciar"
2. Mini resumo (card escuro com bullets do `miniReviewSummary`)
3. Perguntas uma a uma com **feedback imediato**:
   - Acerto: card verde, mensagem curta + memoryTip
   - Erro: card vermelho/rosa, resposta correta destacada em turquesa, `wrongAnswerExplanation`, "Ponto para memorizar"
   - Erro crítico: alerta mais forte
4. Resultado final (acertos, %, pontos fortes/fracos, "Nova revisão criada para amanhã" quando aplicável)
5. Próxima revisão na fila ou volta para home

Visual segue o padrão atual (fundo escuro premium, cards arredondados, turquesa/roxo, vermelho discreto). Reaproveita componentes existentes (`Card`, `Button`, `Badge`, `RadioGroup`).

A página `/revisao` atual fica como "Revisão livre" (sem espaçada). Não mexo nela.

## Admin

Adicionar seção em `/admin` com:
- Lista de atendentes × revisões pendentes/concluídas
- Top 5 temas com mais erro
- Erros críticos recentes (últimas 14 dias)

Consultas via `supabase.from('review_answers')` agregando.

## Fases de entrega (incremental)

1. **Migration** das 3 tabelas + RLS + GRANT
2. **Tipos + matriz + mini-resumos** em `src/data/topics.ts` e `src/lib/reviews.ts`
3. **Server functions** de scheduling/extra/onboarding
4. **Gatilho de geração** ao concluir módulo
5. **UI "Revisão do dia"** no `DailyTasksButton` + rota `/revisao-do-dia`
6. **Feedback imediato + resultado + geração de reforço**
7. **Painel admin**

## Detalhes técnicos

- Server fns em `src/lib/reviews.functions.ts` com `requireSupabaseAuth`.
- Cálculo de `due_date` em UTC + `toISOString().slice(0,10)`.
- `scheduled_reviews` indexado por `(user_id, due_date, status)`.
- `theme_performance` atualizado por server fn dentro da mesma transação da gravação de respostas.
- Critérios de "questão crítica" embutidos nas próprias questões via flag `isCritical: true` — sem heurística textual.
- Migration NÃO mexe em `auth.*`, `storage.*` etc.

## Cuidados

- Não bloqueia trilha.
- Não duplica revisões (constraint + upsert).
- Não cria revisão para módulo nunca iniciado.
- Não altera provas finais nem suas autorizações.
- Mini resumo nunca entrega gabarito literal das perguntas.

---

Posso começar pelas fases 1–3 (dados + lógica core) e mostrar antes de seguir para UI, ou prefere que eu vá direto até a UI funcional do "Revisão do dia"?
