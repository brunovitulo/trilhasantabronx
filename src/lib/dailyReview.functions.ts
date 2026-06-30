import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOPICS } from "@/data/topics";
import { isTopicComplete, type ProgressRow } from "@/lib/progress";
import {
  spDateKey,
  daysBetween,
  MODULE_REVIEW_PLANS,
  type ReviewQueueItem,
} from "@/lib/dailyReview";
import {
  PRODUCT_REVISION_GROUPS,
  type ProductRevisionGroupId,
} from "@/data/produtosRevisao";

export type TodayReviewState = {
  date: string; // YYYY-MM-DD SP
  queue: ReviewQueueItem[];
  /** Chaves de revisão (review_key) que já foram concluídas hoje. */
  completedKeysToday: string[];
};

/** Helper interno: para cada tópico, retorna a data ISO em que a última subtarefa foi concluída (ou null). */
function topicCompletionDate(
  topicId: string,
  rows: Array<ProgressRow & { completed_at: string | null }>,
): string | null {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic || topic.subtasks.length === 0) return null;
  if (!isTopicComplete(topic, rows)) return null;
  let maxIso: string | null = null;
  for (const s of topic.subtasks) {
    const r = rows.find((x) => x.subtask_id === s.id);
    const at = r?.completed_at ?? null;
    if (at && (!maxIso || at > maxIso)) maxIso = at;
  }
  return maxIso;
}

/** Helper: retorna a data ISO em que uma subtarefa específica foi concluída. */
function subtaskCompletionDate(
  subtaskId: string,
  rows: Array<ProgressRow & { completed_at: string | null }>,
): string | null {
  const r = rows.find((x) => x.subtask_id === subtaskId);
  if (!r || !r.completed) return null;
  return r.completed_at ?? null;
}

export const getTodayReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TodayReviewState> => {
    const { supabase, userId } = context;
    const today = spDateKey();

    const [
      { data: progress },
      { data: todayCompletions },
      { data: groupProgress },
      { data: flashcardMastery },
    ] = await Promise.all([
      supabase
        .from("subtask_progress")
        .select("subtask_id, completed, score, completed_at")
        .eq("user_id", userId),
      supabase
        .from("daily_review_completions")
        .select("review_key")
        .eq("user_id", userId)
        .eq("review_date", today),
      supabase
        .from("product_revision_progress")
        .select(
          "group_id, cycle, phase, cycle_anchor_date, sessions_done, group_completed",
        )
        .eq("user_id", userId),
      supabase
        .from("product_flashcard_mastery")
        .select("group_id, subcategory_id, product_slug, mastered_at, next_review_date")
        .eq("user_id", userId),
    ]);

    const rows = (progress ?? []) as Array<
      ProgressRow & { completed_at: string | null }
    >;
    const completedKeysToday = (todayCompletions ?? []).map((c) => c.review_key);

    const queue: ReviewQueueItem[] = [];

    // --- Módulos 1-6 -------------------------------------------------------
    for (const plan of MODULE_REVIEW_PLANS) {
      const completedAt = topicCompletionDate(plan.topicId, rows);
      if (!completedAt) continue;
      const completedDay = spDateKey(new Date(completedAt));
      const diff = daysBetween(completedDay, today);
      if (!plan.dayOffsets.includes(diff)) continue;
      const topic = TOPICS.find((t) => t.id === plan.topicId);
      if (!topic) continue;
      const sessionIndex = plan.dayOffsets.indexOf(diff) + 1;
      queue.push({
        kind: "module",
        reviewKey: plan.topicId,
        topicId: plan.topicId,
        title: topic.title,
        hasApostila: plan.hasApostila,
        hasChecklist: plan.hasChecklist,
        quizCount: plan.quizCount,
        dayOffset: diff,
        sessionIndex,
        totalSessions: plan.dayOffsets.length,
        estimatedMinutes: plan.estimatedMinutes,
      });
    }

    // --- Módulo 7 (grupos de produtos) ------------------------------------
    type GP = {
      group_id: string;
      cycle: number;
      phase: number;
      cycle_anchor_date: string;
      sessions_done: number;
      group_completed: boolean;
    };
    const existingProgress = new Map<string, GP>();
    for (const gp of (groupProgress ?? []) as GP[]) {
      existingProgress.set(gp.group_id, gp);
    }

    // Cria registro inicial para grupos cujo exame já foi concluído mas ainda não há row.
    const toInsert: Array<{
      user_id: string;
      group_id: string;
      cycle: number;
      phase: number;
      cycle_anchor_date: string;
      sessions_done: number;
    }> = [];
    for (const group of PRODUCT_REVISION_GROUPS) {
      if (existingProgress.has(group.id)) continue;
      const examDate = subtaskCompletionDate(group.examSubtaskId, rows);
      if (!examDate) continue;
      const anchor = spDateKey(new Date(examDate));
      toInsert.push({
        user_id: userId,
        group_id: group.id,
        cycle: 1,
        phase: 1,
        cycle_anchor_date: anchor,
        sessions_done: 0,
      });
    }
    if (toInsert.length > 0) {
      await supabase.from("product_revision_progress").insert(toInsert);
      for (const ins of toInsert) {
        existingProgress.set(ins.group_id, {
          ...ins,
          group_completed: false,
        } as GP);
      }
    }

    // Mastery por grupo (para sabermos se há produto "vencido" hoje OU se o grupo já foi totalmente dominado).
    type MR = { group_id: string; subcategory_id: string; product_slug: string; mastered_at: string | null; next_review_date: string | null };
    const masteryByGroup = new Map<string, MR[]>();
    for (const m of (flashcardMastery ?? []) as MR[]) {
      const arr = masteryByGroup.get(m.group_id) ?? [];
      arr.push(m);
      masteryByGroup.set(m.group_id, arr);
    }

    // Importa estaticamente para sabermos o total de produtos por grupo APÓS o filtro
    // de subcategorias permitidas para a revisão (catálogo M7 cobre mais SKUs do que
    // a revisão por flashcard).
    const { M7_PRODUCTS } = await import("@/data/m7Products");
    const { M7_REVIEW_ALLOWED_SUBCATEGORIES } = await import("@/data/produtosRevisao");
    const totalByGroup = new Map<string, number>();
    for (const p of M7_PRODUCTS) {
      const allowed = M7_REVIEW_ALLOWED_SUBCATEGORIES[
        p.groupId as keyof typeof M7_REVIEW_ALLOWED_SUBCATEGORIES
      ];
      if (!allowed || !allowed.includes(p.subcategoryId)) continue;
      totalByGroup.set(p.groupId, (totalByGroup.get(p.groupId) ?? 0) + 1);
    }

    // Progressão sequencial: só enfileira o próximo grupo se TODOS os produtos
    // dos grupos anteriores já foram dominados.
    let previousGroupsDone = true;
    for (const group of PRODUCT_REVISION_GROUPS) {
      const gp = existingProgress.get(group.id);
      const mastery = masteryByGroup.get(group.id) ?? [];
      const allowedForGroup = new Set(
        M7_REVIEW_ALLOWED_SUBCATEGORIES[group.id] ?? [],
      );
      const masteredCount = mastery.filter(
        (m) => m.mastered_at && allowedForGroup.has(m.subcategory_id),
      ).length;
      const total = totalByGroup.get(group.id) ?? 0;

      if (!gp || gp.group_completed || total === 0 || masteredCount >= total) {
        // Esse grupo está pronto — não entra na fila, mas também não bloqueia o próximo.
        continue;
      }

      if (!previousGroupsDone) {
        // Aguarda o grupo anterior ser dominado por completo antes de aparecer.
        previousGroupsDone = false;
        continue;
      }

      const phase = gp.phase as 1 | 2 | 3;
      queue.push({
        kind: "product-group",
        reviewKey: `produtos:${group.id}`,
        groupId: group.id as ProductRevisionGroupId,
        title: group.title,
        phase,
        cycle: gp.cycle,
        sessionsDoneInCycle: gp.sessions_done,
        estimatedMinutes: "10-15",
      });
      // Trava grupos seguintes até este ser dominado.
      previousGroupsDone = false;
    }


    // Ordena: módulos primeiro (mesma ordem dos TOPICS), depois grupos de produtos.
    queue.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "module" ? -1 : 1;
      if (a.kind === "module" && b.kind === "module") {
        return (
          TOPICS.findIndex((t) => t.id === a.topicId) -
          TOPICS.findIndex((t) => t.id === b.topicId)
        );
      }
      return 0;
    });

    return { date: today, queue, completedKeysToday };
  });

export const completeReviewItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      reviewKey: string;
      scoreCorrect: number;
      scoreTotal: number;
      /** Necessário quando reviewKey começa com "produtos:". */
      groupId?: ProductRevisionGroupId;
      metadata?: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = spDateKey();

    // Persiste a conclusão diária (idempotente por (user, key, date)).
    const { error: insErr } = await supabase
      .from("daily_review_completions")
      .upsert(
        {
          user_id: userId,
          review_key: data.reviewKey,
          review_date: today,
          score_correct: data.scoreCorrect,
          score_total: data.scoreTotal,
          metadata: (data.metadata ?? {}) as never,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,review_key,review_date" },
      );
    if (insErr) throw new Error(insErr.message);

    // Apenas registra atividade no progresso do grupo (sem mais avançar fases
    // por contagem de sessões). O grupo é considerado completo SOMENTE quando
    // TODOS os produtos estão marcados em `product_flashcard_mastery.mastered_at`.
    if (data.groupId && data.reviewKey.startsWith("produtos:")) {
      const { data: gpRow } = await supabase
        .from("product_revision_progress")
        .select("id, group_completed, sessions_done")
        .eq("user_id", userId)
        .eq("group_id", data.groupId)
        .maybeSingle();

      if (gpRow && !gpRow.group_completed) {
        // Conta produtos do grupo no catálogo M7.
        const { M7_PRODUCTS } = await import("@/data/m7Products");
        const total = M7_PRODUCTS.filter((p) => p.groupId === data.groupId).length;
        const { data: masteryRows } = await supabase
          .from("product_flashcard_mastery")
          .select("product_slug, mastered_at")
          .eq("user_id", userId)
          .eq("group_id", data.groupId);
        const masteredCount = (masteryRows ?? []).filter(
          (m) => m.mastered_at,
        ).length;

        const patch: Record<string, unknown> = {
          sessions_done: (gpRow.sessions_done ?? 0) + 1,
          last_session_at: new Date().toISOString(),
        };
        if (total > 0 && masteredCount >= total) {
          patch.group_completed = true;
        }
        await supabase
          .from("product_revision_progress")
          .update(patch as never)
          .eq("id", gpRow.id);
      }
    }


    return { ok: true, date: today };
  });
