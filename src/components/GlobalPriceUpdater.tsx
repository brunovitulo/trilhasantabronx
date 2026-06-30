// Botão único de "Atualizar preços" no topo do Módulo 7.
// - Hidrata o cache local (React Query) a partir do cache GLOBAL compartilhado
//   em Supabase, para que todos os usuários vejam os mesmos valores.
// - Se nenhum produto do tópico tem dados em cache, dispara o scraping
//   automaticamente na primeira renderização (auto-fetch on setup).
// - O botão segue disponível para refresh manual.

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/data/topics";
import {
  scrapeProducts,
  getProductPriceCache,
  type ScrapedProduct,
} from "@/lib/productScrape.functions";
import { GLOBAL_SCRAPE_CACHE_KEY } from "@/lib/globalScrape";

type Props = { topic: Topic };

export function GlobalPriceUpdater({ topic }: Props) {
  const qc = useQueryClient();
  const scrape = useServerFn(scrapeProducts);
  const getCache = useServerFn(getProductPriceCache);
  const [justFinished, setJustFinished] = useState(false);
  const autoTriggered = useRef(false);

  const urls = useMemo(() => {
    const all: string[] = [];
    for (const s of topic.subtasks) {
      if (s.kind === "product_block") for (const p of s.products) all.push(p.url);
    }
    return Array.from(new Set(all));
  }, [topic.subtasks]);

  // Hidrata o cache local com o cache global do Supabase (compartilhado entre usuários).
  const cacheQuery = useQuery({
    queryKey: ["product-price-cache-bootstrap"],
    queryFn: async () => {
      const rows = await getCache({ data: undefined as never });
      const map = (qc.getQueryData<Record<string, ScrapedProduct>>(
        [GLOBAL_SCRAPE_CACHE_KEY],
      ) ?? {}) as Record<string, ScrapedProduct>;
      for (const r of rows) map[r.url] = r;
      qc.setQueryData([GLOBAL_SCRAPE_CACHE_KEY], map);
      return rows;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const existing =
    qc.getQueryData<Record<string, ScrapedProduct>>([GLOBAL_SCRAPE_CACHE_KEY]) ?? {};
  const fetchedAt = Object.values(existing)[0]?.fetchedAt;

  const mutation = useMutation({
    mutationFn: async () => {
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

  // Auto-fetch na inicialização do Módulo 7 se nenhum produto do tópico
  // estiver no cache global ainda. Só dispara uma vez por sessão.
  useEffect(() => {
    if (autoTriggered.current) return;
    if (cacheQuery.isLoading) return;
    if (urls.length === 0) return;
    const anyCached = urls.some((u) => existing[u]?.price);
    if (anyCached) {
      autoTriggered.current = true;
      return;
    }
    autoTriggered.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheQuery.isLoading, urls.length]);

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
          ({urls.length} produtos · cache global compartilhado)
        </span>
      </Button>
      {fetchedAt && !isPending && !justFinished && (
        <span className="text-[11px] text-muted-foreground">
          Última atualização:{" "}
          {new Date(fetchedAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
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
