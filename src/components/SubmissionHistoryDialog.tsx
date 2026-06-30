import { useEffect, useMemo, useState } from "react";
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
  Brain,
  Sparkles,
  Lock,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findSubtask, TOPICS } from "@/data/topics";
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
import { ReviewActivitySection } from "@/components/ReviewActivitySection";
import { PRODUCT_REVISION_GROUPS } from "@/data/produtosRevisao";
import { M7_PRODUCTS } from "@/data/m7Products";

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

type ReviewCompletion = {
  id: string;
  review_key: string;
  review_date: string;
  score_correct: number;
  score_total: number;
  completed_at: string;
};

type Mastery = {
  group_id: string;
  subcategory_id: string;
  product_slug: string;
  mastered_at: string | null;
};

type TabId = "provas" | "exercicios" | "revisoes" | "flashcards";

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "provas", label: "Provas", icon: FileText },
  { id: "exercicios", label: "Exercícios", icon: ListChecks },
  { id: "revisoes", label: "Revisões", icon: Brain },
  { id: "flashcards", label: "Flashcards", icon: Sparkles },
];

// Subcategorias permitidas no flashcard (chaves usam underscore em M7_PRODUCTS).
const FLASHCARD_GROUPS: { id: "cosmeticos" | "vibradores"; title: string; subs: string[] }[] = [
  {
    id: "cosmeticos",
    title: "Grupo 1 · Excitantes + Lubrificantes",
    subs: ["excitantes", "lubrificante"],
  },
  {
    id: "vibradores",
    title: "Grupo 2 · Vibradores",
    subs: [
      "vibrador_rabbit",
      "sugador_de_clitoris",
      "vibrador_de_calcinha",
      "maquina_de_sexo",
      "vibrador_de_casal",
      "vibrador_de_aplicativo",
      "varinha_magica",
      "mini_vibrador",
    ],
  },
];

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function resolveReviewTitle(key: string): string {
  if (key.startsWith("produtos:")) {
    const gid = key.slice("produtos:".length);
    const g = PRODUCT_REVISION_GROUPS.find((x) => x.id === gid);
    return g ? `Módulo 7 · ${g.title}` : `Módulo 7 · ${gid}`;
  }
  const t = TOPICS.find((x) => x.id === key);
  return t?.title ?? key;
}

function moduleNumberFor(key: string): number {
  if (key.startsWith("produtos:")) return 7;
  const idx = TOPICS.findIndex((t) => t.id === key);
  return idx >= 0 ? idx + 1 : 99;
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
  const [reviews, setReviews] = useState<ReviewCompletion[]>([]);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [viewingPractice, setViewingPractice] = useState<PracticeAttempt | null>(null);
  const [tab, setTab] = useState<TabId>("provas");

  async function refresh() {
    if (!userId) return;
    setLoading(true);
    const [{ data: subData }, { data: pData }, { data: rData }, { data: mData }] =
      await Promise.all([
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
        supabase
          .from("daily_review_completions")
          .select("id, review_key, review_date, score_correct, score_total, completed_at")
          .eq("user_id", userId)
          .order("review_date", { ascending: false })
          .order("completed_at", { ascending: false }),
        supabase
          .from("product_flashcard_mastery")
          .select("group_id, subcategory_id, product_slug, mastered_at")
          .eq("user_id", userId),
      ]);
    setSubs((subData ?? []) as Submission[]);
    setPractice((pData ?? []) as unknown as PracticeAttempt[]);
    setReviews((rData ?? []) as ReviewCompletion[]);
    setMastery((mData ?? []) as Mastery[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!open) {
      setViewing(null);
      setViewingPractice(null);
      setTab("provas");
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const grouped = useMemo(
    () =>
      subs.reduce<Record<string, Submission[]>>((acc, s) => {
        (acc[s.subtask_id] ??= []).push(s);
        return acc;
      }, {}),
    [subs],
  );

  const groupedPractice = useMemo(
    () =>
      practice.reduce<Record<string, PracticeAttempt[]>>((acc, p) => {
        (acc[p.subtask_id] ??= []).push(p);
        return acc;
      }, {}),
    [practice],
  );

  // Revisões ordenadas por módulo asc e dentro de cada módulo do mais recente para o mais antigo.
  const reviewsByModule = useMemo(() => {
    const groups = new Map<number, ReviewCompletion[]>();
    for (const r of reviews) {
      const m = moduleNumberFor(r.review_key);
      const arr = groups.get(m) ?? [];
      arr.push(r);
      groups.set(m, arr);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [reviews]);

  // Flashcards: produtos por grupo, com status mastered/pendente. Grupo 2 bloqueia até grupo 1 dominado.
  const flashcardData = useMemo(() => {
    const masteryByGroup = new Map<string, Map<string, boolean>>();
    for (const m of mastery) {
      const inner = masteryByGroup.get(m.group_id) ?? new Map();
      if (m.mastered_at) inner.set(m.product_slug, true);
      masteryByGroup.set(m.group_id, inner);
    }
    const result = FLASHCARD_GROUPS.map((g) => {
      const products = M7_PRODUCTS.filter(
        (p) => p.groupId === g.id && g.subs.includes(p.subcategoryId),
      );
      const inner = masteryByGroup.get(g.id) ?? new Map();
      const items = products.map((p) => ({
        slug: p.productSlug,
        name: p.productName,
        subLabel: p.subcategoryLabel,
        mastered: inner.get(p.productSlug) === true,
      }));
      const masteredCount = items.filter((i) => i.mastered).length;
      return { ...g, items, masteredCount, total: items.length };
    });
    const g1Done = result[0].total > 0 && result[0].masteredCount >= result[0].total;
    return result.map((g, i) => ({ ...g, locked: i > 0 && !g1Done }));
  }, [mastery]);

  const totalProvas = subs.length;
  const totalExercicios = practice.length;
  const totalRevisoes = reviews.length;
  const totalFlashcardsDominados = flashcardData.reduce((acc, g) => acc + g.masteredCount, 0);
  const totalFlashcards = flashcardData.reduce((acc, g) => acc + g.total, 0);
  const totalFlashcardsPendentes = totalFlashcards - totalFlashcardsDominados;

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

  const inDetail = !!viewing || !!viewingPractice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[88vh] overflow-hidden p-0 sm:max-w-3xl border-0 flex flex-col gap-0"
        style={{ background: "linear-gradient(165deg, #241f42, #15122a)" }}
      >
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
          {inDetail ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewing(null);
                  setViewingPractice(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-1 self-start"
              >
                <ChevronLeft className="h-3 w-3" /> Voltar ao histórico
              </button>
              <DialogTitle className="text-white">
                {viewingPractice ? "Detalhes do exercício de fixação" : "Detalhes da prova"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {findSubtask((viewing ?? viewingPractice!)!.subtask_id)?.topic.title ?? "Prova"}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-white">Histórico de provas e exercícios</DialogTitle>
              <DialogDescription className="text-white/60 flex flex-wrap items-center gap-2">
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

        {!inDetail && (
          <div className="px-5 pt-3 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 p-1 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      active
                        ? "bg-violet-400/90 text-violet-950"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-white/60" />
            </div>
          ) : viewing ? (
            <SubmissionDetail
              submission={viewing}
              isAdmin={!!isAdmin}
              onReleaseRetry={() => releaseRetry(viewing)}
            />
          ) : viewingPractice ? (
            <PracticeDetail attempt={viewingPractice} />
          ) : (
            <>
              {/* Metric cards per tab */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {tab === "provas" && (
                  <MetricCard label="Provas enviadas" value={totalProvas} icon={FileText} tone="emerald" />
                )}
                {tab === "exercicios" && (
                  <MetricCard
                    label="Exercícios respondidos"
                    value={totalExercicios}
                    icon={ListChecks}
                    tone="sky"
                  />
                )}
                {tab === "revisoes" && (
                  <MetricCard
                    label="Sessões de revisão"
                    value={totalRevisoes}
                    icon={Brain}
                    tone="violet"
                  />
                )}
                {tab === "flashcards" && (
                  <>
                    <MetricCard
                      label="Produtos dominados"
                      value={`${totalFlashcardsDominados}/${totalFlashcards}`}
                      icon={CheckCircle2}
                      tone="emerald"
                    />
                    <MetricCard
                      label="Pendentes"
                      value={totalFlashcardsPendentes}
                      icon={Sparkles}
                      tone="fuchsia"
                    />
                  </>
                )}
              </div>

              {tab === "provas" && (
                <ProvasTab grouped={grouped} onView={setViewing} />
              )}
              {tab === "exercicios" && (
                <ExerciciosTab grouped={groupedPractice} onView={setViewingPractice} />
              )}
              {tab === "revisoes" && <RevisoesTab byModule={reviewsByModule} />}
              {tab === "flashcards" && <FlashcardsTab groups={flashcardData} />}

              {/* Admin: detailed review activity (mantém o painel rico anterior) */}
              {tab === "revisoes" && isAdmin && userId && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <ReviewActivitySection userId={userId} />
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof FileText;
  tone: "emerald" | "sky" | "violet" | "fuchsia";
}) {
  const toneMap = {
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    fuchsia: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  } as const;
  return (
    <div
      className={`rounded-2xl border p-3 ${toneMap[tone]}`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProvasTab({
  grouped,
  onView,
}: {
  grouped: Record<string, Submission[]>;
  onView: (s: Submission) => void;
}) {
  if (Object.keys(grouped).length === 0) {
    return <EmptyState message="Nenhuma prova enviada ainda." />;
  }
  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([subtaskId, list]) => {
        const meta = findSubtask(subtaskId);
        const topicTitle = meta?.topic.title ?? "Prova";
        const sorted = [...list].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        return (
          <div key={subtaskId} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
              {topicTitle}
            </p>
            <div className="space-y-2">
              {sorted.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onView(s)}
                  className="group w-full text-left rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">Tentativa {idx + 1}</span>
                    {statusBadge(s.status)}
                    {s.score != null && (
                      <Badge variant="outline" className="font-mono border-white/20 text-white">
                        {Math.round(s.score)}%
                      </Badge>
                    )}
                    {s.retry_allowed && s.status === "rejected" && (
                      <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        Nova tentativa liberada
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
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
  );
}

function ExerciciosTab({
  grouped,
  onView,
}: {
  grouped: Record<string, PracticeAttempt[]>;
  onView: (p: PracticeAttempt) => void;
}) {
  if (Object.keys(grouped).length === 0) {
    return <EmptyState message="Nenhum exercício de fixação respondido ainda." />;
  }
  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([subtaskId, list]) => {
        const meta = findSubtask(subtaskId);
        const topicTitle = meta?.topic.title ?? "Exercício";
        const subtitle = meta?.subtask.title ?? "";
        const sorted = [...list].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        return (
          <div key={subtaskId} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
              {topicTitle}
              {subtitle ? <span className="text-white/40"> · {subtitle}</span> : null}
            </p>
            <div className="space-y-2">
              {sorted.map((p, idx) => {
                const pct = Math.round((p.correct_count / Math.max(p.total, 1)) * 100);
                const good = pct >= 70;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onView(p)}
                    className="group w-full text-left rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">Tentativa {idx + 1}</span>
                      <Badge
                        variant="outline"
                        className={`font-mono ${
                          good
                            ? "text-emerald-200 border-emerald-400/40"
                            : "text-amber-200 border-amber-400/40"
                        }`}
                      >
                        {p.correct_count}/{p.total} · {pct}%
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-white/50 inline-flex items-center gap-1">
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
  );
}

function RevisoesTab({ byModule }: { byModule: [number, ReviewCompletion[]][] }) {
  if (byModule.length === 0) {
    return <EmptyState message="Nenhuma sessão de revisão registrada ainda." />;
  }
  return (
    <div className="space-y-5">
      {byModule.map(([mod, list]) => {
        const sorted = [...list].sort((a, b) =>
          b.completed_at.localeCompare(a.completed_at),
        );
        return (
          <div key={mod} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
              Módulo {mod}
            </p>
            <div className="space-y-2">
              {sorted.map((r) => {
                const pct =
                  r.score_total > 0 ? Math.round((r.score_correct / r.score_total) * 100) : 0;
                const good = pct >= 70;
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3.5"
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">
                        {resolveReviewTitle(r.review_key)}
                      </span>
                      {r.score_total > 0 ? (
                        <Badge
                          variant="outline"
                          className={`font-mono ${
                            good
                              ? "text-emerald-200 border-emerald-400/40"
                              : "text-amber-200 border-amber-400/40"
                          }`}
                        >
                          {r.score_correct}/{r.score_total} · {pct}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-white/60 border-white/20">
                          sem quiz
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/50 inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {fmtDate(r.review_date)} · {new Date(r.completed_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlashcardsTab({
  groups,
}: {
  groups: {
    id: string;
    title: string;
    items: { slug: string; name: string; subLabel: string; mastered: boolean }[];
    masteredCount: number;
    total: number;
    locked: boolean;
  }[];
}) {
  if (groups.every((g) => g.total === 0)) {
    return <EmptyState message="Nenhum produto cadastrado para flashcards." />;
  }
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div
          key={g.id}
          className={`rounded-2xl border p-4 ${
            g.locked ? "border-white/10 bg-white/[0.03] opacity-80" : "border-white/10 bg-white/5"
          }`}
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-violet-200" />
            <p className="text-sm font-semibold text-white">{g.title}</p>
            <Badge variant="outline" className="ml-auto font-mono text-white/80 border-white/20">
              {g.masteredCount}/{g.total}
            </Badge>
          </div>
          {g.locked && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
              <Lock className="h-3.5 w-3.5" />
              Bloqueado até dominar todos os produtos do grupo anterior.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-1.5">
            {g.items.map((it) => (
              <div
                key={it.slug}
                className={`text-[11px] rounded-lg border px-2.5 py-1.5 flex items-center gap-2 ${
                  g.locked
                    ? "border-white/10 bg-white/[0.03] text-white/50"
                    : it.mastered
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                <span className="flex-1 truncate" title={it.name}>
                  {it.name}
                </span>
                {g.locked ? (
                  <Lock className="h-3 w-3 shrink-0" />
                ) : it.mastered ? (
                  <span className="inline-flex items-center gap-1 shrink-0 text-emerald-200 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    Dominado
                  </span>
                ) : (
                  <span className="shrink-0 text-amber-200 font-semibold">Pendente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-8 text-center text-sm text-white/60 border-white/10 bg-white/5">
      {message}
    </Card>
  );
}

function PracticeDetail({ attempt }: { attempt: PracticeAttempt }) {
  const meta = findSubtask(attempt.subtask_id);
  const sub = meta?.subtask;
  const questions = sub && sub.kind === "practice" ? sub.questions : [];
  const pct = Math.round((attempt.correct_count / Math.max(attempt.total, 1)) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap rounded-2xl border border-white/10 bg-white/5 p-3">
        <Badge variant="outline" className="font-mono border-white/20 text-white">
          {attempt.correct_count}/{attempt.total} corretas
        </Badge>
        <Badge className="bg-white/10 text-white border border-white/20 font-mono">{pct}%</Badge>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => {
          const chosen = attempt.answers[i];
          const isCorrect = chosen === q.correctIndex;
          return (
            <div
              key={i}
              className={`rounded-2xl border bg-white/5 p-4 ${
                isCorrect ? "border-emerald-400/30" : "border-rose-400/30"
              }`}
            >
              <p className="text-sm font-semibold text-white">
                {i + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isAnswer = oi === q.correctIndex;
                  const tone = isAnswer
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                    : isChosen
                    ? "border-rose-400/50 bg-rose-400/10 text-rose-100"
                    : "border-white/10 text-white/60";
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
                  isCorrect ? "text-emerald-200" : "text-rose-200"
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
      <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 border inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> Pendente
      </Badge>
    );
  if (s === "approved")
    return (
      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 border inline-flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Aprovada
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/20 text-rose-200 border-rose-400/30 border inline-flex items-center gap-1">
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-2 flex-wrap">
        {statusBadge(submission.status)}
        {submission.score != null && (
          <Badge variant="outline" className="font-mono border-white/20 text-white">
            {correctCount}/{answers.length} corretas — {Math.round(submission.score)}%
          </Badge>
        )}
      </div>

      {submission.general_feedback && (
        <div className="rounded-2xl border border-violet-400/30 bg-violet-400/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200 mb-1 inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Feedback da gestora
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
            {submission.general_feedback}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-white/60" />
        </div>
      ) : (
        <div className="space-y-3">
          {answers.map((a) => {
            const verdict = reviewed && a.is_correct != null;
            const correct = a.is_correct === true;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border bg-white/5 overflow-hidden ${
                  verdict
                    ? correct
                      ? "border-emerald-400/30"
                      : "border-rose-400/30"
                    : "border-white/10"
                }`}
              >
                <div className="bg-white/5 px-4 py-3 border-b border-white/10">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
                    Pergunta {a.question_index + 1}
                  </p>
                  <p className="text-sm font-semibold text-white">{a.question_text}</p>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                    Resposta da atendente
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-white/90">
                    {a.answer_text || <span className="text-white/40">(sem resposta)</span>}
                  </p>
                </div>

                {(verdict || a.feedback) && (
                  <div className="px-4 py-3 border-t border-white/10 bg-black/20 space-y-2">
                    {verdict && (
                      <p
                        className={`text-xs font-semibold inline-flex items-center gap-1 ${
                          correct ? "text-emerald-200" : "text-rose-200"
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
                      <div className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200 mb-0.5 inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Comentário da gestora
                        </p>
                        <p className="text-xs leading-relaxed text-white/90">{a.feedback}</p>
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
        <p className="text-xs text-white/60 text-right">
          Nova tentativa já liberada — aguardando a atendente refazer.
        </p>
      )}
    </div>
  );
}
