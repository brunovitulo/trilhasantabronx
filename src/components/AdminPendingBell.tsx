import { useCallback, useEffect, useState } from "react";
import { Inbox, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { findSubtask } from "@/data/topics";

type Row = {
  id: string;
  user_id: string;
  subtask_id: string;
  created_at: string;
  full_name: string | null;
};

type PermRow = Row;

export const ADMIN_OPEN_CORRECTION_EVENT = "sb-admin-open-correction";

export type AdminOpenCorrectionDetail = {
  submissionId: string;
  userId: string;
  subtaskId: string;
  fullName: string | null;
  createdAt: string;
};

export function AdminPendingBell() {
  const [rows, setRows] = useState<Row[]>([]);
  const [perms, setPerms] = useState<PermRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [{ data: subs }, { data: pr }] = await Promise.all([
      supabase
        .from("open_evaluation_submissions")
        .select("id, user_id, subtask_id, created_at")
        .eq("status", "pending_review")
        .order("created_at", { ascending: true }),
      supabase
        .from("exam_permission_requests")
        .select("id, user_id, subtask_id, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);
    const list = (subs ?? []) as Omit<Row, "full_name">[];
    const plist = (pr ?? []) as Omit<PermRow, "full_name">[];
    const ids = Array.from(new Set([...list.map((r) => r.user_id), ...plist.map((r) => r.user_id)]));
    let nameMap: Record<string, string | null> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      nameMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.full_name]));
    }
    setRows(list.map((r) => ({ ...r, full_name: nameMap[r.user_id] ?? null })));
    setPerms(plist.map((r) => ({ ...r, full_name: nameMap[r.user_id] ?? null })));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("admin-bell-pendings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "open_evaluation_submissions" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exam_permission_requests" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refresh]);

  function handleOpenCorrection(r: Row) {
    setOpen(false);
    const detail: AdminOpenCorrectionDetail = {
      submissionId: r.id,
      userId: r.user_id,
      subtaskId: r.subtask_id,
      fullName: r.full_name,
      createdAt: r.created_at,
    };
    window.dispatchEvent(
      new CustomEvent(ADMIN_OPEN_CORRECTION_EVENT, { detail }),
    );
  }

  const total = rows.length + perms.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="relative text-white hover:bg-white/10 hover:text-white"
          aria-label={`${total} pendência(s)`}
        >
          <Inbox className="h-5 w-5" />
          {total > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--brand-deep)]">
              {total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : total === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground text-center">
            Nenhuma pendência no momento.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3">
            {perms.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-300 px-2 py-1 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Pedidos de permissão
                </p>
                {perms.map((r) => {
                  const meta = findSubtask(r.subtask_id);
                  return (
                    <div
                      key={r.id}
                      className="rounded-lg px-2 py-2 bg-rose-500/10 border border-rose-400/30"
                    >
                      <p className="text-sm font-medium truncate">
                        {r.full_name ?? "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {meta?.topic.title ?? r.subtask_id}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            {rows.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 py-1">
                  Provas pendentes de correção
                </p>
                {rows.map((r) => {
                  const meta = findSubtask(r.subtask_id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleOpenCorrection(r)}
                      className="w-full text-left rounded-lg px-2 py-2 hover:bg-muted/60 transition"
                    >
                      <p className="text-sm font-medium truncate">
                        {r.full_name ?? "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {meta?.topic.title ?? r.subtask_id}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pt-BR")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
