import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PermissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "consumed";

export type PermissionRow = {
  id: string;
  user_id: string;
  subtask_id: string;
  status: PermissionStatus;
  decided_at: string | null;
  decided_by: string | null;
  expires_at: string | null;
  created_at: string;
};

export const APPROVAL_TTL_MS = 30 * 60 * 1000;

export type EffectiveStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "consumed";

export function getEffectiveStatus(row: PermissionRow | null): EffectiveStatus {
  if (!row) return "none";
  if (row.status === "approved" && row.expires_at) {
    if (new Date(row.expires_at).getTime() < Date.now()) return "expired";
  }
  return row.status;
}

export function useExamPermission(userId: string, subtaskId: string) {
  const [row, setRow] = useState<PermissionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("exam_permission_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("subtask_id", subtaskId)
      .order("created_at", { ascending: false })
      .limit(1);
    setRow((data?.[0] as PermissionRow | undefined) ?? null);
    setLoading(false);
  }, [userId, subtaskId]);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel(`perm-${userId}-${subtaskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exam_permission_requests",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh(),
      )
      .subscribe();
    const i = setInterval(() => setTick((n) => n + 1), 30 * 1000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(i);
    };
  }, [userId, subtaskId, refresh]);

  return { row, status: getEffectiveStatus(row), loading, refresh, tick };
}

export async function requestPermission(userId: string, subtaskId: string) {
  const { data, error } = await supabase
    .from("exam_permission_requests")
    .insert({ user_id: userId, subtask_id: subtaskId, status: "pending" })
    .select()
    .single();
  return { data: data as PermissionRow | null, error };
}

export async function approvePermission(id: string, reviewerId: string) {
  const expires = new Date(Date.now() + APPROVAL_TTL_MS).toISOString();
  return supabase
    .from("exam_permission_requests")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      decided_by: reviewerId,
      expires_at: expires,
    })
    .eq("id", id);
}

export async function rejectPermission(id: string, reviewerId: string) {
  return supabase
    .from("exam_permission_requests")
    .update({
      status: "rejected",
      decided_at: new Date().toISOString(),
      decided_by: reviewerId,
    })
    .eq("id", id);
}

export async function consumePermission(id: string) {
  return supabase
    .from("exam_permission_requests")
    .update({ status: "consumed" })
    .eq("id", id);
}
