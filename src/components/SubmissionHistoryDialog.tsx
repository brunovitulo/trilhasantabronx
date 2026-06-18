import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, RotateCcw } from "lucide-react";
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

  // Agrupa por subtask para contar tentativas
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          {viewing ? (
            <>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-1 self-start"
              >
                <ChevronLeft className="h-3 w-3" /> Voltar ao histórico
              </button>
              <DialogTitle>Detalhes da prova</DialogTitle>
              <DialogDescription>
                {findSubtask(viewing.subtask_id)?.topic.title ?? "Prova"}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Histórico de provas</DialogTitle>
              <DialogDescription>
                {userName ?? "Todas as provas enviadas, incluindo tentativas anteriores."}
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
        ) : subs.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma prova enviada ainda.
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([subtaskId, list]) => {
              const meta = findSubtask(subtaskId);
              const topicTitle = meta?.topic.title ?? "Prova";
              const sorted = [...list].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
              );
              return (
                <div key={subtaskId} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {topicTitle}
                  </p>
                  {sorted.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setViewing(s)}
                      className="w-full text-left rounded-2xl border border-border/60 bg-muted/30 p-3 hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          Tentativa {idx + 1}
                        </span>
                        {statusBadge(s.status)}
                        {s.score != null && (
                          <Badge variant="outline">{Math.round(s.score)}%</Badge>
                        )}
                        {s.retry_allowed && s.status === "rejected" && (
                          <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Nova tentativa liberada
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enviada em {new Date(s.created_at).toLocaleString("pt-BR")}
                        {s.reviewed_at && (
                          <> · Corrigida em {new Date(s.reviewed_at).toLocaleString("pt-BR")}</>
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function statusBadge(s: Submission["status"]) {
  if (s === "pending_review")
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border">
        Pendente
      </Badge>
    );
  if (s === "approved")
    return (
      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">
        Aprovada
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 border">
      Reprovada
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {statusBadge(submission.status)}
        {submission.score != null && (
          <Badge variant="outline">
            {correctCount}/{answers.length} corretas — {Math.round(submission.score)}%
          </Badge>
        )}
      </div>

      {submission.general_feedback && (
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Feedback da gestora
          </p>
          <p className="whitespace-pre-wrap leading-relaxed">
            {submission.general_feedback}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {answers.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
              <p className="text-sm font-medium">
                {a.question_index + 1}. {a.question_text}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                {a.answer_text || (
                  <span className="text-muted-foreground">(sem resposta)</span>
                )}
              </p>
              {reviewed && a.is_correct != null && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    a.is_correct ? "text-[var(--success)]" : "text-destructive"
                  }`}
                >
                  {a.is_correct ? "✓ Correta" : "✗ Incorreta"}
                </p>
              )}
              {a.feedback && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  Feedback: {a.feedback}
                </p>
              )}
            </div>
          ))}
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
