import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  completeTodayReview,
  getTodayReview,
  type TodayReviewState,
} from "@/lib/dailyReview.functions";
import { getRevisionContent } from "@/data/revisao";

export const Route = createFileRoute("/_authenticated/revisao-do-dia")({
  head: () => ({ meta: [{ title: "Revisão do dia — Santa Bronx" }] }),
  component: RevisaoDoDiaPage,
});

type ModulePhase = "apostila" | "checklist" | "quiz" | "done";

type ModuleState = {
  reread: boolean;
  checklist: boolean;
  quizIndex: number;
  answers: (number | null)[];
  phase: ModulePhase;
};

function emptyModuleState(quizLen: number): ModuleState {
  return {
    reread: false,
    checklist: false,
    quizIndex: 0,
    answers: Array(quizLen).fill(null),
    phase: "apostila",
  };
}

function RevisaoDoDiaPage() {
  const navigate = useNavigate();
  const fetchToday = useServerFn(getTodayReview);
  const finishReview = useServerFn(completeTodayReview);

  const [state, setState] = useState<TodayReviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleIdx, setModuleIdx] = useState(0);
  const [modStates, setModStates] = useState<Record<string, ModuleState>>({});
  const [popup, setPopup] = useState<null | {
    title: string;
    html: string;
  }>(null);
  const [saving, setSaving] = useState(false);
  const [finalScreen, setFinalScreen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await fetchToday();
        if (!alive) return;
        setState(s);
        const init: Record<string, ModuleState> = {};
        for (const it of s.queue) {
          const c = getRevisionContent(it.topicId);
          init[it.topicId] = emptyModuleState(c?.quiz.length ?? 0);
        }
        setModStates(init);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchToday]);

  const current = state?.queue[moduleIdx];
  const content = current ? getRevisionContent(current.topicId) : null;
  const ms = current ? modStates[current.topicId] : null;

  const allModuleIds = useMemo(
    () => (state?.queue ?? []).map((q) => q.topicId),
    [state],
  );

  const allModulesDone = useMemo(() => {
    if (!state) return false;
    return state.queue.every((q) => modStates[q.topicId]?.phase === "done");
  }, [state, modStates]);

  function updateModule(topicId: string, patch: Partial<ModuleState>) {
    setModStates((prev) => ({
      ...prev,
      [topicId]: { ...prev[topicId], ...patch } as ModuleState,
    }));
  }

  function advancePhase(topicId: string, next: ModulePhase) {
    updateModule(topicId, { phase: next });
  }

  function answerQuestion(topicId: string, qIdx: number, optIdx: number) {
    setModStates((prev) => {
      const cur = prev[topicId];
      if (!cur || cur.answers[qIdx] !== null) return prev;
      const next = [...cur.answers];
      next[qIdx] = optIdx;
      return { ...prev, [topicId]: { ...cur, answers: next } };
    });
  }

  function nextQuestion(topicId: string, quizLen: number) {
    setModStates((prev) => {
      const cur = prev[topicId];
      if (!cur) return prev;
      const next = cur.quizIndex + 1;
      if (next >= quizLen) return { ...prev, [topicId]: { ...cur, phase: "done", quizIndex: cur.quizIndex } };
      return { ...prev, [topicId]: { ...cur, quizIndex: next } };
    });
  }

  function goToModule(idx: number) {
    setModuleIdx(Math.max(0, Math.min(idx, (state?.queue.length ?? 1) - 1)));
  }

  async function finalize() {
    if (!state) return;
    setSaving(true);
    try {
      await finishReview({ data: { moduleIds: allModuleIds } });
      setFinalScreen(true);
    } catch (e) {
      toast.error("Erro ao salvar revisão", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!state || state.queue.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Card className="p-8 text-center">
          <Brain className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-bold">Nada para revisar hoje</h1>
          <p className="text-sm text-muted-foreground mt-2">
            A fila de revisão fica vazia quando você ainda não concluiu nenhum
            módulo ou quando todas as revisões já passaram da janela de 2 dias.
            Continue a sua trilha — assim que concluir um módulo, ele aparece
            aqui no dia seguinte.
          </p>
        </Card>
      </main>
    );
  }

  if (state.completed && !finalScreen) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Revisão do dia concluída</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Você já concluiu a revisão de hoje. Volte amanhã para reforçar os
            módulos que ainda estiverem na janela de 2 dias.
          </p>
          {state.completedModuleIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Conteúdo revisado: {state.completedModuleIds
                .map((id) => getRevisionContent(id)?.title ?? id)
                .join(", ")}
            </p>
          )}
        </Card>
      </main>
    );
  }

  if (finalScreen) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-8 text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Revisão do dia concluída!</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Conteúdo revisado:{" "}
            <span className="font-semibold text-foreground">
              {state.queue
                .map((q) => getRevisionContent(q.topicId)?.title ?? q.topicTitle)
                .join(", ")}
            </span>
            .
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
            Voltar para a trilha
          </Button>
        </Card>
      </main>
    );
  }

  if (!current || !ms) return null;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Sair
          </Link>
          <span className="text-xs text-muted-foreground">
            Módulo {moduleIdx + 1} de {state.queue.length}
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Revisão do dia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cada módulo concluído entra na revisão por 2 dias. Faça as 3 etapas
            de cada módulo antes de concluir.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {state.queue.map((q, idx) => {
            const done = modStates[q.topicId]?.phase === "done";
            const isCur = idx === moduleIdx;
            return (
              <button
                key={q.topicId}
                onClick={() => goToModule(idx)}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  isCur
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : done
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {done && <Check className="inline h-3 w-3 mr-1" />}
                {idx + 1}. {q.topicTitle}
              </button>
            );
          })}
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-lg font-bold">{current.topicTitle}</h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Revisão dia {current.dayInWindow} de 2
            </span>
          </div>

          <ModulePhaseView
            phase={ms.phase}
            module={ms}
            content={content}
            onOpenPopup={(title, html) => setPopup({ title, html })}
            onRereadChange={(v) => updateModule(current.topicId, { reread: v })}
            onChecklistChange={(v) =>
              updateModule(current.topicId, { checklist: v })
            }
            onAdvance={(next) => advancePhase(current.topicId, next)}
            onAnswer={(qIdx, optIdx) =>
              answerQuestion(current.topicId, qIdx, optIdx)
            }
            onNextQuestion={(quizLen) =>
              nextQuestion(current.topicId, quizLen)
            }
          />
        </Card>

        {ms.phase === "done" && (
          <div className="mt-5 flex justify-end gap-2">
            {moduleIdx < state.queue.length - 1 ? (
              <Button onClick={() => goToModule(moduleIdx + 1)}>
                Próximo módulo
              </Button>
            ) : (
              <Button
                onClick={finalize}
                disabled={!allModulesDone || saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Concluir revisão do dia
              </Button>
            )}
          </div>
        )}
      </main>

      <Dialog open={popup !== null} onOpenChange={(o) => !o && setPopup(null)}>
        <DialogContent className="p-0 w-[92vw] h-[90vh] max-w-[92vw] sm:max-w-[92vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{popup?.title ?? ""}</DialogTitle>
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {popup && (
            <iframe
              srcDoc={popup.html}
              title={popup.title}
              className="flex-1 w-full border-0 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModulePhaseView({
  phase,
  module: ms,
  content,
  onOpenPopup,
  onRereadChange,
  onChecklistChange,
  onAdvance,
  onAnswer,
  onNextQuestion,
}: {
  phase: ModulePhase;
  module: ModuleState;
  content: ReturnType<typeof getRevisionContent>;
  onOpenPopup: (title: string, html: string) => void;
  onRereadChange: (v: boolean) => void;
  onChecklistChange: (v: boolean) => void;
  onAdvance: (next: ModulePhase) => void;
  onAnswer: (qIdx: number, optIdx: number) => void;
  onNextQuestion: (quizLen: number) => void;
}) {
  if (phase === "apostila") {
    return (
      <div className="mt-4 space-y-4">
        <StepHeader n={1} title="Reler a apostila" />
        <p className="text-sm text-muted-foreground">
          Abra a apostila e releia rapidamente o conteúdo deste módulo.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              content &&
              onOpenPopup(`Apostila — ${content.title}`, content.apostilaHtml)
            }
            disabled={!content}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Abrir apostila
          </Button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ms.reread}
            onCheckedChange={(v) => onRereadChange(!!v)}
          />
          <span className="text-sm">Reli a apostila deste módulo.</span>
        </label>
        <div className="flex justify-end">
          <Button
            disabled={!ms.reread}
            onClick={() => onAdvance("checklist")}
          >
            Próxima etapa
          </Button>
        </div>
      </div>
    );
  }
  if (phase === "checklist") {
    return (
      <div className="mt-4 space-y-4">
        <StepHeader n={2} title="Marcar checklist de aprendizados" />
        <p className="text-sm text-muted-foreground">
          Abra o checklist e marque mentalmente os principais pontos.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              content &&
              onOpenPopup(
                `Checklist — ${content.title}`,
                content.checklistHtml,
              )
            }
            disabled={!content}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Abrir checklist
          </Button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ms.checklist}
            onCheckedChange={(v) => onChecklistChange(!!v)}
          />
          <span className="text-sm">Marquei os principais pontos do checklist.</span>
        </label>
        <div className="flex justify-end">
          <Button
            disabled={!ms.checklist}
            onClick={() => onAdvance(content && content.quiz.length > 0 ? "quiz" : "done")}
          >
            {content && content.quiz.length > 0 ? "Iniciar quiz" : "Concluir módulo"}
          </Button>
        </div>
      </div>
    );
  }
  if (phase === "quiz") {
    if (!content || content.quiz.length === 0) {
      return (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Quiz de revisão em breve para este módulo.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => onAdvance("done")}>Concluir módulo</Button>
          </div>
        </div>
      );
    }
    const qIdx = ms.quizIndex;
    const q = content.quiz[qIdx];
    const chosen = ms.answers[qIdx];
    const isAnswered = chosen !== null;
    const isLast = qIdx === content.quiz.length - 1;
    return (
      <div className="mt-4 space-y-4">
        <StepHeader n={3} title={`Quiz — pergunta ${qIdx + 1} de ${content.quiz.length}`} />
        <p className="text-sm font-medium">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, optIdx) => {
            const isCorrect = optIdx === q.correctIndex;
            const isChosen = chosen === optIdx;
            const stateClass = !isAnswered
              ? "border-border hover:border-primary/50 hover:bg-primary/5"
              : isCorrect
                ? "border-emerald-500/60 bg-emerald-500/10"
                : isChosen
                  ? "border-rose-500/60 bg-rose-500/10"
                  : "border-border opacity-60";
            return (
              <button
                key={optIdx}
                disabled={isAnswered}
                onClick={() => onAnswer(qIdx, optIdx)}
                className={`w-full text-left text-sm rounded-xl border px-4 py-3 transition-colors ${stateClass}`}
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(97 + optIdx)})
                </span>
                {opt}
                {isAnswered && isCorrect && (
                  <Check className="inline h-4 w-4 ml-2 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
        {isAnswered && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              chosen === q.correctIndex
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
                : "border-rose-500/40 bg-rose-500/5 text-rose-700"
            }`}
          >
            {chosen === q.correctIndex
              ? "Resposta correta!"
              : `Resposta incorreta. A correta é: ${String.fromCharCode(97 + q.correctIndex)}) ${q.options[q.correctIndex]}`}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            disabled={!isAnswered}
            onClick={() => onNextQuestion(content.quiz.length)}
          >
            {isLast ? "Ver resultado" : "Próxima"}
          </Button>
        </div>
      </div>
    );
  }
  // done
  const totalAnswered = ms.answers.filter((a) => a !== null).length;
  const correct =
    content && content.quiz.length > 0
      ? ms.answers.reduce<number>(
          (acc, a, i) =>
            acc + (a !== null && a === content.quiz[i].correctIndex ? 1 : 0),
          0,
        )
      : 0;
  return (
    <div className="mt-4 text-center space-y-3">
      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
      <p className="text-base font-semibold">Módulo revisado!</p>
      {content && content.quiz.length > 0 && totalAnswered > 0 && (
        <p className="text-sm text-muted-foreground">
          Pontuação: <span className="font-semibold text-foreground">{correct}/{content.quiz.length} corretas</span>
        </p>
      )}
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
        {n}
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}
