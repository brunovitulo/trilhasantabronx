import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, CheckCircle2, Circle, Copy, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findTopic, type Subtask, PASSING_SCORE } from "@/data/topics";
import { computeTopicStatuses, getSubtaskState, type ProgressRow } from "@/lib/progress";
import { TOPICS } from "@/data/topics";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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
          <div className="mt-6 space-y-4">
            {groupSubtasks(topic.subtasks).map((group) => {
              const multi = group.items.length > 1;
              return (
                <Card
                  key={group.key}
                  className="overflow-hidden rounded-3xl border-border/60 bg-card/70 backdrop-blur-xl shadow-sm"
                >
                  {multi && (
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground/90">
                        {group.title}
                      </h2>
                    </div>
                  )}
                  <div className="divide-y divide-border/50">
                    {group.items.map((entry, idx) => {
                      const sub = entry.subtask;
                      const state = getSubtaskState(sub.id, rows);
                      const priorCompleted = topic.subtasks
                        .filter(
                          (s) =>
                            s.kind !== "evaluation" &&
                            s.kind !== "open_evaluation" &&
                            s.id !== sub.id,
                        )
                        .every((s) => getSubtaskState(s.id, rows).completed);
                      const displayTitle = multi
                        ? `Passo ${idx + 1}: ${entry.stepLabel}`
                        : group.title;
                      return (
                        <SubtaskBody
                          key={sub.id}
                          subtask={sub}
                          userId={user.id}
                          displayTitle={displayTitle}
                          completed={state.completed}
                          score={state.score}
                          priorCompleted={priorCompleted}
                          onComplete={(score) => markCompleted(sub, score)}
                          onUncheck={() => unmark(sub.id)}
                        />
                      );

                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

type SubtaskGroupEntry = { subtask: Subtask; stepLabel: string };
type SubtaskGroup = {
  key: string;
  title: string;
  items: SubtaskGroupEntry[];
  titleFromDash: boolean;
};

function groupSubtasks(subtasks: Subtask[]): SubtaskGroup[] {
  const groups: SubtaskGroup[] = [];
  const indexByNum = new Map<string, number>();
  for (const sub of subtasks) {
    const m = sub.title.match(/^(\d+)\.\s+(.*)$/);
    const num = m ? m[1] : null;
    const rest = (m ? m[2] : sub.title).trim();
    const dashParts = rest.split(/\s+—\s+/);
    const hasDash = dashParts.length >= 2;
    const headerFromDash = hasDash
      ? `${num ? num + ". " : ""}${dashParts[0].trim()}`
      : null;
    const stepLabel = hasDash ? dashParts.slice(1).join(" — ").trim() : rest;

    let groupIdx = num != null ? indexByNum.get(num) : undefined;
    if (groupIdx === undefined) {
      groupIdx = groups.length;
      groups.push({
        key: num ?? `solo-${groups.length}`,
        title: headerFromDash ?? (num ? `${num}. ${rest}` : rest),
        titleFromDash: headerFromDash != null,
        items: [],
      });
      if (num != null) indexByNum.set(num, groupIdx);
    } else if (headerFromDash && !groups[groupIdx].titleFromDash) {
      groups[groupIdx].title = headerFromDash;
      groups[groupIdx].titleFromDash = true;
    }
    groups[groupIdx].items.push({ subtask: sub, stepLabel });
  }
  return groups;
}

function SubtaskBody({
  subtask,
  userId,
  displayTitle,
  completed,
  score,
  priorCompleted,
  onComplete,
  onUncheck,
}: {
  subtask: Subtask;
  userId: string;
  displayTitle?: string;
  completed: boolean;
  score: number | null;
  priorCompleted: boolean;
  onComplete: (score?: number) => void;
  onUncheck: () => void;
}) {
  const isEvaluation = subtask.kind === "evaluation";
  const isOpenEval = subtask.kind === "open_evaluation";
  const passing = isEvaluation
    ? (subtask as Extract<Subtask, { kind: "evaluation" }>).passingScore ?? PASSING_SCORE
    : 0;
  const passed = !isEvaluation ? completed : completed && (score ?? 0) >= passing;
  const evalLocked =
    (isEvaluation || isOpenEval) && !priorCompleted && !completed;

  return (
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
            <h3 className="font-medium">{displayTitle ?? subtask.title}</h3>
            {(isEvaluation || isOpenEval) && (
              <Badge className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/20 border border-pink-400/30">
                Avaliação
              </Badge>
            )}
            {completed && score != null && isEvaluation && (
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
            {subtask.kind === "practice" && (
              <PracticeSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} />
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
            {subtask.kind === "open_evaluation" && (
              evalLocked ? (
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
                  Conclua as etapas anteriores para liberar a avaliação.
                </div>
              ) : (
                <OpenEvaluationSubtask
                  subtask={subtask}
                  userId={userId}
                  completed={completed}
                  onSubmitted={() => onComplete()}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
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
  const [copied, setCopied] = useState(false);
  const canMark = copied || completed;

  async function copyVideoLink() {
    try {
      await navigator.clipboard.writeText(subtask.url);
      setCopied(true);
      toast.success("Link copiado", { description: "Cole no navegador para abrir o vídeo." });
    } catch {
      setCopied(true);
      window.prompt("Copie este link e cole no navegador:", subtask.url);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs sm:text-sm text-muted-foreground break-all font-mono select-all">
        {subtask.url}
      </div>
      <p className="text-xs text-muted-foreground">
        Copie o link, cole em outra aba, assista o destaque por completo.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          onClick={copyVideoLink}
        >
          <Copy className="h-4 w-4" /> {copied ? "Link copiado" : "Copiar link do vídeo"}
        </Button>

        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>Desmarcar</Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={!canMark}
            onClick={onComplete}
            title={!canMark ? "Copie o link primeiro" : undefined}
          >
            Já assisti
          </Button>
        )}
      </div>
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

function ApostilaSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "apostila" }>;
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
        <div className="mt-4">
          <ApostilaView
            title={subtask.title}
            intro={subtask.intro}
            sections={subtask.sections}
            extrasTitle={subtask.extrasTitle}
            extras={subtask.extras}
            faq={subtask.faq}
          />
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar leitura
          </Button>
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

function renderTextWithLinks(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    elements.push(
      <a
        key={key++}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
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
              {renderTextWithLinks(item)}
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

function PracticeSubtask({
  subtask,
  completed,
  onComplete,
}: {
  subtask: Extract<Subtask, { kind: "practice" }>;
  completed: boolean;
  onComplete: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    subtask.questions.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  function pick(qi: number, oi: number) {
    if (answers[qi] != null) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  function finish() {
    if (!completed) onComplete();
    setSubmitted(true);
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === subtask.questions.length;
  const correctCount = answers.filter(
    (a, i) => a !== null && a === subtask.questions[i].correctIndex,
  ).length;

  if (completed && !submitted) {
    return (
      <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Exercício de fixação finalizado ✓</p>
        <p className="text-muted-foreground">
          Este exercício só pode ser respondido uma vez e já foi concluído. Avance para a avaliação final do tópico.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold mb-2">⚠️ Antes de iniciar, leia com atenção:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ao iniciar, todas as <strong>{subtask.questions.length} perguntas</strong> vão aparecer.</li>
            <li>Você precisa <strong>responder todas</strong> antes de finalizar.</li>
            <li>Cada pergunta só pode ser respondida <strong>uma única vez</strong> — não dá para mudar a resposta depois.</li>
            <li>Depois de finalizar, o exercício <strong>não pode ser refeito</strong>.</li>
            <li>Este exercício precisa estar completo antes da avaliação final.</li>
          </ul>
        </div>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => setStarted(true)}
        >
          Iniciar exercício de fixação
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subtask.questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <p className="text-sm font-medium mb-2">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                const answered = chosen != null;
                const tone = !answered
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
                    disabled={answered}
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
                  ? "✓ Correto"
                  : `✗ Resposta correta: ${String.fromCharCode(97 + q.correctIndex)}`}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-3 flex-wrap pt-1">
        <span className="text-xs text-muted-foreground">
          Respondidas: {answeredCount}/{subtask.questions.length}
        </span>
        {submitted ? (
          <Badge>
            {correctCount}/{subtask.questions.length} corretas — finalizado
          </Badge>
        ) : (
          <Button
            size="sm"
            className="rounded-full"
            disabled={!allAnswered}
            onClick={finish}
          >
            Finalizar exercício
          </Button>
        )}
      </div>
    </div>
  );
}


type OpenSubmission = {
  id: string;
  status: "pending_review" | "approved" | "rejected";
  score: number | null;
  general_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type OpenAnswerRow = {
  id: string;
  question_index: number;
  answer_text: string;
  is_correct: boolean | null;
  feedback: string | null;
};

function OpenEvaluationSubtask({
  subtask,
  userId,
  completed,
  onSubmitted,
}: {
  subtask: Extract<Subtask, { kind: "open_evaluation" }>;
  userId: string;
  completed: boolean;
  onSubmitted: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<OpenSubmission | null>(null);
  const [answerRows, setAnswerRows] = useState<OpenAnswerRow[]>([]);
  const [drafts, setDrafts] = useState<string[]>(() => subtask.questions.map(() => ""));
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const { data: subs } = await supabase
      .from("open_evaluation_submissions")
      .select("id, status, score, general_feedback, created_at, reviewed_at")
      .eq("user_id", userId)
      .eq("subtask_id", subtask.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const latest = (subs?.[0] as OpenSubmission | undefined) ?? null;
    setSubmission(latest);
    if (latest) {
      const { data: ans } = await supabase
        .from("open_evaluation_answers")
        .select("id, question_index, answer_text, is_correct, feedback")
        .eq("submission_id", latest.id)
        .order("question_index", { ascending: true });
      const rows = (ans ?? []) as OpenAnswerRow[];
      setAnswerRows(rows);
      setDrafts(
        subtask.questions.map(
          (_, i) => rows.find((r) => r.question_index === i)?.answer_text ?? "",
        ),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, subtask.id]);

  async function submit() {
    if (drafts.some((d) => d.trim().length === 0)) {
      toast.error("Responda todas as 15 perguntas antes de enviar");
      return;
    }
    setSending(true);
    const { data: sub, error: subErr } = await supabase
      .from("open_evaluation_submissions")
      .insert({
        user_id: userId,
        subtask_id: subtask.id,
        status: "pending_review",
      })
      .select()
      .single();
    if (subErr || !sub) {
      setSending(false);
      toast.error("Não consegui enviar", { description: subErr?.message });
      return;
    }
    const rows = subtask.questions.map((q, i) => ({
      submission_id: sub.id,
      question_index: i,
      question_text: q.question,
      answer_text: drafts[i].trim(),
    }));
    const { error: ansErr } = await supabase
      .from("open_evaluation_answers")
      .insert(rows);
    if (ansErr) {
      setSending(false);
      toast.error("Erro ao salvar respostas", { description: ansErr.message });
      return;
    }
    onSubmitted();
    toast.success("Avaliação enviada para revisão");
    await load();
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submission) {
    const statusLabel =
      submission.status === "pending_review"
        ? "Pendente revisão"
        : submission.status === "approved"
        ? `Aprovada${submission.score != null ? ` — ${Math.round(submission.score)}%` : ""}`
        : `Reprovada — pode refazer${submission.score != null ? ` (${Math.round(submission.score)}%)` : ""}`;
    const statusTone =
      submission.status === "pending_review"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : submission.status === "approved"
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-rose-500/15 text-rose-400 border-rose-500/30";

    return (
      <div className="space-y-3">
        <div className={`rounded-2xl border px-3 py-2 text-sm font-medium ${statusTone}`}>
          Status: {statusLabel}
        </div>
        {submission.general_feedback && (
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Feedback da gestora
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{submission.general_feedback}</p>
          </div>
        )}
        <div className="space-y-2">
          {subtask.questions.map((q, i) => {
            const row = answerRows.find((r) => r.question_index === i);
            return (
              <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium">
                  {i + 1}. {q.question}
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                  {row?.answer_text || <span className="text-muted-foreground">(sem resposta)</span>}
                </p>
                {row?.is_correct != null && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      row.is_correct ? "text-[var(--success)]" : "text-destructive"
                    }`}
                  >
                    {row.is_correct ? "✓ Correta" : "✗ Incorreta"}
                  </p>
                )}
                {row?.feedback && (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    Feedback: {row.feedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {submission.status === "rejected" && (
          <div className="pt-2">
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                setSubmission(null);
                setAnswerRows([]);
                setDrafts(subtask.questions.map(() => ""));
              }}
            >
              Refazer avaliação
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Responda com suas próprias palavras. Ao enviar, o próximo tópico é liberado e a gestora corrige depois.
      </p>
      {subtask.questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
          <label className="block text-sm font-medium mb-2">
            {i + 1}. {q.question}
          </label>
          <Textarea
            value={drafts[i]}
            onChange={(e) =>
              setDrafts((prev) => prev.map((d, idx) => (idx === i ? e.target.value : d)))
            }
            placeholder="Escreva sua resposta aqui..."
            rows={3}
            className="bg-background"
          />
        </div>
      ))}
      <Button onClick={submit} disabled={sending} className="rounded-full">
        {sending ? "Enviando..." : "Enviar para revisão"}
      </Button>
    </div>
  );
}
