import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Loader2,
  Circle,
  AlertTriangle,
  Brain,
  Store,
  Package,
  ClipboardCheck,
  MessageCircleQuestion,
  TrendingUp,
  HeartPulse,
  Tag,
  Users,
} from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Trilha — Santa Bronx Formação" }] }),
  component: HomePage,
});

type Profile = {
  full_name: string | null;
  blocked: boolean;
  blocked_reason: string | null;
};

function topicIcon(id: string) {
  switch (id) {
    case "apresentacao":
      return Store;
    case "embalar":
      return Package;
    case "responsabilidade":
      return ClipboardCheck;
    case "objecoes":
      return MessageCircleQuestion;
    case "vendas":
      return TrendingUp;
    case "dores":
      return HeartPulse;
    case "produtos":
      return Tag;
    case "presencial":
      return Users;
    default:
      return Circle;
  }
}

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

  const statuses = computeTopicStatuses(TOPICS, rows, { isAdmin });
  const totalDone = Object.values(statuses).filter((s) => s === "completed").length;
  const overallPercent = Math.round((totalDone / TOPICS.length) * 100);

  return (
    <div className="min-h-screen">
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
            <Progress
              value={overallPercent}
              className="h-2 bg-white/10 [&>div]:!bg-[#14b8a6]"
            />
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

        {totalDone > 0 && <ReviewReminder userId={user.id} />}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ol className="space-y-3">
            {TOPICS.map((topic, idx) => {
              const status = statuses[topic.id];
              const percent = topicProgressPercent(topic, rows);
              const locked = status === "locked" || profile?.blocked;
              const isEmpty = topic.subtasks.length === 0;
              // Progressão de roxo: do mais claro (topo) para o mais escuro (final)
              const t = TOPICS.length > 1 ? idx / (TOPICS.length - 1) : 0;
              const L = 0.74 - t * 0.32; // 0.74 → 0.42
              const Ldark = Math.max(L - 0.10, 0.30);
              const purple = `oklch(${L.toFixed(3)} 0.18 295)`;
              const purpleDark = `oklch(${Ldark.toFixed(3)} 0.19 295)`;
              const gradient = `linear-gradient(135deg, ${purple}, ${purpleDark})`;
              const TopicIcon = topicIcon(topic.id);
              const card = (
                <Card
                  className={`relative overflow-hidden rounded-2xl border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] transition-all ${
                    locked ? "opacity-60" : "hover:-translate-y-0.5 hover:bg-white/[0.09]"
                  } ${status === "completed" ? "ring-1 ring-[oklch(0.68_0.16_150/40%)]" : ""}`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                          style={{ background: gradient }}
                        >
                          <TopicIcon className="h-6 w-6" strokeWidth={2} />
                        </div>
                        <div className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.78_0.12_175)] text-[oklch(0.22_0.06_170)] text-[10px] font-bold shadow-md border border-white/20">
                          {topic.order}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-base sm:text-lg">{topic.title}</h2>
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
                      className="block focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-2xl"
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

function ReviewReminder({ userId }: { userId: string }) {
  const [show, setShow] = useState(true);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sb-last-review-${userId}`);
      const last = raw ? Number(raw) : 0;
      const hours = (Date.now() - last) / 36e5;
      setStale(!last || hours >= 12);
      const dismissed = sessionStorage.getItem(`sb-review-dismiss-${userId}`);
      if (dismissed === "1") setShow(false);
    } catch {
      /* noop */
    }
  }, [userId]);

  if (!show || !stale) return null;

  return (
    <Card className="mb-6 border-primary/40 bg-primary/5 p-4">
      <div className="flex gap-3 items-start">
        <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">Revise antes de continuar</p>
          <p className="text-sm text-muted-foreground mt-1">
            Antes de começar um tópico novo, relembre rapidamente o que você já estudou.
            Isso fixa o conteúdo de verdade na sua memória.
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Link
              to="/revisao"
              className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Abrir apostila de revisão
            </Link>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.setItem(`sb-review-dismiss-${userId}`, "1");
                } catch {
                  /* noop */
                }
                setShow(false);
              }}
              className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
