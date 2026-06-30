// Painel admin: gera/cacheia funcionalidades curtas (1 frase) para cada produto
// individual do Módulo 7. Essas frases viram as opções corretas/distratoras dos
// flashcards de revisão.

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ChevronDown, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateProductFunctionalities,
  listFlashcardCoverage,
} from "@/lib/flashcards.functions";
import {
  M7_SUBCATEGORY_LABELS,
  getM7ProductsBySubcategory,
} from "@/data/m7Products";

export function ProductFlashcardsAdminPanel() {
  const [open, setOpen] = useState(false);
  const listFn = useServerFn(listFlashcardCoverage);
  const genFn = useServerFn(generateProductFunctionalities);
  const qc = useQueryClient();

  const subs = useMemo(
    () =>
      Object.entries(M7_SUBCATEGORY_LABELS).map(([key, title]) => ({
        key,
        title,
        total: getM7ProductsBySubcategory(key).length,
      })),
    [],
  );

  const listQuery = useQuery({
    queryKey: ["flashcard-coverage"],
    queryFn: () => listFn({ data: undefined as never }),
    enabled: open,
  });

  const byKey = useMemo(() => {
    const m = new Map<string, { count: number; latest: string }>();
    (listQuery.data ?? []).forEach((r: any) =>
      m.set(r.subcategoryId, { count: r.count, latest: r.latest }),
    );
    return m;
  }, [listQuery.data]);

  const mutation = useMutation({
    mutationFn: async (key: string) => genFn({ data: { subcategoryKey: key } }),
    onSuccess: (d, key) => {
      toast.success(`${d.count} funcionalidades geradas`, { description: key });
      qc.invalidateQueries({ queryKey: ["flashcard-coverage"] });
    },
    onError: (e: Error, key) =>
      toast.error("Falha ao gerar", { description: `${key}: ${e.message}` }),
  });

  const generated = subs.filter((s) => {
    const r = byKey.get(s.key);
    return r && r.count >= s.total;
  }).length;

  const pending = subs.filter((s) => {
    const r = byKey.get(s.key);
    return !r || r.count < s.total;
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] rounded-2xl"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 border border-fuchsia-400/30 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-fuchsia-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            Flashcards do Módulo 7 — funcionalidades por produto
          </p>
          <p className="text-xs text-muted-foreground">
            {open && listQuery.isLoading
              ? "Carregando…"
              : generated >= subs.length
                ? `${subs.length}/${subs.length} subcategorias com cache completo.`
                : `${generated}/${subs.length} subcategorias com funcionalidades geradas pela IA. ${pending.length} pendente(s) — sem isso, os flashcards mostram opções incoerentes.`}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {pending.length > 0 && (
            <div className="flex gap-2 items-start rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-100">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  {pending.length} subcategoria(s) ainda sem funcionalidades cadastradas.
                </p>
                <p className="opacity-80">
                  Sem isso, os flashcards exibem um aviso no lugar das opções.
                  Rode “Refinar com IA” em: {pending.map((p) => p.title).join(", ")}.
                </p>
              </div>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
          {subs.map((s) => {
            const r = byKey.get(s.key);
            const ok = r && r.count >= s.total;
            const isGenerating =
              mutation.isPending && mutation.variables === s.key;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  ok
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-amber-400/30 bg-amber-400/10"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r
                      ? `${r.count}/${s.total} produtos · refinado em ${new Date(r.latest).toLocaleDateString("pt-BR")}`
                      : `${s.total} produtos · pendente — gerar agora.`}
                  </p>

                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8"
                  disabled={isGenerating}
                  onClick={() => mutation.mutate(s.key)}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      {ok ? "Regerar" : "Refinar com IA"}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
