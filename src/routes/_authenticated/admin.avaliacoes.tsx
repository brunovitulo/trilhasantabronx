import { createFileRoute, Link, redirect, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { findSubtask, PASSING_SCORE } from "@/data/topics";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/avaliacoes")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.user.id);
    if (!data?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Avaliações pendentes — Santa Bronx" }] }),
  component: AvaliacoesPage,
});

type Submission = {
  id: string;
  user_id: string;
  subtask_id: string;
  status: "pending_review" | "approved" | "rejected";
  score: number | null;
  general_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
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

function AvaliacoesPage() {
  const { user } = Route.useRouteContext();
  const [filter, setFilter] = useState<"pending_review" | "approved" | "rejected" | "all">("pending_review");
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    let q = supabase
      .from("open_evaluation_submissions")
      .select("id, user_id, subtask_id, status, score, general_feedback, created_at, reviewed_at")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const rows = (data ?? []) as Omit<Submission, "full_name">[];
    // join profile names
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    let nameMap: Record<string, string | null> = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      nameMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.full_name]));
    }
    setSubs(rows.map((r) => ({ ...r, full_name: nameMap[r.user_id] ?? null })));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Auto-expande a submissão indicada pelo hash da URL (ex: vindo do painel admin)
  const location = useLocation();
  useEffect(() => {
    const hash = location.hash?.replace(/^#/, "");
    if (!hash) return;
    if (subs.some((s) => s.id === hash)) {
      setExpandedId(hash);
      // Garante o filtro certo se a submissão não estiver no filtro atual
      setTimeout(() => {
        const el = document.getElementById(`sub-${hash}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (filter !== "all") {
      // Pode estar em outro filtro — tenta "all"
      setFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, subs]);

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Voltar ao painel
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Avaliações dissertativas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revise as respostas, marque cada pergunta como correta/incorreta e dê feedback.
        </p>

        <div className="mt-4 flex gap-2 flex-wrap">
          {(["pending_review", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="rounded-full"
            >
              {f === "pending_review"
                ? "Pendentes"
                : f === "approved"
                ? "Aprovadas"
                : f === "rejected"
                ? "Reprovadas"
                : "Todas"}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subs.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground">
            Nenhuma avaliação nesse filtro.
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {subs.map((s) => (
              <SubmissionRow
                key={s.id}
                submission={s}
                expanded={expandedId === s.id}
                onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                reviewerId={user.id}
                onReviewed={refresh}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function statusBadge(s: Submission["status"]) {
  if (s === "pending_review")
    return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border">Pendente</Badge>;
  if (s === "approved")
    return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border">Aprovada</Badge>;
  return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 border">Reprovada</Badge>;
}

function SubmissionRow({
  submission,
  expanded,
  onToggle,
  reviewerId,
  onReviewed,
}: {
  submission: Submission;
  expanded: boolean;
  onToggle: () => void;
  reviewerId: string;
  onReviewed: () => void;
}) {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [general, setGeneral] = useState(submission.general_feedback ?? "");
  const [saving, setSaving] = useState(false);
  const sub = findSubtask(submission.subtask_id);
  const topicTitle = sub?.topic.title ?? "Tópico";
  const subtaskTitle = sub?.subtask.title ?? submission.subtask_id;

  useEffect(() => {
    if (!expanded) return;
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
  }, [expanded, submission.id]);

  async function updateAnswer(id: string, patch: Partial<AnswerRow>) {
    setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    const { error } = await supabase.from("open_evaluation_answers").update(patch).eq("id", id);
    if (error) toast.error("Não consegui salvar", { description: error.message });
  }

  async function finalize() {
    const reviewed = answers.filter((a) => a.is_correct !== null);
    if (reviewed.length < answers.length) {
      toast.error(`Marque correta/incorreta em todas as ${answers.length} perguntas antes de finalizar`);
      return;
    }
    setSaving(true);
    const total = answers.length;
    const correct = answers.filter((a) => a.is_correct === true).length;
    const score = Math.round((correct / total) * 100);
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
    setSaving(false);
    if (error) {
      toast.error("Erro ao finalizar", { description: error.message });
      return;
    }
    toast.success(
      status === "approved" ? `Aprovada (${score}%)` : `Reprovada (${score}%) — atendente pode refazer`,
    );
    onReviewed();
  }

  async function saveFeedbackOnly() {
    setSaving(true);
    const { error } = await supabase
      .from("open_evaluation_submissions")
      .update({ general_feedback: general || null })
      .eq("id", submission.id);
    setSaving(false);
    if (error) toast.error("Erro", { description: error.message });
    else toast.success("Feedback salvo");
  }

  return (
    <Card id={`sub-${submission.id}`} className="p-4 scroll-mt-24">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h3 className="font-semibold">{submission.full_name ?? "Sem nome"}</h3>
          <p className="text-xs text-muted-foreground">
            {topicTitle} · {subtaskTitle}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enviada em {new Date(submission.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {submission.score != null && <Badge variant="outline">{Math.round(submission.score)}%</Badge>}
          {statusBadge(submission.status)}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 border-t pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {answers.map((a) => (
                <div key={a.id} className="rounded-2xl border bg-muted/30 p-3">
                  <p className="text-sm font-medium">
                    {a.question_index + 1}. {a.question_text}
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                    {a.answer_text}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={a.is_correct === true ? "default" : "outline"}
                      onClick={() => updateAnswer(a.id, { is_correct: true })}
                      className="rounded-full"
                    >
                      Correta
                    </Button>
                    <Button
                      size="sm"
                      variant={a.is_correct === false ? "destructive" : "outline"}
                      onClick={() => updateAnswer(a.id, { is_correct: false })}
                      className="rounded-full"
                    >
                      Incorreta
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor={`fb-${a.id}`} className="text-xs">
                      Feedback (opcional)
                    </Label>
                    <Textarea
                      id={`fb-${a.id}`}
                      rows={2}
                      defaultValue={a.feedback ?? ""}
                      onBlur={(e) =>
                        e.target.value !== (a.feedback ?? "") &&
                        updateAnswer(a.id, { feedback: e.target.value || null })
                      }
                      className="bg-background mt-1"
                    />
                  </div>
                </div>
              ))}

              <div>
                <Label htmlFor={`gen-${submission.id}`} className="text-xs">
                  Feedback geral (opcional)
                </Label>
                <Textarea
                  id={`gen-${submission.id}`}
                  rows={3}
                  value={general}
                  onChange={(e) => setGeneral(e.target.value)}
                  className="bg-background mt-1"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={saveFeedbackOnly} disabled={saving}>
                  Salvar feedback
                </Button>
                <Button size="sm" onClick={finalize} disabled={saving}>
                  {saving ? "Salvando..." : "Finalizar correção"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
