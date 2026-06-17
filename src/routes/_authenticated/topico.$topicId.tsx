import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, CheckCircle2, Circle, ExternalLink, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findTopic, type Subtask, PASSING_SCORE } from "@/data/topics";
import { computeTopicStatuses, getSubtaskState, type ProgressRow } from "@/lib/progress";
import { TOPICS } from "@/data/topics";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApostilaView } from "@/components/ApostilaView";

export const Route = createFileRoute("/_authenticated/topico/$topicId")({
  head: ({ params }) => {
    const t = findTopic(params.topicId);
    return { meta: [{ title: t ? `${t.title} — Santa Bronx` : "Tópico" }] };
  },
  component: TopicPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Tópico não encontrado</h1>
        <Link to="/" className="text-primary underline mt-2 inline-block">Voltar à trilha</Link>
      </div>
    </div>
  ),
});

function TopicPage() {
  const { user } = Route.useRouteContext();
  const { topicId } = Route.useParams();
  const navigate = useNavigate();
  const topic = findTopic(topicId);
  if (!topic) throw notFound();

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
    })();
    return () => {
      active = false;
    };
  }, [user.id]);

  const statuses = useMemo(() => computeTopicStatuses(TOPICS, rows), [rows]);
  const accessLocked = statuses[topic.id] === "locked";

  useEffect(() => {
    if (!loading && accessLocked) {
      toast.error("Este tópico ainda está bloqueado");
      navigate({ to: "/" });
    }
  }, [accessLocked, loading, navigate]);

  async function markCompleted(subtask: Subtask, score?: number) {
    const payload = {
      user_id: user.id,
      subtask_id: subtask.id,
      completed: true,
      score: score ?? null,
      completed_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("subtask_progress")
      .upsert(payload, { onConflict: "user_id,subtask_id" });
    if (error) {
      toast.error("Não consegui salvar", { description: error.message });
      return;
    }
    setRows((prev) => {
      const others = prev.filter((r) => r.subtask_id !== subtask.id);
      return [...others, { subtask_id: subtask.id, completed: true, score: score ?? null }];
    });
    toast.success("Salvo!");
  }

  async function unmark(subtaskId: string) {
    const { error } = await supabase
      .from("subtask_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("subtask_id", subtaskId);
    if (error) {
      toast.error("Erro", { description: error.message });
      return;
    }
    setRows((prev) => prev.filter((r) => r.subtask_id !== subtaskId));
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin={isAdmin} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>
        <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${topic.accent} mb-4`} />
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${topic.accent} text-white font-bold shadow-lg`}>
            {topic.order}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
        </div>
        <p className="text-muted-foreground">{topic.summary}</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : topic.subtasks.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground rounded-3xl">
            Este tópico ainda está em construção. Em breve!
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {topic.subtasks.map((sub) => {
              const state = getSubtaskState(sub.id, rows);
              // Avaliação só libera quando todas as subtarefas anteriores (não-avaliação) estiverem concluídas
              const priorCompleted = topic.subtasks
                .filter((s) => s.kind !== "evaluation" && s.id !== sub.id)
                .every((s) => getSubtaskState(s.id, rows).completed);
              return (
                <SubtaskCard
                  key={sub.id}
                  subtask={sub}
                  completed={state.completed}
                  score={state.score}
                  priorCompleted={priorCompleted}
                  onComplete={(score) => markCompleted(sub, score)}
                  onUncheck={() => unmark(sub.id)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function SubtaskCard({
  subtask,
  completed,
  score,
  priorCompleted,
  onComplete,
  onUncheck,
}: {
  subtask: Subtask;
  completed: boolean;
  score: number | null;
  priorCompleted: boolean;
  onComplete: (score?: number) => void;
  onUncheck: () => void;
}) {
  const isEvaluation = subtask.kind === "evaluation";
  const passing = isEvaluation
    ? (subtask as Extract<Subtask, { kind: "evaluation" }>).passingScore ?? PASSING_SCORE
    : 0;
  const passed = !isEvaluation ? completed : completed && (score ?? 0) >= passing;
  const evalLocked = isEvaluation && !priorCompleted && !completed;

  return (
    <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/70 backdrop-blur-xl shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {passed ? (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            ) : evalLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{subtask.title}</h3>
              {isEvaluation && (
                <Badge className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/20 border border-pink-400/30">
                  Avaliação
                </Badge>
              )}
              {completed && score != null && (
                <Badge variant={passed ? "default" : "destructive"}>{score}%</Badge>
              )}
            </div>
            {"description" in subtask && subtask.description && (
              <p className="text-sm text-muted-foreground mt-1">{subtask.description}</p>
            )}

            <div className="mt-3">
              {subtask.kind === "video" && (
                <VideoSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />
              )}
              {subtask.kind === "reading" && (
                <ReadingSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />
              )}
              {subtask.kind === "apostila" && (
                <ApostilaSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />
              )}
              {subtask.kind === "checklist" && (
                <ChecklistSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />
              )}
              {subtask.kind === "evaluation" && (
                evalLocked ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
                    Conclua as etapas anteriores para liberar a avaliação.
                  </div>
                ) : (
                  <EvaluationSubtask
                    subtask={subtask}
                    completed={completed}
                    score={score}
                    passing={passing}
                    onComplete={onComplete}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function VideoSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "video" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const canMark = opened || completed;
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <a
          href={subtask.url}
          target="_blank"
          rel="noreferrer"
          className="gap-1.5"
          onClick={() => setOpened(true)}
        >
          <ExternalLink className="h-4 w-4" /> Abrir vídeo
        </a>
      </Button>
      {completed ? (
        <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>Desmarcar</Button>
      ) : (
        <Button
          size="sm"
          className="rounded-full"
          disabled={!canMark}
          onClick={onComplete}
          title={!canMark ? "Abra o vídeo primeiro" : undefined}
        >
          Já assisti
        </Button>
      )}
      {!completed && !canMark && (
        <span className="text-xs text-muted-foreground">Abra o vídeo para liberar</span>
      )}
    </div>
  );
}

function ReadingSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "reading" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const canMark = opened || completed;
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => {
          setOpen((o) => !o);
          setOpened(true);
        }}
      >
        {open ? "Fechar apostila" : "Abrir apostila"}
      </Button>
      {open && (
        <div className="mt-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
          {subtask.body}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>Desmarcar leitura</Button>
        ) : (
          <Button
            size="sm"
            className="rounded-full"
            disabled={!canMark}
            onClick={onComplete}
            title={!canMark ? "Abra a apostila primeiro" : undefined}
          >
            Marcar como lida
          </Button>
        )}
        {!completed && !canMark && (
          <span className="text-xs text-muted-foreground">Abra a apostila para liberar</span>
        )}
      </div>
    </div>
  );
}

function ChecklistSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "checklist" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [checks, setChecks] = useState<boolean[]>(() => subtask.items.map(() => false));
  const allChecked = checks.every(Boolean);
  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {subtask.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <Checkbox
              id={`${subtask.id}-${i}`}
              checked={checks[i]}
              onCheckedChange={(v) =>
                setChecks((prev) => prev.map((p, idx) => (idx === i ? !!v : p)))
              }
            />
            <Label htmlFor={`${subtask.id}-${i}`} className="text-sm font-normal cursor-pointer leading-snug">
              {item}
            </Label>
          </li>
        ))}
      </ul>
      <div className="pt-1">
        {completed ? (
          <Button variant="ghost" size="sm" onClick={onUncheck}>Desmarcar</Button>
        ) : (
          <Button size="sm" disabled={!allChecked} onClick={onComplete}>
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

function EvaluationSubtask({
  subtask,
  completed,
  score,
  passing,
  onComplete,
}: {
  subtask: Extract<Subtask, { kind: "evaluation" }>;
  completed: boolean;
  score: number | null;
  passing: number;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    subtask.questions.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const correct = answers.filter((a, i) => a === subtask.questions[i].correctIndex).length;
    const computed = Math.round((correct / subtask.questions.length) * 100);
    setSubmitted(true);
    onComplete(computed);
  }

  function retry() {
    setAnswers(subtask.questions.map(() => null));
    setSubmitted(false);
  }

  const passed = completed && (score ?? 0) >= passing;

  if (completed && passed && !submitted) {
    return (
      <div className="rounded-md border bg-[var(--success)]/10 text-sm p-3">
        Aprovada com {score}%. Bom trabalho!{" "}
        <button onClick={retry} className="underline">Refazer</button>
      </div>
    );
  }
  if (completed && !passed && !submitted) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 text-sm p-3">
        Você tirou {score}% e precisa de {passing}% para passar.{" "}
        <button onClick={retry} className="underline">Tentar de novo</button>
      </div>
    );
  }

  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="space-y-4">
      {subtask.questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-2">
            {qi + 1}. {q.question}
          </p>
          <RadioGroup
            value={answers[qi]?.toString() ?? ""}
            onValueChange={(v) =>
              setAnswers((prev) => prev.map((a, i) => (i === qi ? Number(v) : a)))
            }
          >
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-start gap-2">
                <RadioGroupItem value={oi.toString()} id={`${subtask.id}-${qi}-${oi}`} />
                <Label htmlFor={`${subtask.id}-${qi}-${oi}`} className="text-sm font-normal leading-snug cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
      <Button onClick={submit} disabled={!allAnswered}>
        Enviar respostas
      </Button>
      <p className="text-xs text-muted-foreground">Nota mínima: {passing}%.</p>
    </div>
  );
}
