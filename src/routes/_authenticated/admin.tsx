import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { TOPICS } from "@/data/topics";
import { computeTopicStatuses, type ProgressRow } from "@/lib/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.user.id);
    if (!data?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Admin — Santa Bronx Formação" }] }),
  component: AdminPage,
});

type AttendantRow = {
  id: string;
  full_name: string | null;
  blocked: boolean;
  blocked_reason: string | null;
  progress: ProgressRow[];
};

function AdminPage() {
  const [list, setList] = useState<AttendantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});

  async function refresh() {
    setLoading(true);
    const [{ data: profiles }, { data: progress }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, blocked, blocked_reason")
        .order("created_at", { ascending: false }),
      supabase.from("subtask_progress").select("user_id, subtask_id, completed, score"),
    ]);
    const grouped = (profiles ?? []).map((p) => ({
      ...p,
      progress: (progress ?? [])
        .filter((r) => r.user_id === p.id)
        .map((r) => ({ subtask_id: r.subtask_id, completed: r.completed, score: r.score })),
    }));
    setList(grouped as AttendantRow[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setBlocked(userId: string, blocked: boolean, reason?: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ blocked, blocked_reason: blocked ? reason ?? null : null })
      .eq("id", userId);
    if (error) {
      toast.error("Erro", { description: error.message });
      return;
    }
    toast.success(blocked ? "Atendente bloqueada" : "Atendente liberada");
    refresh();
  }

  return (
    <div className="min-h-screen">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4" /> Voltar à trilha
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Painel da gestora</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Veja o progresso de cada atendente, libere quem está travada ou bloqueie acessos.
        </p>
        <div className="mt-3">
          <Link
            to="/admin/avaliacoes"
            className="inline-flex items-center rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium hover:bg-muted/60"
          >
            Avaliações dissertativas pendentes →
          </Link>
        </div>


        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-muted-foreground">
            Nenhuma atendente cadastrada ainda.
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {list.map((att) => {
              const statuses = computeTopicStatuses(TOPICS, att.progress);
              const done = Object.values(statuses).filter((s) => s === "completed").length;
              return (
                <Card key={att.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold">{att.full_name ?? "Sem nome"}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{att.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {att.blocked ? (
                        <Badge variant="destructive">Bloqueada</Badge>
                      ) : (
                        <Badge className="bg-[var(--success)] hover:bg-[var(--success)] text-[var(--success-foreground)]">
                          Ativa
                        </Badge>
                      )}
                      <Badge variant="outline">{done}/{TOPICS.length} tópicos</Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {TOPICS.map((t) => {
                      const s = statuses[t.id];
                      const cls =
                        s === "completed"
                          ? "bg-[var(--success)]"
                          : s === "in_progress"
                          ? "bg-[var(--warning)]"
                          : s === "available"
                          ? "bg-primary/40"
                          : "bg-muted";
                      return (
                        <div key={t.id} className="flex flex-col items-center gap-1">
                          <div className={`h-6 w-full rounded ${cls}`} title={t.title} />
                          <span className="text-[10px] text-muted-foreground">{t.order}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t pt-4">
                    {att.blocked ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Motivo:</span>{" "}
                          {att.blocked_reason ?? "—"}
                        </p>
                        <Button size="sm" onClick={() => setBlocked(att.id, false)}>
                          Liberar acesso
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 items-end">
                        <div className="flex-1 w-full">
                          <Label htmlFor={`reason-${att.id}`} className="text-xs">
                            Motivo do bloqueio (opcional)
                          </Label>
                          <Input
                            id={`reason-${att.id}`}
                            value={reasonDraft[att.id] ?? ""}
                            onChange={(e) =>
                              setReasonDraft((r) => ({ ...r, [att.id]: e.target.value }))
                            }
                            placeholder="Ex.: reprovou na avaliação do tópico 2"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setBlocked(att.id, true, reasonDraft[att.id])}
                        >
                          Bloquear
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
