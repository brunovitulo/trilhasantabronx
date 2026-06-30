// Bloqueio diário obrigatório.
// Força a atendente a concluir as tarefas do dia antes de usar o resto do app.
// Não pode ser fechado por X, clique fora ou botão "voltar".

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Brain, CheckCircle2, ClipboardList, Loader2, Lock, ScrollText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getTodayReview, type TodayReviewState } from "@/lib/dailyReview.functions";
import apostilaResponsabilidadeHtml from "@/content/responsabilidade/apostila.html?raw";
import checklistOrganizacaoHtml from "@/content/organizacao/checklist.html?raw";

type StepId = "apostila-responsabilidades" | "checklist-organizacao" | "revisao-do-dia";

type GateStep = {
  id: StepId;
  title: string;
  description: string;
  icon: typeof ScrollText;
  kind: "iframe" | "review";
  html?: string;
};

const BASE_STEPS: GateStep[] = [
  {
    id: "apostila-responsabilidades",
    title: "Ler apostila de responsabilidades",
    description: "Releia rapidamente o que é esperado de você na loja antes de começar o dia.",
    icon: ScrollText,
    kind: "iframe",
    html: apostilaResponsabilidadeHtml,
  },
  {
    id: "checklist-organizacao",
    title: "Checklist de organização da loja",
    description: "Garanta que a loja está organizada antes de iniciar os atendimentos.",
    icon: ClipboardList,
    kind: "iframe",
    html: checklistOrganizacaoHtml,
  },
];

function todaySpKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function DailyTasksGate({ userId }: { userId: string }) {
  const router = useRouter();
  const fetchReview = useServerFn(getTodayReview);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [review, setReview] = useState<TodayReviewState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [iframeNonce, setIframeNonce] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const today = todaySpKey();
    const [{ data: roles }, { data: comps }, rev] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("daily_task_completions")
        .select("task_id")
        .eq("user_id", userId)
        .eq("task_date", today),
      fetchReview().catch(() => null),
    ]);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    setCompleted(new Set((comps ?? []).map((c) => c.task_id as StepId)));
    setReview(rev);
    setLoading(false);
  }, [userId, fetchReview]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-checa quando o usuário volta para o app/aba (ex: terminou a revisão em outra rota).
  useEffect(() => {
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload]);

  const steps = useMemo<GateStep[]>(() => {
    const out: GateStep[] = [...BASE_STEPS];
    const hasPendingReview =
      !!review &&
      review.queue.length > 0 &&
      review.queue.some((q) => !review.completedKeysToday.includes(q.reviewKey));
    if (hasPendingReview) {
      out.push({
        id: "revisao-do-dia",
        title: "Fazer revisão do dia",
        description: review!.queue
          .filter((q) => !review!.completedKeysToday.includes(q.reviewKey))
          .map((q) => q.title)
          .join(", "),
        icon: Brain,
        kind: "review",
      });
    }
    return out;
  }, [review]);

  const isStepComplete = useCallback(
    (s: GateStep) => {
      if (s.id === "revisao-do-dia") {
        if (!review || review.queue.length === 0) return true;
        return review.queue.every((q) => review.completedKeysToday.includes(q.reviewKey));
      }
      return completed.has(s.id);
    },
    [completed, review],
  );

  const firstPendingIndex = useMemo(() => {
    const i = steps.findIndex((s) => !isStepComplete(s));
    return i === -1 ? steps.length : i;
  }, [steps, isStepComplete]);

  useEffect(() => {
    setCurrentIndex(firstPendingIndex);
  }, [firstPendingIndex]);

  const open =
    !loading &&
    !isAdmin &&
    steps.length > 0 &&
    firstPendingIndex < steps.length &&
    router.state.location.pathname !== "/revisao-do-dia";

  // Bloqueia o botão "voltar" enquanto o gate estiver aberto.
  useEffect(() => {
    if (!open) return;
    const onPop = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  if (!open) return null;

  const current = steps[currentIndex];

  async function markDone(stepId: StepId) {
    setBusy(true);
    const today = todaySpKey();
    const { error } = await supabase
      .from("daily_task_completions")
      .upsert(
        { user_id: userId, task_date: today, task_id: stepId },
        { onConflict: "user_id,task_date,task_id" },
      );
    setBusy(false);
    if (error) {
      console.error(error);
      return;
    }
    setCompleted((prev) => new Set(prev).add(stepId));
  }

  function startReview() {
    router.navigate({ to: "/revisao-do-dia" });
  }

  return (
    <Dialog open onOpenChange={() => { /* não pode fechar */ }}>
      <DialogContent
        className="p-0 w-[94vw] max-w-2xl h-[88vh] flex flex-col gap-0 overflow-hidden border-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        style={{
          background: "linear-gradient(165deg, #241f42, #15122a)",
        }}
      >
        <DialogTitle className="sr-only">Tarefas obrigatórias do dia</DialogTitle>
        <DialogDescription className="sr-only">
          Conclua as tarefas do dia para liberar o acesso ao app.
        </DialogDescription>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/60">
            <Lock className="h-3.5 w-3.5" />
            Antes de começar
          </div>
          <h2 className="mt-1.5 text-lg font-semibold text-white">Tarefas do dia</h2>
          <p className="mt-1 text-xs text-white/60">
            Conclua os passos abaixo para liberar o restante do app.
          </p>

          {/* Stepper */}
          <ol className="mt-4 flex items-center gap-2">
            {steps.map((s, i) => {
              const done = isStepComplete(s);
              const isCurrent = i === currentIndex;
              return (
                <li key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold border flex-1 transition ${
                      done
                        ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/40"
                        : isCurrent
                        ? "bg-violet-400/15 text-violet-100 border-violet-300/50"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[10px]">
                        {i + 1}
                      </span>
                    )}
                    <span className="truncate">{s.title}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Body */}
        {current && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-4 shrink-0">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-violet-200">
                  <current.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-white/50">
                    Passo {currentIndex + 1} de {steps.length}
                  </p>
                  <h3 className="text-base font-semibold text-white">{current.title}</h3>
                  <p className="mt-0.5 text-xs text-white/60">{current.description}</p>
                </div>
              </div>
            </div>

            {current.kind === "iframe" && current.html && (
              <div className="flex-1 min-h-0 px-5 pb-3">
                <iframe
                  key={`${current.id}-${iframeNonce}`}
                  srcDoc={current.html}
                  title={current.title}
                  className="w-full h-full rounded-2xl border border-white/10 bg-white"
                />
              </div>
            )}

            {current.kind === "review" && (
              <div className="flex-1 min-h-0 px-5 pb-3 flex items-center justify-center">
                <div
                  className="w-full max-w-md rounded-2xl border border-white/10 p-5 text-center"
                  style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
                >
                  <Brain className="h-8 w-8 text-violet-200 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">Revisão de hoje</p>
                  <p className="mt-1 text-xs text-white/60">
                    {current.description}
                  </p>
                  <Button
                    onClick={startReview}
                    className="mt-4 rounded-full bg-violet-400 text-violet-950 hover:bg-violet-300"
                  >
                    Iniciar revisão agora
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <p className="text-[11px] text-white/50">
                Não é possível pular nem fechar — conclua para liberar o app.
              </p>
              {current.kind === "iframe" ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setIframeNonce((n) => n + 1)}
                  >
                    Recarregar
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => markDone(current.id)}
                    className="rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Marcar como feito
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={startReview}
                  className="rounded-full bg-violet-400 text-violet-950 hover:bg-violet-300"
                >
                  Iniciar revisão
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
