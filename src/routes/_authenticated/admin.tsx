import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Loader2, AlertCircle, MapPin, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { TOPICS, findSubtask } from "@/data/topics";
import { computeTopicStatuses, type ProgressRow } from "@/lib/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.user.id);
    if (!data?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Admin — Santa Bronx Formação" }] }),
  component: AdminPage,
});

type PendingSubmission = {
  id: string;
  subtask_id: string;
  created_at: string;
};

type AttendantRow = {
  id: string;
  full_name: string | null;
  progress: ProgressRow[];
  pending: PendingSubmission[];
};

function AdminPage() {
  const [list, setList] = useState<AttendantRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [{ data: profiles }, { data: progress }, { data: pendings }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .order("created_at", { ascending: false }),
      supabase.from("subtask_progress").select("user_id, subtask_id, completed, score"),
      supabase
        .from("open_evaluation_submissions")
        .select("id, user_id, subtask_id, created_at")
        .eq("status", "pending_review")
        .order("created_at", { ascending: true }),
    ]);
    const grouped: AttendantRow[] = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      progress: (progress ?? [])
        .filter((r) => r.user_id === p.id)
        .map((r) => ({
          subtask_id: r.subtask_id,
          completed: r.completed,
          score: r.score,
        })),
      pending: (pendings ?? [])
        .filter((s) => s.user_id === p.id)
        .map((s) => ({ id: s.id, subtask_id: s.subtask_id, created_at: s.created_at })),
    }));
    setList(grouped);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("admin-pendings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "open_evaluation_submissions" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subtask_progress" },
        () => refresh(),
      )
      .subscribe();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Painel da gestora</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe o avanço de cada atendente e corrija as provas dissertativas pendentes diretamente no card delas.
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground border-white/10 bg-white/[0.06] backdrop-blur-xl">
            Nenhuma atendente cadastrada ainda.
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {list.map((att) => (
              <AttendantCard key={att.id} att={att} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "?";
}

function AttendantCard({ att }: { att: AttendantRow }) {
  const statuses = useMemo(() => computeTopicStatuses(TOPICS, att.progress), [att.progress]);
  const totalTopics = TOPICS.length;
  const doneTopics = TOPICS.filter((t) => statuses[t.id] === "completed").length;

  // "Está em": primeiro tópico não concluído (in_progress > available > locked)
  const current =
    TOPICS.find((t) => statuses[t.id] === "in_progress") ??
    TOPICS.find((t) => statuses[t.id] === "available") ??
    TOPICS.find((t) => statuses[t.id] !== "completed" && statuses[t.id] !== "empty") ??
    null;

  return (
    <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.18_295)] to-[oklch(0.45_0.19_295)] text-white font-bold text-sm">
            {initials(att.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight">{att.full_name ?? "Sem nome"}</h3>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {att.id.slice(0, 8)}
            </p>
          </div>
          <Badge className="bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)]/15">
            Ativa
          </Badge>
        </div>

        {/* Localização atual */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-snug">
            <span className="text-foreground/70">Está em: </span>
            <span className="font-medium text-foreground">
              {current ? current.title : "Trilha concluída"}
            </span>
          </p>
        </div>

        {/* Barra segmentada de progresso */}
        <div>
          <div className="flex gap-1.5">
            {TOPICS.map((t) => {
              const s = statuses[t.id];
              const filled = s === "completed";
              const inProg = s === "in_progress";
              return (
                <div
                  key={t.id}
                  title={`${t.order}. ${t.title}`}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    filled
                      ? "bg-[var(--success)]"
                      : inProg
                      ? "bg-[var(--warning)]"
                      : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {doneTopics} de {totalTopics} tópicos concluídos
          </p>
        </div>

        {/* Avaliações pendentes inline */}
        {att.pending.length > 0 && (
          <div className="space-y-2">
            {att.pending.map((p) => {
              const meta = findSubtask(p.subtask_id);
              const label = meta?.topic.title ?? "Prova";
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3"
                >
                  <AlertCircle className="h-5 w-5 text-amber-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Prova: {label}
                    </p>
                    <p className="text-xs text-foreground/70">
                      Pendente revisão · enviada em{" "}
                      {new Date(p.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button asChild size="sm" className="rounded-full shrink-0">
                    <Link to="/admin/avaliacoes" hash={p.id}>
                      Corrigir
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <ResetProgressBlock attendantId={att.id} attendantName={att.full_name} />
      </div>
    </Card>
  );
}

function ResetProgressBlock({
  attendantId,
  attendantName,
}: {
  attendantId: string;
  attendantName: string | null;
}) {
  const [fromTopicId, setFromTopicId] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);

  const selectedTopic = TOPICS.find((t) => t.id === fromTopicId) ?? null;

  async function doReset() {
    if (!selectedTopic) return;
    setWorking(true);
    const subtaskIds = TOPICS.filter((t) => t.order >= selectedTopic.order).flatMap((t) =>
      t.subtasks.map((s) => s.id),
    );
    if (subtaskIds.length === 0) {
      setWorking(false);
      setConfirmOpen(false);
      return;
    }
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase
        .from("subtask_progress")
        .delete()
        .eq("user_id", attendantId)
        .in("subtask_id", subtaskIds),
      supabase
        .from("open_evaluation_submissions")
        .delete()
        .eq("user_id", attendantId)
        .in("subtask_id", subtaskIds),
    ]);
    setWorking(false);
    setConfirmOpen(false);
    if (e1 || e2) {
      toast.error("Erro ao resetar", {
        description: (e1 ?? e2)?.message ?? "Tente novamente",
      });
      return;
    }
    toast.success(
      `Progresso de ${attendantName ?? "atendente"} zerado a partir de "${selectedTopic.title}"`,
    );
    setFromTopicId("");
    // Atualiza a UI do painel
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-foreground/70" />
        <p className="text-sm font-medium text-foreground/90">Resetar progresso</p>
      </div>
      <p className="text-xs text-foreground/60">
        Apaga o progresso desta atendente a partir do tópico escolhido (inclusive). Os tópicos anteriores não são afetados.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={fromTopicId} onValueChange={setFromTopicId}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="Escolha o tópico inicial..." />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.order}. {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fromTopicId && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => setConfirmOpen(true)}
          >
            Resetar a partir daqui
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reset de progresso</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTopic ? (
                <>
                  Isso vai zerar o progresso de{" "}
                  <strong>{attendantName ?? "esta atendente"}</strong> a partir do tópico{" "}
                  <strong>
                    {selectedTopic.order}. {selectedTopic.title}
                  </strong>{" "}
                  em diante. Os tópicos anteriores{" "}
                  {selectedTopic.order > 1
                    ? `(1 a ${selectedTopic.order - 1})`
                    : "(nenhum)"}{" "}
                  não serão afetados. Avaliações e notas a partir desse ponto também serão apagadas. Confirmar?
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                doReset();
              }}
              disabled={working}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {working ? "Resetando..." : "Sim, resetar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
