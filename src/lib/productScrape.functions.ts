// Server function que faz scraping ao vivo do preço, imagem e resumo
// dos produtos do site Santa Bronx (WooCommerce padrão).
// Chamada pelo bloco unificado de produtos no Módulo 7.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ScrapedProduct = {
  url: string;
  name?: string;
  price?: string;
  imageUrl?: string;
  summary?: string;
  /** Chips de especificação técnica extraídos da página do produto
   *  (ex.: "10 modos", "Recarregável", "Silicone", "À prova d'água",
   *  "Ponto G", "Anal"). Usados como pílulas adicionais no card e como
   *  fonte de dados para distratores da revisão. */
  specs?: string[];
  error?: string;
  fetchedAt: string;
};

const InputSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(40),
});

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractMeta(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]) : undefined;
}

function extractPrice(html: string): string | undefined {
  // WooCommerce: <p class="price">...<bdi>R$ 39,90</bdi>...</p>
  // Promoção:  <ins>...<bdi>R$ 29,90</bdi></ins> -- preferir esta
  const priceBlock = html.match(/<p[^>]*class="[^"]*\bprice\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  const block = priceBlock?.[1] ?? html;
  const ins = block.match(/<ins\b[\s\S]*?<bdi>([\s\S]*?)<\/bdi>[\s\S]*?<\/ins>/i);
  if (ins) return stripTags(ins[1]);
  const bdi = block.match(/<bdi>([\s\S]*?)<\/bdi>/i);
  if (bdi) return stripTags(bdi[1]);
  // Fallback: meta product:price:amount
  const meta = extractMeta(html, "product:price:amount") ?? extractMeta(html, "og:price:amount");
  if (meta) return `R$ ${meta.replace(".", ",")}`;
  return undefined;
}

function extractName(html: string): string | undefined {
  const og = extractMeta(html, "og:title");
  if (og) return og.split("|")[0].split("—")[0].trim();
  const h1 = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  return undefined;
}

function extractImage(html: string): string | undefined {
  return extractMeta(html, "og:image");
}

function extractSummary(html: string): string | undefined {
  const block = html.match(
    /<div[^>]*class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  );
  if (block) {
    const text = stripTags(block[1]);
    if (text.length > 280) return text.slice(0, 277) + "…";
    return text;
  }
  const og = extractMeta(html, "og:description");
  if (og) {
    return og.length > 280 ? og.slice(0, 277) + "…" : og;
  }
  return undefined;
}

/** Extrai pílulas de especificação técnica a partir do texto da página do
 *  produto (descrição curta + descrição longa + tabela de atributos do
 *  WooCommerce). Cobre o que um atendente precisa lembrar:
 *  modos de vibração, fonte de energia, material, à prova d'água,
 *  uso indicado e tamanho. Ordem importa — chips mais relevantes primeiro. */
function extractSpecs(html: string): string[] {
  // Pega blocos onde a info normalmente vive (descrição + atributos).
  const blocks: string[] = [];
  const grab = (re: RegExp) => {
    const m = html.match(re);
    if (m) blocks.push(m[1]);
  };
  grab(/<div[^>]*class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  grab(/<div[^>]*id="tab-description"[^>]*>([\s\S]*?)<\/div>\s*<div/i);
  grab(/<table[^>]*class="[^"]*shop_attributes[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (blocks.length === 0) blocks.push(html);
  const text = stripTags(blocks.join(" \n "));
  const lower = text.toLowerCase();
  const chips: string[] = [];
  const push = (chip: string) => {
    if (!chips.some((c) => c.toLowerCase() === chip.toLowerCase())) chips.push(chip);
  };

  // Modos de vibração / velocidades / funções
  const modos = text.match(/(\d{1,2})\s*(?:modos?|velocidades?|fun[cç][õo]es|n[ií]veis|frequ[êe]ncias?|padr[õo]es)\b/i);
  if (modos) push(`${modos[1]} modos`);

  // Fonte de energia
  if (/recarreg[áa]vel|recarga\s+usb|carregamento\s+usb|\busb\b|cabo\s+usb/i.test(lower))
    push("Recarregável USB");
  else if (/\b(\d+)\s*(?:pilhas?|baterias?)\b|funciona\s+(?:com|a)\s+pilhas?|à\s+pilha/i.test(lower))
    push("A pilha");

  // À prova d'água
  if (/[àa]\s*prova\s*d['’ ]?[aá]gua|resistente\s*[àa]\s*[aá]gua|water\s*proof|waterproof|ipx[4-8]/i.test(lower))
    push("À prova d'água");

  // Materiais
  for (const [re, label] of [
    [/silicone\s+m[ée]dico/i, "Silicone médico"],
    [/silicone/i, "Silicone"],
    [/abs\b/i, "ABS"],
    [/pvc\b/i, "PVC"],
    [/tpe\b|tpr\b/i, "TPE"],
    [/metal|a[çc]o\s+inox|inox/i, "Metal"],
    [/cyber\s*skin|cyberskin|jelly|gel/i, "Cyberskin"],
    [/l[áa]tex/i, "Látex"],
    [/vidro/i, "Vidro"],
  ] as [RegExp, string][]) {
    if (re.test(lower)) {
      push(label);
      break;
    }
  }

  // Indicação de uso
  if (/ponto\s*g\b/i.test(lower)) push("Ponto G");
  if (/clit[óo]ris|clitoriano/i.test(lower)) push("Clitóris");
  if (/anal|pl[úu]g\s*anal|para\s+uso\s+anal/i.test(lower)) push("Uso anal");
  if (/casal|casais|para\s+dois/i.test(lower)) push("Para casal");
  if (/masturba[çc][ãa]o\s+masculina|p[êe]nis|glande/i.test(lower)) push("Masculino");
  if (/aplicativo|app\s+bluetooth|controle\s+por\s+aplicativo|bluetooth/i.test(lower))
    push("Controle por app");
  if (/controle\s+remoto|controle\s+sem\s+fio|wireless\s+remote/i.test(lower))
    push("Controle remoto");
  if (/sabor\s+([a-zà-ÿ]+)/i.test(lower)) {
    const m = lower.match(/sabor\s+([a-zà-ÿ]+)/i);
    if (m) push(`Sabor ${m[1]}`);
  }
  if (/base\s+(?:de\s+)?[áa]gua|water\s*based/i.test(lower)) push("Base água");
  if (/base\s+(?:de\s+)?silicone/i.test(lower)) push("Base silicone");
  if (/refresca|gela|esfria|menta|menthol/i.test(lower)) push("Refresca");
  if (/esquenta|aquece|t[ée]rmico/i.test(lower)) push("Aquece");
  if (/anest[ée]sico|dessensibilizante|retardante/i.test(lower)) push("Retardante");

  // Tamanho aproximado (apenas o primeiro número plausível em cm)
  const tam = text.match(/(\d{1,2}(?:[.,]\d)?)\s*cm\b/i);
  if (tam) push(`${tam[1].replace(",", ".")} cm`);

  return chips.slice(0, 6);
}

async function scrapeOne(url: string): Promise<ScrapedProduct> {
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; SantaBronxTrilha/1.0; +https://trilhasantabronx.lovable.app)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { url, fetchedAt, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    return {
      url,
      fetchedAt,
      name: extractName(html),
      price: extractPrice(html),
      imageUrl: extractImage(html),
      summary: extractSummary(html),
      specs: extractSpecs(html),
    };
  } catch (e) {
    return { url, fetchedAt, error: e instanceof Error ? e.message : "fetch error" };
  }
}

export const scrapeProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }): Promise<ScrapedProduct[]> => {
    // Limita concorrência leve para não sobrecarregar o site.
    const results: ScrapedProduct[] = [];
    const queue = [...data.urls];
    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const url = queue.shift();
        if (!url) break;
        results.push(await scrapeOne(url));
      }
    });
    await Promise.all(workers);
    const byUrl = new Map(results.map((r) => [r.url, r]));
    const ordered = data.urls.map((u) => byUrl.get(u)!);

    // Grava no cache GLOBAL compartilhado (product_price_cache) — outros usuários
    // já leem os preços/imagens atualizados sem rodar scraping novamente.
    try {
      const { supabase, userId } = context;
      const rows = ordered
        .filter((p) => !!p)
        .map((p) => ({
          url: p.url,
          name: p.name ?? null,
          price: p.price ?? null,
          image_url: p.imageUrl ?? null,
          summary: p.summary ?? null,
          specs: (p.specs ?? []) as unknown,
          error: p.error ?? null,
          fetched_at: p.fetchedAt,
          updated_by: userId,
        }));
      if (rows.length > 0) {
        await supabase
          .from("product_price_cache")
          .upsert(rows as never, { onConflict: "url" });
      }
    } catch {
      // Falha silenciosa: não bloqueia o retorno dos dados ao cliente.
    }

    return ordered;
  });

/** Lê o cache global compartilhado de preços (sem disparar scraping). */
export const getProductPriceCache = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ScrapedProduct[]> => {
    const { data, error } = await context.supabase
      .from("product_price_cache")
      .select("url, name, price, image_url, summary, specs, error, fetched_at");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      url: r.url as string,
      name: (r.name as string | null) ?? undefined,
      price: (r.price as string | null) ?? undefined,
      imageUrl: (r.image_url as string | null) ?? undefined,
      summary: (r.summary as string | null) ?? undefined,
      specs: ((r.specs as unknown as string[] | null) ?? []),
      error: (r.error as string | null) ?? undefined,
      fetchedAt: r.fetched_at as string,
    }));
  });
