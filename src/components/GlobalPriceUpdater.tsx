// Botão único de "Atualizar preços" no topo do Módulo 7.
// Coleta todas as URLs de produtos de todas as subtarefas product_block do
// tópico em uma única chamada e popula o cache global compartilhado.

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/data/topics";
import { scrapeProducts, type ScrapedProduct } from "@/lib/productScrape.functions";
import { GLOBAL_SCRAPE_CACHE_KEY } from "@/lib/globalScrape";

type Props = { topic: Topic };

export function GlobalPriceUpdater({ topic }: Props) {
  const qc = useQueryClient();
  const scrape = useServerFn(scrapeProducts);
  const [justFinished, setJustFinished] = useState(false);

  const urls = useMemo(() => {
    const all: string[] = [];
    for (const s of topic.subtasks) {
      if (s.kind === "product_block") {
        for (const p of s.products) all.push(p.url);
      }
    }
    return Array.from(new Set(all));
  }, [topic.subtasks]);

  const existing =
    qc.getQueryData<Record<string, ScrapedProduct>>([GLOBAL_SCRAPE_CACHE_KEY]) ?? {};
  const fetchedAt = Object.values(existing)[0]?.fetchedAt;

  const mutation = useMutation({
    // Faz uma única chamada batch para o servidor — o server function já
    // paraleliza internamente respeitando limite de concorrência.
    mutationFn: async () => {
      // O backend valida no máximo 40 URLs por chamada (z.array.max(40)).
      // Para o Módulo 7 atual (~93 produtos) fatiamos em lotes de 40.
      const chunks: string[][] = [];
      for (let i = 0; i < urls.length; i += 40) chunks.push(urls.slice(i, i + 40));
      const all = await Promise.all(chunks.map((c) => scrape({ data: { urls: c } })));
      return all.flat();
    },
    onSuccess: (data: ScrapedProduct[]) => {
      const map: Record<string, ScrapedProduct> = { ...existing };
      for (const item of data) map[item.url] = item;
      qc.setQueryData([GLOBAL_SCRAPE_CACHE_KEY], map);
      setJustFinished(true);
      setTimeout(() => setJustFinished(false), 2500);
    },
  });

  if (urls.length === 0) return null;

  const isPending = mutation.isPending;
  const label = isPending
    ? "Atualizando…"
    : justFinished
      ? "Preços atualizados"
      : "Atualizar preços";

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full border-emerald-400/40 bg-emerald-400/10 text-foreground hover:bg-emerald-400/20"
        disabled={isPending}
        onClick={() => mutation.mutate()}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : justFinished ? (
          <Check className="h-4 w-4 mr-1.5" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-1.5" />
        )}
        {label}
        <span className="ml-1.5 text-[11px] opacity-70">
          ({urls.length} produtos)
        </span>
      </Button>
      {fetchedAt && !isPending && !justFinished && (
        <span className="text-[11px] text-muted-foreground">
          Última atualização:{" "}
          {new Date(fetchedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      {mutation.isError && (
        <span className="text-[11px] text-destructive">
          Não foi possível atualizar todos os preços. Tente novamente.
        </span>
      )}
    </div>
  );
}
