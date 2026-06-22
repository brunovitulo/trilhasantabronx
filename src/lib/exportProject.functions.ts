import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Lê os arquivos do projeto no servidor e devolve o snapshot em markdown.
 * Mesma lógica de scripts/export-projeto.mjs, exposto como server function
 * pra ser baixado direto pela interface.
 *
 * Funciona no dev/preview (filesystem disponível). Em produção (Worker),
 * o código-fonte do projeto não está no disco — esse botão é uma ferramenta
 * de desenvolvimento pra admin.
 */
export const exportProjectSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      throw new Response("Forbidden", { status: 403 });
    }

    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const { join, relative, extname } = await import("node:path");

    const ROOT = process.cwd();

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

    const IGNORE_DIRS = new Set([
      "node_modules", "dist", ".git", "build", ".cache", ".vite", "exports",
    ]);
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

    const LANG_BY_EXT: Record<string, string> = {
      ".ts": "ts", ".tsx": "tsx", ".js": "js", ".jsx": "jsx", ".mjs": "js",
      ".json": "json", ".css": "css", ".html": "html", ".sql": "sql",
      ".md": "md", ".sh": "bash", ".toml": "toml", ".yml": "yaml", ".yaml": "yaml",
    };

    function walk(dir: string, files: string[] = []) {
      let entries: string[];
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
          if (st.size > 500 * 1024) continue;
          files.push(rel);
        }
      }
      return files;
    }

    function buildTree(paths: string[]) {
      const tree: Record<string, any> = {};
      for (const p of paths) {
        const parts = p.split("/");
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

    const allFiles: string[] = [];
    for (const dir of INCLUDE_DIRS) {
      const full = join(ROOT, dir);
      try { if (statSync(full).isDirectory()) walk(full, allFiles); } catch {}
    }
    for (const f of INCLUDE_ROOT_FILES) {
      try { if (statSync(join(ROOT, f)).isFile()) allFiles.push(f); } catch {}
    }
    allFiles.sort();

    const now = new Date().toISOString();
    const parts: string[] = [];
    parts.push(`# Projeto Santa Bronx — snapshot completo`);
    parts.push(``);
    parts.push(`Gerado em: ${now}`);
    parts.push(`Total de arquivos: ${allFiles.length}`);
    parts.push(``);
    parts.push(`---`);
    parts.push(``);
    parts.push(`## Como usar este arquivo no ChatGPT`);
    parts.push(``);
    parts.push(`Cole o prompt abaixo no início de uma conversa nova e anexe este arquivo:`);
    parts.push(``);
    parts.push("```");
    parts.push(`Você é um PM/dev sênior me ajudando a escrever prompts curtos e diretos`);
    parts.push(`pra Lovable (TanStack Start + Supabase) modificar o app Trilha Santa Bronx.`);
    parts.push(``);
    parts.push(`Regras do projeto:`);
    parts.push(`- Não quebrar provas finais já existentes nem a lógica de autorização do admin.`);
    parts.push(`- Manter o padrão dos módulos (categorias, ordem, progresso da trilha).`);
    parts.push(`- Prova final = uma só (múltipla escolha + abertas juntas), com pedido ao admin.`);
    parts.push(`- Revisão Inteligente vive dentro de "Tarefa do Dia".`);
    parts.push(`- Erros em exercícios viram revisão no dia seguinte.`);
    parts.push(``);
    parts.push(`Antes de me dar o prompt, leia o arquivo anexado pra entender a estrutura.`);
    parts.push(`Quando eu pedir uma mudança, responda APENAS com o prompt pronto pra colar no Lovable.`);
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
      let content: string;
      try { content = readFileSync(join(ROOT, rel), "utf8"); } catch { continue; }
      const lang = LANG_BY_EXT[extname(rel).toLowerCase()] ?? "";
      parts.push(`### \`${rel}\``);
      parts.push(``);
      parts.push("```" + lang);
      parts.push(content.replace(/```/g, "ʼʼʼ"));
      parts.push("```");
      parts.push(``);
    }

    const markdown = parts.join("\n");
    return { markdown, fileCount: allFiles.length, sizeKb: Math.round(markdown.length / 1024) };
  });
