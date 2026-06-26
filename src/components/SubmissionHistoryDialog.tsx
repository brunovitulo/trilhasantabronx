import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  RotateCcw,
  FileText,
  ListChecks,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  User,
  CalendarClock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findSubtask } from "@/data/topics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Submission = {
  id: string;
  subtask_id: string;
  status: "pending_review" | "approved" | "rejected";
  score: number | null;
  general_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
  retry_allowed: boolean;
};

type AnswerRow = {
  id: string;
  question_index: number;
  question_text: string;
  answer_text: string;
  is_correct: boolean | null;
  feedback: string | null;
};

type PracticeAttempt = {
  id: string;
  subtask_id: string;
  answers: number[];
  correct_count: number;
  total: number;
  created_at: string;
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionHistoryDialog({
  open,
  onOpenChange,
  userId,
  userName,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string | null;
  isAdmin?: boolean;
}) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [practice, setPractice] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [viewingPractice, setViewingPractice] = useState<PracticeAttempt | null>(null);

  async function refresh() {
    if (!userId) return;
    setLoading(true);
    const [{ data: subData }, { data: pData }] = await Promise.all([
      supabase
        .from("open_evaluation_submissions")
        .select("id, subtask_id, status, score, general_feedback, created_at, reviewed_at, retry_allowed")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("practice_attempts")
        .select("id, subtask_id, answers, correct_count, total, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    setSubs((subData ?? []) as Submission[]);
    setPractice((pData ?? []) as unknown as PracticeAttempt[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!open) {
      setViewing(null);
      setViewingPractice(null);
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const grouped = subs.reduce<Record<string, Submission[]>>((acc, s) => {
    (acc[s.subtask_id] ??= []).push(s);
    return acc;
  }, {});

  const groupedPractice = practice.reduce<Record<string, PracticeAttempt[]>>((acc, p) => {
    (acc[p.subtask_id] ??= []).push(p);
    return acc;
  }, {});

  async function releaseRetry(sub: Submission) {
    const { error } = await supabase
      .from("open_evaluation_submissions")
      .update({ retry_allowed: true })
      .eq("id", sub.id);
    if (error) {
      toast.error("Não consegui liberar", { description: error.message });
      return;
    }
    toast.success("Nova tentativa liberada para a atendente");
    refresh();
    setViewing((v) => (v && v.id === sub.id ? { ...v, retry_allowed: true } : v));
  }

  const noContent = subs.length === 0 && practice.length === 0;
  const totalProvas = subs.length;
  const totalExercicios = practice.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          {viewing || viewingPractice ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewing(null);
                  setViewingPractice(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 self-start"
              >
                <ChevronLeft className="h-3 w-3" /> Voltar ao histórico
              </button>
              <DialogTitle>
                {viewingPractice ? "Detalhes do exercício de fixação" : "Detalhes da prova"}
              </DialogTitle>
              <DialogDescription>
                {findSubtask((viewing ?? viewingPractice!)!.subtask_id)?.topic.title ?? "Prova"}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Histórico de provas e exercícios</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                {userName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {userName}
                  </span>
                )}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : viewing ? (
          <SubmissionDetail
            submission={viewing}
            isAdmin={!!isAdmin}
            onReleaseRetry={() => releaseRetry(viewing)}
          />
        ) : viewingPractice ? (
          <PracticeDetail attempt={viewingPractice} />
        ) : noContent ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma prova nem exercício enviado ainda.
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Resumo no topo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-300/80">
                  <FileText className="h-3.5 w-3.5" />
                  Provas
                </div>
                <p className="mt-1 text-2xl font-bold text-emerald-200">{totalProvas}</p>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-sky-300/80">
                  <ListChecks className="h-3.5 w-3.5" />
                  Exercícios
                </div>
                <p className="mt-1 text-2xl font-bold text-sky-200">{totalExercicios}</p>
              </div>
            </div>

            {Object.keys(grouped).length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/95 leading-tight">
                      Provas dissertativas
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Tentativas enviadas e corrigidas pela gestora
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pl-1">
                  {Object.entries(grouped).map(([subtaskId, list]) => {
                    const meta = findSubtask(subtaskId);
                    const topicTitle = meta?.topic.title ?? "Prova";
                    const sorted = [...list].sort(
                      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                    );
                    return (
                      <div key={subtaskId} className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          {topicTitle}
                        </p>
                        <div className="space-y-2">
                          {sorted.map((s, idx) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setViewing(s)}
                              className="group w-full text-left rounded-2xl border border-border/60 bg-card/40 p-3.5 hover:bg-card/70 hover:border-border transition shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold">Tentativa {idx + 1}</span>
                                {statusBadge(s.status)}
                                {s.score != null && (
                                  <Badge variant="outline" className="font-mono">
                                    {Math.round(s.score)}%
                                  </Badge>
                                )}
                                {s.retry_allowed && s.status === "rejected" && (
                                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Nova tentativa liberada
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <CalendarClock className="h-3 w-3" />
                                  Enviada {formatDateShort(s.created_at)}
                                </span>
                                {s.reviewed_at && (
                                  <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Corrigida {formatDateShort(s.reviewed_at)}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {Object.keys(groupedPractice).length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/95 leading-tight">
                      Exercícios de fixação
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Questões de múltipla escolha respondidas durante o conteúdo
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pl-1">
                  {Object.entries(groupedPractice).map(([subtaskId, list]) => {
                    const meta = findSubtask(subtaskId);
                    const topicTitle = meta?.topic.title ?? "Exercício";
                    const subtitle = meta?.subtask.title ?? "";
                    const sorted = [...list].sort(
                      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                    );
                    return (
                      <div key={subtaskId} className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          {topicTitle}
                          {subtitle ? <span className="text-muted-foreground/70"> · {subtitle}</span> : null}
                        </p>
                        <div className="space-y-2">
                          {sorted.map((p, idx) => {
                            const pct = Math.round((p.correct_count / Math.max(p.total, 1)) * 100);
                            const good = pct >= 70;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setViewingPractice(p)}
                                className="group w-full text-left rounded-2xl border border-border/60 bg-card/40 p-3.5 hover:bg-card/70 hover:border-border transition shadow-sm"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold">Tentativa {idx + 1}</span>
                                  <Badge
                                    variant="outline"
                                    className={`font-mono ${
                                      good ? "text-emerald-300 border-emerald-500/40" : "text-amber-300 border-amber-500/40"
                                    }`}
                                  >
                                    {p.correct_count}/{p.total} · {pct}%
                                  </Badge>
                                </div>
                                <p className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                                  <CalendarClock className="h-3 w-3" />
                                  Realizado em {formatDateShort(p.created_at)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PracticeDetail({ attempt }: { attempt: PracticeAttempt }) {
  const meta = findSubtask(attempt.subtask_id);
  const sub = meta?.subtask;
  const questions = sub && sub.kind === "practice" ? sub.questions : [];
  const pct = Math.round((attempt.correct_count / Math.max(attempt.total, 1)) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap rounded-2xl border border-border/60 bg-muted/30 p-3">
        <Badge variant="outline" className="font-mono">
          {attempt.correct_count}/{attempt.total} corretas
        </Badge>
        <Badge className="bg-muted text-foreground/80 border border-border/60 font-mono">{pct}%</Badge>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => {
          const chosen = attempt.answers[i];
          const isCorrect = chosen === q.correctIndex;
          return (
            <div
              key={i}
              className={`rounded-2xl border bg-card/30 p-4 ${
                isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
              }`}
            >
              <p className="text-sm font-semibold">
                {i + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isAnswer = oi === q.correctIndex;
                  const tone = isAnswer
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                    : isChosen
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-100"
                    : "border-border/40 opacity-70";
                  return (
                    <div key={oi} className={`text-xs rounded-xl border px-3 py-2 ${tone}`}>
                      <span className="font-semibold mr-1">{String.fromCharCode(97 + oi)})</span>
                      {opt}
                      {isChosen && <span className="ml-2 font-semibold">← escolha da atendente</span>}
                    </div>
                  );
                })}
              </div>
              <p
                className={`mt-3 text-xs font-semibold inline-flex items-center gap-1 ${
                  isCorrect ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {isCorrect ? "Correta" : "Incorreta"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function statusBadge(s: Submission["status"]) {
  if (s === "pending_review")
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> Pendente
      </Badge>
    );
  if (s === "approved")
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Aprovada
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 border inline-flex items-center gap-1">
      <XCircle className="h-3 w-3" /> Reprovada
    </Badge>
  );
}

function SubmissionDetail({
  submission,
  isAdmin,
  onReleaseRetry,
}: {
  submission: Submission;
  isAdmin: boolean;
  onReleaseRetry: () => void;
}) {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("open_evaluation_answers")
        .select("id, question_index, question_text, answer_text, is_correct, feedback")
        .eq("submission_id", submission.id)
        .order("question_index", { ascending: true });
      setAnswers((data ?? []) as AnswerRow[]);
      setLoading(false);
    })();
  }, [submission.id]);

  const correctCount = answers.filter((a) => a.is_correct === true).length;
  const reviewed = submission.status !== "pending_review";

  return (
    <div className="space-y-4">
      {/* Cabeçalho de resultado */}
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 flex items-center gap-2 flex-wrap">
        {statusBadge(submission.status)}
        {submission.score != null && (
          <Badge variant="outline" className="font-mono">
            {correctCount}/{answers.length} corretas — {Math.round(submission.score)}%
          </Badge>
        )}
      </div>

      {submission.general_feedback && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/90 mb-1 inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Feedback da gestora
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {submission.general_feedback}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {answers.map((a) => {
            const verdict = reviewed && a.is_correct != null;
            const correct = a.is_correct === true;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border bg-card/30 overflow-hidden ${
                  verdict
                    ? correct
                      ? "border-emerald-500/30"
                      : "border-rose-500/30"
                    : "border-border/60"
                }`}
              >
                {/* Pergunta */}
                <div className="bg-muted/40 px-4 py-3 border-b border-border/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Pergunta {a.question_index + 1}
                  </p>
                  <p className="text-sm font-semibold">{a.question_text}</p>
                </div>

                {/* Resposta da atendente */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Resposta da atendente
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {a.answer_text || <span className="text-muted-foreground">(sem resposta)</span>}
                  </p>
                </div>

                {/* Veredito e feedback */}
                {(verdict || a.feedback) && (
                  <div className="px-4 py-3 border-t border-border/40 bg-background/50 space-y-2">
                    {verdict && (
                      <p
                        className={`text-xs font-semibold inline-flex items-center gap-1 ${
                          correct ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {correct ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {correct ? "Correta" : "Incorreta"}
                      </p>
                    )}
                    {a.feedback && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80 mb-0.5 inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Comentário da gestora
                        </p>
                        <p className="text-xs leading-relaxed text-foreground/90">{a.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && submission.status === "rejected" && !submission.retry_allowed && (
        <div className="pt-2 flex justify-end">
          <Button onClick={onReleaseRetry} className="rounded-full" size="sm">
            <RotateCcw className="h-4 w-4 mr-1" /> Liberar nova tentativa
          </Button>
        </div>
      )}
      {isAdmin && submission.status === "rejected" && submission.retry_allowed && (
        <p className="text-xs text-muted-foreground text-right">
          Nova tentativa já liberada — aguardando a atendente refazer.
        </p>
      )}
    </div>
  );
}
