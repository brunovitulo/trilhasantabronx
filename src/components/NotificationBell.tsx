import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type ReviewedRow = {
  id: string;
  status: "approved" | "rejected" | "pending_review";
  reviewed_at: string | null;
};

function seenKey(id: string) {
  return `sb-exam-seen-${id}`;
}

function isUnseen(id: string) {
  try {
    return localStorage.getItem(seenKey(id)) !== "1";
  } catch {
    return true;
  }
}

export const EXAM_POPUP_EVENT = "sb-show-exam-popup";
export const EXAM_SEEN_EVENT = "sb-exam-seen-changed";

export function NotificationBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("open_evaluation_submissions")
      .select("id, status, reviewed_at")
      .eq("user_id", userId)
      .in("status", ["approved", "rejected"])
      .not("reviewed_at", "is", null)
      .order("reviewed_at", { ascending: false })
      .limit(20);
    const rows = (data ?? []) as ReviewedRow[];
    setCount(rows.filter((r) => isUnseen(r.id)).length);
  }, [userId]);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel(`bell-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "open_evaluation_submissions",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh(),
      )
      .subscribe();
    const onSeen = () => refresh();
    window.addEventListener(EXAM_SEEN_EVENT, onSeen);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener(EXAM_SEEN_EVENT, onSeen);
    };
  }, [userId, refresh]);

  if (count === 0) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={() => window.dispatchEvent(new CustomEvent(EXAM_POPUP_EVENT))}
      className="relative text-white hover:bg-white/10 hover:text-white"
      aria-label={`${count} resultado(s) de prova pendente(s)`}
    >
      <Bell className="h-5 w-5" />
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--brand-deep)]">
        {count}
      </span>
    </Button>
  );
}
