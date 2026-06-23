import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOPICS } from "@/data/topics";
import { isTopicComplete, type ProgressRow } from "@/lib/progress";
import { getRevisionContent } from "@/data/revisao";
import {
  spDateKey,
  daysBetween,
  type DailyReviewQueueItem,
} from "@/lib/dailyReview";

export type TodayReviewState = {
  date: string; // YYYY-MM-DD SP
  queue: DailyReviewQueueItem[];
  completed: boolean;
  completedAt: string | null;
  completedModuleIds: string[];
};

export const getTodayReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TodayReviewState> => {
    const { supabase, userId } = context;
    const today = spDateKey();

    const [{ data: progress }, { data: completion }] = await Promise.all([
      supabase
        .from("subtask_progress")
        .select("subtask_id, completed, score, completed_at")
        .eq("user_id", userId),
      supabase
        .from("daily_review_completions")
        .select("review_date, module_ids, completed_at")
        .eq("user_id", userId)
        .eq("review_date", today)
        .maybeSingle(),
    ]);

    const rows = (progress ?? []) as Array<
      ProgressRow & { completed_at: string | null }
    >;

    const queue: DailyReviewQueueItem[] = [];
    for (const topic of TOPICS) {
      if (topic.subtasks.length === 0) continue;
      if (!isTopicComplete(topic, rows)) continue;
      // Última data de conclusão entre as subtarefas do tópico.
      let maxIso: string | null = null;
      for (const s of topic.subtasks) {
        const r = rows.find((x) => x.subtask_id === s.id);
        const at = r?.completed_at ?? null;
        if (at && (!maxIso || at > maxIso)) maxIso = at;
      }
      if (!maxIso) continue;
      const completedDay = spDateKey(new Date(maxIso));
      const diff = daysBetween(completedDay, today);
      if (diff === 1 || diff === 2) {
        const content = getRevisionContent(topic.id);
        queue.push({
          topicId: topic.id,
          topicTitle: topic.title,
          dayInWindow: diff as 1 | 2,
          hasQuiz: !!content && content.quiz.length > 0,
          hasContent: !!content,
        });
      }
    }

    // Preserva a ordem dos TOPICS (mesma da home).
    queue.sort(
      (a, b) =>
        TOPICS.findIndex((t) => t.id === a.topicId) -
        TOPICS.findIndex((t) => t.id === b.topicId),
    );

    return {
      date: today,
      queue,
      completed: !!completion,
      completedAt: completion?.completed_at ?? null,
      completedModuleIds: (completion?.module_ids ?? []) as string[],
    };
  });

export const completeTodayReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { moduleIds: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = spDateKey();
    const { error } = await supabase
      .from("daily_review_completions")
      .upsert(
        {
          user_id: userId,
          review_date: today,
          module_ids: data.moduleIds,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,review_date" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, date: today };
  });
