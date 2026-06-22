#!/usr/bin/env node
// Exporta o projeto Santa Bronx num único arquivo .md pra colar no ChatGPT.
// Uso: bun run export-chat  (ou: node scripts/export-projeto.mjs)

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "exports");
const OUT_FILE = join(OUT_DIR, "projeto-santabronx.md");

// Pastas/arquivos que entram
const INCLUDE_DIRS = ["src", "supabase/migrations", "public", "scripts", ".lovable"];
const INCLUDE_ROOT_FILES = [
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "tailwind.config.ts",
  "components.json",
  "AGENTS.md",
  "eslint.config.js",
];

// O que sempre ignorar
const IGNORE_DIRS = new Set(["node_modules", "dist", ".git", "build", ".cache", ".vite", "exports"]);
const IGNORE_FILES = new Set([
  "src/routeTree.gen.ts",
  "src/integrations/supabase/types.ts",
  "bun.lockb",
  "package-lock.json",
]);
const IGNORE_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".mp4", ".mov", ".webm", ".mp3", ".wav",
  ".woff", ".woff2", ".ttf", ".otf",
  ".pdf", ".zip", ".lockb",
]);

const LANG_BY_EXT = {
  ".ts": "ts", ".tsx": "tsx", ".js": "js", ".jsx": "jsx", ".mjs": "js",
  ".json": "json", ".css": "css", ".html": "html", ".sql": "sql",
  ".md": "md", ".sh": "bash", ".toml": "toml", ".yml": "yaml", ".yaml": "yaml",
};

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const name of entries) {
    const full = join(dir, name);
    const rel = relative(ROOT, full);
    if (IGNORE_DIRS.has(name)) continue;
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      walk(full, files);
    } else {
      if (IGNORE_FILES.has(rel)) continue;
      if (IGNORE_EXTS.has(extname(name).toLowerCase())) continue;
      if (st.size > 500 * 1024) continue; // pula >500kb
      files.push(rel);
    }
  }
  return files;
}

function buildTree(paths) {
  const tree = {};
  for (const p of paths) {
    const parts = p.split("/");
    let node = tree;
    for (const part of parts) {
      node[part] ??= {};
      node = node[part];
    }
  }
  const lines = [];
  function render(node, prefix = "") {
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

mkdirSync(OUT_DIR, { recursive: true });

const allFiles = [];
for (const dir of INCLUDE_DIRS) {
  const full = join(ROOT, dir);
  try { if (statSync(full).isDirectory()) walk(full, allFiles); } catch {}
}
for (const f of INCLUDE_ROOT_FILES) {
  try { if (statSync(join(ROOT, f)).isFile()) allFiles.push(f); } catch {}
}
allFiles.sort();

const now = new Date().toISOString();
const parts = [];
parts.push(`# Projeto Santa Bronx — snapshot completo`);
parts.push(``);
parts.push(`Gerado em: ${now}`);
parts.push(`Total de arquivos: ${allFiles.length}`);
parts.push(``);
parts.push(`---`);
parts.push(``);
parts.push(`## Como usar este arquivo no ChatGPT`);
parts.push(``);
parts.push(`Cole o prompt abaixo no início de uma conversa nova no ChatGPT e anexe este arquivo:`);
parts.push(``);
parts.push("```");
parts.push(`Você é um PM/dev sênior me ajudando a escrever prompts curtos e diretos`);
parts.push(`pra Lovable (TanStack Start + Supabase) modificar o app Trilha Santa Bronx.`);
parts.push(``);
parts.push(`Regras do projeto:`);
parts.push(`- Não quebrar provas finais já existentes nem a lógica de autorização do admin.`);
parts.push(`- Manter o padrão dos módulos (categorias, ordem, progresso da trilha).`);
parts.push(`- Prova final = uma só (múltipla escolha + abertas juntas), com pedido de liberação ao admin.`);
parts.push(`- Revisão Inteligente vive dentro de "Tarefa do Dia".`);
parts.push(`- Erros em exercícios viram revisão no dia seguinte.`);
parts.push(``);
parts.push(`Antes de me dar o prompt, leia o arquivo anexado pra entender a estrutura.`);
parts.push(`Quando eu te pedir uma mudança, responda APENAS com o prompt pronto pra eu`);
parts.push(`colar no Lovable — curto, específico, citando arquivos e comportamento esperado.`);
parts.push("```");
parts.push(``);
parts.push(`---`);
parts.push(``);
parts.push(`## Árvore de arquivos`);
parts.push(``);
parts.push("```");
parts.push(buildTree(allFiles));
parts.push("```");
parts.push(``);
parts.push(`---`);
parts.push(``);
parts.push(`## Conteúdo dos arquivos`);
parts.push(``);

for (const rel of allFiles) {
  let content;
  try { content = readFileSync(join(ROOT, rel), "utf8"); } catch { continue; }
  const lang = LANG_BY_EXT[extname(rel).toLowerCase()] ?? "";
  parts.push(`### \`${rel}\``);
  parts.push(``);
  parts.push("```" + lang);
  parts.push(content.replace(/```/g, "ʼʼʼ"));
  parts.push("```");
  parts.push(``);
}

const out = parts.join("\n");
writeFileSync(OUT_FILE, out, "utf8");

const kb = (out.length / 1024).toFixed(1);
console.log(`✅ Exportado: ${relative(ROOT, OUT_FILE)}`);
console.log(`   ${allFiles.length} arquivos · ${kb} KB`);
console.log(`\nBaixe esse arquivo e anexe no ChatGPT.`);
