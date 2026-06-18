import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, BookOpen, Brain, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { TOPICS, type Subtask, type QuizQuestion } from "@/data/topics";
import { computeTopicStatuses, type ProgressRow } from "@/lib/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/revisao")({
  head: () => ({
    meta: [{ title: "Revisão — Santa Bronx Formação" }],
  }),
  component: RevisaoPage,
});

type ReviewQuestion = QuizQuestion & { topicTitle: string };

function RevisaoPage() {
  const { user } = Route.useRouteContext();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: prog }, { data: roles }] = await Promise.all([
        supabase
          .from("subtask_progress")
          .select("subtask_id, completed, score")
          .eq("user_id", user.id),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!active) return;
      setRows((prog ?? []) as ProgressRow[]);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setLoading(false);
      // marca que revisou hoje
      try {
        localStorage.setItem(`sb-last-review-${user.id}`, String(Date.now()));
      } catch {
        /* noop */
      }
    })();
    return () => {
      active = false;
    };
  }, [user.id]);

  const statuses = computeTopicStatuses(TOPICS, rows);
  const completedTopics = TOPICS.filter(
    (t) => statuses[t.id] === "completed" || statuses[t.id] === "in_progress",
  );

  const reviewQuestions = useMemo<ReviewQuestion[]>(() => {
    const all: ReviewQuestion[] = [];
    for (const t of completedTopics) {
      for (const s of t.subtasks) {
        if (s.kind === "practice" || s.kind === "evaluation") {
          for (const q of s.questions) {
            all.push({ ...q, topicTitle: t.title });
          }
        }
      }
    }
    return all;
  }, [completedTopics]);

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin={isAdmin} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[3px] text-primary font-semibold mb-2">
            <Brain className="h-3.5 w-3.5" /> Revisão geral
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Apostila de revisão + reforço
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Releia o resumo de cada tópico que você já estudou e, em seguida, responda às
            perguntas de reforço. Quanto mais você revisa, mais fixa o conteúdo na memória.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : completedTopics.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Você ainda não concluiu nenhum tópico. Conclua pelo menos um para liberar a revisão.
          </Card>
        ) : (
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-lg">Resumo dos tópicos estudados</h2>
              </div>
              <div className="space-y-3">
                {completedTopics.map((topic) => (
                  <TopicSummary key={topic.id} topic={topic} status={statuses[topic.id]} />
                ))}
              </div>
            </section>

            {reviewQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-lg">
                    Perguntas de reforço ({reviewQuestions.length})
                  </h2>
                </div>
                <ReviewQuiz questions={reviewQuestions} />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TopicSummary({
  topic,
  status,
}: {
  topic: (typeof TOPICS)[number];
  status: string;
}) {
  const apostilas = topic.subtasks.filter(
    (s): s is Extract<Subtask, { kind: "apostila" }> => s.kind === "apostila",
  );
  const readings = topic.subtasks.filter(
    (s): s is Extract<Subtask, { kind: "reading" }> => s.kind === "reading",
  );
  const checklists = topic.subtasks.filter(
    (s): s is Extract<Subtask, { kind: "checklist" }> => s.kind === "checklist",
  );

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${topic.accent} text-white font-bold text-sm`}
          >
            {topic.order}
          </div>
          <h3 className="font-semibold text-base truncate">{topic.title}</h3>
        </div>
        {status === "completed" ? (
          <Badge className="bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]">
            Concluído
          </Badge>
        ) : (
          <Badge variant="secondary">Em andamento</Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3">{topic.summary}</p>

      {apostilas.map((a) => (
        <div key={a.id} className="space-y-2 mb-3 last:mb-0">
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-[13px] text-foreground leading-relaxed">
            <strong className="block text-violet-700 text-[10px] uppercase tracking-[2px] mb-1">
              Conceito base
            </strong>
            {a.intro}
          </div>
          {a.sections.length > 0 && (
            <ul className="text-sm space-y-1.5 pl-1">
              {a.sections.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">{s.icon}</span>
                  <div className="min-w-0">
                    <strong className="text-foreground">{s.title}</strong>
                    <span className="text-muted-foreground"> — {s.subtitle}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {readings.map((r) => (
        <div
          key={r.id}
          className="rounded-xl bg-muted/40 border border-border/60 p-3 text-[13px] text-foreground leading-relaxed whitespace-pre-line mb-2"
        >
          {r.body}
        </div>
      ))}

      {checklists.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Checklist
          </p>
          <ul className="text-sm space-y-1">
            {c.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[var(--success)]" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="pt-2">
        <Link
          to="/topico/$topicId"
          params={{ topicId: topic.id }}
          className="text-xs font-medium text-primary hover:underline"
        >
          Reabrir tópico completo →
        </Link>
      </div>
    </Card>
  );
}

function ReviewQuiz({ questions }: { questions: ReviewQuestion[] }) {
  const [order, setOrder] = useState<number[]>(() =>
    questions.map((_, i) => i).sort(() => Math.random() - 0.5),
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});

  function pick(qi: number, oi: number) {
    if (answers[qi] != null) return;
    setAnswers((p) => ({ ...p, [qi]: oi }));
  }

  function reset() {
    setOrder(questions.map((_, i) => i).sort(() => Math.random() - 0.5));
    setAnswers({});
  }

  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(
    ([qi, oi]) => questions[Number(qi)].correctIndex === oi,
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
        <span>
          <strong>{answered}</strong>/{questions.length} respondidas ·{" "}
          <strong className="text-[var(--success)]">{correct} corretas</strong>
        </span>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-1.5"
          onClick={reset}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Embaralhar de novo
        </Button>
      </div>

      {order.map((qi, idx) => {
        const q = questions[qi];
        const chosen = answers[qi];
        return (
          <Card key={qi} className="p-4">
            <div className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-1">
              {q.topicTitle}
            </div>
            <p className="text-sm font-medium mb-2">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                const isAnswered = chosen != null;
                const tone = !isAnswered
                  ? "border-border/60 hover:bg-muted/60"
                  : isCorrect
                  ? "border-[var(--success)]/50 bg-[var(--success)]/10"
                  : isChosen
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-border/40 opacity-60";
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => pick(qi, oi)}
                    className={`w-full text-left text-sm rounded-xl border px-3 py-2 transition-colors ${tone}`}
                  >
                    <span className="font-semibold mr-1">
                      {String.fromCharCode(97 + oi)})
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {chosen != null && (
              <p
                className={`mt-2 text-xs font-medium ${
                  chosen === q.correctIndex
                    ? "text-[var(--success)]"
                    : "text-destructive"
                }`}
              >
                {chosen === q.correctIndex
                  ? "✓ Correto — fixa essa!"
                  : `✗ Resposta correta: ${String.fromCharCode(97 + q.correctIndex)}) ${q.options[q.correctIndex]}`}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
