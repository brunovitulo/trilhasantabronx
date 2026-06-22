## Objetivo

Criar um script simples que junta todos os arquivos relevantes do projeto Santa Bronx num único arquivo Markdown. Você roda o script, baixa o arquivo gerado e cola/anexa no ChatGPT sempre que quiser ajuda pra escrever prompts melhores aqui no Lovable.

Não é integração ao vivo (Lovable não expõe o sistema de arquivos pra fora em tempo real) — mas o fluxo é: rodou o script → arquivo atualizado → ChatGPT vê o estado mais recente.

## O que será criado

**1. `scripts/export-projeto.mjs`** — script Node que:
- Varre `src/`, `supabase/migrations/`, `public/` (HTMLs de conteúdo) e arquivos-raiz importantes (`package.json`, `vite.config.ts`, `tailwind`, `tsconfig`, `AGENTS.md`, `.lovable/plan.md`).
- Ignora: `node_modules`, `dist`, `.git`, `routeTree.gen.ts`, `src/integrations/supabase/types.ts`, imagens/binários, `bun.lockb`.
- Concatena tudo num único `projeto-santabronx.md` com:
  - Cabeçalho com data de geração e resumo (nº de arquivos, tamanho).
  - Árvore de diretórios no topo.
  - Cada arquivo num bloco com caminho + ``` ```linguagem ``` ```.
- Mostra no console o caminho final e o tamanho.

**2. Atalho em `package.json`**
```json
"scripts": {
  "export-chat": "node scripts/export-projeto.mjs"
}
```

**3. `scripts/README-export.md`** — instruções curtas:
- Como rodar (`bun run export-chat`).
- Onde o arquivo é salvo (`exports/projeto-santabronx.md`).
- Como usar no ChatGPT (anexar o .md no chat; pedir "leia este arquivo e me ajude a escrever prompts pro Lovable").
- Template de prompt inicial pro ChatGPT entender o contexto (papel: PM/dev sênior; objetivo: gerar prompts curtos e diretos pro Lovable; regras do projeto: não quebrar provas, manter padrão dos módulos, etc).

## Como você vai usar

1. Quando quiser atualizar o contexto: `bun run export-chat`.
2. Baixa o `.md` gerado pela aba de arquivos do Lovable (ou copia o conteúdo).
3. Anexa no ChatGPT (uma vez por conversa nova).
4. Pede ajuda: "me escreva um prompt pro Lovable pra [o que você quer]".

## O que NÃO faz parte

- Não cria integração ao vivo via API/MCP.
- Não modifica nenhum código do app (só adiciona scripts).
- Não envia nada pra fora automaticamente — você controla quando exportar.
