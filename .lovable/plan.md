## Objetivo

Aplicar duas mudanças no sistema de provas (Módulos 1–6 e provas de grupo do Módulo 7):

1. **Auto-correção das questões objetivas** no momento da submissão.
2. **Revisão de conteúdo** de todas as questões (clareza, distratores plausíveis, alinhamento com a apostila/checklist).

---

## Parte 1 — Auto-correção de múltipla escolha (mudança técnica)

### Fluxo atual
Hoje o `OpenEvaluationSubtask` já calcula localmente os acertos das objetivas, mas a submissão entra no banco com `status=pending` e o admin precisa marcar cada questão (incluindo as objetivas) no `CorrectionDialog`. A nota final só é fechada depois que todas — abertas e objetivas — recebem `correct/incorrect`.

### Nova lógica
- Na submissão (`OpenEvaluationSubtask.handleSubmit`):
  - Para cada questão com `options` + `correctIndex`, gravar imediatamente `question_results.is_correct` comparando a resposta da atendente com o índice correto (considerando o embaralhamento determinístico já existente em `shuffleOptions.ts`).
  - Marcar essas linhas com uma flag nova `auto_graded = true` (coluna boolean default false em `open_evaluation_question_results`).
  - Se a prova só tem questões objetivas → calcular nota final na hora, gravar `score`, definir `status = approved` ou `rejected` conforme `passingScore`, preencher `reviewed_at`, e disparar o popup de resultado.
  - Se houver pelo menos uma questão aberta → manter `status = pending` para revisão manual, mas as objetivas já ficam resolvidas.

- `CorrectionDialog.tsx`:
  - Renderizar questões objetivas em modo somente-leitura, com badge "Auto-corrigida" e marcação verde/vermelha.
  - Botão "Finalizar avaliação" passa a exigir apenas que as questões **abertas** estejam marcadas.
  - Cálculo da nota final = (objetivas auto-corretas + abertas marcadas como corretas) / total × 100. Mantém os pesos atuais (1 ponto por questão).

- Backend (`supabase--migration`):
  - `ALTER TABLE open_evaluation_question_results ADD COLUMN auto_graded boolean NOT NULL DEFAULT false;`
  - Sem mudança em RLS (a coluna herda as policies existentes).

---

## Parte 2 — Revisão de conteúdo das questões

### Escopo
Todos os subtasks `evaluation` e `open_evaluation` em `src/data/topics.ts`:
- Módulo 1 (Responsabilidades) — prova final
- Módulo 2 (Organização) — prova final
- Módulo 3 (Embalar) — prova final
- Módulo 4 (Vendas) — prova final
- Módulo 5 (Dores) — prova final
- Módulo 6 (Objeções) — prova final
- Módulo 7 (Produtos) — 3 provas de grupo (Cosméticos, Vibradores, Acessórios)

### Processo por prova
Para cada prova:
1. Ler a apostila + checklist + destaque do tópico (arquivos em `src/content/<topic>/`).
2. Para cada questão:
   - **Clareza**: reescrever enunciado se for confuso, redundante, ou testar algo irrelevante para o trabalho da atendente.
   - **Distratores**: substituir opções obviamente absurdas por distratores plausíveis baseados em outros conceitos reais do mesmo tópico.
   - **Cobertura**: confirmar que a resposta correta aparece textualmente (ou diretamente derivável) da apostila/checklist. Se não estiver, reescrever para testar algo que está coberto, ou remover.
3. Não alterar quantidade total de questões salvo se uma precisar ser removida por não ter base no material — nesse caso, substituir por uma equivalente baseada em conteúdo coberto.
4. Manter `correctIndex` apontando para a opção certa após qualquer reordenação.
5. Provas de grupo do Módulo 7: verificar cada questão contra os produtos do grupo (`src/data/m7Products.ts` + chips em `m7Chips.ts` + apostilas individuais em `src/content/produtos/apostila_*.html`).

### Entregáveis
- `src/data/topics.ts` atualizado com questões revisadas.
- Diff mantido apenas no array de `questions` de cada subtask de avaliação — sem mexer em outras subtasks, fluxo, ou estilos.

---

## Ordem de execução

1. Migration `auto_graded` + ajustes em `OpenEvaluationSubtask` e `CorrectionDialog` (Parte 1). Verificar build.
2. Revisão de conteúdo Módulo 1 → 6 (uma prova por vez, lendo a apostila correspondente antes).
3. Revisão das 3 provas do Módulo 7.
4. Build final + smoke test.

---

## Observações

- A revisão de conteúdo é um trabalho extenso (~80–100 questões no total). Vou executar tópico por tópico para manter qualidade; se preferir, posso começar só pelos módulos que você considera prioritários — me avise antes de eu seguir.
- Submissões antigas (`open_evaluation_submissions` já criadas) continuam funcionando como hoje; a flag `auto_graded` só passa a ser gravada nas novas submissões.
- Nenhuma mudança visual além do badge "Auto-corrigida" no painel de correção.
