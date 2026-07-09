// Gate diário obrigatório. Reusa DailyTasksList em modo não-dismissível.
// Some sozinho assim que tudo do dia (apostila, checklist e revisão pendente)
// estiver concluído. Admin é isento.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getTodayReview, type TodayReviewState } from "@/lib/dailyReview.functions";
import { DailyTasksList, DAILY_TASKS } from "@/components/DailyTasksList";

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function DailyTasksGate({ userId }: { userId: string }) {
  const router = useRouter();
  const fetchReview = useServerFn(getTodayReview);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [review, setReview] = useState<TodayReviewState | null>(null);

  const reload = useCallback(async () => {
    const today = todayKey();
    const [{ data: roles }, { data: profile }, { data: comps }, rev] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("daily_task_completions")
        .select("task_id")
        .eq("user_id", userId)
        .eq("task_date", today),
      fetchReview().catch(() => null),
    ]);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    setOnboardingComplete(!!profile?.onboarding_completed_at);
    const map: Record<string, boolean> = {};
    (comps ?? []).forEach((c) => {
      map[c.task_id as string] = true;
    });
    setDone(map);
    setReview(rev);
    setLoading(false);
  }, [userId, fetchReview]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload]);

  // Re-checa em cada mudança de rota também.
  useEffect(() => {
    return router.subscribe("onResolved", () => {
      reload();
    });
  }, [router, reload]);

  const pendingReviewItems = useMemo(() => {
    if (!review) return [];
    return review.queue.filter(
      (q) => !review.completedKeysToday.includes(q.reviewKey),
    );
  }, [review]);
  const hasReview = pendingReviewItems.length > 0;
  const reviewDone = !!review && review.queue.length > 0 && !hasReview;

  const allDone =
    DAILY_TASKS.every((t) => done[t.id]) && !hasReview;

  const open =
    !loading &&
    !isAdmin &&
    onboardingComplete &&
    !allDone &&
    router.state.location.pathname !== "/revisao-do-dia";

  // Bloqueia botão "voltar" enquanto o gate está aberto.
  useEffect(() => {
    if (!open) return;
    const onPop = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  const toggle = useCallback(
    async (id: string, value: boolean) => {
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

  if (!open) return null;

  return (
    <Dialog open onOpenChange={() => { /* não pode fechar */ }}>
      <DialogContent
        className="p-0 w-[94vw] max-w-md max-h-[88vh] flex flex-col gap-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">
          Conclua as tarefas do dia para liberar o acesso ao app.
        </DialogDescription>
        <DailyTasksList
          done={done}
          onToggle={toggle}
          hasReview={hasReview}
          reviewDone={reviewDone}
          pendingReviewItems={pendingReviewItems}
          dismissible={false}
          onOpenTask={() => { /* gate permanece aberto */ }}
        />
        {/* Acessibilidade: título acessível redundante caso o list não monte */}
        <DialogTitle className="sr-only">Tarefas obrigatórias do dia</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
