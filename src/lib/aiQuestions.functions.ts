// Server functions para gerar e persistir as 12 questões de fixação por
// subcategoria do Módulo 7 usando o Lovable AI Gateway.

import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUBCATEGORY_APOSTILAS = import.meta.glob("@/content/produtos/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function resolveApostila(subcategoryKey: string): { slug: string; html: string } | null {
  // subcategoryKey ex: "excitantes", "vibrador_de_aplicativo"
  const dashed = subcategoryKey.replace(/_/g, "-");
  for (const [path, html] of Object.entries(SUBCATEGORY_APOSTILAS)) {
    const m = path.match(/apostila_(.+)\.html$/);
    if (!m) continue;
    if (m[1] === dashed) return { slug: m[1], html };
  }
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const QuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

const OutputSchema = z.object({
  questions: z.array(QuestionSchema).length(12),
});

export const generateProductQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ subcategoryKey: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apostila = resolveApostila(data.subcategoryKey);
    if (!apostila) throw new Error(`Apostila não encontrada para ${data.subcategoryKey}`);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const apostilaText = stripHtml(apostila.html);

    const prompt = `Você é uma autora de quizzes para treinamento de atendentes de sex shop.
Receberá uma apostila com informações sobre uma categoria de produto.
Gere EXATAMENTE 12 questões de múltipla escolha com 4 alternativas cada (a, b, c, d) baseadas SOMENTE no conteúdo da apostila.

Regras rígidas:
- Toda questão deve ter exatamente 1 alternativa correta e 3 distratores plausíveis.
- Os distratores devem ser plausíveis (não obviamente errados); evite "todas as anteriores", "nenhuma das anteriores", piadas, opções absurdas.
- Varie a posição da alternativa correta (não deixar tudo na mesma letra).
- Use português brasileiro coloquial igual ao da apostila.
- Cubra: o que é o produto, indicação, fala pronta para cliente, diferenças entre modelos, cuidados, e detalhes específicos citados na apostila.
- Não invente informação que não está na apostila.
- correctIndex é o índice (0-3) da alternativa correta no array options.

Apostila (categoria: ${apostila.slug}):
"""
${apostilaText}
"""

Devolva JSON estrito conforme schema com a chave "questions" contendo as 12 questões.`;

    const { output } = await generateText({
      model,
      output: Output.object({ schema: OutputSchema }),
      prompt,
    });

    // Persiste no banco.
    const { error } = await supabase
      .from("generated_questions")
      .upsert({
        subcategory_key: data.subcategoryKey,
        questions: output.questions as unknown as never,
        approved_by: userId,
        generated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);

    return { questions: output.questions, generatedAt: new Date().toISOString() };
  });

export const listGeneratedQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generated_questions")
      .select("subcategory_key, generated_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getGeneratedQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ subcategoryKey: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("generated_questions")
      .select("subcategory_key, questions, generated_at")
      .eq("subcategory_key", data.subcategoryKey)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
