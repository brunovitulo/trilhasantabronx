# Exportar projeto pro ChatGPT

Gera um único arquivo `.md` com todo o código relevante do app, pra você colar/anexar no ChatGPT e pedir ajuda escrevendo prompts melhores pro Lovable.

## Rodar

```bash
bun run export-chat
```

(ou `node scripts/export-projeto.mjs`)

## Resultado

Arquivo em **`exports/projeto-santabronx.md`** com:
- Árvore de diretórios
- Conteúdo de `src/`, `supabase/migrations/`, `public/`, scripts e configs
- Um prompt inicial pronto pra colar no ChatGPT

## Fluxo de uso

1. Rode `bun run export-chat` toda vez que mudar algo importante.
2. Baixe o `.md` (botão de download na aba de arquivos do Lovable).
3. Abra uma conversa nova no ChatGPT e anexe o arquivo.
4. Cole o prompt inicial que aparece no topo do `.md`.
5. Peça: *"me escreva um prompt pro Lovable pra [o que você quer mudar]"*.
6. Cola o prompt que o ChatGPT te der aqui no Lovable.

## O que NÃO é exportado

- `node_modules`, `dist`, `.git`
- `routeTree.gen.ts` e `types.ts` (auto-gerados)
- Imagens, fontes, vídeos, lockfiles
- Arquivos maiores que 500 KB
