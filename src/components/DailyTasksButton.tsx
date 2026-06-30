// Botão opcional "Tarefas do dia" no header. Reusa DailyTasksList e persiste
// progresso na tabela Supabase daily_task_completions (mesma fonte do gate).

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { DailyTasksList, DAILY_TASKS } from "@/components/DailyTasksList";
import { getTodayReview, type TodayReviewState } from "@/lib/dailyReview.functions";

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function DailyTasksButton() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [review, setReview] = useState<TodayReviewState | null>(null);
  const fetchReview = useServerFn(getTodayReview);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const reload = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("daily_task_completions")
      .select("task_id")
      .eq("user_id", userId)
      .eq("task_date", todayKey());
    const map: Record<string, boolean> = {};
    (data ?? []).forEach((r) => {
      map[r.task_id as string] = true;
    });
    setDone(map);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  useEffect(() => {
    let alive = true;
    fetchReview()
      .then((r) => {
        if (alive) setReview(r);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [fetchReview]);

  const pendingReviewItems = useMemo(() => {
    if (!review) return [];
    return review.queue.filter(
      (q) => !review.completedKeysToday.includes(q.reviewKey),
    );
  }, [review]);
  const hasReview = pendingReviewItems.length > 0;
  const reviewDone = !!review && review.queue.length > 0 && !hasReview;

  const pending = useMemo(() => {
    const base = DAILY_TASKS.filter((t) => !done[t.id]).length;
    return base + (hasReview ? 1 : 0);
  }, [done, hasReview]);

  const toggle = useCallback(
    async (id: string, value: boolean) => {
      if (!userId) return;
      const today = todayKey();
      if (value) {
        await supabase
          .from("daily_task_completions")
          .upsert(
            { user_id: userId, task_date: today, task_id: id },
            { onConflict: "user_id,task_date,task_id" },
          );
      } else {
        await supabase
          .from("daily_task_completions")
          .delete()
          .eq("user_id", userId)
          .eq("task_date", today)
          .eq("task_id", id);
      }
      setDone((prev) => ({ ...prev, [id]: value }));
    },
    [userId],
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="relative text-white hover:bg-white/10 hover:text-white gap-1.5"
        aria-label="Tarefas do dia"
        title="Tarefas do dia"
      >
        <CalendarCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Tarefas do dia</span>
        {pending > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
            aria-label={`${pending} pendentes`}
          >
            {pending}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 w-[92vw] max-w-md max-h-[85vh] flex flex-col gap-0 overflow-hidden [&>button]:hidden">
          <DailyTasksList
            done={done}
            onToggle={toggle}
            hasReview={hasReview}
            reviewDone={reviewDone}
            pendingReviewItems={pendingReviewItems}
            dismissible
            onClose={() => setOpen(false)}
            onOpenTask={(id) => {
              if (id === "revisao-do-dia") setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
