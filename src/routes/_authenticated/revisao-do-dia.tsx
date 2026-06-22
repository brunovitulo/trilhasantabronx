import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Sparkles,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listTodayReviews,
  submitReviewAnswer,
  finalizeReview,
} from "@/lib/reviews.functions";
import {
  MODULE_REVIEW,
  pickReviewQuestions,
  type ReviewQuestion,
  type ScheduledReview,
} from "@/lib/reviews";

export const Route = createFileRoute("/_authenticated/revisao-do-dia")({
  head: () => ({
    meta: [{ title: "Revisão do dia — Santa Bronx" }],
  }),
  component: ReviewDayPage,
});

type Phase = "loading" | "intro" | "summary" | "quiz" | "done" | "finished_all";

function ReviewDayPage() {
  const navigate = useNavigate();
  const fetchList = useServerFn(listTodayReviews);
  const submit = useServerFn(submitReviewAnswer);
  const finalize = useServerFn(finalizeReview);

  const [phase, setPhase] = useState<Phase>("loading");
  const [reviews, setReviews] = useState<ScheduledReview[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    hadCritical: false,
    wrongThemes: {} as Record<string, number>,
  });
  const [lastResult, setLastResult] = useState<{
    score: number;
    extraCreated: string | null;
    moduleName: string;
  } | null>(null);

  // carrega revisões
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchList();
        setReviews(data as ScheduledReview[]);
        if (!data || data.length === 0) {
          setPhase("finished_all");
        } else {
          startReview(0, data as ScheduledReview[]);
        }
      } catch (err) {
        console.error(err);
        setPhase("finished_all");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startReview(idx: number, list: ScheduledReview[]) {
    const rev = list[idx];
    if (!rev) {
      setPhase("finished_all");
      return;
    }
    const qs = pickReviewQuestions(rev.module_id, rev.question_count);
    setQuestions(qs);
    setQIdx(0);
    setChosen(null);
    setStats({ correct: 0, total: 0, hadCritical: false, wrongThemes: {} });
    setCurrentIdx(idx);
    setPhase("intro");
  }

  const currentReview = reviews[currentIdx];
  const cfg = currentReview ? MODULE_REVIEW[currentReview.module_id] : null;
  const currentQ = questions[qIdx];

  async function pickAnswer(oi: number) {
    if (chosen !== null || !currentQ || !currentReview) return;
    setChosen(oi);
    const isCorrect = oi === currentQ.correctIndex;
    const isCritical = !!currentQ.isCritical;
    const theme = currentQ.theme;

    const newStats = {
      correct: stats.correct + (isCorrect ? 1 : 0),
      total: stats.total + 1,
      hadCritical: stats.hadCritical || (!isCorrect && isCritical),
      wrongThemes: { ...stats.wrongThemes },
    };
    if (!isCorrect && theme) {
      newStats.wrongThemes[theme] = (newStats.wrongThemes[theme] ?? 0) + 1;
    }
    setStats(newStats);

    try {
      await submit({
        data: {
          reviewId: currentReview.id,
          moduleId: currentReview.module_id,
          questionId: currentQ.questionId,
          theme: theme ?? null,
          tags: currentQ.tags ?? [],
          questionType: "mcq",
          answer: String(oi),
          correctAnswer: String(currentQ.correctIndex),
          isCorrect,
          isCritical,
        },
      });
    } catch (err) {
      console.error("submit answer failed", err);
    }
  }

  async function next() {
    if (qIdx + 1 < questions.length) {
      setQIdx(qIdx + 1);
      setChosen(null);
      return;
    }
    // fim do quiz — finaliza
    if (!currentReview) return;
    try {
      const res = await finalize({
        data: {
          reviewId: currentReview.id,
          moduleId: currentReview.module_id,
          correct: stats.correct,
          total: stats.total,
          hadCriticalError: stats.hadCritical,
          wrongThemesCount: stats.wrongThemes,
        },
      });
      setLastResult({
        score: res.scorePercent,
        extraCreated: res.extraCreated,
        moduleName: currentReview.module_name,
      });
    } catch (err) {
      console.error(err);
      setLastResult({
        score: Math.round((stats.correct / Math.max(1, stats.total)) * 100),
        extraCreated: null,
        moduleName: currentReview.module_name,
      });
    }
    setPhase("done");
  }

  function nextReview() {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= reviews.length) {
      setPhase("finished_all");
      return;
    }
    setLastResult(null);
    startReview(nextIdx, reviews);
  }

  const progressPct = useMemo(
    () => (questions.length ? Math.round(((qIdx + (chosen !== null ? 1 : 0)) / questions.length) * 100) : 0),
    [qIdx, chosen, questions.length],
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin={false} />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[3px] text-primary font-semibold mb-2">
            <Brain className="h-3.5 w-3.5" /> Revisão do dia
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reforce o que já estudou
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mini resumo + perguntas rápidas. Você recebe feedback na hora.
          </p>
        </div>

        {phase === "loading" && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {phase === "finished_all" && (
          <Card className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <h2 className="font-semibold text-lg mb-1">Tudo em dia!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Você não tem revisões pendentes. Volte amanhã para continuar fortalecendo o que aprendeu.
            </p>
            <Button onClick={() => navigate({ to: "/" })}>Voltar à trilha</Button>
          </Card>
        )}

        {phase === "intro" && currentReview && (
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <Badge variant="secondary" className="mb-2">
                  Revisão {currentIdx + 1} de {reviews.length}
                </Badge>
                <h2 className="font-semibold text-lg">{currentReview.module_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Motivo: <strong>{currentReview.reason}</strong>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{currentReview.question_count} perguntas</div>
                <div>~{currentReview.estimated_minutes} min</div>
              </div>
            </div>
            <Button className="w-full" onClick={() => setPhase("summary")}>
              Iniciar revisão
            </Button>
          </Card>
        )}

        {phase === "summary" && currentReview && cfg && (
          <Card className="p-5 space-y-4 border-primary/30">
            <div className="text-[10px] uppercase tracking-[2px] text-primary font-semibold">
              Revisão rápida
            </div>
            <h2 className="font-semibold text-lg">{currentReview.module_name}</h2>
            <p className="text-sm text-muted-foreground">
              Antes de responder, relembre:
            </p>
            <ul className="space-y-2 text-sm">
              {cfg.miniSummary.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={() => setPhase("quiz")}>
              Começar perguntas
            </Button>
          </Card>
        )}

        {phase === "quiz" && currentQ && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Pergunta {qIdx + 1} de {questions.length}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <Card className="p-5">
              <p className="text-sm font-medium mb-3">{currentQ.question}</p>
              <div className="space-y-2">
                {currentQ.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isCorrect = oi === currentQ.correctIndex;
                  const answered = chosen !== null;
                  let tone = "border-border/60 hover:bg-muted/40";
                  if (answered) {
                    if (isCorrect) tone = "border-emerald-400/60 bg-emerald-500/10";
                    else if (isChosen) tone = "border-rose-400/60 bg-rose-500/10";
                    else tone = "border-border/30 opacity-60";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => pickAnswer(oi)}
                      className={`w-full text-left text-sm rounded-xl border px-3 py-2.5 transition-colors ${tone}`}
                    >
                      <span className="font-semibold mr-1">
                        {String.fromCharCode(65 + oi)})
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {chosen !== null && (
                <FeedbackCard question={currentQ} chosen={chosen} />
              )}
              {chosen !== null && (
                <Button className="w-full mt-3" onClick={next}>
                  {qIdx + 1 < questions.length ? "Próxima" : "Ver resultado"}
                </Button>
              )}
            </Card>
          </div>
        )}

        {phase === "done" && lastResult && (
          <Card className="p-5 space-y-3">
            <div className="text-[10px] uppercase tracking-[2px] text-primary font-semibold">
              Resultado da revisão
            </div>
            <h2 className="font-semibold text-lg">{lastResult.moduleName}</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-border/60 p-3">
                <div className="text-2xl font-bold">{stats.correct}/{stats.total}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div className="rounded-xl border border-border/60 p-3">
                <div
                  className={`text-2xl font-bold ${
                    lastResult.score >= 70 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {lastResult.score}%
                </div>
                <div className="text-xs text-muted-foreground">Desempenho</div>
              </div>
            </div>
            {lastResult.extraCreated && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs">
                <strong>Nova revisão criada para amanhã:</strong>{" "}
                {lastResult.extraCreated}
              </div>
            )}
            <Button className="w-full" onClick={nextReview}>
              {currentIdx + 1 < reviews.length ? "Próxima revisão" : "Concluir"}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}

function FeedbackCard({
  question,
  chosen,
}: {
  question: ReviewQuestion;
  chosen: number;
}) {
  const correct = chosen === question.correctIndex;
  const critical = !!question.isCritical;
  if (correct) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Correto.
        </div>
        {question.memoryTip && (
          <p className="text-xs text-emerald-100/80 mt-1.5">
            <strong>Ponto para memorizar:</strong> {question.memoryTip}
          </p>
        )}
      </div>
    );
  }
  return (
    <div
      className={`mt-3 rounded-xl border p-3 text-sm ${
        critical
          ? "border-rose-500/60 bg-rose-500/15"
          : "border-rose-400/40 bg-rose-500/10"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold text-rose-300">
        {critical ? (
          <>
            <AlertTriangle className="h-4 w-4" /> Você errou uma questão crítica.
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" /> Você errou.
          </>
        )}
      </div>
      <p className="text-xs mt-1.5">
        <strong>Resposta correta:</strong>{" "}
        <span className="text-primary font-semibold">
          {String.fromCharCode(65 + question.correctIndex)}){" "}
          {question.options[question.correctIndex]}
        </span>
      </p>
      {question.wrongAnswerExplanation && (
        <p className="text-xs mt-1.5 opacity-90">
          <strong>Por quê?</strong> {question.wrongAnswerExplanation}
        </p>
      )}
      {question.memoryTip && (
        <p className="text-xs mt-1.5 opacity-90">
          <strong>Ponto para memorizar:</strong> {question.memoryTip}
        </p>
      )}
    </div>
  );
}
