import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Loader2, Circle, AlertTriangle, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TOPICS } from "@/data/topics";
import {
  computeTopicStatuses,
  topicProgressPercent,
  type ProgressRow,
} from "@/lib/progress";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Trilha — Santa Bronx Formação" }] }),
  component: HomePage,
});

type Profile = {
  full_name: string | null;
  blocked: boolean;
  blocked_reason: string | null;
};

function HomePage() {
  const { user } = Route.useRouteContext();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: prog }, { data: prof }, { data: roles }] = await Promise.all([
        supabase
          .from("subtask_progress")
          .select("subtask_id, completed, score")
          .eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("full_name, blocked, blocked_reason")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!active) return;
      setRows((prog ?? []) as ProgressRow[]);
      setProfile((prof as Profile) ?? null);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user.id]);

  const statuses = computeTopicStatuses(TOPICS, rows);
  const totalDone = Object.values(statuses).filter((s) => s === "completed").length;
  const overallPercent = Math.round((totalDone / TOPICS.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin={isAdmin} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Olá{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Siga a trilha de tópicos em ordem. Cada tópico desbloqueia o próximo quando você concluir tudo.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={overallPercent} className="h-2" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {totalDone}/{TOPICS.length} concluídos
            </span>
          </div>
        </div>

        {profile?.blocked && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Acesso bloqueado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.blocked_reason ?? "Fale com a gestora para liberar."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ol className="space-y-3">
            {TOPICS.map((topic) => {
              const status = statuses[topic.id];
              const percent = topicProgressPercent(topic, rows);
              const locked = status === "locked" || profile?.blocked;
              const isEmpty = topic.subtasks.length === 0;
              const card = (
                <Card
                  className={`relative overflow-hidden transition-all ${
                    locked ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${topic.accent}`} />
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${topic.accent} text-white font-bold`}
                      >
                        {topic.order}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-semibold text-base sm:text-lg">{topic.title}</h2>
                          <StatusBadge status={status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{topic.summary}</p>
                        {!isEmpty && (
                          <div className="mt-3 flex items-center gap-3">
                            <Progress value={percent} className="h-1.5" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {percent}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex items-center text-muted-foreground">
                        {status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                        ) : locked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
              return (
                <li key={topic.id}>
                  {locked || isEmpty ? (
                    <div aria-disabled className="cursor-not-allowed">{card}</div>
                  ) : (
                    <Link
                      to="/topico/$topicId"
                      params={{ topicId: topic.id }}
                      className="block focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-xl"
                    >
                      {card}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return <Badge className="bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]">Concluído</Badge>;
  if (status === "in_progress")
    return <Badge className="bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]">Em andamento</Badge>;
  if (status === "available") return <Badge variant="secondary">Disponível</Badge>;
  if (status === "empty") return <Badge variant="outline">Em breve</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Bloqueado</Badge>;
}
