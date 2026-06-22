import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  MODULE_REVIEW,
  addDaysISO,
  moduleNameOf,
  reasonForOffset,
  todayISODate,
  type ReviewReason,
} from "./reviews";

// ---------------------------------------------------------------------------
// Listar revisões pendentes para hoje (e atrasadas).
// ---------------------------------------------------------------------------
export const listTodayReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = todayISODate();
    const { data, error } = await context.supabase
      .from("scheduled_reviews")
      .select("*")
      .eq("user_id", context.userId)
      .eq("status", "pending")
      .lte("due_date", today)
      .order("due_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

// ---------------------------------------------------------------------------
// Agendar revisões fixas para um módulo (chamado quando o módulo é concluído).
// Usa ON CONFLICT DO NOTHING via upsert ignoreDuplicates.
// ---------------------------------------------------------------------------
export const scheduleReviewsForModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { moduleId: string }) => data)
  .handler(async ({ data, context }) => {
    const cfg = MODULE_REVIEW[data.moduleId];
    if (!cfg) return { created: 0 };

    const base = new Date();
    const rows = cfg.offsets.map((off) => ({
      user_id: context.userId,
      module_id: data.moduleId,
      module_name: moduleNameOf(data.moduleId),
      weight: cfg.weight,
      due_date: addDaysISO(base, off),
      reason: reasonForOffset(off),
      status: "pending" as const,
      question_count: cfg.questionCount,
      estimated_minutes: cfg.estimatedMinutes,
    }));

    const { data: inserted, error } = await context.supabase
      .from("scheduled_reviews")
      .upsert(rows, {
        onConflict: "user_id,module_id,due_date,reason",
        ignoreDuplicates: true,
      })
      .select("id");
    if (error) throw error;
    return { created: inserted?.length ?? 0 };
  });

// ---------------------------------------------------------------------------
// Criar revisão extra de reforço para amanhã.
// ---------------------------------------------------------------------------
export const scheduleExtraReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      moduleId: string;
      reason: "Reforço por erro" | "Ponto crítico";
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const cfg = MODULE_REVIEW[data.moduleId];
    if (!cfg) return { created: false };
    const due = addDaysISO(new Date(), 1);
    const { error } = await context.supabase
      .from("scheduled_reviews")
      .upsert(
        [
          {
            user_id: context.userId,
            module_id: data.moduleId,
            module_name: moduleNameOf(data.moduleId),
            weight: cfg.weight,
            due_date: due,
            reason: data.reason,
            status: "pending",
            question_count: cfg.questionCount,
            estimated_minutes: cfg.estimatedMinutes,
          },
        ],
        {
          onConflict: "user_id,module_id,due_date,reason",
          ignoreDuplicates: true,
        },
      );
    if (error) throw error;
    return { created: true };
  });

// ---------------------------------------------------------------------------
// Garantir revisão inicial (primeiros 15 dias).
// ---------------------------------------------------------------------------
export const ensureOnboardingReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // checa se usuário foi criado há <=15 dias
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("created_at")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.created_at) return { created: false };

    const createdAt = new Date(profile.created_at);
    const days = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days > 15) return { created: false };

    // só cria de segunda a sexta
    const today = new Date();
    const dow = today.getDay();
    if (dow === 0 || dow === 6) return { created: false };

    // precisa ter pelo menos 1 módulo iniciado
    const { data: progress } = await context.supabase
      .from("subtask_progress")
      .select("subtask_id")
      .eq("user_id", context.userId)
      .limit(1);
    if (!progress || progress.length === 0) return { created: false };

    // escolhe o módulo mais recente entre os que têm matriz
    const { data: recent } = await context.supabase
      .from("subtask_progress")
      .select("subtask_id, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    const moduleIds = Object.keys(MODULE_REVIEW);
    const found = recent?.find((r) =>
      moduleIds.some((mid) => r.subtask_id.startsWith(`${mid}.`)),
    );
    const moduleId =
      moduleIds.find((mid) => found?.subtask_id.startsWith(`${mid}.`)) ??
      moduleIds[0];

    const cfg = MODULE_REVIEW[moduleId];
    const today_iso = todayISODate();
    const reason: ReviewReason = "Revisão inicial — primeiros 15 dias";

    const { error } = await context.supabase
      .from("scheduled_reviews")
      .upsert(
        [
          {
            user_id: context.userId,
            module_id: moduleId,
            module_name: moduleNameOf(moduleId),
            weight: cfg.weight,
            due_date: today_iso,
            reason,
            status: "pending",
            question_count: Math.min(cfg.questionCount, 5),
            estimated_minutes: Math.min(cfg.estimatedMinutes, 5),
          },
        ],
        {
          onConflict: "user_id,module_id,due_date,reason",
          ignoreDuplicates: true,
        },
      );
    if (error) throw error;
    return { created: true };
  });

// ---------------------------------------------------------------------------
// Salvar resposta de uma questão de revisão (+ atualiza desempenho por tema).
// ---------------------------------------------------------------------------
export const submitReviewAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      reviewId: string;
      moduleId: string;
      questionId: string;
      theme?: string | null;
      tags?: string[];
      questionType?: string;
      answer: string;
      correctAnswer: string;
      isCorrect: boolean;
      isCritical?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { error: insertErr } = await context.supabase
      .from("review_answers")
      .insert({
        review_id: data.reviewId,
        user_id: context.userId,
        question_id: data.questionId,
        module_id: data.moduleId,
        theme: data.theme ?? null,
        tags: data.tags ?? [],
        question_type: data.questionType ?? "mcq",
        answer: data.answer,
        correct_answer: data.correctAnswer,
        is_correct: data.isCorrect,
        is_critical: data.isCritical ?? false,
      });
    if (insertErr) throw insertErr;

    // upsert agregado por tema (se houver)
    if (data.theme) {
      const { data: existing } = await context.supabase
        .from("theme_performance")
        .select("id, total_answered, total_correct, total_wrong")
        .eq("user_id", context.userId)
        .eq("module_id", data.moduleId)
        .eq("theme", data.theme)
        .maybeSingle();

      const now = new Date().toISOString();
      if (existing) {
        const total = existing.total_answered + 1;
        const ok = existing.total_correct + (data.isCorrect ? 1 : 0);
        const wrong = existing.total_wrong + (data.isCorrect ? 0 : 1);
        await context.supabase
          .from("theme_performance")
          .update({
            total_answered: total,
            total_correct: ok,
            total_wrong: wrong,
            accuracy: Number(((ok / total) * 100).toFixed(2)),
            last_wrong_at: data.isCorrect ? undefined : now,
            last_reviewed_at: now,
          })
          .eq("id", existing.id);
      } else {
        await context.supabase.from("theme_performance").insert({
          user_id: context.userId,
          module_id: data.moduleId,
          theme: data.theme,
          total_answered: 1,
          total_correct: data.isCorrect ? 1 : 0,
          total_wrong: data.isCorrect ? 0 : 1,
          accuracy: data.isCorrect ? 100 : 0,
          last_wrong_at: data.isCorrect ? null : now,
          last_reviewed_at: now,
        });
      }
    }

    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Finalizar revisão: marca completed, salva score, decide reforço extra.
// ---------------------------------------------------------------------------
export const finalizeReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      reviewId: string;
      moduleId: string;
      correct: number;
      total: number;
      hadCriticalError: boolean;
      wrongThemesCount: Record<string, number>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

    const { error: upErr } = await context.supabase
      .from("scheduled_reviews")
      .update({
        status: "completed",
        score_percent: pct,
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.reviewId)
      .eq("user_id", context.userId);
    if (upErr) throw upErr;

    let extraCreated: null | "Reforço por erro" | "Ponto crítico" = null;
    const repeatedThemes = Object.values(data.wrongThemesCount).some(
      (n) => n >= 2,
    );
    if (data.hadCriticalError) {
      extraCreated = "Ponto crítico";
    } else if (pct < 70 || repeatedThemes) {
      extraCreated = "Reforço por erro";
    }

    if (extraCreated) {
      const cfg = MODULE_REVIEW[data.moduleId];
      if (cfg) {
        const due = addDaysISO(new Date(), 1);
        await context.supabase.from("scheduled_reviews").upsert(
          [
            {
              user_id: context.userId,
              module_id: data.moduleId,
              module_name: moduleNameOf(data.moduleId),
              weight: cfg.weight,
              due_date: due,
              reason: extraCreated,
              status: "pending",
              question_count: cfg.questionCount,
              estimated_minutes: cfg.estimatedMinutes,
            },
          ],
          {
            onConflict: "user_id,module_id,due_date,reason",
            ignoreDuplicates: true,
          },
        );
      }
    }

    return { scorePercent: pct, extraCreated };
  });
