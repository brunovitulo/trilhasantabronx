// Bloco unificado de conteúdo + produtos para o Módulo 7.
// Substitui as etapas "Ver produtos no site" e "Ler apostila" por um único
// passo com:
//   - Botão para abrir a apostila completa em iframe (conteúdo inalterado)
//   - Botão "Atualizar preços" (faz scraping ao vivo do site Santa Bronx)
//   - Grid de cards: imagem | nome | preço | resumo | "Ver no site"
//   - Confirmação para concluir o passo

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen, Check, ChevronLeft, ExternalLink, Globe, Loader2,
  Package, RefreshCw, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StepGuide } from "@/components/StepGuide";
import type { Subtask } from "@/data/topics";
import { scrapeProducts, type ScrapedProduct } from "@/lib/productScrape.functions";

type Props = {
  subtask: Extract<Subtask, { kind: "product_block" }>;
  apostila?: { title: string; html: string };
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
};

export function ProductBlockSubtask({ subtask, apostila, completed, onComplete, onUncheck }: Props) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);

  const qc = useQueryClient();
  const scrape = useServerFn(scrapeProducts);
  const urls = useMemo(() => subtask.products.map((p) => p.url), [subtask.products]);
  const cacheKey = ["scrape-products", subtask.id] as const;

  const cached = qc.getQueryData<ScrapedProduct[]>(cacheKey);
  const mutation = useMutation({
    mutationFn: async () => scrape({ data: { urls } }),
    onSuccess: (data) => qc.setQueryData(cacheKey, data),
  });

  const scraped = mutation.data ?? cached;
  const dataByUrl = useMemo(() => {
    const m = new Map<string, ScrapedProduct>();
    (scraped ?? []).forEach((p) => m.set(p.url, p));
    return m;
  }, [scraped]);

  const lastFetched = scraped?.[0]?.fetchedAt;

  return (
    <div className="space-y-4">
      <StepGuide
        steps={[
          { icon: BookOpen, title: "Abra o conteúdo completo", description: "Leia o que é, pontos para decorar, fala pronta e cuidados." },
          { icon: RefreshCw, title: "Atualize os preços", description: "Busca o preço, imagem e resumo de cada produto direto do site." },
          { icon: Package, title: "Revise cada produto", description: "Memorize nome, preço e características antes da prova." },
          { icon: Check, title: "Confirme que estudou", description: "Marque a confirmação e clique em concluir." },
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-emerald-400/40 bg-emerald-400/10 text-foreground hover:bg-emerald-400/20"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1.5" />
          )}
          {mutation.isPending ? "Atualizando..." : "Atualizar preços"}
        </Button>
        {lastFetched && (
          <span className="text-[11px] text-muted-foreground self-center">
            Atualizado em {new Date(lastFetched).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {mutation.isError && (
        <p className="text-xs text-destructive">
          Não foi possível atualizar todos os preços. Tente novamente em alguns segundos.
        </p>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-2">
          Produtos desta categoria ({subtask.products.length})
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {subtask.products.map((p) => {
            const d = dataByUrl.get(p.url);
            return (
              <div
                key={p.url}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  {d?.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      src={d.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-7 w-7 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
                    {p.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {d?.price ? (
                      <span className="text-sm font-bold text-emerald-300">{d.price}</span>
                    ) : mutation.isPending ? (
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Buscando preço…
                      </span>
                    ) : d?.error ? (
                      <span className="text-[11px] text-destructive">Preço indisponível</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">— clique em "Atualizar preços"</span>
                    )}
                  </div>
                  {d?.summary && (
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-snug line-clamp-3">
                      {d.summary}
                    </p>
                  )}
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-2 text-[12px] font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 self-start"
                  >
                    Ver no site <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
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
