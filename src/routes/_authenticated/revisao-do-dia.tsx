import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  completeReviewItem,
  getTodayReview,
  type TodayReviewState,
} from "@/lib/dailyReview.functions";
import { getRevisionContent, type RevisionQuestion } from "@/data/revisao";
import {
  getProductRevisionGroup,
  type ProductRevisionItem,
} from "@/data/produtosRevisao";
import {
  MODULE_REVIEW_PLANS,
  sampleIndices,
  spDateKey,
  type ReviewQueueItem,
} from "@/lib/dailyReview";
import { TOPICS } from "@/data/topics";
import {
  PRODUCT_REVISION_GROUPS,
  type ProductRevisionGroupId,
} from "@/data/produtosRevisao";
import { useQuery } from "@tanstack/react-query";
import {
  getFlashcardSession,
  recordFlashcardResult,
  type FlashcardItem,
  type FlashcardSession,
} from "@/lib/flashcards.functions";

export const Route = createFileRoute("/_authenticated/revisao-do-dia")({
  head: () => ({ meta: [{ title: "Revisão do dia — Santa Bronx" }] }),
  validateSearch: (search: Record<string, unknown>): { preview?: string } => ({
    preview: typeof search.preview === "string" ? search.preview : undefined,
  }),
  component: RevisaoDoDiaPage,
});

/** Constrói um estado sintético para o modo "visualizar revisão" (admin),
 *  sem nenhuma gravação no banco. */
function buildPreviewState(preview: string): TodayReviewState | null {
  if (preview.startsWith("module:")) {
    const topicId = preview.slice("module:".length);
    const plan = MODULE_REVIEW_PLANS.find((p) => p.topicId === topicId);
    if (!plan) return null;
    const topic = TOPICS.find((t) => t.id === topicId);
    return {
      date: spDateKey(),
      completedKeysToday: [],
      queue: [
        {
          kind: "module",
          reviewKey: `preview:${topicId}`,
          topicId,
          title: topic?.title ?? topicId,
          hasApostila: plan.hasApostila,
          hasChecklist: plan.hasChecklist,
          quizCount: plan.quizCount,
          dayOffset: plan.dayOffsets[0] ?? 1,
          sessionIndex: 1,
          totalSessions: plan.dayOffsets.length,
          estimatedMinutes: plan.estimatedMinutes,
        },
      ],
    };
  }
  if (preview.startsWith("group:")) {
    const groupId = preview.slice("group:".length) as ProductRevisionGroupId;
    const grp = PRODUCT_REVISION_GROUPS.find((g) => g.id === groupId);
    if (!grp) return null;
    return {
      date: spDateKey(),
      completedKeysToday: [],
      queue: [
        {
          kind: "product-group",
          reviewKey: `preview:produtos:${groupId}`,
          groupId,
          title: grp.title,
          phase: 1,
          cycle: 1,
          sessionsDoneInCycle: 0,
          estimatedMinutes: "10-15",
        },
      ],
    };
  }
  return null;
}

// =============================================================================
// Estados por item de revisão
// =============================================================================

type ModulePhase = "apostila" | "checklist" | "quiz" | "done";

type ModuleItemState = {
  kind: "module";
  reread: boolean;
  checklist: boolean;
  phase: ModulePhase;
  quizIndex: number;
  /** Índices (no array original de perguntas) selecionados para esta sessão. */
  selected: number[];
  answers: (number | null)[];
};

type ProductPhase1Step = { kind: "card" | "quiz"; productIdx: number; quizIdx?: number };

type ProductItemState = {
  kind: "product-group";
  phase: 1 | 2 | 3;
  // Fase 1: percorre TODOS os produtos do grupo. Cada produto: card + 3 perguntas.
  // Fase 2/3: apenas perguntas, alguns produtos sorteados.
  selectedProducts: number[]; // índices na lista de produtos do grupo
  /** Para cada produto selecionado, lista de índices de pergunta usados (sempre 3). */
  selectedQuestionsPerProduct: number[][];
  stepIndex: number; // posição linear no fluxo
  steps: ProductPhase1Step[];
  answers: Record<string, number>; // chave "p<productIdx>:q<qIdx>" => optIdx
  finished: boolean;
};

type ItemState = ModuleItemState | ProductItemState;

// =============================================================================
// Init helpers
// =============================================================================

function initModuleState(item: Extract<ReviewQueueItem, { kind: "module" }>): ModuleItemState {
  const content = getRevisionContent(item.topicId);
  const total = content?.quiz.length ?? 0;
  const count = Math.min(item.quizCount, total);
  const seed = `${item.reviewKey}:${new Date().toISOString().slice(0, 10)}`;
  const selected = sampleIndices(total, count, seed);
  return {
    kind: "module",
    reread: false,
    checklist: false,
    phase: item.hasApostila ? "apostila" : item.hasChecklist ? "checklist" : "quiz",
    quizIndex: 0,
    selected,
    answers: Array(selected.length).fill(null),
  };
}

function initProductState(
  item: Extract<ReviewQueueItem, { kind: "product-group" }>,
): ProductItemState {
  const group = getProductRevisionGroup(item.groupId);
  if (!group) {
    return {
      kind: "product-group",
      phase: item.phase,
      selectedProducts: [],
      selectedQuestionsPerProduct: [],
      stepIndex: 0,
      steps: [],
      answers: {},
      finished: true,
    };
  }
  const seed = `${item.reviewKey}:${item.cycle}:${item.phase}:${item.sessionsDoneInCycle}:${new Date().toISOString().slice(0, 10)}`;
  const totalProducts = group.products.length;

  let selectedProducts: number[];
  if (item.phase === 1) {
    selectedProducts = Array.from({ length: totalProducts }, (_, i) => i);
  } else if (item.phase === 2) {
    selectedProducts = sampleIndices(totalProducts, 4, seed);
  } else {
    selectedProducts = sampleIndices(totalProducts, 3, seed + ":p3");
  }

  const selectedQuestionsPerProduct = selectedProducts.map((pIdx, i) => {
    const product = group.products[pIdx];
    return sampleIndices(product.questions.length, 3, `${seed}:p${pIdx}:${i}`);
  });

  // Monta a sequência linear de steps.
  const steps: ProductPhase1Step[] = [];
  selectedProducts.forEach((_pIdx, sIdx) => {
    if (item.phase === 1) {
      steps.push({ kind: "card", productIdx: sIdx });
    }
    const qIdxs = selectedQuestionsPerProduct[sIdx];
    qIdxs.forEach((_q, qPos) => {
      steps.push({ kind: "quiz", productIdx: sIdx, quizIdx: qPos });
    });
  });

  return {
    kind: "product-group",
    phase: item.phase,
    selectedProducts,
    selectedQuestionsPerProduct,
    stepIndex: 0,
    steps,
    answers: {},
    finished: false,
  };
}

// =============================================================================
// Página
// =============================================================================

function RevisaoDoDiaPage() {
  const navigate = useNavigate();
  const fetchToday = useServerFn(getTodayReview);
  const completeItem = useServerFn(completeReviewItem);

  const [state, setState] = useState<TodayReviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemIdx, setItemIdx] = useState(0);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [popup, setPopup] = useState<null | { title: string; html: string }>(null);
  const [saving, setSaving] = useState(false);
  const [finalScreen, setFinalScreen] = useState(false);
  const [phase3Result, setPhase3Result] = useState<null | {
    score: number;
    passed: boolean;
    groupTitle: string;
  }>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await fetchToday();
        if (!alive) return;
        setState(s);
        const init: Record<string, ItemState> = {};
        const doneMap: Record<string, boolean> = {};
        for (const it of s.queue) {
          if (s.completedKeysToday.includes(it.reviewKey)) {
            doneMap[it.reviewKey] = true;
            continue;
          }
          init[it.reviewKey] =
            it.kind === "module" ? initModuleState(it) : initProductState(it);
        }
        setItemStates(init);
        setCompleted(doneMap);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchToday]);

  const queue = state?.queue ?? [];
  const remaining = queue.filter((q) => !completed[q.reviewKey]);
  const current = remaining[itemIdx];

  function updateState(key: string, patch: Partial<ItemState>) {
    setItemStates((prev) => {
      const cur = prev[key];
      if (!cur) return prev;
      return { ...prev, [key]: { ...cur, ...patch } as ItemState };
    });
  }

  async function finishCurrentItem() {
    if (!current) return;
    const cur = itemStates[current.reviewKey];
    if (!cur) return;
    setSaving(true);
    try {
      let scoreCorrect = 0;
      let scoreTotal = 0;
      if (cur.kind === "module" && current.kind === "module") {
        const content = getRevisionContent(current.topicId);
        if (content) {
          cur.selected.forEach((qOriginalIdx, i) => {
            const expected = content.quiz[qOriginalIdx].correctIndex;
            scoreTotal++;
            if (cur.answers[i] === expected) scoreCorrect++;
          });
        }
      } else if (cur.kind === "product-group" && current.kind === "product-group") {
        const group = getProductRevisionGroup(current.groupId);
        if (group) {
          cur.selectedProducts.forEach((pIdx, sIdx) => {
            const product = group.products[pIdx];
            cur.selectedQuestionsPerProduct[sIdx].forEach((qIdx, qPos) => {
              const expected = product.questions[qIdx].correctIndex;
              const got = cur.answers[`p${sIdx}:q${qPos}`];
              scoreTotal++;
              if (got === expected) scoreCorrect++;
            });
          });
        }
      }

      await completeItem({
        data: {
          reviewKey: current.reviewKey,
          scoreCorrect,
          scoreTotal,
          groupId:
            current.kind === "product-group" ? current.groupId : undefined,
        },
      });

      // Fase 3 — mostra tela de resultado especial.
      if (
        current.kind === "product-group" &&
        current.phase === 3 &&
        scoreTotal > 0
      ) {
        const score = scoreCorrect / scoreTotal;
        setPhase3Result({
          score,
          passed: score >= 0.7,
          groupTitle: current.title,
        });
      }

      setCompleted((prev) => ({ ...prev, [current.reviewKey]: true }));
      // Avança para o próximo se houver, ou tela final
      const nextRemaining = remaining.filter(
        (q) => q.reviewKey !== current.reviewKey,
      );
      if (nextRemaining.length === 0) {
        setFinalScreen(true);
      } else {
        setItemIdx(0);
      }
    } catch (e) {
      toast.error("Erro ao salvar revisão", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------------------------------------------
  // Telas de borda
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!state || queue.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Card className="p-8 text-center">
          <Brain className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-bold">Nada para revisar hoje</h1>
          <p className="text-sm text-muted-foreground mt-2">
            A fila fica vazia quando você ainda não concluiu nenhum módulo ou
            quando todas as revisões previstas para hoje já foram feitas.
            Continue a sua trilha — assim que um módulo ou grupo for concluído,
            ele aparece aqui no dia seguinte.
          </p>
        </Card>
      </main>
    );
  }

  if (phase3Result) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-8 text-center">
          {phase3Result.passed ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          ) : (
            <Brain className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          )}
          <h1 className="text-xl font-bold">
            {phase3Result.passed
              ? `Grupo "${phase3Result.groupTitle}" concluído!`
              : `Quase lá no grupo "${phase3Result.groupTitle}"`}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Pontuação final: <b>{Math.round(phase3Result.score * 100)}%</b>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {phase3Result.passed
              ? "Esse grupo sai oficialmente da fila de revisão. Bom trabalho!"
              : "Como a pontuação ficou abaixo de 70%, o ciclo reinicia em 3 dias para reforço."}
          </p>
          <Button className="mt-6" onClick={() => setPhase3Result(null)}>
            Continuar
          </Button>
        </Card>
      </main>
    );
  }

  if (finalScreen || remaining.length === 0) {
    const allDoneTitles = queue
      .filter((q) => completed[q.reviewKey])
      .map((q) => q.title);
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-8 text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Revisão do dia concluída!</h1>
          {allDoneTitles.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Conteúdo revisado:{" "}
              <span className="font-semibold text-foreground">
                {allDoneTitles.join(", ")}
              </span>
              .
            </p>
          )}
          <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
            Voltar para a trilha
          </Button>
        </Card>
      </main>
    );
  }

  if (!current) return null;
  const curState = itemStates[current.reviewKey];

  // -----------------------------------------------------------------------
  // Header / navegação
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Sair
          </Link>
          <span className="text-xs text-muted-foreground">
            Item {itemIdx + 1} de {remaining.length}
          </span>
        </div>

        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Revisão do dia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Você faz as etapas até concluir cada item da fila.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {queue.map((q, idx) => {
            const isDone = !!completed[q.reviewKey];
            const isCur = q.reviewKey === current.reviewKey;
            return (
              <button
                key={q.reviewKey}
                onClick={() => {
                  const remIdx = remaining.findIndex(
                    (r) => r.reviewKey === q.reviewKey,
                  );
                  if (remIdx >= 0) setItemIdx(remIdx);
                }}
                disabled={isDone}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  isCur
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : isDone
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {isDone && <Check className="inline h-3 w-3 mr-1" />}
                {idx + 1}. {q.title}
              </button>
            );
          })}
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-1 gap-3 flex-wrap">
            <h2 className="text-lg font-bold">
              {current.kind === "product-group"
                ? `Revisão — ${current.title}`
                : current.title}
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~{current.estimatedMinutes} min
            </span>
          </div>

          {current.kind === "module" && (
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
              Sessão {current.sessionIndex} de {current.totalSessions} · D+
              {current.dayOffset}
            </p>
          )}
          {current.kind === "product-group" && (
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
              Fase {current.phase} · Ciclo {current.cycle}
            </p>
          )}

          {current.kind === "module" && curState && curState.kind === "module" && (
            <ModuleFlow
              item={current}
              state={curState}
              onOpenPopup={(t, h) => setPopup({ title: t, html: h })}
              onUpdate={(patch) => updateState(current.reviewKey, patch)}
              onFinish={finishCurrentItem}
              saving={saving}
            />
          )}

          {current.kind === "product-group" &&
            curState &&
            curState.kind === "product-group" && (
              <ProductGroupFlow
                item={current}
                state={curState}
                onUpdate={(patch) => updateState(current.reviewKey, patch)}
                onFinish={finishCurrentItem}
                saving={saving}
              />
            )}
        </Card>
      </main>

      <Dialog open={popup !== null} onOpenChange={(o) => !o && setPopup(null)}>
        <DialogContent className="p-0 w-[92vw] h-[90vh] max-w-[92vw] sm:max-w-[92vw] flex flex-col gap-0 [&>button]:hidden overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base">{popup?.title ?? ""}</DialogTitle>
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {popup && (
            <iframe
              srcDoc={popup.html}
              title={popup.title}
              className="flex-1 w-full border-0 bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================================================
// Fluxo MÓDULO (1 a 6)
// =============================================================================

function ModuleFlow({
  item,
  state: ms,
  onOpenPopup,
  onUpdate,
  onFinish,
  saving,
}: {
  item: Extract<ReviewQueueItem, { kind: "module" }>;
  state: ModuleItemState;
  onOpenPopup: (title: string, html: string) => void;
  onUpdate: (patch: Partial<ModuleItemState>) => void;
  onFinish: () => void;
  saving: boolean;
}) {
  const content = getRevisionContent(item.topicId);

  function answer(qIdx: number, optIdx: number) {
    if (ms.answers[qIdx] !== null) return;
    const next = [...ms.answers];
    next[qIdx] = optIdx;
    onUpdate({ answers: next });
  }

  function nextQuestion() {
    if (ms.quizIndex + 1 >= ms.selected.length) {
      onUpdate({ phase: "done" });
    } else {
      onUpdate({ quizIndex: ms.quizIndex + 1 });
    }
  }

  if (ms.phase === "apostila") {
    return (
      <div className="mt-4 space-y-4">
        <StepHeader n={1} title="Reler a apostila" />
        <p className="text-sm text-muted-foreground">
          Abra a apostila e releia rapidamente o conteúdo deste módulo.
        </p>
        <Button
          variant="outline"
          onClick={() =>
            content && onOpenPopup(`Apostila — ${content.title}`, content.apostilaHtml)
          }
          disabled={!content}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Abrir apostila
        </Button>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ms.reread}
            onCheckedChange={(v) => onUpdate({ reread: !!v })}
          />
          <span className="text-sm">Reli a apostila deste módulo.</span>
        </label>
        <div className="flex justify-end">
          <Button
            disabled={!ms.reread}
            onClick={() =>
              onUpdate({ phase: item.hasChecklist ? "checklist" : "quiz" })
            }
          >
            Próxima etapa
          </Button>
        </div>
      </div>
    );
  }

  if (ms.phase === "checklist") {
    return (
      <div className="mt-4 space-y-4">
        <StepHeader n={item.hasApostila ? 2 : 1} title="Marcar checklist de aprendizados" />
        <p className="text-sm text-muted-foreground">
          Abra o checklist e marque mentalmente os principais pontos.
        </p>
        <Button
          variant="outline"
          onClick={() =>
            content &&
            onOpenPopup(`Checklist — ${content.title}`, content.checklistHtml)
          }
          disabled={!content}
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Abrir checklist
        </Button>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ms.checklist}
            onCheckedChange={(v) => onUpdate({ checklist: !!v })}
          />
          <span className="text-sm">Marquei os principais pontos.</span>
        </label>
        <div className="flex justify-end">
          <Button disabled={!ms.checklist} onClick={() => onUpdate({ phase: "quiz" })}>
            Iniciar perguntas
          </Button>
        </div>
      </div>
    );
  }

  if (ms.phase === "quiz") {
    if (!content || ms.selected.length === 0) {
      return (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Quiz indisponível para este módulo. Concluir mesmo assim?
          </p>
          <div className="flex justify-end">
            <Button onClick={() => onUpdate({ phase: "done" })}>Concluir</Button>
          </div>
        </div>
      );
    }
    const q = content.quiz[ms.selected[ms.quizIndex]];
    const chosen = ms.answers[ms.quizIndex];
    return (
      <QuestionView
        n={ms.quizIndex + 1}
        total={ms.selected.length}
        step={item.hasApostila ? 3 : item.hasChecklist ? 2 : 1}
        question={q}
        chosen={chosen}
        onAnswer={(o) => answer(ms.quizIndex, o)}
        onNext={nextQuestion}
        isLast={ms.quizIndex === ms.selected.length - 1}
      />
    );
  }

  // done
  const correct = content
    ? ms.selected.reduce<number>(
        (acc, qOriginalIdx, i) =>
          acc +
          (ms.answers[i] !== null &&
          ms.answers[i] === content.quiz[qOriginalIdx].correctIndex
            ? 1
            : 0),
        0,
      )
    : 0;
  return (
    <div className="mt-4 text-center space-y-3">
      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
      <p className="text-base font-semibold">Etapa de revisão pronta!</p>
      <p className="text-sm text-muted-foreground">
        Pontuação:{" "}
        <span className="font-semibold text-foreground">
          {correct}/{ms.selected.length} corretas
        </span>
      </p>
      <Button
        onClick={onFinish}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Concluir este item
      </Button>
    </div>
  );
}

// =============================================================================
// Fluxo PRODUCT GROUP (Módulo 7) — flashcards
// =============================================================================




function ProductGroupFlow({
  item,
  onFinish,
  saving,
}: {
  item: Extract<ReviewQueueItem, { kind: "product-group" }>;
  state: ProductItemState;
  onUpdate: (patch: Partial<ProductItemState>) => void;
  onFinish: () => void;
  saving: boolean;
}) {
  const sessionFn = useServerFn(getFlashcardSession);
  const recordFn = useServerFn(recordFlashcardResult);

  const sessionQuery = useQuery<FlashcardSession>({
    queryKey: ["flashcard-session", item.groupId],
    queryFn: () => sessionFn({ data: { groupId: item.groupId } }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [cursor, setCursor] = useState(0);
  const [funcChoice, setFuncChoice] = useState<number | null>(null);
  const [priceChoice, setPriceChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ mastered: number; wrong: number }>({
    mastered: 0,
    wrong: 0,
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (sessionQuery.error) {
    return (
      <div className="mt-4 text-sm text-rose-600">
        Erro ao carregar a sessão: {(sessionQuery.error as Error).message}
      </div>
    );
  }
  const session = sessionQuery.data!;
  const items = session.items;

  if (items.length === 0) {
    return (
      <div className="mt-4 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
        <p className="text-base font-semibold">
          Todos os produtos deste grupo já foram dominados!
        </p>
        <p className="text-sm text-muted-foreground">
          Nada para revisar agora. Você pode fechar este item.
        </p>
        <Button
          onClick={onFinish}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Concluir este item
        </Button>
      </div>
    );
  }

  const current = items[cursor];
  const isDone = cursor >= items.length;

  if (isDone) {
    return (
      <div className="mt-4 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
        <p className="text-base font-semibold">Sessão de flashcards pronta!</p>
        <p className="text-sm text-muted-foreground">
          Dominados:{" "}
          <span className="font-semibold text-emerald-600">
            {results.mastered}
          </span>{" "}
          · Voltam amanhã:{" "}
          <span className="font-semibold text-rose-600">{results.wrong}</span>
        </p>
        <Button
          onClick={onFinish}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Concluir este item
        </Button>
      </div>
    );
  }

  async function confirm() {
    if (funcChoice === null || priceChoice === null || submitted) return;
    const both =
      funcChoice === current.functionalityCorrectIndex &&
      priceChoice === current.priceCorrectIndex;
    setSubmitted(true);
    try {
      await recordFn({
        data: {
          groupId: item.groupId,
          subcategoryId: current.subcategoryId,
          productSlug: current.productSlug,
          mastered: both,
        },
      });
      setResults((r) => ({
        mastered: r.mastered + (both ? 1 : 0),
        wrong: r.wrong + (both ? 0 : 1),
      }));
    } catch (e) {
      toast.error("Erro ao registrar resultado", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      });
    }
  }

  function nextCard() {
    setCursor((c) => c + 1);
    setFuncChoice(null);
    setPriceChoice(null);
    setSubmitted(false);
  }

  return (
    <Flashcard
      item={current}
      groupTitle={item.title}
      total={items.length}
      cursor={cursor}
      submitted={submitted}
      funcChoice={funcChoice}
      priceChoice={priceChoice}
      onFuncChoice={(i) => !submitted && setFuncChoice(i)}
      onPriceChoice={(i) => !submitted && setPriceChoice(i)}
      onConfirm={confirm}
      onNext={nextCard}
    />
  );
}

function Flashcard({
  item,
  groupTitle,
  total,
  cursor,
  submitted,
  funcChoice,
  priceChoice,
  onFuncChoice,
  onPriceChoice,
  onConfirm,
  onNext,
}: {
  item: FlashcardItem;
  groupTitle: string;
  total: number;
  cursor: number;
  submitted: boolean;
  funcChoice: number | null;
  priceChoice: number | null;
  onFuncChoice: (i: number) => void;
  onPriceChoice: (i: number) => void;
  onConfirm: () => void;
  onNext: () => void;
}) {
  const funcCorrect = funcChoice === item.functionalityCorrectIndex;
  const priceCorrect = priceChoice === item.priceCorrectIndex;
  const allCorrect = submitted && funcCorrect && priceCorrect;

  function optionClasses(
    chosen: number | null,
    optIdx: number,
    correctIdx: number,
  ): string {
    if (!submitted) {
      return chosen === optIdx
        ? "border-primary bg-primary/10"
        : "border-white/10 bg-white/[0.04] hover:border-primary/40";
    }
    if (optIdx === correctIdx)
      return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    if (chosen === optIdx)
      return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    return "border-white/10 bg-white/[0.03] opacity-60";
  }

  return (
    <div className="mt-3 mx-auto" style={{ maxWidth: 420 }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Revisão — {groupTitle}
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < cursor
                  ? "bg-emerald-500"
                  : i === cursor
                    ? "bg-primary"
                    : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-lg bg-white/[0.06] flex items-center justify-center overflow-hidden"
            style={{ width: 110, height: 110 }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">sem imagem</span>
            )}
          </div>
          <h3 className="text-base font-bold text-center">{item.productName}</h3>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Qual é a funcionalidade deste produto?
          </p>
          <div className="space-y-1.5">
            {item.functionalityOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => onFuncChoice(i)}
                disabled={submitted}
                className={`w-full text-left text-sm rounded-lg border px-3 py-2.5 transition-colors ${optionClasses(
                  funcChoice,
                  i,
                  item.functionalityCorrectIndex,
                )}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Qual é o preço atual?
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {item.priceOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => onPriceChoice(i)}
                disabled={submitted || item.priceOptions[0] === "—"}
                className={`text-sm rounded-lg border px-3 py-2.5 transition-colors ${optionClasses(
                  priceChoice,
                  i,
                  item.priceCorrectIndex,
                )}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {item.scrapeError && (
            <p className="text-[11px] text-amber-500">
              {item.scrapeError} · revise apenas a funcionalidade.
            </p>
          )}
        </div>

        {!submitted ? (
          <Button
            className="w-full"
            disabled={funcChoice === null || priceChoice === null}
            onClick={onConfirm}
          >
            Confirmar resposta
          </Button>
        ) : (
          <>
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                allCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              <p className="font-bold mb-1">
                {allCorrect
                  ? "Acertou tudo!"
                  : "Não foi dessa vez."}
              </p>
              <p className="text-xs leading-relaxed">
                {allCorrect
                  ? "Este produto sai da sua fila de revisão de hoje."
                  : "Este produto volta amanhã para revisão."}
              </p>
            </div>
            <Button className="w-full" onClick={onNext}>
              {cursor + 1 >= total ? "Ver resumo" : "Próximo produto"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


// =============================================================================
// Helpers de UI
// =============================================================================

function QuestionView({
  n,
  total,
  step,
  question,
  chosen,
  onAnswer,
  onNext,
  isLast,
}: {
  n: number;
  total: number;
  step: number;
  question: RevisionQuestion;
  chosen: number | null;
  onAnswer: (optIdx: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const isAnswered = chosen !== null;
  return (
    <div className="space-y-3">
      <StepHeader n={step} title={`Pergunta ${n} de ${total}`} />
      <p className="text-sm font-medium">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt, optIdx) => {
          const isCorrect = optIdx === question.correctIndex;
          const isChosen = chosen === optIdx;
          const stateClass = !isAnswered
            ? "border-border hover:border-primary/50 hover:bg-primary/5"
            : isCorrect
              ? "border-emerald-500/60 bg-emerald-500/10"
              : isChosen
                ? "border-rose-500/60 bg-rose-500/10"
                : "border-border opacity-60";
          return (
            <button
              key={optIdx}
              disabled={isAnswered}
              onClick={() => onAnswer(optIdx)}
              className={`w-full text-left text-sm rounded-xl border px-4 py-3 transition-colors ${stateClass}`}
            >
              <span className="font-semibold mr-2">
                {String.fromCharCode(97 + optIdx)})
              </span>
              {opt}
              {isAnswered && isCorrect && (
                <Check className="inline h-4 w-4 ml-2 text-emerald-600" />
              )}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            chosen === question.correctIndex
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
              : "border-rose-500/40 bg-rose-500/5 text-rose-700"
          }`}
        >
          {chosen === question.correctIndex
            ? "Resposta correta!"
            : `Resposta incorreta. A correta é: ${String.fromCharCode(97 + question.correctIndex)}) ${question.options[question.correctIndex]}`}
        </div>
      )}
      <div className="flex justify-end">
        <Button disabled={!isAnswered} onClick={onNext}>
          {isLast ? "Ver resultado" : "Próxima"}
        </Button>
      </div>
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
        {n}
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}


