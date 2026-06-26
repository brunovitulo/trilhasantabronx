import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Loader2, AlertCircle, RotateCcw, FileText, KeyRound, Download, MoreHorizontal, BookOpen, ShieldCheck } from "lucide-react";
import { generateProjectSnapshotForChatGPT } from "@/lib/projectSnapshot";
import { approvePermission, rejectPermission } from "@/lib/examPermission";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { TOPICS, findSubtask } from "@/data/topics";
import { computeTopicStatuses, type ProgressRow } from "@/lib/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubmissionHistoryDialog } from "@/components/SubmissionHistoryDialog";
import { CorrectionDialog, type CorrectionTarget } from "@/components/CorrectionDialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
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


type PermissionRequest = {
  id: string;
  subtask_id: string;
  created_at: string;
};

type AttendantRow = {
  id: string;
  full_name: string | null;
  progress: ProgressRow[];
  pending: PendingSubmission[];
  permissionRequests: PermissionRequest[];
};

function AdminPage() {
  const { user } = Route.useRouteContext();
  const [list, setList] = useState<AttendantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [correction, setCorrection] = useState<CorrectionTarget | null>(null);
  const [historyFor, setHistoryFor] = useState<{ id: string; name: string | null } | null>(null);

  async function refresh() {
    setLoading(true);
    const [{ data: profiles }, { data: progress }, { data: pendings }, { data: perms }] = await Promise.all([
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
      supabase
        .from("exam_permission_requests")
        .select("id, user_id, subtask_id, created_at")
        .eq("status", "pending")
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
      permissionRequests: (perms ?? [])
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exam_permission_requests" },
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
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel da gestora</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe o avanço de cada atendente e corrija as provas dissertativas pendentes diretamente no card delas.
            </p>
          </div>
          <ExportChatButton />
        </div>

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
              <AttendantCard
                key={att.id}
                att={att}
                reviewerId={user.id}
                onCorrect={setCorrection}
                onOpenHistory={() => setHistoryFor({ id: att.id, name: att.full_name })}
              />
            ))}
          </div>
        )}
        <CorrectionDialog
          submission={correction}
          reviewerId={user.id}
          onOpenChange={(open) => !open && setCorrection(null)}
          onReviewed={() => {
            setCorrection(null);
            refresh();
          }}
        />
        <SubmissionHistoryDialog
          open={historyFor !== null}
          onOpenChange={(o) => !o && setHistoryFor(null)}
          userId={historyFor?.id ?? null}
          userName={historyFor?.name ?? null}
          isAdmin
        />
      </main>
    </div>
  );
}

function ExportChatButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      // pequeno yield pra UI atualizar o spinner antes do trabalho pesado
      await new Promise((r) => setTimeout(r, 10));
      const result = generateProjectSnapshotForChatGPT();
      if (result.fileCount === 0) {
        toast.error("Não foi possível gerar o snapshot", {
          description: "Nenhum arquivo foi encontrado para exportação.",
        });
        return;
      }
      const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}`;
      a.href = url;
      a.download = `projeto-santabronx-snapshot-${stamp}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Snapshot baixado", {
        description: `${result.fileCount} arquivos · ${result.sizeKb} KB`,
      });
    } catch (err) {
      toast.error("Não consegui exportar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-3 max-w-xs">
      <Button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="w-full rounded-full bg-[var(--success)] hover:bg-[var(--success)]/90 text-[oklch(0.18_0.02_180)] font-semibold gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Baixar snapshot para ChatGPT
      </Button>
      <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
        Gera um arquivo atualizado com estrutura, configurações, módulos, provas, tarefas, conteúdos e lógica principal do app.
      </p>
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

function AttendantCard({
  att,
  reviewerId,
  onCorrect,
  onOpenHistory,
}: {
  att: AttendantRow;
  reviewerId: string;
  onCorrect: (submission: CorrectionTarget) => void;
  onOpenHistory: () => void;
}) {
  const statuses = useMemo(() => computeTopicStatuses(TOPICS, att.progress), [att.progress]);
  const totalTopics = TOPICS.length;
  const doneTopics = TOPICS.filter((t) => statuses[t.id] === "completed").length;
  const totalSubtasks = TOPICS.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSet = useMemo(
    () => new Set(att.progress.filter((p) => p.completed).map((p) => p.subtask_id)),
    [att.progress],
  );
  const doneSubtasks = completedSet.size;
  const percent = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  // Etapa atual: primeiro tópico não concluído + primeira subtask aberta dentro dele
  const currentTopic =
    TOPICS.find((t) => statuses[t.id] === "in_progress") ??
    TOPICS.find((t) => statuses[t.id] === "available") ??
    TOPICS.find((t) => statuses[t.id] !== "completed" && statuses[t.id] !== "empty") ??
    null;
  const currentSubtask = currentTopic
    ? currentTopic.subtasks.find((s) => !completedSet.has(s.id)) ?? null
    : null;
  const trilhaConcluida = !currentTopic;

  return (
    <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.18_295)] to-[oklch(0.45_0.19_295)] text-white font-bold text-sm shadow-[0_4px_12px_-4px_oklch(0.45_0.19_295/0.6)]">
            {initials(att.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight truncate">{att.full_name ?? "Sem nome"}</h3>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
              ID {att.id.slice(0, 8)}
            </p>
          </div>
          <Badge
            className={
              trilhaConcluida
                ? "bg-[oklch(0.78_0.13_180)]/15 text-[oklch(0.85_0.13_180)] border border-[oklch(0.78_0.13_180)]/30 hover:bg-[oklch(0.78_0.13_180)]/15"
                : "bg-[oklch(0.65_0.18_295)]/15 text-[oklch(0.82_0.12_295)] border border-[oklch(0.65_0.18_295)]/30 hover:bg-[oklch(0.65_0.18_295)]/15"
            }
          >
            {trilhaConcluida ? "Concluída" : "Em andamento"}
          </Badge>
        </div>

        {/* Progresso geral */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Progresso geral
              </p>
              <p className="text-2xl font-bold tabular-nums leading-none mt-1">
                {percent}<span className="text-base text-muted-foreground">%</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Tópicos
              </p>
              <p className="text-sm font-semibold mt-1 tabular-nums">
                {doneTopics}<span className="text-muted-foreground">/{totalTopics}</span>
              </p>
            </div>
          </div>
          <Progress
            value={percent}
            className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[oklch(0.65_0.18_295)] [&>div]:to-[oklch(0.78_0.13_180)]"
          />
          <div className="flex items-start gap-2 pt-1">
            <BookOpen className="h-3.5 w-3.5 text-[oklch(0.78_0.13_180)] shrink-0 mt-0.5" />
            <p className="text-xs leading-snug text-foreground/80">
              {trilhaConcluida ? (
                <span className="text-foreground/70">Concluiu toda a trilha.</span>
              ) : (
                <>
                  <span className="text-muted-foreground">Etapa atual: </span>
                  <span className="font-medium text-foreground">{currentTopic!.title}</span>
                  {currentSubtask && (
                    <>
                      <span className="text-muted-foreground"> · próxima ação: </span>
                      <span className="text-foreground/90">{currentSubtask.title}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Pedidos de permissão para prova */}
        {att.permissionRequests.length > 0 && (
          <div className="space-y-2">
            {att.permissionRequests.map((p) => {
              const meta = findSubtask(p.subtask_id);
              const label = meta?.topic.title ?? "Prova";
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border-2 border-rose-400/60 bg-rose-500/15 p-3 animate-pulse-once shadow-[0_0_24px_-4px_rgba(244,63,94,0.5)]"
                >
                  <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 text-rose-200 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        🔔 {att.full_name ?? "Atendente"} pediu permissão
                      </p>
                      <p className="text-sm text-foreground/90">Prova: {label}</p>
                      <p className="text-xs text-foreground/70">
                        Solicitado em {new Date(p.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={async () => {
                        const { error } = await approvePermission(p.id, reviewerId);
                        if (error) {
                          toast.error("Não consegui liberar", { description: error.message });
                        } else {
                          toast.success(
                            `Prova liberada para ${att.full_name ?? "atendente"} — acompanhe em tempo real.`,
                          );
                        }
                      }}
                    >
                      Liberar prova
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={async () => {
                        const { error } = await rejectPermission(p.id, reviewerId);
                        if (error) toast.error("Erro", { description: error.message });
                        else toast("Pedido rejeitado");
                      }}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                    <p className="text-sm font-medium text-foreground">Prova: {label}</p>
                    <p className="text-xs text-foreground/70">
                      Pendente revisão · enviada em{" "}
                      {new Date(p.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full shrink-0"
                    onClick={() => onCorrect({ ...p, user_id: att.id, full_name: att.full_name })}
                  >
                    Corrigir
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé: ação principal discreta + menu de ações */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 border-white/15 bg-white/[0.04] hover:bg-white/[0.08]"
            onClick={onOpenHistory}
          >
            <FileText className="h-4 w-4" />
            Ver histórico
          </Button>
          <AttendantActionsMenu
            attendantId={att.id}
            attendantName={att.full_name}
            reviewerId={reviewerId}
            progress={att.progress}
          />
        </div>
      </div>
    </Card>
  );
}

function AttendantActionsMenu({
  attendantId,
  attendantName,
  reviewerId,
  progress,
}: {
  attendantId: string;
  attendantName: string | null;
  reviewerId: string;
  progress: ProgressRow[];
}) {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-foreground/80 hover:bg-white/[0.06]"
          >
            <MoreHorizontal className="h-4 w-4" />
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Ações administrativas
          </DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setUnlockOpen(true)} className="gap-2">
            <ShieldCheck className="h-4 w-4 text-[oklch(0.78_0.13_180)]" />
            Liberar todas as provas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setResetOpen(true)}
            className="gap-2 text-amber-300 focus:text-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar progresso
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UnlockAllExamsDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        attendantId={attendantId}
        attendantName={attendantName}
        reviewerId={reviewerId}
        progress={progress}
      />
      <ResetProgressDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        attendantId={attendantId}
        attendantName={attendantName}
      />
    </>
  );
}

function UnlockAllExamsDialog({
  open,
  onOpenChange,
  attendantId,
  attendantName,
  reviewerId,
  progress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendantId: string;
  attendantName: string | null;
  reviewerId: string;
  progress: ProgressRow[];
}) {
  const [working, setWorking] = useState(false);

  const pendingExamIds = useMemo(() => {
    const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.subtask_id));
    const ids: string[] = [];
    for (const t of TOPICS) {
      for (const s of t.subtasks) {
        if (s.kind === "open_evaluation" && !completedIds.has(s.id)) {
          ids.push(s.id);
        }
      }
    }
    return ids;
  }, [progress]);

  async function doUnlockAll() {
    setWorking(true);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();
    const rows = pendingExamIds.map((sid) => ({
      user_id: attendantId,
      subtask_id: sid,
      status: "approved" as const,
      decided_at: nowIso,
      decided_by: reviewerId,
      expires_at: expires,
    }));
    const { error } = await supabase.from("exam_permission_requests").insert(rows);
    setWorking(false);
    onOpenChange(false);
    if (error) {
      toast.error("Não consegui liberar todas", { description: error.message });
      return;
    }
    toast.success(
      `${pendingExamIds.length} prova(s) liberada(s) para ${attendantName ?? "atendente"}.`,
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Liberar todas as provas?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingExamIds.length === 0 ? (
              <>Não há provas pendentes de liberação para esta atendente.</>
            ) : (
              <>
                Isso vai liberar a permissão para que{" "}
                <strong>{attendantName ?? "esta atendente"}</strong> realize todas as{" "}
                <strong>{pendingExamIds.length}</strong> prova(s) pendente(s) de uma vez. Confirmar?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              doUnlockAll();
            }}
            disabled={working || pendingExamIds.length === 0}
            className="bg-[oklch(0.78_0.13_180)] text-[oklch(0.18_0.02_180)] hover:bg-[oklch(0.72_0.13_180)]"
          >
            {working ? "Liberando..." : "Sim, liberar todas"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ResetProgressDialog({
  open,
  onOpenChange,
  attendantId,
  attendantName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    const subtaskIds = selectedTopic.subtasks.map((s) => s.id);
    if (subtaskIds.length === 0) {
      setWorking(false);
      setConfirmOpen(false);
      return;
    }
    const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
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
      supabase
        .from("profiles")
        .update({
          progress_reset_at: new Date().toISOString(),
          onboarding_completed_at: null,
        })
        .eq("id", attendantId),
    ]);

    setWorking(false);
    setConfirmOpen(false);
    if (e1 || e2 || e3) {
      toast.error("Erro ao resetar", {
        description: (e1 ?? e2 ?? e3)?.message ?? "Tente novamente",
      });
      return;
    }
    toast.success(
      `Progresso de ${attendantName ?? "atendente"} zerado no tópico "${selectedTopic.title}"`,
    );
    setFromTopicId("");
    onOpenChange(false);
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <>
      <AlertDialog
        open={open && !confirmOpen}
        onOpenChange={(o) => {
          if (!o) {
            setFromTopicId("");
            onOpenChange(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-300" />
              Resetar progresso
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apaga o progresso de {attendantName ?? "esta atendente"} apenas no tópico escolhido.
              Os demais tópicos não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Select value={fromTopicId} onValueChange={setFromTopicId}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Escolha o tópico..." />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.order}. {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (fromTopicId) setConfirmOpen(true);
              }}
              disabled={!fromTopicId}
              className="bg-amber-500 text-amber-950 hover:bg-amber-400"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reset de progresso</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTopic ? (
                <>
                  Isso vai zerar o progresso de{" "}
                  <strong>{attendantName ?? "esta atendente"}</strong> apenas no tópico{" "}
                  <strong>
                    {selectedTopic.order}. {selectedTopic.title}
                  </strong>
                  . Os demais tópicos (anteriores e posteriores) não serão afetados. Confirmar?
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
    </>
  );
}
