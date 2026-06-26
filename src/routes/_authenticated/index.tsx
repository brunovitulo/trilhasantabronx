import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Loader2,
  Circle,
  AlertTriangle,
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
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Trilha — Santa Bronx Formação" }] }),
  component: HomePage,
});

type Profile = {
  full_name: string | null;
  blocked: boolean;
  blocked_reason: string | null;
  onboarding_completed_at: string | null;
  progress_reset_at: string | null;
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
  const [onboardingDone, setOnboardingDone] = useState(false);

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
          .select("full_name, blocked, blocked_reason, onboarding_completed_at, progress_reset_at")
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

  // Onboarding: aparece no primeiro acesso (sem timestamp), quando a conta
  // está totalmente zerada (sem nenhum registro de progresso), ou quando o
  // admin resetou o progresso depois da última conclusão do guia — exceto admin.
  const accountIsEmpty = rows.length === 0;
  const resetAfterOnboarding =
    !!profile?.progress_reset_at &&
    (!profile?.onboarding_completed_at ||
      new Date(profile.progress_reset_at) > new Date(profile.onboarding_completed_at));
  const shouldShowOnboarding =
    !loading &&
    !isAdmin &&
    !onboardingDone &&
    (!profile?.onboarding_completed_at || accountIsEmpty || resetAfterOnboarding);


  return (
    <div className="min-h-screen">
      {shouldShowOnboarding && (
        <OnboardingFlow userId={user.id} onFinish={() => setOnboardingDone(true)} />
      )}
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
                    {locked && !profile?.blocked && status === "locked" && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 shrink-0 text-white/50" />
                        <p className="text-[12px] text-muted-foreground leading-snug">
                          Conclua o tópico anterior para liberar este módulo.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
              return (
                <li key={topic.id}>
                  {locked || isEmpty ? (
                    <button
                      type="button"
                      aria-disabled
                      onClick={() => {
                        if (status === "locked") {
                          toast.info("Conclua o tópico anterior para liberar este módulo.");
                        }
                      }}
                      className="block w-full text-left cursor-not-allowed"
                    >
                      {card}
                    </button>
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

