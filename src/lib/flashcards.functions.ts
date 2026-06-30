// Server functions para o flashcard de revisão do Módulo 7.
// - generateProductFunctionalities: admin gera (via Lovable AI) e cacheia uma frase
//   curta de funcionalidade para cada produto individual de uma subcategoria.
// - listFunctionalityCoverage: admin vê quais subcategorias já têm cache.
// - getFlashcardSession: retorna a próxima fila de produtos a revisar de um grupo,
//   já com imagem/preço scrapeados, opções de funcionalidade e opções de preço.
// - recordFlashcardResult: registra acerto/erro por produto e marca/desmarca mastery.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  M7_PRODUCTS,
  M7_SUBCATEGORY_LABELS,
  type M7GroupId,
  type M7Product,
  getM7ProductsBySubcategory,
  getM7ProductsByGroup,
} from "@/data/m7Products";
import { spDateKey, addDaysIso } from "@/lib/dailyReview";

// ---------- helpers --------------------------------------------------------

const APOSTILAS = import.meta.glob("@/content/produtos/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function resolveApostila(subcategoryKey: string): string | null {
  const dashed = subcategoryKey.replace(/_/g, "-");
  for (const [path, html] of Object.entries(APOSTILAS)) {
    const m = path.match(/apostila_(.+)\.html$/);
    if (m && m[1] === dashed) return html;
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
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceBRL(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?/);
  if (!m) return null;
  const whole = m[1].replace(/\./g, "");
  const cents = m[2] ?? "00";
  return Number(whole) + Number(cents.padEnd(2, "0")) / 100;
}

function formatPriceBRL(n: number): string {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

/** Cria 4 opções de preço próximas. ≤R$100 usa ±R$5; acima usa ±10%. */
function buildPriceOptions(realPrice: number, seed: number): { options: string[]; correctIndex: number } {
  const step = realPrice <= 100 ? 5 : Math.max(5, Math.round(realPrice * 0.1));
  // PRNG simples para escolher offsets variados.
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  // Gera 3 deltas distintos não-zero.
  const deltas = new Set<number>();
  while (deltas.size < 3) {
    const sign = rand() < 0.5 ? -1 : 1;
    const mult = 1 + Math.floor(rand() * 3); // 1,2,3
    deltas.add(sign * mult * step);
  }
  const arr = [0, ...Array.from(deltas)];
  // Embaralha
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const prices = arr.map((d) => Math.max(1, realPrice + d));
  const correctIndex = arr.findIndex((d) => d === 0);
  return {
    options: prices.map((p) => formatPriceBRL(Math.round(p * 100) / 100)),
    correctIndex,
  };
}

async function scrapeOne(url: string): Promise<{ price?: string; imageUrl?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; SantaBronxTrilha/1.0; +https://trilhasantabronx.lovable.app)",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const html = await res.text();
    // preço
    const priceBlock = html.match(/<p[^>]*class="[^"]*\bprice\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const block = priceBlock?.[1] ?? html;
    let price: string | undefined;
    const ins = block.match(/<ins\b[\s\S]*?<bdi>([\s\S]*?)<\/bdi>[\s\S]*?<\/ins>/i);
    if (ins) price = ins[1].replace(/<[^>]+>/g, "").trim();
    else {
      const bdi = block.match(/<bdi>([\s\S]*?)<\/bdi>/i);
      if (bdi) price = bdi[1].replace(/<[^>]+>/g, "").trim();
    }
    // imagem
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const imageUrl = og ? og[1] : undefined;
    return { price, imageUrl };
  } catch {
    return {};
  }
}

// ---------- ADMIN: gerar funcionalidades ----------------------------------

const FuncSchema = z.object({
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        functionality: z.string().min(6).max(160),
      }),
    )
    .min(1),
});

export const generateProductFunctionalities = createServerFn({ method: "POST" })
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
    if (!apostila)
      throw new Error(`Apostila não encontrada para ${data.subcategoryKey}`);
    const products = getM7ProductsBySubcategory(data.subcategoryKey);
    if (products.length === 0)
      throw new Error(`Nenhum produto catalogado para ${data.subcategoryKey}`);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const apostilaText = stripHtml(apostila).slice(0, 8000);
    const list = products
      .map((p, i) => `${i + 1}. slug=${p.productSlug} | nome=${p.productName}`)
      .join("\n");

    const prompt = `Você é treinadora de atendentes de sex shop. Para cada produto da lista abaixo, escreva UMA frase curta (máx. 18 palavras, em português brasileiro coloquial) descrevendo a FUNCIONALIDADE específica desse produto — o que ele faz / qual efeito entrega.

Regras rígidas:
- Use SOMENTE informações da apostila + nome do produto. Não invente.
- Cada frase precisa ser DISTINGUÍVEL das outras: destaque o que diferencia este produto dos irmãos (efeito principal, sabor, tamanho, material, modo de uso etc.).
- Não comece com "Produto que…" — vá direto ao efeito (ex.: "Vibra, refresca, suga e pulsa com sabor melancia", "Plug pequeno em silicone macio ideal para iniciantes").
- Não use emojis, aspas, listas, nem termos vagos como "para prazer".

Apostila (categoria ${data.subcategoryKey}):
"""
${apostilaText}
"""

Produtos:
${list}

Devolva JSON estrito com a chave "items": [{ "productSlug": "...", "functionality": "..." }] na MESMA ORDEM e cobrindo TODOS os ${products.length} produtos.`;

    const { output } = await generateText({
      model,
      output: Output.object({ schema: FuncSchema }),
      prompt,
    });

    const bySlug = new Map(output.items.map((it) => [it.productSlug, it.functionality]));
    const rows = products.map((p) => ({
      group_id: p.groupId,
      subcategory_id: p.subcategoryId,
      product_slug: p.productSlug,
      product_name: p.productName,
      product_url: p.productUrl,
      functionality: bySlug.get(p.productSlug) ?? p.productName,
      generated_by: userId,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("product_flashcards")
      .upsert(rows as never, { onConflict: "subcategory_id,product_slug" });
    if (error) throw new Error(error.message);

    return { count: rows.length };
  });

export const listFlashcardCoverage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("product_flashcards")
      .select("subcategory_id, updated_at");
    if (error) throw new Error(error.message);
    // Agrupa por subcategoria.
    const map = new Map<string, { count: number; latest: string }>();
    for (const r of data ?? []) {
      const cur = map.get(r.subcategory_id) ?? { count: 0, latest: "" };
      cur.count += 1;
      if (!cur.latest || r.updated_at > cur.latest) cur.latest = r.updated_at;
      map.set(r.subcategory_id, cur);
    }
    return Array.from(map.entries()).map(([subcategoryId, v]) => ({
      subcategoryId,
      count: v.count,
      latest: v.latest,
    }));
  });

// ---------- USER: sessão de flashcards -----------------------------------

export type FlashcardItem = {
  productSlug: string;
  productName: string;
  productUrl: string;
  subcategoryId: string;
  subcategoryLabel: string;
  imageUrl: string | null;
  /** Opções de funcionalidade (4); a correta é a do próprio produto. */
  functionalityOptions: string[];
  functionalityCorrectIndex: number;
  /** Opções de preço (4) próximas. */
  priceOptions: string[];
  priceCorrectIndex: number;
  /** Preço bruto exibido como referência ("R$ 39,90"). */
  realPrice: string;
  /** Se não foi possível obter preço/imagem online, sinalizamos. */
  scrapeError?: string;
};

export type FlashcardSession = {
  groupId: M7GroupId;
  items: FlashcardItem[];
  /** Produtos do grupo já dominados (não entram nesta sessão). */
  masteredSlugs: string[];
};

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const getFlashcardSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        groupId: z.enum(["cosmeticos", "acessorios", "vibradores"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<FlashcardSession> => {
    const { supabase, userId } = context;
    const today = spDateKey();
    const products = getM7ProductsByGroup(data.groupId);

    // Cache de funcionalidades (todas do grupo, para alimentar distractors).
    const subcategoryIds = Array.from(new Set(products.map((p) => p.subcategoryId)));
    const { data: cacheRows } = await supabase
      .from("product_flashcards")
      .select("subcategory_id, product_slug, functionality")
      .in("subcategory_id", subcategoryIds);
    const funcCache = new Map<string, string>();
    for (const r of cacheRows ?? []) {
      funcCache.set(`${r.subcategory_id}:${r.product_slug}`, r.functionality);
    }

    // Mastery do usuário.
    const { data: masteryRows } = await supabase
      .from("product_flashcard_mastery")
      .select("subcategory_id, product_slug, mastered_at")
      .eq("user_id", userId)
      .eq("group_id", data.groupId);
    const masteredSet = new Set<string>();
    for (const r of masteryRows ?? []) {
      if (r.mastered_at) masteredSet.add(`${r.subcategory_id}:${r.product_slug}`);
    }

    const queue = products.filter(
      (p) => !masteredSet.has(`${p.subcategoryId}:${p.productSlug}`),
    );

    // Scrape em paralelo (limitado a 6 conexões).
    const results = new Map<string, { price?: string; imageUrl?: string }>();
    const work = [...queue];
    await Promise.all(
      Array.from({ length: 6 }, async () => {
        while (work.length) {
          const p = work.shift();
          if (!p) break;
          results.set(p.productUrl, await scrapeOne(p.productUrl));
        }
      }),
    );

    function pickDistractors(p: M7Product, seed: number): string[] {
      const siblings = getM7ProductsBySubcategory(p.subcategoryId).filter(
        (s) => s.productSlug !== p.productSlug,
      );
      const pool = siblings
        .map((s) => funcCache.get(`${s.subcategoryId}:${s.productSlug}`))
        .filter((x): x is string => !!x);
      // Se faltam distratores nos irmãos da subcategoria, completa com outros do grupo.
      if (pool.length < 3) {
        const extras = products
          .filter((x) => x.productSlug !== p.productSlug)
          .map((x) => funcCache.get(`${x.subcategoryId}:${x.productSlug}`))
          .filter((x): x is string => !!x && !pool.includes(x));
        pool.push(...extras);
      }
      // Dedup
      const uniq = Array.from(new Set(pool));
      // Embaralha determinístico
      let s = seed >>> 0;
      const rand = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
      };
      for (let i = uniq.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
      }
      return uniq.slice(0, 3);
    }

    const items: FlashcardItem[] = queue.map((p) => {
      const scraped = results.get(p.productUrl) ?? {};
      const correctFunc =
        funcCache.get(`${p.subcategoryId}:${p.productSlug}`) ?? p.productName;
      const baseSeed = seedFromString(`${userId}:${today}:${p.productSlug}`);
      const distractors = pickDistractors(p, baseSeed);
      // Monta opções de funcionalidade e embaralha.
      const funcArr = [correctFunc, ...distractors];
      while (funcArr.length < 4) funcArr.push(p.subcategoryLabel);
      let s = baseSeed;
      const rand = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
      };
      const order = funcArr.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const funcOptions = order.map((i) => funcArr[i]);
      const funcCorrectIndex = order.indexOf(0);

      const realNum = parsePriceBRL(scraped.price);
      let priceOptions: string[] = [];
      let priceCorrectIndex = 0;
      let realPrice = scraped.price ?? "—";
      if (realNum && realNum > 0) {
        const built = buildPriceOptions(realNum, baseSeed);
        priceOptions = built.options;
        priceCorrectIndex = built.correctIndex;
        realPrice = formatPriceBRL(realNum);
      } else {
        // Sem preço — preenche placeholder pra UI não quebrar.
        priceOptions = ["—", "—", "—", "—"];
        priceCorrectIndex = 0;
      }

      return {
        productSlug: p.productSlug,
        productName: p.productName,
        productUrl: p.productUrl,
        subcategoryId: p.subcategoryId,
        subcategoryLabel: M7_SUBCATEGORY_LABELS[p.subcategoryId] ?? p.subcategoryLabel,
        imageUrl: scraped.imageUrl ?? null,
        functionalityOptions: funcOptions,
        functionalityCorrectIndex: funcCorrectIndex,
        priceOptions,
        priceCorrectIndex,
        realPrice,
        scrapeError: !scraped.price ? "Preço indisponível agora" : undefined,
      };
    });

    return {
      groupId: data.groupId,
      items,
      masteredSlugs: products
        .filter((p) => masteredSet.has(`${p.subcategoryId}:${p.productSlug}`))
        .map((p) => p.productSlug),
    };
  });

export const recordFlashcardResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        groupId: z.enum(["cosmeticos", "acessorios", "vibradores"]),
        subcategoryId: z.string().min(1),
        productSlug: z.string().min(1),
        mastered: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = spDateKey();
    // Lê linha atual para preservar 'attempts'.
    const { data: existing } = await supabase
      .from("product_flashcard_mastery")
      .select("id, attempts")
      .eq("user_id", userId)
      .eq("subcategory_id", data.subcategoryId)
      .eq("product_slug", data.productSlug)
      .maybeSingle();

    const row = {
      user_id: userId,
      group_id: data.groupId,
      subcategory_id: data.subcategoryId,
      product_slug: data.productSlug,
      mastered_at: data.mastered ? today : null,
      next_review_date: data.mastered ? null : addDaysIso(today, 1),
      last_attempt_at: new Date().toISOString(),
      attempts: (existing?.attempts ?? 0) + 1,
    };
    const { error } = await supabase
      .from("product_flashcard_mastery")
      .upsert(row as never, { onConflict: "user_id,subcategory_id,product_slug" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
