import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { deleteAttendant, setAttendantBanned } from "@/lib/adminUsers.functions";
import { Ban, Trash2, ShieldOff } from "lucide-react";

import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  RotateCcw,
  FileText,
  KeyRound,
  Download,
  MoreHorizontal,
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Lock,
  Star,
  Users as UsersIcon,
  Store,
  Package,
  ClipboardCheck,
  MessageCircleQuestion,
  TrendingUp,
  HeartPulse,
  Tag,
  Users,
  Boxes,
  Shield,
  Heart,
  Circle as CircleIcon,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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


import { ReviewPreviewPanel } from "@/components/ReviewPreviewPanel";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "open_evaluation_submissions" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "subtask_progress" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "exam_permission_requests" }, () => refresh())
      .subscribe();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((att) => {
      const stats = computeAttendantStats(att);
      if (statusFilter === "completed" && !stats.completed) return false;
      if (statusFilter === "in_progress" && stats.completed) return false;
      if (!q) return true;
      const name = (att.full_name ?? "").toLowerCase();
      const id = att.id.toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [list, query, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * perPage;
  const paged = filtered.slice(pageStart, pageStart + perPage);

  // Mantém o cartão expandido apenas se ele ainda estiver visível na página atual.
  // NÃO expande automaticamente nenhum atendente no carregamento — o admin
  // precisa clicar manualmente em quem quiser abrir.
  useEffect(() => {
    if (expandedId && !paged.some((a) => a.id === expandedId)) {
      setExpandedId(null);
    }
  }, [paged, expandedId]);

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>

        {/* Header: title + search + filter */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.62_0.2_295)]/30 to-[oklch(0.45_0.19_295)]/30 border border-[oklch(0.65_0.18_295)]/30">
              <UsersIcon className="h-6 w-6 text-[oklch(0.82_0.13_295)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Acompanhe o progresso e desempenho de cada atendente.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none sm:min-w-[420px] justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar usuário..."
                className="pl-9 h-10 rounded-xl border-white/10 bg-white/[0.04]"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] rounded-xl border-white/10 bg-white/[0.04] gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <ExportChatButton compact />
          </div>
        </div>

        {/* Painel de Ferramentas administrativas — visualmente separado da lista de atendentes. */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
                Ferramentas
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Visualização de revisões e bancos de conteúdo do Módulo 7 — todo o conteúdo já vem pré-populado.
              </p>
            </div>
          </div>
          <ReviewPreviewPanel />

        </section>

        <div className="mt-6 h-px bg-white/10" aria-hidden />


        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : paged.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground border-white/10 bg-white/[0.06] backdrop-blur-xl">
            Nenhuma atendente encontrada.
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {paged.map((att) =>
              expandedId === att.id ? (
                <AttendantExpandedCard
                  key={att.id}
                  att={att}
                  reviewerId={user.id}
                  onCollapse={() => setExpandedId(null)}
                  onCorrect={setCorrection}
                  onOpenHistory={() => setHistoryFor({ id: att.id, name: att.full_name })}
                />
              ) : (
                <AttendantCollapsedRow
                  key={att.id}
                  att={att}
                  onExpand={() => setExpandedId(att.id)}
                  onOpenHistory={() => setHistoryFor({ id: att.id, name: att.full_name })}
                />
              ),
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Mostrando {paged.length} de {filtered.length} usuários
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04]"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 2), Math.max(0, currentPage - 2) + 3)
                .map((n) => (
                  <Button
                    key={n}
                    size="icon"
                    variant={n === currentPage ? "default" : "ghost"}
                    className={
                      n === currentPage
                        ? "h-9 w-9 rounded-lg bg-[oklch(0.55_0.22_295)] hover:bg-[oklch(0.55_0.22_295)]/90 text-white"
                        : "h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04]"
                    }
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-white/10 bg-white/[0.04]"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span>Itens por página:</span>
              <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-9 w-[80px] rounded-lg border-white/10 bg-white/[0.04]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

function ExportChatButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
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

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleExport}
        disabled={loading}
        title="Baixar snapshot para ChatGPT"
        className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-3 max-w-xs">
      <Button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="w-full rounded-full bg-[var(--success)] hover:bg-[var(--success)]/90 text-[oklch(0.18_0.02_180)] font-semibold gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
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

function topicIcon(id: string): LucideIcon {
  switch (id) {
    case "apresentacao": return Store;
    case "embalar": return Package;
    case "vendas": return TrendingUp;
    case "objecoes": return Shield;
    case "dores": return Heart;
    case "responsabilidade": return ClipboardCheck;
    case "produtos": return Tag;
    case "presencial": return Users;
    case "organizacao": return Boxes;
    case "decoracao": return Tag;
    default: return CircleIcon;
  }
}

// Cor de avatar determinística por id
const AVATAR_GRADIENTS = [
  "from-[oklch(0.65_0.2_295)] to-[oklch(0.45_0.19_295)]", // roxo
  "from-[oklch(0.7_0.16_175)] to-[oklch(0.5_0.15_175)]", // verde água
  "from-[oklch(0.7_0.18_45)] to-[oklch(0.55_0.18_45)]", // laranja
  "from-[oklch(0.65_0.22_25)] to-[oklch(0.5_0.22_25)]", // vermelho
  "from-[oklch(0.65_0.18_220)] to-[oklch(0.5_0.18_220)]", // azul
  "from-[oklch(0.7_0.18_320)] to-[oklch(0.55_0.18_320)]", // rosa
];

function avatarGradient(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

type AttendantStats = {
  doneTopics: number;
  totalTopics: number;
  donePracticas: number;
  doneExams: number;
  totalExams: number;
  examAverage: number | null;
  percent: number;
  currentTopic: ReturnType<typeof TOPICS.find>;
  currentSubtask: { id: string; title: string } | null;
  completed: boolean;
  statuses: ReturnType<typeof computeTopicStatuses>;
};

function computeAttendantStats(att: AttendantRow): AttendantStats {
  const statuses = computeTopicStatuses(TOPICS, att.progress);
  const totalTopics = TOPICS.length;
  const doneTopics = TOPICS.filter((t) => statuses[t.id] === "completed").length;
  const completedSet = new Set(
    att.progress.filter((p) => p.completed).map((p) => p.subtask_id),
  );
  const totalSubtasks = TOPICS.reduce((acc, t) => acc + t.subtasks.length, 0);
  const doneSub = completedSet.size;
  const percent = totalSubtasks > 0 ? Math.round((doneSub / totalSubtasks) * 100) : 0;

  // Provas
  const examIds: string[] = [];
  for (const t of TOPICS) for (const s of t.subtasks) if (s.kind === "open_evaluation") examIds.push(s.id);
  const examScores: number[] = [];
  let doneExams = 0;
  for (const id of examIds) {
    const row = att.progress.find((p) => p.subtask_id === id);
    if (row?.completed && (row.score ?? 0) >= 70) {
      doneExams += 1;
      if (row.score != null) examScores.push(row.score);
    }
  }
  const examAverage = examScores.length > 0
    ? examScores.reduce((a, b) => a + b, 0) / examScores.length
    : null;

  const currentTopic =
    TOPICS.find((t) => statuses[t.id] === "in_progress") ??
    TOPICS.find((t) => statuses[t.id] === "available") ??
    TOPICS.find((t) => statuses[t.id] !== "completed" && statuses[t.id] !== "empty") ??
    null;
  const currentSubtask = currentTopic
    ? currentTopic.subtasks.find((s) => !completedSet.has(s.id)) ?? null
    : null;

  return {
    doneTopics,
    totalTopics,
    donePracticas: doneSub,
    doneExams,
    totalExams: examIds.length,
    examAverage,
    percent,
    currentTopic: currentTopic ?? undefined,
    currentSubtask,
    completed: !currentTopic,
    statuses,
  };
}

function StatusBadge({ completed }: { completed: boolean }) {
  return (
    <Badge
      className={
        completed
          ? "bg-[oklch(0.7_0.16_175)]/15 text-[oklch(0.82_0.14_175)] border border-[oklch(0.7_0.16_175)]/30 hover:bg-[oklch(0.7_0.16_175)]/15 rounded-full font-medium gap-1.5"
          : "bg-[oklch(0.7_0.16_175)]/15 text-[oklch(0.82_0.14_175)] border border-[oklch(0.7_0.16_175)]/30 hover:bg-[oklch(0.7_0.16_175)]/15 rounded-full font-medium gap-1.5"
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.18_175)]" />
      Ativa
    </Badge>
  );
}

function AttendantCollapsedRow({
  att,
  onExpand,
  onOpenHistory,
}: {
  att: AttendantRow;
  onExpand: () => void;
  onOpenHistory: () => void;
}) {
  const s = useMemo(() => computeAttendantStats(att), [att]);
  return (
    <Card
      onClick={onExpand}
      className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.06] transition-colors"
    >
      <div className="grid grid-cols-12 items-center gap-3 p-3 sm:p-4">
        <div className="col-span-12 sm:col-span-3 flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(att.id)} text-white font-bold text-xs`}>
            {initials(att.full_name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate text-sm">{att.full_name ?? "Sem nome"}</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{att.id.slice(0, 8)}</p>
          </div>
          <StatusBadge completed={s.completed} />
        </div>

        <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
          <p className="text-[11px] text-muted-foreground">Tópicos concluídos</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
              <span className="text-[oklch(0.82_0.14_175)]">{s.doneTopics}</span>
              <span className="text-muted-foreground"> de {s.totalTopics}</span>
            </span>
            <Progress
              value={s.percent}
              className="h-1.5 flex-1 bg-white/10 [&>div]:bg-[oklch(0.78_0.13_175)]"
            />
            <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{s.percent}%</span>
          </div>
        </div>

        <div className="col-span-6 sm:col-span-2">
          <p className="text-[11px] text-muted-foreground">Provas concluídas</p>
          <p className="text-sm font-semibold tabular-nums mt-1">
            <span className={s.doneExams === 0 ? "text-rose-300" : "text-[oklch(0.82_0.14_175)]"}>{s.doneExams}</span>
            <span className="text-muted-foreground"> de {s.totalExams}</span>
          </p>
        </div>

        <div className="col-span-6 sm:col-span-1">
          <p className="text-[11px] text-muted-foreground">Média geral</p>
          <p className="text-sm font-semibold mt-1 flex items-center gap-1">
            <Star className={`h-3.5 w-3.5 ${s.examAverage != null ? "text-amber-300 fill-amber-300" : "text-muted-foreground"}`} />
            {s.examAverage != null ? (s.examAverage / 10).toFixed(1).replace(".", ",") : "—"}
          </p>
        </div>

        <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full gap-1.5 border-white/15 bg-white/[0.04] hover:bg-white/[0.1] h-8"
            onClick={(e) => { e.stopPropagation(); onOpenHistory(); }}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ver histórico</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04]"
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            aria-label="Expandir"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AttendantExpandedCard({
  att,
  reviewerId,
  onCollapse,
  onCorrect,
  onOpenHistory,
}: {
  att: AttendantRow;
  reviewerId: string;
  onCollapse: () => void;
  onCorrect: (submission: CorrectionTarget) => void;
  onOpenHistory: () => void;
}) {
  const s = useMemo(() => computeAttendantStats(att), [att]);

  return (
    <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header: identidade + ações */}
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(att.id)} text-white font-bold text-sm shadow`}>
            {initials(att.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight truncate">{att.full_name ?? "Sem nome"}</h3>
              <StatusBadge completed={s.completed} />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{att.id.slice(0, 8)}</p>
          </div>
          <AttendantActionsMenu
            attendantId={att.id}
            attendantName={att.full_name}
            reviewerId={reviewerId}
            progress={att.progress}
            onOpenHistory={onOpenHistory}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.04]"
            onClick={onCollapse}
            aria-label="Recolher"
          >
            <ChevronDown className="h-4 w-4 rotate-180" />
          </Button>
        </div>

        {/* KPIs compactos */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Progresso</span>
            <span className="font-semibold tabular-nums">{s.percent}%</span>
            <Progress value={s.percent} className="h-1.5 w-24 bg-white/10 [&>div]:bg-[oklch(0.78_0.13_175)]" />
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">Tópicos</span>
            <span className="font-semibold tabular-nums">{s.doneTopics}/{s.totalTopics}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">Provas</span>
            <span className={`font-semibold tabular-nums ${s.doneExams === 0 ? "text-rose-300" : ""}`}>{s.doneExams}/{s.totalExams}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className={`h-3.5 w-3.5 ${s.examAverage != null ? "text-amber-300 fill-amber-300" : "text-muted-foreground"}`} />
            <span className="text-muted-foreground text-xs">Média</span>
            <span className="font-semibold tabular-nums">
              {s.examAverage != null ? (s.examAverage / 10).toFixed(1).replace(".", ",") : "—"}
            </span>
          </div>
        </div>

        {/* Etapa atual — uma linha discreta */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center gap-3">
          <MapPin className="h-4 w-4 text-[oklch(0.82_0.13_295)] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {s.currentTopic ? s.currentTopic.title : "Trilha concluída"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {s.currentTopic
                ? s.currentSubtask
                  ? `Próxima ação: ${s.currentSubtask.title}`
                  : "Aguardando avanço."
                : "Concluiu todos os tópicos."}
            </p>
          </div>
          {s.currentTopic && (
            <Link
              to="/topico/$topicId"
              params={{ topicId: s.currentTopic.id }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.55_0.22_295)]/20 hover:bg-[oklch(0.55_0.22_295)]/30 text-[oklch(0.82_0.13_295)] px-3 py-1.5 text-xs font-medium border border-[oklch(0.65_0.18_295)]/30 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Ir ao tópico
            </Link>
          )}
        </div>

        {/* Pedidos de permissão para prova */}
        {att.permissionRequests.length > 0 && (
          <div className="space-y-2">
            {att.permissionRequests.map((p) => {
              const meta = findSubtask(p.subtask_id);
              const label = meta?.topic.title ?? "Prova";
              return (
                <div key={p.id} className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-rose-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Pedido de permissão · {label}</p>
                      <p className="text-xs text-foreground/70">{new Date(p.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white h-8"
                      onClick={async () => {
                        const { error } = await approvePermission(p.id, reviewerId);
                        if (error) toast.error("Não consegui liberar", { description: error.message });
                        else toast.success(`Prova liberada para ${att.full_name ?? "atendente"}.`);
                      }}
                    >
                      Liberar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8"
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

        {/* Avaliações pendentes */}
        {att.pending.length > 0 && (
          <div className="space-y-2">
            {att.pending.map((p) => {
              const meta = findSubtask(p.subtask_id);
              const label = meta?.topic.title ?? "Prova";
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Prova: {label}</p>
                    <p className="text-xs text-foreground/70">
                      Enviada em {new Date(p.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full h-8 shrink-0"
                    onClick={() => onCorrect({ ...p, user_id: att.id, full_name: att.full_name })}
                  >
                    Corrigir
                  </Button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Card>
  );
}

function CircularProgress({ value }: { value: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative mt-1" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.3 0.02 285)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.65 0.18 295)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {value}%
      </div>
    </div>
  );
}

function UnlockAllExamsLauncher({
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full gap-1.5 border-white/15 bg-white/[0.04] hover:bg-white/[0.1]"
        onClick={() => setOpen(true)}
      >
        <Lock className="h-4 w-4" />
        Liberar todas as provas
      </Button>
      <UnlockAllExamsDialog
        open={open}
        onOpenChange={setOpen}
        attendantId={attendantId}
        attendantName={attendantName}
        reviewerId={reviewerId}
        progress={progress}
      />
    </>
  );
}

function AttendantActionsMenu({
  attendantId,
  attendantName,
  reviewerId,
  progress,
  onOpenHistory,
}: {
  attendantId: string;
  attendantName: string | null;
  reviewerId: string;
  progress: ProgressRow[];
  onOpenHistory?: () => void;
}) {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-foreground/80 hover:bg-white/[0.06] h-8"
          >
            <MoreHorizontal className="h-4 w-4" />
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Ações administrativas
          </DropdownMenuLabel>
          {onOpenHistory && (
            <DropdownMenuItem onSelect={() => onOpenHistory()} className="gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Ver histórico de provas
            </DropdownMenuItem>
          )}
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
          <DropdownMenuItem
            onSelect={() => setBanOpen(true)}
            className="gap-2 text-amber-300 focus:text-amber-200"
          >
            <Ban className="h-4 w-4" />
            Bloquear acesso
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setUnbanOpen(true)}
            className="gap-2"
          >
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
            Desbloquear acesso
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="gap-2 text-rose-300 focus:text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            Excluir usuário
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
      <BanAttendantDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        attendantId={attendantId}
        attendantName={attendantName}
        banned
      />
      <BanAttendantDialog
        open={unbanOpen}
        onOpenChange={setUnbanOpen}
        attendantId={attendantId}
        attendantName={attendantName}
        banned={false}
      />
      <DeleteAttendantDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        attendantId={attendantId}
        attendantName={attendantName}
      />
    </>
  );
}

function BanAttendantDialog({
  open,
  onOpenChange,
  attendantId,
  attendantName,
  banned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendantId: string;
  attendantName: string | null;
  banned: boolean;
}) {
  const [working, setWorking] = useState(false);
  const setBanned = useServerFn(setAttendantBanned);

  async function run() {
    setWorking(true);
    try {
      await setBanned({ data: { userId: attendantId, banned } });
      toast.success(
        banned
          ? `Acesso de ${attendantName ?? "atendente"} bloqueado.`
          : `Acesso de ${attendantName ?? "atendente"} liberado.`,
      );
      onOpenChange(false);
    } catch (err) {
      toast.error("Não consegui aplicar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setWorking(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {banned ? <Ban className="h-4 w-4 text-amber-300" /> : <ShieldOff className="h-4 w-4" />}
            {banned ? "Bloquear acesso?" : "Desbloquear acesso?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {banned ? (
              <>
                <strong>{attendantName ?? "Esta atendente"}</strong> não vai mais conseguir
                entrar na conta até ser desbloqueada. O progresso e os dados ficam preservados.
              </>
            ) : (
              <>
                Liberar o acesso de <strong>{attendantName ?? "esta atendente"}</strong> para
                voltar a entrar na conta normalmente.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              run();
            }}
            disabled={working}
            className={
              banned
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400"
                : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            }
          >
            {working ? "Aplicando..." : banned ? "Sim, bloquear" : "Sim, desbloquear"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteAttendantDialog({
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
  const [working, setWorking] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const removeUser = useServerFn(deleteAttendant);
  const expected = "EXCLUIR";

  async function run() {
    setWorking(true);
    try {
      await removeUser({ data: { userId: attendantId } });
      toast.success(`${attendantName ?? "Atendente"} foi excluída.`);
      onOpenChange(false);
      if (typeof window !== "undefined") window.location.reload();
    } catch (err) {
      toast.error("Não consegui excluir", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setWorking(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setConfirmText("");
        onOpenChange(o);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-300">
            <Trash2 className="h-4 w-4" />
            Excluir usuário?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação é permanente. <strong>{attendantName ?? "Esta atendente"}</strong> perde
            o acesso, o progresso, as provas enviadas e o histórico. Não dá pra desfazer.
            <br />
            <br />
            Digite <strong>{expected}</strong> para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expected}
            className="bg-white/5 border-white/10"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              run();
            }}
            disabled={working || confirmText !== expected}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {working ? "Excluindo..." : "Excluir definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
