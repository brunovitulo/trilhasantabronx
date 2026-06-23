import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findSubtask, PASSING_SCORE } from "@/data/topics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type CorrectionTarget = {
  id: string;
  user_id: string;
  subtask_id: string;
  created_at: string;
  full_name: string | null;
};

type AnswerRow = {
  id: string;
  question_index: number;
  question_text: string;
  answer_text: string;
  is_correct: boolean | null;
  feedback: string | null;
};

export function CorrectionDialog({
  submission,
  reviewerId,
  onOpenChange,
  onReviewed,
}: {
  submission: CorrectionTarget | null;
  reviewerId: string;
  onOpenChange: (open: boolean) => void;
  onReviewed: () => void;
}) {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState("");

  const sub = submission ? findSubtask(submission.subtask_id) : null;
  const topicTitle = sub?.topic.title ?? "Prova";
  const subtaskTitle = sub?.subtask.title ?? "Avaliação";
  const marked = answers.filter((a) => a.is_correct !== null).length;

  useEffect(() => {
    if (!submission) {
      setAnswers([]);
      setGeneral("");
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("open_evaluation_answers")
        .select("id, question_index, question_text, answer_text, is_correct, feedback")
        .eq("submission_id", submission.id)
        .order("question_index", { ascending: true });
      if (error) toast.error("Erro ao carregar a prova", { description: error.message });
      setAnswers((data ?? []) as AnswerRow[]);
      setLoading(false);
    })();
  }, [submission]);

  async function updateAnswer(id: string, patch: Partial<AnswerRow>) {
    setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    const { error } = await supabase.from("open_evaluation_answers").update(patch).eq("id", id);
    if (error) toast.error("Não consegui salvar a marcação", { description: error.message });
  }

  async function finalize() {
    if (!submission) return;
    if (answers.length === 0 || answers.some((a) => a.is_correct === null)) {
      toast.error(`Marque certa ou errada em todas as ${answers.length} questões antes de finalizar`);
      return;
    }
    setSaving(true);
    const correct = answers.filter((a) => a.is_correct === true).length;
    const score = Math.round((correct / answers.length) * 100);
    const status = score >= PASSING_SCORE ? "approved" : "rejected";
    const { error } = await supabase
      .from("open_evaluation_submissions")
      .update({
        status,
        score,
        general_feedback: general || null,
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
    if (error) {
      setSaving(false);
      toast.error("Erro ao finalizar avaliação", { description: error.message });
      return;
    }
    // Reflete na trilha do(a) atendente: só conta como concluído quando aprovado.
    if (status === "approved") {
      const { error: upErr } = await supabase
        .from("subtask_progress")
        .upsert(
          {
            user_id: submission.user_id,
            subtask_id: submission.subtask_id,
            completed: true,
            score,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,subtask_id" },
        );
      if (upErr) {
        setSaving(false);
        toast.error("Avaliação salva, mas não consegui liberar o próximo módulo", {
          description: upErr.message,
        });
        return;
      }
    } else {
      // Reprovada: garante que o passo NÃO conste como concluído.
      await supabase
        .from("subtask_progress")
        .delete()
        .eq("user_id", submission.user_id)
        .eq("subtask_id", submission.subtask_id);
    }
    setSaving(false);
    toast.success(status === "approved" ? `Avaliação aprovada (${score}%)` : `Avaliação reprovada (${score}%)`);
    onReviewed();
  }

  return (
    <Dialog open={Boolean(submission)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-background sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Corrigir prova</DialogTitle>
          <DialogDescription>
            {submission?.full_name ?? "Atendente"} · {topicTitle} · {subtaskTitle}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : answers.length === 0 ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma resposta encontrada para esta prova.
          </Card>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer.id} className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm font-semibold">
                  {answer.question_index + 1}. {answer.question_text}
                </p>
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-background/70 p-3 text-sm leading-relaxed text-foreground/90">
                  {answer.answer_text}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className={
                      answer.is_correct === true
                        ? "rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        : "rounded-full border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    }
                    onClick={() => updateAnswer(answer.id, { is_correct: true })}
                  >
                    Está certa
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className={
                      answer.is_correct === false
                        ? "rounded-full bg-rose-600 hover:bg-rose-700 text-white border-0"
                        : "rounded-full border border-rose-500/60 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    }
                    onClick={() => updateAnswer(answer.id, { is_correct: false })}
                  >
                    Está errada
                  </Button>
                </div>
                <div className="mt-3">
                  <Label htmlFor={`answer-feedback-${answer.id}`} className="text-xs">
                    Feedback desta questão (opcional)
                  </Label>
                  <Textarea
                    id={`answer-feedback-${answer.id}`}
                    rows={2}
                    defaultValue={answer.feedback ?? ""}
                    onBlur={(event) => {
                      const value = event.target.value || null;
                      if (value !== (answer.feedback ?? null)) updateAnswer(answer.id, { feedback: value });
                    }}
                    className="mt-1 bg-background"
                  />
                </div>
              </div>
            ))}

            <div>
              <Label htmlFor="general-feedback" className="text-xs">
                Feedback geral (opcional)
              </Label>
              <Textarea
                id="general-feedback"
                rows={3}
                value={general}
                onChange={(event) => setGeneral(event.target.value)}
                className="mt-1 bg-background"
              />
            </div>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">
                {marked} de {answers.length} questões marcadas
              </span>
              <Button
                type="button"
                onClick={finalize}
                disabled={saving || answers.length === 0 || answers.some((a) => a.is_correct === null)}
              >
                {saving ? "Finalizando..." : "Finalizar avaliação"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
