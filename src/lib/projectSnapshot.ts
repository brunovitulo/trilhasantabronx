// Gera um snapshot do projeto no client usando import.meta.glob,
// que embute os arquivos no bundle em tempo de build. Funciona em
// dev e em produção (Worker), diferente de ler do filesystem.

// Carrega como string crua. Glob eager pra entregar tudo síncrono.
const modules = import.meta.glob(
  [
    "/src/**/*.{ts,tsx,js,jsx,mjs,css,html,md,json,sql}",
    "/supabase/migrations/**/*.sql",
    "/supabase/config.toml",
    "/scripts/**/*.{mjs,js,ts,md}",
    "/.lovable/**/*.md",
    "/package.json",
    "/vite.config.ts",
    "/tsconfig.json",
    "/tailwind.config.ts",
    "/components.json",
    "/AGENTS.md",
    "/eslint.config.js",
  ],
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

// Ignora arquivos auto-gerados ou pesados
const IGNORE_SUFFIX = [
  "/src/routeTree.gen.ts",
  "/src/integrations/supabase/types.ts",
];

// Padrões que sinalizam segredos
const SECRET_PATTERNS: { re: RegExp; replace: string }[] = [
  { re: /(SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*)["'`][^"'`]+["'`]/gi, replace: '$1"[REMOVIDO POR SEGURANÇA]"' },
  { re: /(service_role[^"'`\n]{0,40}["'`])[A-Za-z0-9._-]{20,}(["'`])/gi, replace: '$1[REMOVIDO POR SEGURANÇA]$2' },
  { re: /(sk_live_|sk_test_|rk_live_)[A-Za-z0-9]{16,}/g, replace: "[REMOVIDO POR SEGURANÇA]" },
  { re: /(Bearer\s+)[A-Za-z0-9._-]{20,}/g, replace: "$1[REMOVIDO POR SEGURANÇA]" },
];

const LANG_BY_EXT: Record<string, string> = {
  ts: "ts", tsx: "tsx", js: "js", jsx: "jsx", mjs: "js",
  json: "json", css: "css", html: "html", sql: "sql",
  md: "md", toml: "toml", yml: "yaml", yaml: "yaml",
};

function sanitize(content: string) {
  let out = content;
  for (const { re, replace } of SECRET_PATTERNS) out = out.replace(re, replace);
  return out;
}

function buildTree(paths: string[]) {
  const tree: Record<string, any> = {};
  for (const p of paths) {
    const parts = p.replace(/^\//, "").split("/");
    let node = tree;
    for (const part of parts) {
      node[part] ??= {};
      node = node[part];
    }
  }
  const lines: string[] = [];
  function render(node: Record<string, any>, prefix = "") {
    const keys = Object.keys(node).sort();
    keys.forEach((k, i) => {
      const last = i === keys.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${k}`);
      const child = node[k];
      if (Object.keys(child).length) render(child, prefix + (last ? "    " : "│   "));
    });
  }
  render(tree);
  return lines.join("\n");
}

export function generateProjectSnapshotForChatGPT(): {
  markdown: string;
  fileCount: number;
  sizeKb: number;
} {
  const paths = Object.keys(modules)
    .filter((p) => !IGNORE_SUFFIX.some((s) => p.endsWith(s)))
    .sort();

  const now = new Date().toISOString();
  const parts: string[] = [];

  parts.push(`# Projeto Santa Bronx — snapshot completo`);
  parts.push(``);
  parts.push(`Gerado em: ${now}`);
  parts.push(`Total de arquivos: ${paths.length}`);
  parts.push(``);
  parts.push(`## Resumo do projeto`);
  parts.push(``);
  parts.push(`App de formação de atendentes da Santa Bronx. Stack: TanStack Start (React 19 + Vite), Tailwind v4, Supabase (Lovable Cloud) com RLS, shadcn/ui.`);
  parts.push(``);
  parts.push(`## Regras importantes do projeto`);
  parts.push(``);
  parts.push(`- Não quebrar provas finais existentes.`);
  parts.push(`- Prova final mantém pedido de liberação ao admin.`);
  parts.push(`- Questões abertas precisam de correção manual.`);
  parts.push(`- Revisão Inteligente vive dentro de "Tarefa do Dia".`);
  parts.push(`- Erros em exercícios viram revisão no dia seguinte.`);
  parts.push(`- Não alterar progresso da trilha sem necessidade.`);
  parts.push(``);
  parts.push(`## Como usar este arquivo no ChatGPT`);
  parts.push(``);
  parts.push("```");
  parts.push(`Você é um PM/dev sênior me ajudando a escrever prompts curtos e diretos`);
  parts.push(`pra Lovable (TanStack Start + Supabase) modificar o app Santa Bronx.`);
  parts.push(`Leia o arquivo anexado antes de responder. Quando eu pedir uma mudança,`);
  parts.push(`responda APENAS com o prompt pronto pra colar no Lovable.`);
  parts.push("```");
  parts.push(``);
  parts.push(`## Árvore de arquivos`);
  parts.push(``);
  parts.push("```");
  parts.push(buildTree(paths));
  parts.push("```");
  parts.push(``);
  parts.push(`## Arquivos ignorados por segurança ou ruído`);
  parts.push(``);
  parts.push(`- .env, .env.local, .env.production e quaisquer chaves/segredos`);
  parts.push(`- node_modules, dist, build, .next, .git, logs, temporários`);
  parts.push(`- src/routeTree.gen.ts (auto-gerado)`);
  parts.push(`- src/integrations/supabase/types.ts (auto-gerado)`);
  parts.push(`- binários (imagens, fontes, vídeos, pdfs)`);
  parts.push(``);
  parts.push(`Valores sensíveis encontrados foram substituídos por \`[REMOVIDO POR SEGURANÇA]\`.`);
  parts.push(``);
  parts.push(`---`);
  parts.push(``);
  parts.push(`## Conteúdo dos arquivos`);
  parts.push(``);

  for (const p of paths) {
    const rel = p.replace(/^\//, "");
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    const lang = LANG_BY_EXT[ext] ?? "";
    const raw = modules[p] ?? "";
    const safe = sanitize(raw).replace(/```/g, "ʼʼʼ");
    parts.push(`### \`${rel}\``);
    parts.push(``);
    parts.push("```" + lang);
    parts.push(safe);
    parts.push("```");
    parts.push(``);
  }

  const markdown = parts.join("\n");
  return {
    markdown,
    fileCount: paths.length,
    sizeKb: Math.round(markdown.length / 1024),
  };
}
