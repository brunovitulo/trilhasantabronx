// Bloco unificado de conteúdo + produtos para o Módulo 7.
//
// Estrutura visual aprovada:
//   1. Stepper compacto (StepGuide)
//   2. Botão "Abrir conteúdo completo" (apostila em iframe)
//   3. Card único contendo:
//      - 4 seções extraídas da apostila (O que é / Pontos para decorar /
//        Como falar / Cuidados importantes)
//      - Lista de produtos da categoria com imagem, nome, preço, resumo
//        (extraído da apostila) e link "Ver no site"
//   4. Confirmação para concluir o passo
//
// A atualização dos preços é feita por um único botão global no topo do
// tópico — aqui apenas LEMOS o cache compartilhado (chave "scrape-products-all").

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Package, X } from "lucide-react";
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

export function ProductBlockSubtask({ subtask, apostila, completed, onComplete, onUncheck }: Props) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);

  const qc = useQueryClient();
  // Lê do cache global atualizado pelo botão único "Atualizar preços" no topo
  // do tópico. O componente re-renderiza quando o cache é alterado porque
  // useQueryClient devolve uma instância estável; usamos um getter no render.
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
        {/* Resumo extraído da apostila (4 sub-blocos) */}
        <div
          className="flex flex-col"
          style={{ gap: "10px", padding: "14px 16px" }}
        >
          {apostilaContent?.oQueE && (
            <SummaryCard
              label="O que é"
              labelColor="var(--text-pro)"
              body={apostilaContent.oQueE}
            />
          )}
          {apostilaContent && apostilaContent.pontosParaDecorar.length > 0 && (
            <NumberedSummaryCard
              label="Pontos para decorar"
              items={apostilaContent.pontosParaDecorar}
            />
          )}
          {apostilaContent?.comoFalar && (
            <QuoteSummary body={apostilaContent.comoFalar} />
          )}
          {apostilaContent && apostilaContent.cuidados.length > 0 && (
            <DangerSummary items={apostilaContent.cuidados} />
          )}
        </div>

        {/* Divisor */}
        <div style={{ borderTop: "1px solid var(--border-subtle)" }} />

        {/* Lista de produtos */}
        <div style={{ padding: "14px 16px" }}>
          <p
            className="mb-3"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--text-pro)",
            }}
          >
            Produtos desta categoria ({subtask.products.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {subtask.products.map((p) => {
              const d = scrapedMap[p.url];
              const summary = productSummaries.get(p.url);
              return (
                <div
                  key={p.url}
                  className="flex gap-3 rounded-xl p-2.5"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      width: 56,
                      height: 56,
                      background: "var(--surface-1)",
                      borderRadius: 8,
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
                      <Package size={22} style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="min-w-0 leading-snug line-clamp-2"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {p.name}
                      </p>
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: d?.price ? "var(--text-success)" : "var(--text-muted)",
                        }}
                      >
                        {d?.price ?? "—"}
                      </span>
                    </div>
                    {summary && (
                      <p
                        className="mt-1 leading-snug line-clamp-2"
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {summary}
                      </p>
                    )}
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1"
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

/* ---------- Sub-componentes de resumo ---------- */

function SummaryCard({
  label,
  labelColor,
  body,
}: {
  label: string;
  labelColor: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: labelColor,
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
        {body}
      </p>
    </div>
  );
}

function NumberedSummaryCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--text-success)",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "var(--bg-success)",
                color: "var(--text-success)",
                fontSize: 10,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuoteSummary({ body }: { body: string }) {
  return (
    <div
      style={{
        background: "rgba(93,202,165,0.08)",
        borderLeft: "3px solid var(--border-success)",
        borderRadius: "0 10px 10px 0",
        padding: "11px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--text-success)",
          marginBottom: 4,
        }}
      >
        Como falar com o cliente
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          fontStyle: "italic",
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function DangerSummary({ items }: { items: string[] }) {
  return (
    <div
      style={{
        background: "var(--bg-danger)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--text-danger)",
          marginBottom: 6,
        }}
      >
        Cuidados importantes
      </p>
      <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}
          >
            • {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
