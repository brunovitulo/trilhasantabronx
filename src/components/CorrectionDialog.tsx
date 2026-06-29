import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, MessageSquare, User2 } from "lucide-react";
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
  // Quando reprovada, admin escolhe se atendente pode refazer só a prova ou todo o módulo.
  const [retryMode, setRetryMode] = useState<"direct" | "redo_module">("direct");

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
    const isRedoModule = status === "rejected" && retryMode === "redo_module";
    const { error } = await supabase
      .from("open_evaluation_submissions")
      .update({
        status,
        score,
        general_feedback: general || null,
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
        // Em reprovação, sempre liberamos retry no banco — o gate de "refazer só a
        // prova" vs "refazer o módulo todo" é controlado pelo retry_requires_module_redo.
        retry_allowed: status === "rejected",
        retry_requires_module_redo: isRedoModule,
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

      // Refazer o módulo inteiro: zera o progresso das demais subtarefas do mesmo tópico
      // (mantém apenas a prova já zerada acima) e marca a permissão atual como consumida,
      // forçando novo fluxo de pedido de permissão depois que ela refizer tudo.
      if (isRedoModule && sub) {
        const otherIds = sub.topic.subtasks
          .map((s) => s.id)
          .filter((id) => id !== submission.subtask_id);
        if (otherIds.length > 0) {
          await supabase
            .from("subtask_progress")
            .delete()
            .eq("user_id", submission.user_id)
            .in("subtask_id", otherIds);
        }
        await supabase
          .from("exam_permission_requests")
          .update({ status: "consumed" })
          .eq("user_id", submission.user_id)
          .eq("subtask_id", submission.subtask_id)
          .in("status", ["pending", "approved"]);
      }
    }
    setSaving(false);
    if (status === "approved") {
      toast.success(`Avaliação aprovada (${score}%)`);
    } else if (isRedoModule) {
      toast.success(`Avaliação reprovada (${score}%). Atendente precisa refazer o módulo inteiro.`);
    } else {
      toast.success(`Avaliação reprovada (${score}%). Atendente pode refazer a prova na sequência.`);
    }
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
          <div className="space-y-5">
            {answers.map((answer) => {
              const marked = answer.is_correct !== null;
              const correct = answer.is_correct === true;
              return (
                <div
                  key={answer.id}
                  className={`rounded-2xl border bg-card/30 overflow-hidden ${
                    marked
                      ? correct
                        ? "border-emerald-500/40"
                        : "border-rose-500/40"
                      : "border-border/60"
                  }`}
                >
                  {/* Pergunta */}
                  <div className="bg-muted/40 px-4 py-3 border-b border-border/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Pergunta {answer.question_index + 1}
                    </p>
                    <p className="text-sm font-semibold leading-snug">{answer.question_text}</p>
                  </div>

                  {/* Resposta da atendente */}
                  <div className="px-4 py-3 bg-background/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                      <User2 className="h-3 w-3" /> Resposta da atendente
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {answer.answer_text || (
                        <span className="text-muted-foreground italic">(sem resposta)</span>
                      )}
                    </p>
                  </div>

                  {/* Área de correção da gestora */}
                  <div className="px-4 py-3 border-t border-dashed border-border/60 bg-primary/5 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/90 inline-flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Sua correção
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className={
                          correct
                            ? "rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            : "rounded-full border border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }
                        onClick={() => updateAnswer(answer.id, { is_correct: true })}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Está certa
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
                        <XCircle className="h-4 w-4 mr-1" /> Está errada
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor={`answer-feedback-${answer.id}`} className="text-[11px] text-muted-foreground">
                        Comentário desta questão (opcional)
                      </Label>
                      <Textarea
                        id={`answer-feedback-${answer.id}`}
                        rows={2}
                        placeholder="Adicione uma observação para a atendente..."
                        defaultValue={answer.feedback ?? ""}
                        onBlur={(event) => {
                          const value = event.target.value || null;
                          if (value !== (answer.feedback ?? null)) updateAnswer(answer.id, { feedback: value });
                        }}
                        className="mt-1 bg-background"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Label htmlFor="general-feedback" className="text-[11px] font-semibold uppercase tracking-wider text-primary/90 inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Feedback geral da prova (opcional)
              </Label>
              <Textarea
                id="general-feedback"
                rows={3}
                placeholder="Mensagem geral para a atendente sobre essa prova..."
                value={general}
                onChange={(event) => setGeneral(event.target.value)}
                className="mt-2 bg-background"
              />
            </div>

            {(() => {
              const allMarked = answers.length > 0 && answers.every((a) => a.is_correct !== null);
              const correctCount = answers.filter((a) => a.is_correct === true).length;
              const previewScore = allMarked
                ? Math.round((correctCount / answers.length) * 100)
                : null;
              const wouldFail = previewScore != null && previewScore < PASSING_SCORE;
              if (!wouldFail) return null;
              return (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
                    Prévia: {previewScore}% — reprovada
                  </p>
                  <p className="text-xs text-foreground/80">
                    Como ficará a próxima tentativa da atendente?
                  </p>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 rounded-xl border p-3 cursor-pointer ${
                      retryMode === "direct" ? "border-primary/60 bg-primary/10" : "border-border/60 bg-background/40"
                    }`}>
                      <input
                        type="radio"
                        name="retry-mode"
                        className="mt-1"
                        checked={retryMode === "direct"}
                        onChange={() => setRetryMode("direct")}
                      />
                      <span className="text-xs leading-snug">
                        <span className="font-semibold text-foreground">Refazer só a prova</span>
                        <br />
                        <span className="text-muted-foreground">
                          Ao receber o resultado, ela já vê o botão "Refazer prova" e tenta de novo na sequência.
                        </span>
                      </span>
                    </label>
                    <label className={`flex items-start gap-2 rounded-xl border p-3 cursor-pointer ${
                      retryMode === "redo_module" ? "border-primary/60 bg-primary/10" : "border-border/60 bg-background/40"
                    }`}>
                      <input
                        type="radio"
                        name="retry-mode"
                        className="mt-1"
                        checked={retryMode === "redo_module"}
                        onChange={() => setRetryMode("redo_module")}
                      />
                      <span className="text-xs leading-snug">
                        <span className="font-semibold text-foreground">Refazer o módulo inteiro</span>
                        <br />
                        <span className="text-muted-foreground">
                          As demais tarefas do módulo voltam para "a fazer" e ela precisa pedir permissão de novo antes da nova prova.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              );
            })()}

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
