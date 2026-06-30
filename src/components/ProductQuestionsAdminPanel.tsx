// Painel admin: dispara geração das 12 questões IA por subcategoria do Módulo 7.

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Check, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TOPICS } from "@/data/topics";
import {
  generateProductQuestions,
  listGeneratedQuestions,
} from "@/lib/aiQuestions.functions";

type Sub = { key: string; title: string };

function getProdutosSubcategories(): Sub[] {
  const m7 = TOPICS.find((t) => t.id === "produtos");
  if (!m7) return [];
  const out: Sub[] = [];
  for (const s of m7.subtasks) {
    if (s.kind === "product_block") {
      const key = s.id.replace(/^produtos\./, "").replace(/\.bloco$/, "");
      out.push({ key, title: s.title });
    }
  }
  return out;
}

export function ProductQuestionsAdminPanel() {
  const [open, setOpen] = useState(false);
  const subs = useMemo(getProdutosSubcategories, []);
  const listFn = useServerFn(listGeneratedQuestions);
  const genFn = useServerFn(generateProductQuestions);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["generated-questions-list"],
    queryFn: () => listFn({ data: undefined as never }),
    enabled: open,
  });

  const byKey = useMemo(() => {
    const m = new Map<string, string>();
    (listQuery.data ?? []).forEach((r: any) => m.set(r.subcategory_key, r.generated_at));
    return m;
  }, [listQuery.data]);

  const mutation = useMutation({
    mutationFn: async (key: string) => genFn({ data: { subcategoryKey: key } }),
    onSuccess: (_d, key) => {
      toast.success("12 questões geradas", { description: key });
      qc.invalidateQueries({ queryKey: ["generated-questions-list"] });
    },
    onError: (e: Error, key) =>
      toast.error("Falha ao gerar", { description: `${key}: ${e.message}` }),
  });

  const generated = subs.filter((s) => byKey.has(s.key)).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] rounded-2xl"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-400/30 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-emerald-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Banco de questões IA — Módulo 7</p>
          <p className="text-xs text-muted-foreground">
            {open && listQuery.isLoading
              ? "Carregando…"
              : generated >= subs.length
                ? `${subs.length}/${subs.length} subcategorias com questões refinadas.`
                : `Pré-populado para todas as ${subs.length} subcategorias (banco padrão pronto). ${generated} já têm versão refinada por IA.`}
          </p>
        </div>

        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          {subs.map((s) => {
            const ts = byKey.get(s.key);
            const isGenerating = mutation.isPending && mutation.variables === s.key;
            return (
              <div
                key={s.key}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {ts
                      ? `Gerado em ${new Date(ts).toLocaleString("pt-BR")}`
                      : "Ainda sem questões geradas (usa fallback embutido)."}
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
                  ) : ts ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regerar
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Gerar 12
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
