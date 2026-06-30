// Lista visual compartilhada das "Tarefas do dia".
// Usada pelo botão opcional (DailyTasksButton) e pelo gate obrigatório
// (DailyTasksGate). Apenas a UI mora aqui; persistência (localStorage,
// Supabase, etc.) é responsabilidade do componente pai via onToggle.

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import apostilaResponsabilidadeHtml from "@/content/responsabilidade/apostila.html?raw";
import checklistOrganizacaoHtml from "@/content/organizacao/checklist.html?raw";

export type DailyTaskItem = {
  id: string;
  title: string;
  subtitle: string;
  openLabel: string;
  popupTitle: string;
  html: string;
  icon: typeof BookOpen;
};

export const DAILY_TASKS: DailyTaskItem[] = [
  {
    id: "apostila-responsabilidades",
    title: "Ler apostila de responsabilidades",
    subtitle: "Releia rapidamente o que é esperado de você antes do dia começar.",
    openLabel: "Abrir",
    popupTitle: "Apostila — Primeira Responsabilidade",
    html: apostilaResponsabilidadeHtml,
    icon: BookOpen,
  },
  {
    id: "checklist-organizacao",
    title: "Checklist de organização da loja",
    subtitle: "Garanta que a loja está pronta antes de atender.",
    openLabel: "Ver checklist",
    popupTitle: "Checklist — Organização da loja",
    html: checklistOrganizacaoHtml,
    icon: ClipboardList,
  },
];

type Props = {
  done: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void | Promise<void>;
  onOpenTask?: (id: string) => void;
  hasReview: boolean;
  reviewDone: boolean;
  pendingReviewItems: Array<{ reviewKey: string; title: string }>;
  dismissible: boolean;
  onClose?: () => void;
};

export function DailyTasksList({
  done,
  onToggle,
  onOpenTask,
  hasReview,
  reviewDone,
  pendingReviewItems,
  dismissible,
  onClose,
}: Props) {
  const [active, setActive] = useState<DailyTaskItem | null>(null);
  const [nonce, setNonce] = useState(0);

  const showReviewRow = hasReview || reviewDone;
  const totalTasks = DAILY_TASKS.length + (showReviewRow ? 1 : 0);
  const doneCount =
    DAILY_TASKS.filter((t) => done[t.id]).length + (reviewDone ? 1 : 0);
  const progress = totalTasks === 0 ? 0 : (doneCount / totalTasks) * 100;

  function handleOpen(task: DailyTaskItem) {
    setNonce((n) => n + 1);
    setActive(task);
    onOpenTask?.(task.id);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/60 shrink-0">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <CalendarCheck className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold leading-tight">
              Tarefas do dia
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conclua todos os passos para liberar o dia.
            </p>
          </div>
          {dismissible && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Progress
            value={progress}
            className="h-[5px] flex-1 bg-emerald-500/10 [&>div]:bg-emerald-500"
          />
          <span className="text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0">
            {doneCount} de {totalTasks} feitas
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {(() => {
          // Encontra o primeiro pendente para mostrar subtitle só nele.
          const firstPending = DAILY_TASKS.findIndex((t) => !done[t.id]);
          return DAILY_TASKS.map((task, idx) => {
            const checked = !!done[task.id];
            const isActive = idx === firstPending;
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-3 transition-colors ${
                  checked
                    ? "border-emerald-300/50 bg-emerald-500/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      checked
                        ? "bg-emerald-500/20 text-emerald-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        checked ? "text-emerald-700 dark:text-emerald-300 line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {!checked && isActive && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                        {task.subtitle}
                      </p>
                    )}
                  </div>
                  {!checked && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpen(task)}
                      className="rounded-full h-8 px-3.5 text-xs"
                    >
                      {task.openLabel}
                    </Button>
                  )}
                </div>
              </div>
            );
          });
        })()}

        {/* Review row */}
        {showReviewRow && (
          <div
            className={`rounded-2xl border p-3 transition-colors ${
              reviewDone
                ? "border-emerald-300/50 bg-emerald-500/10"
                : hasReview
                ? "border-border bg-card"
                : "border-border/60 bg-muted/40 opacity-70"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  reviewDone
                    ? "bg-emerald-500/20 text-emerald-600"
                    : hasReview
                    ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {reviewDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold leading-snug ${
                    reviewDone
                      ? "text-emerald-700 dark:text-emerald-300 line-through"
                      : !hasReview
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  Fazer revisão do dia
                </p>
                {hasReview && !reviewDone && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {pendingReviewItems.map((q) => q.title).join(", ")}
                  </p>
                )}
              </div>
              {reviewDone ? null : hasReview ? (
                <Link
                  to="/revisao-do-dia"
                  onClick={() => onOpenTask?.("revisao-do-dia")}
                  className="inline-flex items-center justify-center rounded-full bg-violet-500 text-white h-8 px-3.5 text-xs font-semibold hover:bg-violet-600"
                >
                  Abrir
                </Link>
              ) : (
                <div
                  aria-label="Bloqueada"
                  className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground"
                >
                  <Lock className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task viewer (iframe) */}
      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{active?.popupTitle ?? ""}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  if (!active) return;
                  await onToggle(active.id, true);
                  setActive(null);
                }}
                className="rounded-full h-8 px-3.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Marcar como feito
              </Button>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
    </div>
  );
}
