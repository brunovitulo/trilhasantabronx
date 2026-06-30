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
    };
  } catch (e) {
    return { url, fetchedAt, error: e instanceof Error ? e.message : "fetch error" };
  }
}

export const scrapeProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ScrapedProduct[]> => {
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
    // Mantém ordem de entrada.
    const byUrl = new Map(results.map((r) => [r.url, r]));
    return data.urls.map((u) => byUrl.get(u)!);
  });
