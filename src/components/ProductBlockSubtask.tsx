// Bloco unificado de conteúdo + produtos para o Módulo 7.
//
// Estrutura visual aprovada:
//   1. Stepper compacto (StepGuide)
//   2. Botão "Abrir conteúdo completo" (apostila em iframe)
//   3. Card único contendo:
//      - 4 seções extraídas da apostila com badges circulares grandes e
//        coloridos (O que é / Pontos para decorar / Como falar / Cuidados)
//      - Lista de produtos da categoria em uma coluna (largura total),
//        com chips coloridos para as funcionalidades, imagem, preço e link
//   4. Confirmação para concluir o passo
//
// A atualização dos preços é feita por um único botão global no topo do
// tópico — aqui apenas LEMOS o cache compartilhado (chave "scrape-products-all").

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Info,
  Lightbulb,
  MessageCircle,
  Package,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StepGuide } from "@/components/StepGuide";
import type { Subtask } from "@/data/topics";
import type { ScrapedProduct } from "@/lib/productScrape.functions";
import { GLOBAL_SCRAPE_CACHE_KEY } from "@/lib/globalScrape";
import { parseApostila, stripDetailPrefix } from "@/lib/apostilaParser";

type Props = {
  subtask: Extract<Subtask, { kind: "product_block" }>;
  apostila?: { title: string; html: string };
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Faz match de cada produto com o item da seção "Detalhes" da apostila.
 *  Estratégia: tenta zip por índice (apostila e topics.ts costumam estar
 *  na mesma ordem). Se a contagem divergir ou o nome no detalhe não bater,
 *  faz fallback por sobreposição de palavras. */
function buildProductSummaries(
  products: { name: string; url: string }[],
  details: string[],
): Map<string, string> {
  const out = new Map<string, string>();
  if (details.length === 0) return out;

  const sameOrder = details.length === products.length;
  const detailTokens = details.map((d) => new Set(normalize(d).split(" ")));

  products.forEach((p, i) => {
    let chosen: string | undefined;
    if (sameOrder) chosen = details[i];
    else {
      const pTokens = normalize(p.name).split(" ").filter((t) => t.length > 3);
      let bestScore = 0;
      details.forEach((d, j) => {
        let score = 0;
        for (const t of pTokens) if (detailTokens[j].has(t)) score++;
        if (score > bestScore) {
          bestScore = score;
          chosen = d;
        }
      });
    }
    if (chosen) out.set(p.url, stripDetailPrefix(chosen));
  });
  return out;
}

/** Extrai chips de funcionalidades do resumo da apostila.
 *  Tenta duas estratégias para garantir que TODOS os produtos virem pílulas
 *  (não apenas os que começam com "A + B + C"):
 *
 *   1) Capta QUALQUER trecho do texto no formato `X + Y + Z` (também aceita
 *      `/`, `•`, `|`). Funciona para listas no início ("SUGA + VIBRA + ...")
 *      e no meio do texto ("4 efeitos: SHOCK + REFRESCA + AQUECE + ...").
 *   2) Para os que sobrarem sem chips (ex.: "diferencial é o SABOR DE MEL e a
 *      fórmula SEM AÇÚCAR"), extrai frases em CAIXA ALTA com 2+ palavras como
 *      chips — é o padrão visual que a apostila usa para destacar atributos.
 */
function splitFeatures(summary: string): { chips: string[]; description: string } {
  if (!summary) return { chips: [], description: "" };
  const chips: string[] = [];
  const tryAdd = (raw: string) => {
    const clean = raw
      .replace(/^[\s.:;,\-–—]+|[\s.:;,\-–—]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (clean.length < 2 || clean.length > 26) return false;
    if (clean.split(/\s+/).length > 3) return false;
    const cap = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    if (!chips.some((c) => c.toLowerCase() === cap.toLowerCase())) chips.push(cap);
    return true;
  };

  let description = summary;

  // (1) Sequências X + Y + Z em qualquer posição do texto.
  const seqRe =
    /[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9'’ ]{0,22}[A-Za-zÀ-ÿ0-9](?:\s*[+/•|]\s*[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9'’ ]{0,22}[A-Za-zÀ-ÿ0-9]){1,}/g;
  description = description.replace(seqRe, (match) => {
    const parts = match
      .split(/\s*[+/•|]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 2) return match;
    const valid = parts.filter((p) => p.length <= 26 && p.split(/\s+/).length <= 3);
    if (valid.length < 2) return match;
    valid.forEach(tryAdd);
    return "";
  });

  // (2) Frases em CAIXA ALTA com 2+ palavras (ex.: "SABOR DE MEL", "SEM AÇÚCAR").
  const capsRe = /\b([A-ZÀ-Ý][A-ZÀ-Ý0-9'’]*(?:\s+[A-ZÀ-Ý][A-ZÀ-Ý0-9'’]*){1,3})\b/g;
  description = description.replace(capsRe, (match) => {
    if (tryAdd(match)) return "";
    return match;
  });

  description = description
    .replace(/\s*\d+\s+efeitos?\s*:?\s*/gi, " ")
    .replace(/^\s*[.:;,\-–—]+\s*/, "")
    .replace(/\s*[.:;,\-–—]+\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { chips, description };
}

// Paleta cíclica para chips de funcionalidade.
const CHIP_PALETTE = [
  { bg: "oklch(0.92 0.06 295)", fg: "oklch(0.40 0.18 295)", dbg: "oklch(0.45 0.18 295 / 25%)", dfg: "oklch(0.85 0.12 295)" },
  { bg: "oklch(0.93 0.07 195)", fg: "oklch(0.40 0.15 195)", dbg: "oklch(0.45 0.15 195 / 25%)", dfg: "oklch(0.85 0.12 195)" },
  { bg: "oklch(0.93 0.08 80)", fg: "oklch(0.45 0.16 70)", dbg: "oklch(0.50 0.16 70 / 25%)", dfg: "oklch(0.86 0.13 80)" },
  { bg: "oklch(0.92 0.07 150)", fg: "oklch(0.42 0.14 150)", dbg: "oklch(0.45 0.14 150 / 25%)", dfg: "oklch(0.85 0.12 150)" },
  { bg: "oklch(0.93 0.07 25)", fg: "oklch(0.50 0.20 25)", dbg: "oklch(0.55 0.22 25 / 22%)", dfg: "oklch(0.85 0.14 25)" },
  { bg: "oklch(0.92 0.07 320)", fg: "oklch(0.42 0.16 320)", dbg: "oklch(0.45 0.16 320 / 25%)", dfg: "oklch(0.85 0.12 320)" },
];

export function ProductBlockSubtask({ subtask, apostila, completed, onComplete, onUncheck }: Props) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);

  const qc = useQueryClient();
  const [, forceRender] = useState(0);
  useEffect(() => {
    const unsub = qc.getQueryCache().subscribe((evt) => {
      if (evt.type === "updated" && (evt.query.queryKey as string[])[0] === GLOBAL_SCRAPE_CACHE_KEY) {
        forceRender((n) => n + 1);
      }
    });
    return () => unsub();
  }, [qc]);

  const scrapedMap =
    qc.getQueryData<Record<string, ScrapedProduct>>([GLOBAL_SCRAPE_CACHE_KEY]) ?? {};

  const apostilaContent = useMemo(
    () => (apostila?.html ? parseApostila(apostila.html) : null),
    [apostila?.html],
  );

  const productSummaries = useMemo(
    () => buildProductSummaries(subtask.products, apostilaContent?.productDetails ?? []),
    [subtask.products, apostilaContent?.productDetails],
  );

  return (
    <div className="space-y-4">
      <StepGuide
        steps={[
          { icon: BookOpen, title: "Abra o conteúdo", description: "Leia o que é, pontos para decorar, fala pronta e cuidados." },
          { icon: Package, title: "Revise os produtos", description: "Memorize nome, preço e características de cada item." },
          { icon: ExternalLink, title: "Confirme", description: "Marque a confirmação e clique em concluir." },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
          onClick={() => {
            setNonce((n) => n + 1);
            setOpen(true);
          }}
        >
          <BookOpen className="h-4 w-4 mr-1.5" />
          Abrir conteúdo completo
        </Button>
      </div>

      {/* Card único contendo as 4 seções + lista de produtos */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Resumo extraído da apostila — visual rico, espaçado, com badges grandes */}
        <div
          className="flex flex-col"
          style={{ gap: 18, padding: "20px 22px" }}
        >
          {apostilaContent?.oQueE && (
            <RichSummary
              icon={Info}
              title="O que é esse produto?"
              subtitle="Explicação simples para memorizar"
              tone="purple"
            >
              <p
                style={{
                  fontSize: 14.5,
                  color: "var(--text-primary)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {apostilaContent.oQueE}
              </p>
            </RichSummary>
          )}

          {apostilaContent && apostilaContent.pontosParaDecorar.length > 0 && (
            <RichSummary
              icon={Lightbulb}
              title="Pontos para decorar"
              subtitle="O que não pode escapar quando o cliente perguntar"
              tone="teal"
            >
              <ol
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  counterReset: "ponto",
                }}
              >
                {apostilaContent.pontosParaDecorar.map((it, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: "var(--bg-success)",
                        color: "var(--text-success)",
                        fontSize: 12,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 14.5,
                        color: "var(--text-primary)",
                        lineHeight: 1.65,
                      }}
                    >
                      {it}
                    </span>
                  </li>
                ))}
              </ol>
            </RichSummary>
          )}

          {apostilaContent?.comoFalar && (
            <RichSummary
              icon={MessageCircle}
              title="Como falar com o cliente"
              subtitle="Fala pronta — copie a estrutura e adapte"
              tone="green"
            >
              <p
                style={{
                  fontSize: 14.5,
                  color: "var(--text-primary)",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  margin: 0,
                  borderLeft: "3px solid var(--border-success)",
                  paddingLeft: 12,
                }}
              >
                “{apostilaContent.comoFalar}”
              </p>
            </RichSummary>
          )}

          {apostilaContent && apostilaContent.cuidados.length > 0 && (
            <RichSummary
              icon={AlertTriangle}
              title="Cuidados importantes"
              subtitle="O que NUNCA pode acontecer com esse produto"
              tone="red"
            >
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {apostilaContent.cuidados.map((it, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      fontSize: 14.5,
                      color: "var(--text-primary)",
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: "var(--text-danger)",
                        marginTop: 10,
                      }}
                    />
                    {it}
                  </li>
                ))}
              </ul>
            </RichSummary>
          )}
        </div>

        {/* Divisor */}
        <div style={{ borderTop: "1px solid var(--border-subtle)" }} />

        {/* Lista de produtos */}
        <div style={{ padding: "18px 20px 20px" }}>
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} style={{ color: "var(--text-pro)" }} />
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--text-pro)",
              }}
            >
              Produtos desta categoria ({subtask.products.length})
            </p>
          </div>

          {/* Banner — instrução de decoreba (azul) */}
          <div
            className="mb-3 flex items-start gap-2 rounded-lg"
            style={{
              background: "var(--bg-accent)",
              color: "var(--text-accent)",
              padding: "10px 12px",
              border: "1px solid var(--border-accent)",
            }}
          >
            <Sparkles size={15} style={{ marginTop: 1, flexShrink: 0, color: "var(--text-accent)" }} />
            <p style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              Decore o nome, o valor e as principais funcionalidades de cada
              produto abaixo — você vai precisar lembrar disso na revisão.
            </p>
          </div>

          <div className="grid gap-3 grid-cols-1">
            {subtask.products.map((p) => {
              const d = scrapedMap[p.url];
              const summary = productSummaries.get(p.url) ?? "";
              const { chips, description } = splitFeatures(summary);
              return (
                <div
                  key={p.url}
                  className="flex gap-3 rounded-xl"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-subtle)",
                    padding: 12,
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      width: 64,
                      height: 64,
                      background: "var(--surface-1)",
                      borderRadius: 10,
                    }}
                  >
                    {d?.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className="min-w-0 leading-snug"
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {p.name}
                      </p>
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: d?.price ? "var(--text-success)" : "var(--text-muted)",
                        }}
                      >
                        {d?.price ?? "—"}
                      </span>
                    </div>

                    {chips.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {chips.map((chip, i) => {
                          const c = CHIP_PALETTE[i % CHIP_PALETTE.length];
                          return (
                            <span
                              key={i}
                              className="product-feature-chip"
                              style={
                                {
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: ".02em",
                                  textTransform: "uppercase",
                                  padding: "3px 9px",
                                  borderRadius: 999,
                                  background: c.bg,
                                  color: c.fg,
                                  ["--chip-bg-dark" as string]: c.dbg,
                                  ["--chip-fg-dark" as string]: c.dfg,
                                } as React.CSSProperties
                              }
                            >
                              {chip}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {description && (
                      <p
                        className="mt-1.5 leading-snug"
                        style={{ fontSize: 12.5, color: "var(--text-secondary)" }}
                      >
                        {description}
                      </p>
                    )}

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-success)",
                      }}
                    >
                      Ver no site <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id={`${subtask.id}-confirm`}
          checked={confirmed}
          disabled={completed}
          onCheckedChange={(v) => setConfirmed(!!v)}
        />
        <Label htmlFor={`${subtask.id}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
          {subtask.confirmLabel}
        </Label>
      </div>

      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={!confirmed}
            onClick={onComplete}
          >
            Concluir passo
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{apostila?.title ?? subtask.title}</DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {apostila ? (
            <iframe
              key={nonce}
              srcDoc={apostila.html}
              title={apostila.title}
              className="flex-1 w-full border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Conteúdo não encontrado.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Sub-componentes de resumo (visual rico) ---------- */

type Tone = "purple" | "teal" | "green" | "red";

const TONE_STYLES: Record<
  Tone,
  { bg: string; fg: string; bgDark: string; fgDark: string }
> = {
  purple: {
    bg: "oklch(0.92 0.07 295)",
    fg: "oklch(0.40 0.18 295)",
    bgDark: "oklch(0.45 0.18 295 / 28%)",
    fgDark: "oklch(0.86 0.12 295)",
  },
  teal: {
    bg: "oklch(0.92 0.08 195)",
    fg: "oklch(0.38 0.14 195)",
    bgDark: "oklch(0.45 0.15 195 / 28%)",
    fgDark: "oklch(0.86 0.12 195)",
  },
  green: {
    bg: "oklch(0.92 0.08 150)",
    fg: "oklch(0.40 0.14 150)",
    bgDark: "oklch(0.45 0.14 150 / 28%)",
    fgDark: "oklch(0.86 0.12 150)",
  },
  red: {
    bg: "oklch(0.93 0.07 25)",
    fg: "oklch(0.50 0.20 25)",
    bgDark: "oklch(0.55 0.22 25 / 24%)",
    fgDark: "oklch(0.86 0.14 25)",
  },
};

function RichSummary({
  icon: Icon,
  title,
  subtitle,
  tone,
  children,
}: {
  icon: typeof Info;
  title: string;
  subtitle?: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  const t = TONE_STYLES[tone];
  return (
    <section
      className="rich-summary-block"
      style={
        {
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "16px 18px",
          borderRadius: 14,
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          ["--rs-icon-bg" as string]: t.bg,
          ["--rs-icon-fg" as string]: t.fg,
          ["--rs-icon-bg-dark" as string]: t.bgDark,
          ["--rs-icon-fg-dark" as string]: t.fgDark,
        } as React.CSSProperties
      }
    >
      <header style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span
          className="rich-summary-badge"
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.bg,
            color: t.fg,
          }}
        >
          <Icon size={22} strokeWidth={2.25} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                margin: "2px 0 0",
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}
