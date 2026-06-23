import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, X, Brain } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import apostilaResponsabilidadeHtml from "@/content/responsabilidade/apostila.html?raw";
import checklistOrganizacaoHtml from "@/content/organizacao/checklist.html?raw";
import { getTodayReview, type TodayReviewState } from "@/lib/dailyReview.functions";

type DailyTask = {
  id: string;
  title: string;
  instruction?: string;
  openLabel: string;
  popupTitle: string;
  html: string;
};

const TASKS: DailyTask[] = [
  {
    id: "apostila-responsabilidades",
    title: "Ler a apostila de responsabilidades",
    instruction:
      "Releia rapidamente o que é esperado de você na loja antes de começar o dia.",
    openLabel: "Abrir apostila",
    popupTitle: "Apostila — Primeira Responsabilidade",
    html: apostilaResponsabilidadeHtml,
  },
  {
    id: "checklist-organizacao",
    title: "Fazer o checklist de organização da loja",
    instruction: "Garanta que a loja está organizada antes de começar a atender.",
    openLabel: "Ver checklist",
    popupTitle: "Checklist — Organização da loja",
    html: checklistOrganizacaoHtml,
  },
];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `daily-tasks-${y}-${m}-${day}`;
}

function loadDone(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(todayKey());
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function saveDone(done: Record<string, boolean>) {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(done));
  } catch {
    /* ignore */
  }
}

export function DailyTasksButton() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<DailyTask | null>(null);
  const [nonce, setNonce] = useState(0);
  const [review, setReview] = useState<TodayReviewState | null>(null);
  const fetchReview = useServerFn(getTodayReview);

  useEffect(() => {
    setDone(loadDone());
    const onFocus = () => setDone(loadDone());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchReview();
        if (alive) setReview(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchReview]);

  const hasReview = !!review && review.queue.length > 0;
  const reviewDone = !!review?.completed;
  const pending = useMemo(() => {
    const base = TASKS.filter((t) => !done[t.id]).length;
    const rev = hasReview && !reviewDone ? 1 : 0;
    return base + rev;
  }, [done, hasReview, reviewDone]);

  function toggle(id: string, value: boolean) {
    setDone((prev) => {
      const next = { ...prev, [id]: value };
      saveDone(next);
      return next;
    });
  }

  function openTask(task: DailyTask) {
    setNonce((n) => n + 1);
    setActive(task);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="relative text-white hover:bg-white/10 hover:text-white gap-1.5"
        aria-label="Tarefas do dia"
        title="Tarefas do dia"
      >
        <CalendarCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Tarefas do dia</span>
        {pending > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
            aria-label={`${pending} pendentes`}
          >
            {pending}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 w-[92vw] max-w-md max-h-[85vh] flex flex-col gap-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Tarefas do dia
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Lista de uso diário — reinicia todo dia. Marque conforme for fazendo.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {TASKS.map((task, idx) => {
              const checked = !!done[task.id];
              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    checked
                      ? "border-emerald-300/50 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          checked ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.instruction && (
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                          {task.instruction}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => openTask(task)}
                        >
                          {task.openLabel}
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Checkbox
                          id={`daily-${task.id}`}
                          checked={checked}
                          onCheckedChange={(v) => toggle(task.id, !!v)}
                        />
                        <Label
                          htmlFor={`daily-${task.id}`}
                          className="text-xs font-normal cursor-pointer"
                        >
                          {checked ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <Check className="h-3 w-3" /> Feito
                            </span>
                          ) : (
                            "Marcar como feito"
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasReview && (
              <div
                className={`rounded-2xl border p-4 transition-colors ${
                  reviewDone
                    ? "border-emerald-300/50 bg-emerald-500/5"
                    : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Brain className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        reviewDone ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      Fazer revisão do dia
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {reviewDone
                        ? "Revisão de hoje já concluída."
                        : `${review!.queue.length} módulo${review!.queue.length > 1 ? "s" : ""} na fila: ${review!.queue.map((q) => q.topicTitle).join(", ")}.`}
                    </p>
                    {!reviewDone && (
                      <div className="mt-3">
                        <Link
                          to="/revisao-do-dia"
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        >
                          Iniciar revisão
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{active?.popupTitle ?? ""}</DialogTitle>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {active && (
            <iframe
              key={nonce}
              srcDoc={active.html}
              title={active.popupTitle}
              className="flex-1 w-full border-0 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
