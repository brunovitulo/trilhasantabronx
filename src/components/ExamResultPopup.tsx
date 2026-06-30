import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findSubtask } from "@/data/topics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EXAM_POPUP_EVENT, EXAM_SEEN_EVENT } from "@/components/NotificationBell";

type ReviewedRow = {
  id: string;
  subtask_id: string;
  status: "approved" | "rejected";
  score: number | null;
  general_feedback: string | null;
  reviewed_at: string | null;
};

type AnswerComment = {
  id: string;
  question_index: number;
  question_text: string;
  answer_text: string | null;
  is_correct: boolean | null;
  feedback: string | null;
};

function seenKey(id: string) {
  return `sb-exam-seen-${id}`;
}

function isUnseen(row: ReviewedRow) {
  try {
    return localStorage.getItem(seenKey(row.id)) !== "1";
  } catch {
    return true;
  }
}


export function ExamResultPopup({ userId }: { userId: string }) {
  const [pending, setPending] = useState<ReviewedRow[]>([]);
  const [commentsBySubmission, setCommentsBySubmission] = useState<
    Record<string, AnswerComment[]>
  >({});

  const enqueue = useCallback((row: ReviewedRow) => {
    setPending((prev) => {
      if (prev.some((r) => r.id === row.id)) return prev;
      return [...prev, row];
    });
  }, []);

  const loadComments = useCallback(async (submissionId: string) => {
    const { data } = await supabase
      .from("open_evaluation_answers")
      .select("id, question_index, question_text, answer_text, is_correct, feedback")
      .eq("submission_id", submissionId)
      .not("feedback", "is", null)
      .order("question_index", { ascending: true });
    const rows = (data ?? []) as AnswerComment[];
    const filtered = rows.filter(
      (r) => typeof r.feedback === "string" && r.feedback.trim().length > 0,
    );
    setCommentsBySubmission((prev) => ({ ...prev, [submissionId]: filtered }));
  }, []);

  const fetchUnseen = useCallback(async () => {
    const { data } = await supabase
      .from("open_evaluation_submissions")
      .select("id, subtask_id, status, score, general_feedback, reviewed_at")
      .eq("user_id", userId)
      .in("status", ["approved", "rejected"])
      .not("reviewed_at", "is", null)
      .order("reviewed_at", { ascending: false })
      .limit(10);
    const rows = ((data ?? []) as ReviewedRow[]).filter(isUnseen);
    if (rows.length > 0) {
      // Mais antigo primeiro, pra a atendente ver na ordem
      rows.reverse().forEach((r) => {
        enqueue(r);
        void loadComments(r.id);
      });
    }
  }, [userId, enqueue, loadComments]);

  useEffect(() => {
    fetchUnseen();
    const channel = supabase
      .channel(`exam-results-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "open_evaluation_submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as ReviewedRow;
          if (
            (row.status === "approved" || row.status === "rejected") &&
            row.reviewed_at &&
            isUnseen(row)
          ) {
            enqueue(row);
            void loadComments(row.id);
          }
        },
      )
      .subscribe();
    const onShow = () => fetchUnseen();
    window.addEventListener(EXAM_POPUP_EVENT, onShow);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(EXAM_POPUP_EVENT, onShow);
    };
  }, [userId, fetchUnseen, enqueue]);

  const current = pending[0] ?? null;

  function dismissCurrent() {
    if (!current) return;
    try {
      localStorage.setItem(seenKey(current.id), "1");
    } catch {
      /* noop */
    }
    setPending((prev) => prev.slice(1));
    window.dispatchEvent(new CustomEvent(EXAM_SEEN_EVENT));
  }

  if (!current) return null;

  const approved = current.status === "approved";
  const meta = findSubtask(current.subtask_id);
  const topicTitle = meta?.topic.title ?? "Tópico";
  const scoreText =
    current.score != null ? `${Math.round(current.score)}%` : "—";

  return (
    <Dialog open onOpenChange={(o) => !o && dismissCurrent()}>
      <DialogContent className="sm:max-w-md border-white/10 bg-white/[0.08] backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {approved ? (
              <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            {approved ? "Prova aprovada!" : "Prova reprovada"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-foreground/90">
            <span className="text-foreground/70">Prova:</span> {topicTitle}
          </p>
          <div
            className={`rounded-2xl border p-3 ${
              approved
                ? "border-[var(--success)]/40 bg-[var(--success)]/10"
                : "border-destructive/40 bg-destructive/10"
            }`}
          >
            <p className="text-sm">
              <span className="text-foreground/70">Sua nota: </span>
              <span className="font-semibold text-foreground">{scoreText}</span>
            </p>
            {!approved && (
              <p className="text-xs text-foreground/80 mt-1">
                Você pode refazer a prova quando estiver pronta.
              </p>
            )}
            {approved && (
              <p className="text-xs text-foreground/80 mt-1">
                Parabéns! Continue para o próximo tópico.
              </p>
            )}
          </div>
          {current.general_feedback && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-semibold text-foreground/80 mb-1">
                Feedback da gestora
              </p>
              <p className="text-sm whitespace-pre-wrap text-foreground/90">
                {current.general_feedback}
              </p>
            </div>
          )}
          <div className="flex justify-end pt-1">
            <Button onClick={dismissCurrent} className="rounded-full">
              Entendi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
