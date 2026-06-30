// Parser leve para extrair seções estruturadas das apostilas de produtos
// (src/content/produtos/apostila_*.html). Trabalha por regex sobre o HTML
// bruto — é suficiente porque todas as apostilas seguem o mesmo template
// (.section, .list .item .num/<p>, .quote, .cards .mini-card).

export type ApostilaSummary = {
  oQueE?: string;
  pontosParaDecorar: string[];
  comoFalar?: string;
  cuidados: string[];
  /** Texto curto descrevendo cada produto, indexado pela ordem da seção
   *  "Detalhes de cada ..." da apostila. */
  productDetails: string[];
};

const sectionRe = /<section[^>]*class="[^"]*\bsection\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function stripOuterQuotes(s: string): string {
  return s.replace(/^["“”'']+/, "").replace(/["“”'']+$/, "").trim();
}

function getTitle(sectionHtml: string): string {
  const m = sectionHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  return m ? stripTags(m[1]).toLowerCase() : "";
}

function getTextBlock(sectionHtml: string): string | undefined {
  const m = sectionHtml.match(/<p[^>]*class="[^"]*\btext\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  return m ? stripTags(m[1]) : undefined;
}

function getListItems(sectionHtml: string): string[] {
  const out: string[] = [];
  const re = /<div[^>]*class="[^"]*\bitem\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*\bitem\b|<\/div>)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sectionHtml)) !== null) {
    // Cada item tem <div class="num">N</div> + <p>...</p>
    const pMatch = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) out.push(stripTags(pMatch[1]));
  }
  return out;
}

function getQuote(sectionHtml: string): string | undefined {
  const m = sectionHtml.match(/<div[^>]*class="[^"]*\bquote\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  return m ? stripOuterQuotes(stripTags(m[1])) : undefined;
}

function getMiniCards(sectionHtml: string): string[] {
  const out: string[] = [];
  const re = /<div[^>]*class="[^"]*\bmini-card\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sectionHtml)) !== null) {
    const pMatch = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) out.push(stripTags(pMatch[1]));
  }
  return out;
}

export function parseApostila(html: string): ApostilaSummary {
  const result: ApostilaSummary = {
    pontosParaDecorar: [],
    cuidados: [],
    productDetails: [],
  };
  if (!html) return result;
  let m: RegExpExecArray | null;
  sectionRe.lastIndex = 0;
  while ((m = sectionRe.exec(html)) !== null) {
    const body = m[1];
    const title = getTitle(body);
    if (!title) continue;
    if (title.includes("o que é")) {
      result.oQueE ??= getTextBlock(body);
    } else if (title.includes("precisa decorar")) {
      const items = getListItems(body);
      if (items.length) result.pontosParaDecorar = items;
    } else if (title.includes("como falar")) {
      result.comoFalar ??= getQuote(body) ?? getTextBlock(body);
    } else if (title.includes("cuidados")) {
      const cards = getMiniCards(body);
      if (cards.length) result.cuidados = cards;
    } else if (title.startsWith("detalhes")) {
      const items = getListItems(body);
      if (items.length) result.productDetails = items;
    }
  }
  return result;
}

/** Remove o prefixo "<strong>Nome:</strong>" do detalhe — usado quando vamos
 *  exibir o resumo dentro do card do produto (o nome já está no título). */
export function stripDetailPrefix(detail: string): string {
  // O strip já tirou as tags; o texto vem como "Nome (qualquer coisa): resto..."
  const idx = detail.indexOf(":");
  if (idx > 0 && idx < 80) return detail.slice(idx + 1).trim();
  return detail.trim();
}
