import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, CheckCircle2, Circle, Copy, Loader2, Lock, X,
  Check, ChevronDown, Play, BookOpen, ListChecks, ClipboardCheck,
  FilePen, Download, History, MapPin, Hand, LayoutGrid, Globe, Package,
  ShieldCheck, Star, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { findTopic, type Subtask, type Topic, PASSING_SCORE } from "@/data/topics";
import { computeTopicStatuses, getSubtaskState, isTopicComplete, type ProgressRow } from "@/lib/progress";
import { TOPICS } from "@/data/topics";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";



import { toast } from "sonner";
import { ApostilaView } from "@/components/ApostilaView";

import { useExamPermission, requestPermission } from "@/lib/examPermission";

import apostilaEmbalarHtml from "@/content/embalar/apostila.html?raw";
import checklistEmbalarHtml from "@/content/embalar/checklist.html?raw";
import checklistOrganizacaoHtml from "@/content/organizacao/checklist.html?raw";
import apostilaResponsabilidadeHtml from "@/content/responsabilidade/apostila.html?raw";
import checklistResponsabilidadeHtml from "@/content/responsabilidade/checklist.html?raw";
import apostilaAppPedidosHtml from "@/content/responsabilidade/app-apostila.html?raw";
import checklistAppPedidosHtml from "@/content/responsabilidade/app-checklist.html?raw";
import apostilaVendasHtml from "@/content/vendas/apostila.html?raw";
import checklistVendasHtml from "@/content/vendas/checklist.html?raw";
import apostilaObjecoesHtml from "@/content/objecoes/apostila.html?raw";
import checklistObjecoesHtml from "@/content/objecoes/checklist.html?raw";
import apostilaDoresHtml from "@/content/dores/apostila.html?raw";
import checklistDoresHtml from "@/content/dores/checklist.html?raw";

// Apostilas do módulo 7 (Decorar Principais Produtos) — carregadas via glob.
const PRODUTOS_APOSTILAS = import.meta.glob("@/content/produtos/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const INLINE_HTML_SOURCES: Record<string, { title: string; html: string }> = {
  apostila: { title: "Apostila — Embalar e Despachar Pedidos", html: apostilaEmbalarHtml },
  checklist: { title: "Checklist de embalagem", html: checklistEmbalarHtml },
  organizacao: { title: "Checklist — Organização da loja", html: checklistOrganizacaoHtml },
  responsabilidade: { title: "Apostila — Primeira Responsabilidade", html: apostilaResponsabilidadeHtml },
  responsabilidade_checklist: { title: "Checklist — Responsabilidades Diárias", html: checklistResponsabilidadeHtml },
  app_apostila: { title: "Apostila — App de Pedidos", html: apostilaAppPedidosHtml },
  app_checklist: { title: "Checklist — App de Pedidos", html: checklistAppPedidosHtml },
  vendas_apostila: { title: "Apostila — Fundamentos de Vendas", html: apostilaVendasHtml },
  vendas_checklist: { title: "Checklist — Fundamentos de Vendas", html: checklistVendasHtml },
  objecoes_apostila: { title: "Apostila — Principais Objeções (Sex Shop)", html: apostilaObjecoesHtml },
  objecoes_checklist: { title: "Checklist — Principais Objeções (Sex Shop)", html: checklistObjecoesHtml },
  dores_apostila: { title: "Apostila — Principais Dores e Soluções", html: apostilaDoresHtml },
  dores_checklist: { title: "Checklist — Principais Dores e Soluções", html: checklistDoresHtml },
};

// Auto-register Decorar Principais Produtos apostilas as "produtos_<slug>" sources.
for (const [path, html] of Object.entries(PRODUTOS_APOSTILAS)) {
  const m = path.match(/apostila_(.+)\.html$/);
  if (!m) continue;
  const slug = m[1].replace(/-/g, "_");
  const pretty = m[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  INLINE_HTML_SOURCES[`produtos_${slug}`] = {
    title: `Apostila — ${pretty}`,
    html,
  };
}


export const Route = createFileRoute("/_authenticated/topico/$topicId")({
  head: ({ params }) => {
    const t = findTopic(params.topicId);
    return { meta: [{ title: t ? `${t.title} — Santa Bronx` : "Tópico" }] };
  },
  component: TopicPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Tópico não encontrado</h1>
        <Link to="/" className="text-primary underline mt-2 inline-block">Voltar à trilha</Link>
      </div>
    </div>
  ),
});

function TopicPage() {
  const { user } = Route.useRouteContext();
  const { topicId } = Route.useParams();
  const navigate = useNavigate();
  const topic = findTopic(topicId);
  if (!topic) throw notFound();

  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: prog }, { data: roles }] = await Promise.all([
        supabase
          .from("subtask_progress")
          .select("subtask_id, completed, score")
          .eq("user_id", user.id),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!active) return;
      setRows((prog ?? []) as ProgressRow[]);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user.id]);

  const statuses = useMemo(
    () => computeTopicStatuses(TOPICS, rows, { isAdmin }),
    [rows, isAdmin],
  );
  const accessLocked = !isAdmin && statuses[topic.id] === "locked";

  useEffect(() => {
    if (!loading && accessLocked) {
      toast.error("Conclua o tópico anterior para liberar este conteúdo.");
      navigate({ to: "/" });
    }
  }, [accessLocked, loading, navigate]);



  async function markCompleted(subtask: Subtask, score?: number) {
    const payload = {
      user_id: user.id,
      subtask_id: subtask.id,
      completed: true,
      score: score ?? null,
      completed_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("subtask_progress")
      .upsert(payload, { onConflict: "user_id,subtask_id" });
    if (error) {
      toast.error("Não consegui salvar", { description: error.message });
      return;
    }
    const nextRows = (() => {
      const others = rows.filter((r) => r.subtask_id !== subtask.id);
      return [...others, { subtask_id: subtask.id, completed: true, score: score ?? null }];
    })();
    setRows(nextRows);
    toast.success("Salvo!");
  }


  async function unmark(subtaskId: string) {
    const { error } = await supabase
      .from("subtask_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("subtask_id", subtaskId);
    if (error) {
      toast.error("Erro", { description: error.message });
      return;
    }
    setRows((prev) => prev.filter((r) => r.subtask_id !== subtaskId));
  }

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin={isAdmin} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>
        {(() => {
          const totalTopics = TOPICS.length;
          const tIdx = Math.max(0, TOPICS.findIndex((x) => x.id === topic.id));
          const t = totalTopics > 1 ? tIdx / (totalTopics - 1) : 0;
          const L = 0.74 - t * 0.32;
          const Ldark = Math.max(L - 0.10, 0.30);
          const gradient = `linear-gradient(135deg, oklch(${L.toFixed(3)} 0.18 295), oklch(${Ldark.toFixed(3)} 0.19 295))`;
          const totalSteps = topic.subtasks.length;
          const doneSteps = topic.subtasks.filter((s) => getSubtaskState(s.id, rows).completed).length;
          const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
          return (
            <>
              <div className="h-2 w-full rounded-full mb-4 bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "#14b8a6" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">
                {doneSteps} de {totalSteps} {totalSteps === 1 ? "passo concluído" : "passos concluídos"} · {pct}%
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-bold shadow-lg"
                  style={{ background: gradient }}
                >
                  {topic.order}
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
              </div>
            </>
          );
        })()}
        <p className="text-muted-foreground">{topic.summary}</p>

        




        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : topic.subtasks.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground rounded-3xl">
            Este tópico ainda está em construção. Em breve!
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {(() => {
              const groups = groupSubtasks(topic.subtasks);
              const groupCompleted = groups.map((g) =>
                g.items.every(({ subtask }) => {
                  const st = getSubtaskState(subtask.id, rows);
                  if (subtask.kind === "evaluation" || subtask.kind === "open_evaluation") {
                    const p =
                      (subtask as Extract<Subtask, { kind: "evaluation" | "open_evaluation" }>).passingScore ?? PASSING_SCORE;
                    return st.completed && (st.score ?? 0) >= p;
                  }
                  return st.completed;
                }),
              );
              let offset = 0;
              return groups.map((group, gIdx) => {
                const startIndex = offset;
                offset += group.items.length;
                const previousGroupComplete = gIdx === 0 || groupCompleted[gIdx - 1];
                return (
                  <SubtaskGroupCard
                    key={group.key}
                    group={group}
                    topic={topic}
                    rows={rows}
                    userId={user.id}
                    isAdmin={isAdmin}
                    startIndex={startIndex}
                    previousGroupComplete={previousGroupComplete}
                    onComplete={markCompleted}
                    onUncheck={unmark}
                  />
                );
              });
            })()}
          </div>

        )}
      </main>
    </div>
  );
}

type SubtaskGroupEntry = { subtask: Subtask; stepLabel: string };
type SubtaskGroup = {
  key: string;
  title: string;
  items: SubtaskGroupEntry[];
  titleFromDash: boolean;
};

function groupSubtasks(subtasks: Subtask[]): SubtaskGroup[] {
  const groups: SubtaskGroup[] = [];
  const indexByNum = new Map<string, number>();
  for (const sub of subtasks) {
    const m = sub.title.match(/^(\d+)\.\s+(.*)$/);
    const num = m ? m[1] : null;
    const rest = (m ? m[2] : sub.title).trim();
    const dashParts = rest.split(/\s+—\s+/);
    const hasDash = dashParts.length >= 2;
    const headerFromDash = hasDash
      ? `${num ? num + ". " : ""}${dashParts[0].trim()}`
      : null;
    const stepLabel = hasDash ? dashParts.slice(1).join(" — ").trim() : rest;

    let groupIdx = num != null ? indexByNum.get(num) : undefined;
    if (groupIdx === undefined) {
      groupIdx = groups.length;
      groups.push({
        key: num ?? `solo-${groups.length}`,
        title: headerFromDash ?? (num ? `${num}. ${rest}` : rest),
        titleFromDash: headerFromDash != null,
        items: [],
      });
      if (num != null) indexByNum.set(num, groupIdx);
    } else if (headerFromDash && !groups[groupIdx].titleFromDash) {
      groups[groupIdx].title = headerFromDash;
      groups[groupIdx].titleFromDash = true;
    }
    groups[groupIdx].items.push({ subtask: sub, stepLabel });
  }
  return groups;
}

function pickGroupIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("históri") || t.includes("histori")) return History;
  if (t.includes("onde fica") || t.includes("loja") || t.includes("mapa")) return MapPin;
  if (t.includes("familiar") || t.includes("produto")) return Hand;
  if (t.includes("organiza") || t.includes("padrão") || t.includes("padrao")) return LayoutGrid;
  if (t.includes("site") || t.includes("apresenta")) return Globe;
  if (t.includes("embalar") || t.includes("despach") || t.includes("99")) return Package;
  if (t.includes("antes da prova")) return ShieldCheck;
  if (t.includes("prova") || t.includes("avalia")) return FilePen;
  if (t.includes("exerc") || t.includes("prática") || t.includes("pratica")) return ClipboardCheck;
  if (t.includes("checklist")) return ListChecks;
  return Star;
}

function pickStepIcon(kind: Subtask["kind"], hasDownload?: boolean) {
  switch (kind) {
    case "video": return Play;
    case "reading":
    case "apostila":
    case "inline_html":
    case "dual_inline_html": return BookOpen;
    case "checklist":
    case "multi_checklist": return ListChecks;
    case "practice": return ClipboardCheck;
    case "evaluation":
    case "open_evaluation": return FilePen;
    case "external_html": return hasDownload ? Download : Globe;
    case "product_links": return Globe;
    case "credentials": return Lock;
    default: return BookOpen;
  }
}

function SubtaskGroupCard({
  group,
  topic,
  rows,
  userId,
  isAdmin,
  startIndex = 0,
  previousGroupComplete = true,
  onComplete,
  onUncheck,
}: {
  group: SubtaskGroup;
  topic: Topic;
  rows: ProgressRow[];
  userId: string;
  isAdmin: boolean;
  startIndex?: number;
  previousGroupComplete?: boolean;
  onComplete: (subtask: Subtask, score?: number) => void;
  onUncheck: (subtaskId: string) => void;
}) {
  const gateVideo = topic.subtasks.find((s) => /\.prova\.video$/.test(s.id));
  const gateExam = topic.subtasks.find((s) => /\.prova\.exam$/.test(s.id));
  const FINAL_GATE_IDS = new Set<string>(
    [gateVideo?.id, gateExam?.id].filter(Boolean) as string[],
  );
  const EXAM_ID = gateExam?.id ?? null;
  const GATE_VIDEO_ID = gateVideo?.id ?? null;
  const nonGateSubtasks = topic.subtasks.filter((s) => !FINAL_GATE_IDS.has(s.id));
  const gateUnlocked =
    nonGateSubtasks.length === 0 ||
    nonGateSubtasks.every((s) => getSubtaskState(s.id, rows).completed);
  const gateVideoCompleted = GATE_VIDEO_ID
    ? getSubtaskState(GATE_VIDEO_ID, rows).completed
    : true;

  const itemStates = group.items.map(({ subtask }) => {
    const st = getSubtaskState(subtask.id, rows);
    const isEvalLike = subtask.kind === "evaluation" || subtask.kind === "open_evaluation";
    const passing = isEvalLike
      ? (subtask as Extract<Subtask, { kind: "evaluation" | "open_evaluation" }>).passingScore ?? PASSING_SCORE
      : 0;
    const passed = !isEvalLike ? st.completed : st.completed && (st.score ?? 0) >= passing;
    return { state: st, passed };
  });

  const total = group.items.length;
  const doneCount = itemStates.filter((s) => s.passed).length;
  const allDone = doneCount === total;
  const pct = total > 0 ? (doneCount / total) * 100 : 0;
  const firstPendingIdx = itemStates.findIndex((s) => !s.passed);

  // All steps start collapsed by default. User expands manually.
  const [openId, setOpenId] = useState<string | null>(null);
  // Collapse a step automatically once it's marked complete.
  useEffect(() => {
    setOpenId((cur) => {
      if (cur == null) return cur;
      const curIdx = group.items.findIndex((it) => it.subtask.id === cur);
      if (curIdx >= 0 && itemStates[curIdx]?.passed) return null;
      return cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);
  void firstPendingIdx;

  const GroupIcon = pickGroupIcon(group.title);
  const isCardLocked = !isAdmin && !previousGroupComplete;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]",
        isCardLocked && "opacity-70",
      )}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10"
          style={{ color: isCardLocked ? "#94a3b8" : "#A78BFA" }}
        >
          {isCardLocked ? <Lock className="h-5 w-5" /> : <GroupIcon className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-base font-medium text-foreground leading-tight">
            {group.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount} de {total} {total === 1 ? "passo concluído" : "passos concluídos"}
          </p>
          <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #5DCAA5, #AFA9EC)",
              }}
            />
          </div>
        </div>
        <div className="mt-0.5 shrink-0">
          {isCardLocked ? (
            <Lock className="h-6 w-6 text-white/40" />
          ) : allDone ? (
            <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
          ) : (
            <Circle className="h-6 w-6 text-white/25" />
          )}
        </div>
      </div>

      {isCardLocked && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-white/50" />
          <p className="text-[12px] text-muted-foreground leading-snug">
            Conclua o tópico anterior para liberar esta etapa.
          </p>
        </div>
      )}

      <div className="border-t border-white/5 divide-y divide-white/5">

        {group.items.map((entry, idx) => {
          const sub = entry.subtask;
          const { state, passed } = itemStates[idx];
          const inFinalGate = FINAL_GATE_IDS.has(sub.id);
          const gateLocked = inFinalGate && !gateUnlocked && !isAdmin;
          const cardLocked = !isAdmin && !previousGroupComplete;
          const sequentialLocked =
            !isAdmin && idx > 0 && !itemStates[idx - 1].passed;
          const isLocked = gateLocked || cardLocked || sequentialLocked;
          const examNeedsVideo =
            sub.id === EXAM_ID && gateUnlocked && !gateVideoCompleted && !isAdmin;
          const useExamDialog = sub.id === EXAM_ID;
          const hasDownload = "downloadAs" in sub && !!(sub as { downloadAs?: string }).downloadAs;
          const StepIcon = pickStepIcon(sub.kind, hasDownload);
          const isOpen = openId === sub.id && !isLocked;
          const baseLabel = total > 1 ? entry.stepLabel : (entry.stepLabel || group.title);
          const label = baseLabel;
          const isEvalLike = sub.kind === "evaluation" || sub.kind === "open_evaluation";

          return (
            <div key={sub.id}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  setOpenId(isOpen ? null : sub.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left transition-colors",
                  isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-white/[0.03] cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    passed
                      ? "border-[var(--success)] bg-[var(--success)] text-white"
                      : "border-white/30 bg-transparent text-muted-foreground",
                  )}
                >
                  {passed ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : isLocked ? (
                    <Lock className="h-2.5 w-2.5" />
                  ) : null}
                </span>
                <StepIcon
                  className="h-4 w-4 shrink-0"
                  style={{ color: passed ? undefined : "#5eead4" }}
                />
                <span
                  className={cn(
                    "flex-1 text-sm leading-tight",
                    passed
                      ? "text-muted-foreground line-through"
                      : isLocked
                        ? "text-muted-foreground"
                        : "text-foreground",
                  )}
                >
                  {label}
                </span>
                {isEvalLike && (
                  <Badge className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/20 border border-pink-400/30">
                    Avaliação
                  </Badge>
                )}
                {state.completed && state.score != null && sub.kind === "evaluation" && (
                  <Badge variant={passed ? "default" : "destructive"}>{state.score}%</Badge>
                )}
                <span
                  className="shrink-0 lowercase tracking-wide"
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "2px 9px",
                    borderRadius: "20px",
                    background: "rgba(20, 184, 166, 0.18)",
                    border: "0.5px solid rgba(20, 184, 166, 0.6)",
                    color: "#5eead4",
                    opacity: passed ? 0.5 : 1,
                  }}
                >
                  passo {idx + 1}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                  {"description" in sub && sub.description && (
                    <p className="text-sm text-muted-foreground mb-3">{sub.description}</p>
                  )}
                  <SubtaskContent
                    subtask={sub}
                    userId={userId}
                    isAdmin={isAdmin}
                    displayTitle={label}
                    completed={state.completed}
                    score={state.score}
                    gateLocked={gateLocked}
                    examNeedsVideo={examNeedsVideo}
                    useExamDialog={useExamDialog}
                    onComplete={(score) => onComplete(sub, score)}
                    onUncheck={() => onUncheck(sub.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SubtaskContent({
  subtask,
  userId,
  isAdmin = false,
  displayTitle,
  completed,
  score,
  gateLocked = false,
  examNeedsVideo = false,
  useExamDialog = false,
  onComplete,
  onUncheck,
}: {
  subtask: Subtask;
  userId: string;
  isAdmin?: boolean;
  displayTitle: string;
  completed: boolean;
  score: number | null;
  gateLocked?: boolean;
  examNeedsVideo?: boolean;
  useExamDialog?: boolean;
  onComplete: (score?: number) => void;
  onUncheck: () => void;
}) {
  if (gateLocked) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-foreground/80">
        🔒 Conclua todos os passos acima para liberar.
      </div>
    );
  }
  const passing =
    subtask.kind === "evaluation"
      ? (subtask as Extract<Subtask, { kind: "evaluation" }>).passingScore ?? PASSING_SCORE
      : 0;

  switch (subtask.kind) {
    case "video":
      return <VideoSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "reading":
      return <ReadingSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "apostila":
      return <ApostilaSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "checklist":
      return <ChecklistSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "practice":
      return <PracticeSubtask subtask={subtask} userId={userId} completed={completed} onComplete={() => onComplete()} />;
    case "evaluation":
      return (
        <EvaluationSubtask
          subtask={subtask}
          completed={completed}
          score={score}
          passing={passing}
          onComplete={onComplete}
        />
      );
    case "external_html":
      return <ExternalHtmlSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "inline_html":
      return <InlineHtmlSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "dual_inline_html":
      return <DualInlineHtmlSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "credentials":
      return <CredentialsSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "multi_checklist":
      return <MultiChecklistSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "product_links":
      return <ProductLinksSubtask subtask={subtask} completed={completed} onComplete={() => onComplete()} onUncheck={onUncheck} />;
    case "open_evaluation":
      return useExamDialog ? (
        <ExamDialogLauncher
          subtask={subtask}
          userId={userId}
          isAdmin={isAdmin}
          completed={completed}
          blockTitle={displayTitle}
          needsVideo={examNeedsVideo}
          onSubmitted={() => {
            /* Nada: a prova só conta como concluída após o gestor aprovar (≥70%). */
          }}
        />
      ) : (
        <OpenEvaluationSubtask
          subtask={subtask}
          userId={userId}
          completed={completed}
          onSubmitted={() => {
            /* Nada: a prova só conta como concluída após o gestor aprovar (≥70%). */
          }}
        />
      );
    default:
      return null;
  }
}



function ExamDialogLauncher({
  subtask,
  userId,
  isAdmin = false,
  completed,
  blockTitle,
  needsVideo,
  onSubmitted,
}: {
  subtask: Extract<Subtask, { kind: "open_evaluation" }>;
  userId: string;
  isAdmin?: boolean;
  completed: boolean;
  blockTitle: string;
  needsVideo: boolean;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hasSubmission, setHasSubmission] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("open_evaluation_submissions")
        .select("id")
        .eq("user_id", userId)
        .eq("subtask_id", subtask.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (!active) return;
      setHasSubmission((data?.length ?? 0) > 0);
    })();
    const ch = supabase
      .channel(`oes-${userId}-${subtask.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "open_evaluation_submissions",
          filter: `user_id=eq.${userId}`,
        },
        () => setHasSubmission(true),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [userId, subtask.id]);

  // Se já foi enviada/corrigida, mostrar o status inline (sem dialog).
  if (completed || hasSubmission) {
    return (
      <OpenEvaluationSubtask
        subtask={subtask}
        userId={userId}
        completed={completed}
        onSubmitted={onSubmitted}
      />
    );
  }

  const { row: permRow, status: permStatus } = useExamPermission(userId, subtask.id);
  const [requesting, setRequesting] = useState(false);

  async function handleRequest() {
    setRequesting(true);
    const { error } = await requestPermission(userId, subtask.id);
    setRequesting(false);
    if (error) {
      toast.error("Não consegui enviar o pedido", { description: error.message });
      return;
    }
    toast.success("Pedido enviado ao gestor");
  }

  const canRequest =
    !needsVideo &&
    !isAdmin &&
    (permStatus === "none" ||
      permStatus === "expired" ||
      permStatus === "rejected" ||
      permStatus === "consumed");
  const isPending = !isAdmin && permStatus === "pending";
  const isApproved = !isAdmin && permStatus === "approved";
  const isRejected = permStatus === "rejected";
  const isExpired = permStatus === "expired";

  const expiresAt = permRow?.expires_at ? new Date(permRow.expires_at) : null;
  const minutesLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="space-y-2">
      {needsVideo && !isAdmin && (
        <p className="text-xs text-foreground/80">
          Assista o vídeo acima e marque como visto para liberar o botão de iniciar a prova.
        </p>
      )}

      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-emerald-400/50 bg-emerald-500/20 text-foreground hover:bg-emerald-500/30"
          onClick={() => setOpen(true)}
        >
          Realizar prova
        </Button>
      )}

      {canRequest && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={needsVideo || requesting}
            onClick={handleRequest}
          >
            {requesting ? "Enviando..." : "Solicitar permissão para realizar a prova"}
          </Button>
          {isRejected && (
            <p className="text-xs text-rose-300">
              O gestor ainda não está disponível para acompanhar. Tente novamente em alguns minutos.
            </p>
          )}
          {isExpired && (
            <p className="text-xs text-amber-300">
              A liberação anterior expirou. Solicite novamente para iniciar a prova.
            </p>
          )}
        </>
      )}

      {isPending && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-amber-400/40 bg-amber-500/15 text-amber-100"
            disabled
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Aguardando liberação do gestor...
          </Button>
          <p className="text-xs text-foreground/80">
            Seu pedido foi enviado. Aguarde o gestor liberar a prova — ele estará acompanhando você em tempo real.
          </p>
        </>
      )}

      {isApproved && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-emerald-400/50 bg-emerald-500/20 text-foreground hover:bg-emerald-500/30"
            onClick={() => setOpen(true)}
          >
            Realizar prova
          </Button>
          <p className="text-xs text-emerald-200">
            Liberação ativa — inicie em até {minutesLeft} min, senão será necessário solicitar de novo.
          </p>
        </>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (o) setOpen(true); /* impedimos fechar via overlay/esc */ }}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">{blockTitle.replace(/^Passo \d+:\s*/, "")}</DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 text-sm leading-relaxed text-foreground/90">
            <p className="font-semibold mb-1">⚠ Antes de começar:</p>
            <p>
              Esta prova será acompanhada pelo seu gestor em tempo real. Responda com suas
              próprias palavras, de forma completa, sem pesquisar em fontes externas. Ao
              finalizar, clique em enviar — você só avança para a próxima etapa com 70% de
              aproveitamento ou mais.
            </p>
          </div>
          <OpenEvaluationSubtask
            subtask={subtask}
            userId={userId}
            completed={completed}
            onSubmitted={() => {
              onSubmitted();
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}



function VideoSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "video" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyVideoLink() {
    try {
      await navigator.clipboard.writeText(subtask.url);
      setCopied(true);
      toast.success("Link copiado", { description: "Cole no navegador para abrir o vídeo." });
    } catch {
      setCopied(true);
      window.prompt("Copie este link e cole no navegador:", subtask.url);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs sm:text-sm text-muted-foreground break-all font-mono select-all">
        {subtask.url}
      </div>
      <p className="text-xs text-foreground/80">
        Copie o link, cole em outra aba, assista o destaque por completo.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline"
          type="button"
          size="sm"
          className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
          onClick={copyVideoLink}
        >
          <Copy className="h-4 w-4" /> {copied ? "Link copiado" : "Copiar link do vídeo"}
        </Button>

        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>Desmarcar</Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={!copied}
            title={!copied ? "Copie o link do vídeo primeiro" : undefined}
            className="rounded-full border-white/15 bg-transparent hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onComplete}
          >
            Já assisti
          </Button>
        )}
      </div>
    </div>
  );
}



function ReadingSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "reading" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-white/15 bg-transparent hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Fechar apostila" : "Abrir apostila"}
      </Button>
      {open && (
        <div className="mt-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
          {subtask.body}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>Desmarcar leitura</Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25" onClick={onComplete}>
            Marcar como lida
          </Button>
        )}
      </div>
    </div>
  );
}

function ApostilaSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "apostila" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-white/15 bg-transparent hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Fechar apostila" : "Abrir apostila"}
      </Button>
      {open && (
        <div className="mt-4">
          <ApostilaView
            title={subtask.title}
            intro={subtask.intro}
            sections={subtask.sections}
            extrasTitle={subtask.extrasTitle}
            extras={subtask.extras}
            faq={subtask.faq}
          />
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar leitura
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25" onClick={onComplete}>
            Marcar como lida
          </Button>
        )}
      </div>
    </div>
  );
}

function renderTextWithLinks(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    elements.push(
      <a
        key={key++}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

function ChecklistSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "checklist" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [checks, setChecks] = useState<boolean[]>(() =>
    subtask.items.map(() => completed),
  );
  // Sync com o estado persistido sempre que o `completed` carregar do banco
  useEffect(() => {
    setChecks(subtask.items.map(() => completed));
  }, [completed, subtask.id, subtask.items.length]);
  const allChecked = checks.every(Boolean);
  // Auto-completa o passo quando todos os itens estão marcados
  useEffect(() => {
    if (allChecked && !completed) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 mb-1">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" />
          <p className="text-sm text-foreground/80 leading-snug">
            Faça as ações do checklist uma por uma e marque cada item somente depois de concluir. Não marque tudo antes de fazer.
          </p>
        </div>
      </div>
      <ul className="space-y-1">
        {subtask.items.map((item, i) => {
          const c = checks[i];
          const toggle = () =>
            setChecks((prev) => prev.map((p, idx) => (idx === i ? !p : p)));
          return (
            <li key={i} className="flex items-start gap-3 py-1.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={c}
                onClick={toggle}
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  c
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : "border-white/30 bg-transparent hover:border-white/60",
                )}
              >
                {c && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <span
                onClick={toggle}
                className={cn(
                  "text-sm leading-snug cursor-pointer select-none",
                  c ? "text-muted-foreground line-through" : "text-foreground/90",
                )}
              >
                {renderTextWithLinks(item)}
              </span>
            </li>
          );
        })}
      </ul>
      {completed && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/15 bg-transparent"
            onClick={onUncheck}
          >
            Desmarcar
          </Button>
        </div>
      )}
    </div>
  );
}


function InlineHtmlSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "inline_html" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);
  const source = INLINE_HTML_SOURCES[subtask.source];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline"
          type="button"
          size="sm"
          className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
          onClick={() => {
            setNonce((n) => n + 1);
            setOpen(true);
          }}
        >
          {subtask.openLabel ?? "Abrir"}
        </Button>
      </div>
      {subtask.helperText && (
        <p className="text-xs text-muted-foreground leading-snug">{subtask.helperText}</p>
      )}
      <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id={`${subtask.id}-confirm`}
          checked={confirmed}
          disabled={completed}
          onCheckedChange={(v) => setConfirmed(!!v)}
        />
        <Label htmlFor={`${subtask.id}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
          {subtask.confirmLabel}
        </Label>
      </div>
      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25" disabled={!confirmed} onClick={onComplete}>
            Concluir passo
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{source?.title ?? subtask.title}</DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {source ? (
            <iframe
              key={nonce}
              srcDoc={source.html}
              title={source.title}
              className="flex-1 w-full border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Apostila não encontrada. Verifique se o arquivo foi enviado corretamente.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function DualInlineHtmlSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "dual_inline_html" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [openKey, setOpenKey] = useState<"first" | "second" | null>(null);
  const [nonce, setNonce] = useState(0);
  const [confirm1, setConfirm1] = useState(completed);
  const [confirm2, setConfirm2] = useState(completed);
  useEffect(() => {
    setConfirm1(completed);
    setConfirm2(completed);
  }, [completed]);

  const current =
    openKey === "first"
      ? INLINE_HTML_SOURCES[subtask.first.source]
      : openKey === "second"
        ? INLINE_HTML_SOURCES[subtask.second.source]
        : null;

  function renderBlock(
    cfg: { source: string; openLabel: string; confirmLabel: string; helperText?: string },
    key: "first" | "second",
    value: boolean,
    setValue: (v: boolean) => void,
  ) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          type="button"
          size="sm"
          className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
          onClick={() => {
            setNonce((n) => n + 1);
            setOpenKey(key);
          }}
        >
          {cfg.openLabel}
        </Button>
        {cfg.helperText && (
          <p className="text-xs text-muted-foreground leading-snug">{cfg.helperText}</p>
        )}
        <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
          <Checkbox
            id={`${subtask.id}-${key}-confirm`}
            checked={value}
            disabled={completed}
            onCheckedChange={(v) => setValue(!!v)}
          />
          <Label htmlFor={`${subtask.id}-${key}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
            {cfg.confirmLabel}
          </Label>
        </div>
      </div>
    );
  }

  const bothConfirmed = confirm1 && confirm2;

  return (
    <div className="space-y-4">
      {renderBlock(subtask.first, "first", confirm1, setConfirm1)}
      {renderBlock(subtask.second, "second", confirm2, setConfirm2)}
      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={!bothConfirmed}
            onClick={onComplete}
          >
            Concluir passo
          </Button>
        )}
      </div>
      <Dialog open={openKey !== null} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DialogContent className="p-0 w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{current?.title ?? ""}</DialogTitle>
            <button
              type="button"
              onClick={() => setOpenKey(null)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {current && (
            <iframe
              key={nonce}
              srcDoc={current.html}
              title={current.title}
              className="flex-1 w-full border-0 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function CredentialsSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "credentials" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [storeIdx, setStoreIdx] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);
  const store = storeIdx != null ? subtask.stores[storeIdx] : null;

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      window.prompt(`Copie ${label}:`, value);
    }
  }

  return (
    <div className="space-y-3">
      <a
        href={subtask.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-sm text-foreground hover:bg-primary/25"
      >
        <Globe className="h-4 w-4" /> {subtask.url}
      </a>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Selecione a sua loja para ver as credenciais:
        </p>
        <div className="flex flex-wrap gap-2">
          {subtask.stores.map((s, i) => (
            <Button
              key={s.name}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full",
                storeIdx === i
                  ? "border-primary bg-primary/25 text-foreground"
                  : "border-white/15 bg-transparent hover:bg-white/5",
              )}
              onClick={() => setStoreIdx(i)}
            >
              {s.name}
            </Button>
          ))}
        </div>
      </div>

      {store && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Usuário</p>
              <p className="text-sm font-mono break-all">{store.user}</p>
            </div>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => copy(store.user, "Usuário")}>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Senha</p>
              <p className="text-sm font-mono break-all">{store.pass}</p>
            </div>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => copy(store.pass, "Senha")}>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id={`${subtask.id}-confirm`}
          checked={confirmed}
          disabled={completed}
          onCheckedChange={(v) => setConfirmed(!!v)}
        />
        <Label htmlFor={`${subtask.id}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
          {subtask.confirmLabel}
        </Label>
      </div>
      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={!confirmed}
            onClick={onComplete}
          >
            Concluir passo
          </Button>
        )}
      </div>
    </div>
  );
}




function ExternalHtmlSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "external_html" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);
  const isDownload = !!subtask.downloadAs;
  const buttonLabel = subtask.openLabel ?? (isDownload ? "Baixar arquivo" : "Abrir");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25">
          {isDownload ? (
            <a href={subtask.url} download={subtask.downloadAs}>
              {buttonLabel}
            </a>
          ) : (
            <a href={subtask.url} target="_blank" rel="noopener noreferrer">
              {buttonLabel}
            </a>
          )}
        </Button>
      </div>
      <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id={`${subtask.id}-confirm`}
          checked={confirmed}
          disabled={completed}
          onCheckedChange={(v) => setConfirmed(!!v)}
        />
        <Label htmlFor={`${subtask.id}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
          {subtask.confirmLabel}
        </Label>
      </div>
      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25" disabled={!confirmed} onClick={onComplete}>
            Concluir passo
          </Button>
        )}
      </div>
    </div>
  );
}

function MultiChecklistSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "multi_checklist" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [checks, setChecks] = useState<boolean[][]>(() =>
    subtask.groups.map((g) => g.items.map(() => completed)),
  );
  useEffect(() => {
    setChecks(subtask.groups.map((g) => g.items.map(() => completed)));
  }, [completed, subtask.id]);
  const allDone = checks.every((g) => g.every(Boolean));
  useEffect(() => {
    if (allDone && !completed) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" />
          <p className="text-sm text-foreground/80 leading-snug">
            Faça as ações de cada grupo uma por uma e marque cada item somente depois de concluir.
          </p>
        </div>
      </div>
      {subtask.groups.map((group, gi) => {
        const done = checks[gi]?.every(Boolean);
        const infoLines = group.subtitle
          ? group.subtitle.split(/\s+·\s+/).map((line) => {
              const m = line.match(/^([^:]+):\s*(.*)$/);
              return m ? { label: m[1].trim(), value: m[2].trim() } : { label: null as string | null, value: line.trim() };
            })
          : [];
        return (
          <div
            key={gi}
            className={`rounded-2xl border p-4 ${
              done ? "border-[var(--success)]/40 bg-[var(--success)]/5" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <p className="text-base font-semibold leading-tight">{group.title}</p>
            {infoLines.length > 0 && (
              <div className="mt-2 space-y-1">
                {infoLines.map((line, li) => (
                  <p key={li} className="text-sm leading-snug text-foreground/90">
                    {line.label && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-1.5">
                        {line.label}:
                      </span>
                    )}
                    <span>{line.value}</span>
                  </p>
                ))}
              </div>
            )}
            <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
              {group.items.map((item, ii) => {
                const c = checks[gi]?.[ii] ?? false;
                const toggle = () =>
                  setChecks((prev) =>
                    prev.map((g, gIdx) =>
                      gIdx === gi ? g.map((cc, iIdx) => (iIdx === ii ? !cc : cc)) : g,
                    ),
                  );
                return (
                  <li key={ii} className="flex items-start gap-3 py-1.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={c}
                      onClick={toggle}
                      className={cn(
                        "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                        c
                          ? "border-[var(--success)] bg-[var(--success)] text-white"
                          : "border-white/30 bg-transparent hover:border-white/60",
                      )}
                    >
                      {c && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <span
                      onClick={toggle}
                      className={cn(
                        "text-xs leading-snug cursor-pointer select-none",
                        c ? "text-muted-foreground line-through" : "text-foreground/80",
                      )}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {completed && (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/15 bg-transparent"
            onClick={onUncheck}
          >
            Desmarcar
          </Button>
        </div>
      )}
    </div>
  );
}


function EvaluationSubtask({
  subtask,
  completed,
  score,
  passing,
  onComplete,
}: {
  subtask: Extract<Subtask, { kind: "evaluation" }>;
  completed: boolean;
  score: number | null;
  passing: number;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    subtask.questions.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const correct = answers.filter((a, i) => a === subtask.questions[i].correctIndex).length;
    const computed = Math.round((correct / subtask.questions.length) * 100);
    setSubmitted(true);
    onComplete(computed);
  }

  function retry() {
    setAnswers(subtask.questions.map(() => null));
    setSubmitted(false);
  }

  const passed = completed && (score ?? 0) >= passing;

  if (completed && passed && !submitted) {
    return (
      <div className="rounded-md border bg-[var(--success)]/10 text-sm p-3">
        Aprovada com {score}%. Bom trabalho!{" "}
        <button onClick={retry} className="underline">Refazer</button>
      </div>
    );
  }
  if (completed && !passed && !submitted) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 text-sm p-3">
        Você tirou {score}% e precisa de {passing}% para passar.{" "}
        <button onClick={retry} className="underline">Tentar de novo</button>
      </div>
    );
  }

  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="space-y-4">
      {subtask.questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border p-3">
          <p className="text-sm font-medium mb-2 text-[#5DCAA5]">
            {qi + 1}. {q.question}
          </p>
          <RadioGroup
            value={answers[qi]?.toString() ?? ""}
            onValueChange={(v) =>
              setAnswers((prev) => prev.map((a, i) => (i === qi ? Number(v) : a)))
            }
          >
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-start gap-2">
                <RadioGroupItem value={oi.toString()} id={`${subtask.id}-${qi}-${oi}`} />
                <Label htmlFor={`${subtask.id}-${qi}-${oi}`} className="text-sm font-normal leading-snug cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
      <Button onClick={submit} disabled={!allAnswered}>
        Enviar respostas
      </Button>
      <p className="text-xs text-foreground/80">Nota mínima: {passing}%.</p>
    </div>
  );
}

function PracticeSubtask({
  subtask,
  userId,
  completed,
  onComplete,
}: {
  subtask: Extract<Subtask, { kind: "practice" }>;
  userId: string;
  completed: boolean;
  onComplete: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    subtask.questions.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  function pick(qi: number, oi: number) {
    if (answers[qi] != null) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  async function finish() {
    const correct = answers.filter(
      (a, i) => a !== null && a === subtask.questions[i].correctIndex,
    ).length;
    // Persiste tentativa para a gestora ver no painel admin
    await supabase.from("practice_attempts").insert({
      user_id: userId,
      subtask_id: subtask.id,
      answers: answers as unknown as number[],
      correct_count: correct,
      total: subtask.questions.length,
    });

    if (!completed) onComplete();
    setSubmitted(true);
  }


  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === subtask.questions.length;
  const correctCount = answers.filter(
    (a, i) => a !== null && a === subtask.questions[i].correctIndex,
  ).length;

  if (completed && !submitted) {
    return (
      <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">Exercício de fixação finalizado ✓</p>
        <p className="text-foreground/80">
          Este exercício só pode ser respondido uma vez e já foi concluído. Avance para a avaliação final do tópico.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 text-sm leading-relaxed text-foreground/90">
          <p className="font-semibold mb-2">⚠️ Antes de iniciar, leia com atenção:</p>
          <ul className="list-disc pl-5 space-y-1 text-foreground/80">
            <li>Ao iniciar, todas as <strong className="text-foreground">{subtask.questions.length} perguntas</strong> vão aparecer.</li>
            <li>Você precisa <strong className="text-foreground">responder todas</strong> antes de finalizar.</li>
            <li>Cada pergunta só pode ser respondida <strong className="text-foreground">uma única vez</strong> — não dá para mudar a resposta depois.</li>
            <li>Depois de finalizar, o exercício <strong className="text-foreground">não pode ser refeito</strong>.</li>
            <li>Este exercício precisa estar completo antes da avaliação final.</li>
          </ul>
        </div>
        <Button variant="outline"
          size="sm"
          className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
          onClick={() => setStarted(true)}
        >
          Iniciar exercício de fixação
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subtask.questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-[15px] sm:text-base font-semibold text-[#5DCAA5] leading-snug mb-4">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2.5">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                const answered = chosen != null;
                const tone = !answered
                  ? "border-border/60 hover:bg-muted/60 text-foreground/80"
                  : isCorrect
                  ? "border-[var(--success)]/50 bg-[var(--success)]/10 text-foreground/90"
                  : isChosen
                  ? "border-destructive/50 bg-destructive/10 text-foreground/90"
                  : "border-border/40 opacity-60 text-foreground/70";
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={answered}
                    onClick={() => pick(qi, oi)}
                    className={`w-full text-left text-[13px] rounded-xl border px-3 py-2.5 transition-colors ${tone}`}
                  >
                    <span className="font-semibold mr-1">
                      {String.fromCharCode(97 + oi)})
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {chosen != null && (
              <p
                className={`mt-3 text-xs font-medium ${
                  chosen === q.correctIndex
                    ? "text-[var(--success)]"
                    : "text-destructive"
                }`}
              >
                {chosen === q.correctIndex
                  ? "✓ Correto"
                  : `✗ Resposta correta: ${String.fromCharCode(97 + q.correctIndex)}`}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-3 flex-wrap pt-1">
        <span className="text-xs text-muted-foreground">
          Respondidas: {answeredCount}/{subtask.questions.length}
        </span>
        {submitted ? (
          <Badge>
            {correctCount}/{subtask.questions.length} corretas — finalizado
          </Badge>
        ) : (
          <Button variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={!allAnswered}
            onClick={finish}
          >
            Finalizar exercício
          </Button>
        )}
      </div>
    </div>
  );
}


type OpenSubmission = {
  id: string;
  status: "pending_review" | "approved" | "rejected";
  score: number | null;
  general_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
  retry_allowed: boolean;
};

type OpenAnswerRow = {
  id: string;
  question_index: number;
  answer_text: string;
  is_correct: boolean | null;
  feedback: string | null;
};

function OpenEvaluationSubtask({
  subtask,
  userId,
  completed,
  onSubmitted,
  showTimer = false,
}: {
  subtask: Extract<Subtask, { kind: "open_evaluation" }>;
  userId: string;
  completed: boolean;
  onSubmitted: () => void;
  showTimer?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<OpenSubmission | null>(null);
  const [answerRows, setAnswerRows] = useState<OpenAnswerRow[]>([]);
  const [drafts, setDrafts] = useState<string[]>(() => subtask.questions.map(() => ""));
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const draftsRef = useRef(drafts);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);
  const submitRef = useRef<((force?: boolean) => Promise<void>) | null>(null);

  async function load() {
    setLoading(true);
    const { data: subs } = await supabase
      .from("open_evaluation_submissions")
      .select("id, status, score, general_feedback, created_at, reviewed_at, retry_allowed")
      .eq("user_id", userId)
      .eq("subtask_id", subtask.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const latest = (subs?.[0] as OpenSubmission | undefined) ?? null;
    setSubmission(latest);
    if (latest) {
      const { data: ans } = await supabase
        .from("open_evaluation_answers")
        .select("id, question_index, answer_text, is_correct, feedback")
        .eq("submission_id", latest.id)
        .order("question_index", { ascending: true });
      const rows = (ans ?? []) as OpenAnswerRow[];
      setAnswerRows(rows);
      setDrafts(
        subtask.questions.map(
          (_, i) => rows.find((r) => r.question_index === i)?.answer_text ?? "",
        ),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`oes-inline-${userId}-${subtask.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "open_evaluation_submissions",
          filter: `user_id=eq.${userId}`,
        },
        () => load(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "open_evaluation_answers",
        },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, subtask.id]);

  async function submit() {
    const missing = subtask.questions.some((q, i) => {
      const isMC = Array.isArray(q.options) && q.options.length > 0;
      return drafts[i].trim().length === 0 && !isMC ? true : isMC && drafts[i] === "" ? true : false;
    });
    if (missing) {
      toast.error(`Responda todas as ${subtask.questions.length} perguntas antes de enviar`);
      return;
    }
    setSending(true);
    const { data: sub, error: subErr } = await supabase
      .from("open_evaluation_submissions")
      .insert({
        user_id: userId,
        subtask_id: subtask.id,
        status: "pending_review",
      })
      .select()
      .single();
    if (subErr || !sub) {
      setSending(false);
      toast.error("Não consegui enviar", { description: subErr?.message });
      return;
    }
    const rows = subtask.questions.map((q, i) => {
      const isMC = Array.isArray(q.options) && q.options.length > 0;
      if (isMC) {
        const idx = parseInt(drafts[i], 10);
        const chosen = q.options![idx] ?? "";
        const correct = idx === q.correctIndex;
        return {
          submission_id: sub.id,
          question_index: i,
          question_text: q.question,
          answer_text: chosen,
          is_correct: correct,
          feedback: correct ? null : `Resposta correta: ${q.options![q.correctIndex ?? 0]}`,
        };
      }
      return {
        submission_id: sub.id,
        question_index: i,
        question_text: q.question,
        answer_text: drafts[i].trim(),
      };
    });
    const { error: ansErr } = await supabase
      .from("open_evaluation_answers")
      .insert(rows);
    if (ansErr) {
      setSending(false);
      toast.error("Erro ao salvar respostas", { description: ansErr.message });
      return;
    }
    // Não marca o passo como concluído aqui. A conclusão (e o desbloqueio do
    // próximo módulo) só acontece quando o gestor corrigir e aprovar (≥70%).
    onSubmitted();
    toast.success("Prova enviada. Aguarde a correção da gestora — o próximo módulo libera somente após aprovação.");
    await load();
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submission) {
    const mcRows = answerRows.filter((r) => {
      const q = subtask.questions[r.question_index];
      return q && Array.isArray(q.options) && q.options.length > 0;
    });
    const mcCorrect = mcRows.filter((r) => r.is_correct === true).length;
    const pendingOpens = answerRows.filter((r) => {
      const q = subtask.questions[r.question_index];
      return q && !(Array.isArray(q.options) && q.options.length > 0) && r.is_correct == null;
    }).length;

    const statusLabel =
      submission.status === "pending_review"
        ? "Pendente revisão"
        : submission.status === "approved"
        ? `Aprovada${submission.score != null ? ` — ${Math.round(submission.score)}%` : ""}`
        : `Reprovada — pode refazer${submission.score != null ? ` (${Math.round(submission.score)}%)` : ""}`;
    const statusTone =
      submission.status === "pending_review"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : submission.status === "approved"
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-rose-500/15 text-rose-400 border-rose-500/30";

    return (
      <div className="space-y-3">
        <div className={`rounded-2xl border px-3 py-2 text-sm font-medium ${statusTone}`}>
          Status: {statusLabel}
        </div>
        {mcRows.length > 0 && (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm">
            <span className="font-semibold text-teal-300">Objetivas:</span>{" "}
            {mcCorrect}/{mcRows.length} corretas
            {pendingOpens > 0 && (
              <>
                {" · "}
                <span className="text-amber-300">{pendingOpens} aberta(s) aguardando correção do gestor</span>
              </>
            )}
          </div>
        )}
        {submission.general_feedback && (
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Feedback da gestora
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{submission.general_feedback}</p>
          </div>
        )}
        <div className="space-y-2">
          {subtask.questions.map((q, i) => {
            const row = answerRows.find((r) => r.question_index === i);
            return (
              <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                <p className="text-sm font-medium text-[#5DCAA5]">
                  {i + 1}. {q.question}
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap text-foreground/90">
                  {row?.answer_text || <span className="text-muted-foreground">(sem resposta)</span>}
                </p>
                {row?.is_correct != null && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      row.is_correct ? "text-[var(--success)]" : "text-destructive"
                    }`}
                  >
                    {row.is_correct ? "✓ Correta" : "✗ Incorreta"}
                  </p>
                )}
                {row?.feedback && (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    Feedback: {row.feedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {submission.status === "rejected" && (
          <div className="pt-2 space-y-2">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm leading-relaxed text-rose-100">
              Você não atingiu a nota mínima de 70% nesta prova. Entre em contato com seu gestor
              para alinhar os próximos passos: quando você vai refazer a prova e quais foram os
              principais pontos de melhoria.
            </div>
            {submission.retry_allowed && (
              <Button variant="outline"
                size="sm"
                className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
                onClick={() => {
                  setSubmission(null);
                  setAnswerRows([]);
                  setDrafts(subtask.questions.map(() => ""));
                }}
              >
                Refazer avaliação
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground/80">
        Responda as objetivas (correção automática) e as abertas (correção do gestor). Ao enviar, o próximo tópico é liberado.
      </p>
      {subtask.questions.map((q, i) => {
        const isMC = Array.isArray(q.options) && q.options.length > 0;
        return (
          <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
            <label className="block text-sm font-medium mb-2 text-[#5DCAA5]">
              {i + 1}. {q.question}
            </label>
            {isMC ? (
              <RadioGroup
                value={drafts[i]}
                onValueChange={(v) =>
                  setDrafts((prev) => prev.map((d, idx) => (idx === i ? v : d)))
                }
                className="space-y-2"
              >
                {q.options!.map((opt, oi) => (
                  <div key={oi} className="flex items-start gap-2">
                    <RadioGroupItem value={oi.toString()} id={`${subtask.id}-${i}-${oi}`} className="mt-0.5" />
                    <Label htmlFor={`${subtask.id}-${i}-${oi}`} className="text-sm font-normal cursor-pointer leading-snug">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={drafts[i]}
                onChange={(e) =>
                  setDrafts((prev) => prev.map((d, idx) => (idx === i ? e.target.value : d)))
                }
                placeholder="Escreva sua resposta aqui..."
                rows={3}
                className="bg-background"
              />
            )}
          </div>
        );
      })}
      <Button variant="outline" onClick={submit} disabled={sending} className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25">
        {sending ? "Enviando..." : "Enviar prova"}
      </Button>
    </div>
  );
}

function ProductLinksSubtask({
  subtask,
  completed,
  onComplete,
  onUncheck,
}: {
  subtask: Extract<Subtask, { kind: "product_links" }>;
  completed: boolean;
  onComplete: () => void;
  onUncheck: () => void;
}) {
  const [confirmed, setConfirmed] = useState(completed);
  useEffect(() => setConfirmed(completed), [completed]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground/80">
        Abra cada link em uma aba nova e observe nome, imagem, descrição e preço atualizado.
        Esses são os produtos reais desta categoria no site da loja.
      </p>
      <div className="grid gap-2">
        {subtask.links.map((l, i) => (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm hover:bg-white/[0.07] transition-colors"
          >
            <Globe className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#5eead4" }} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground leading-snug">{l.label}</p>
              <p className="text-[11px] text-muted-foreground break-all mt-0.5">{l.url}</p>
            </div>
          </a>
        ))}
        {subtask.links.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum link cadastrado para esta categoria.</p>
        )}
      </div>
      <div className="flex items-start gap-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id={`${subtask.id}-confirm`}
          checked={confirmed}
          disabled={completed}
          onCheckedChange={(v) => setConfirmed(!!v)}
        />
        <Label htmlFor={`${subtask.id}-confirm`} className="text-sm font-normal cursor-pointer leading-snug">
          {subtask.confirmLabel}
        </Label>
      </div>
      <div className="flex flex-wrap gap-2">
        {completed ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onUncheck}>
            Desmarcar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25"
            disabled={!confirmed}
            onClick={onComplete}
          >
            Concluir passo
          </Button>
        )}
      </div>
    </div>
  );
}
