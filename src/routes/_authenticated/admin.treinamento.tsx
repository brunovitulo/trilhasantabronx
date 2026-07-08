import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ChevronLeft,
  GraduationCap,
  UserPlus,
  ListChecks,
  BookOpen,
  KeyRound,
  Eye,
  ClipboardCheck,
  RotateCcw,
  Bell,
  ShieldCheck,
  Ban,
  Trash2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/treinamento")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.user.id);
    if (!data?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Treinamento do gerente — Santa Bronx" }] }),
  component: TreinamentoPage,
});

const STEPS: Array<{
  n: number;
  icon: typeof UserPlus;
  title: string;
  body: string;
  details: string[];
  tint: string;
}> = [
  {
    n: 1,
    icon: UserPlus,
    title: "A atendente cria a conta e entra pela primeira vez",
    body:
      "Você pede pra ela abrir o app, se cadastrar com e-mail e senha e fazer o onboarding inicial. Depois disso ela cai na trilha.",
    details: [
      "Na primeira vez do dia, o app abre um bloqueio obrigatório de Tarefas do dia (apostila, checklist e revisão). Ela precisa fazer antes de continuar.",
      "Você pode acompanhar quem já criou conta na aba Usuários — todos aparecem listados aqui no admin.",
    ],
    tint: "from-[oklch(0.65_0.2_295)]/25 to-[oklch(0.45_0.19_295)]/10 border-[oklch(0.65_0.18_295)]/30",
  },
  {
    n: 2,
    icon: ListChecks,
    title: "Tarefas do dia — o que ela faz todos os dias",
    body:
      "Todo dia, logo ao entrar, aparece a lista de tarefas obrigatórias. Sem terminar, ela não avança no restante do app.",
    details: [
      "Apostila: leitura curta do dia.",
      "Checklist: uma conferência prática (organização, decoração, produtos etc.).",
      "Revisão do dia: flashcards e perguntas dos produtos que ela já estudou.",
      "Sua função aqui é apenas garantir que ela abra o app todo dia. Se ela pular um dia, essa lista já cobra automaticamente.",
    ],
    tint: "from-[oklch(0.7_0.16_175)]/25 to-[oklch(0.5_0.15_175)]/10 border-[oklch(0.7_0.16_175)]/30",
  },
  {
    n: 3,
    icon: BookOpen,
    title: "Ela avança nos módulos da trilha",
    body:
      "Cada módulo (Apresentação, Embalar, Vendas, Objeções, Produtos etc.) tem apostila, checklist, prática e prova. Ela vai destravando na ordem.",
    details: [
      "Você não precisa fazer nada enquanto ela está lendo ou praticando.",
      "Quando ela termina toda a prática de um módulo, aparece pra ela o botão de solicitar a prova.",
    ],
    tint: "from-[oklch(0.7_0.18_45)]/25 to-[oklch(0.55_0.18_45)]/10 border-[oklch(0.7_0.18_45)]/30",
  },
  {
    n: 4,
    icon: KeyRound,
    title: "Ela pede pra fazer a prova — VOCÊ libera",
    body:
      "Antes de cada prova, ela clica em Solicitar liberação. Chega uma notificação pra você, e ela fica travada esperando sua aprovação.",
    details: [
      "No canto superior do app aparece um sininho vermelho com o número de pedidos pendentes. Clique nele.",
      "Confirme que ela realmente está pronta (de preferência do seu lado, com a apostila fechada) e aprove.",
      "A aprovação dura 30 minutos. Passou disso, ela precisa pedir de novo.",
      "Se ela ainda não estiver pronta, rejeite — ela volta pra revisar o conteúdo.",
    ],
    tint: "from-[oklch(0.78_0.13_180)]/25 to-[oklch(0.55_0.12_180)]/10 border-[oklch(0.78_0.13_180)]/30",
  },
  {
    n: 5,
    icon: Eye,
    title: "Acompanhe a prova em TEMPO REAL",
    body:
      "Esse é o passo mais importante. Enquanto ela faz a prova, você tem que estar vendo a tela dela ao vivo — pelo próprio app.",
    details: [
      "Vá em Admin → encontre o nome dela → menu Ações → Ver como este usuário.",
      "Você entra na conta dela e vê exatamente a tela que ela está vendo. É pra você conferir se ela não está consultando a apostila, o WhatsApp, o Google ou perguntando pra outra pessoa.",
      "Fique junto dela fisicamente e olhando o app. É o único jeito da prova valer.",
      "Terminou? Clique em Sair da visualização (barra amarela no topo) pra voltar pra sua conta de admin.",
    ],
    tint: "from-[oklch(0.55_0.22_295)]/25 to-[oklch(0.4_0.18_295)]/10 border-[oklch(0.65_0.18_295)]/30",
  },
  {
    n: 6,
    icon: ClipboardCheck,
    title: "Corrija a prova",
    body:
      "Quando ela envia a prova, o app deixa ela pendente pra correção. Você abre e avalia cada resposta.",
    details: [
      "O sininho no topo mostra provas aguardando correção.",
      "Marque cada resposta como certa ou errada e escreva um feedback curto quando fizer sentido.",
      "Se a nota final ficar abaixo da mínima, o app já cobra ela a refazer o módulo (ou só a prova, se você marcar assim).",
    ],
    tint: "from-[oklch(0.7_0.16_175)]/25 to-[oklch(0.5_0.15_175)]/10 border-[oklch(0.7_0.16_175)]/30",
  },
  {
    n: 7,
    icon: RotateCcw,
    title: "Revisões diárias mantêm o que ela aprendeu",
    body:
      "Depois que ela passa por um conteúdo, o app coloca aquele tema na revisão dos próximos dias — flashcards e perguntas rápidas.",
    details: [
      "A revisão do dia é obrigatória (aparece nas Tarefas do dia).",
      "Você não precisa aprovar nada da revisão — é automático. Só cobre que ela abra o app todo dia pra não acumular.",
    ],
    tint: "from-[oklch(0.65_0.2_295)]/25 to-[oklch(0.45_0.19_295)]/10 border-[oklch(0.65_0.18_295)]/30",
  },
];

const TOOLS: Array<{ icon: typeof Bell; title: string; body: string }> = [
  {
    icon: Bell,
    title: "Sininho de pendências",
    body:
      "No topo da tela mostra pedidos de prova esperando aprovação e provas aguardando correção. Confira várias vezes ao dia.",
  },
  {
    icon: Eye,
    title: "Ver como este usuário",
    body:
      "Impersona a conta da atendente pra você acompanhar em tempo real. Use SEMPRE que ela estiver fazendo uma prova.",
  },
  {
    icon: ShieldCheck,
    title: "Liberar todas as provas",
    body:
      "Libera de uma vez todas as provas travadas daquela pessoa. Use só em situação especial (ex.: ela já provou o conteúdo antes).",
  },
  {
    icon: RotateCcw,
    title: "Resetar progresso",
    body:
      "Zera o progresso do usuário. Cuidado — não tem volta. Use em teste ou quando você quer que a pessoa comece do zero.",
  },
  {
    icon: Ban,
    title: "Bloquear / desbloquear acesso",
    body:
      "Impede a pessoa de logar temporariamente sem excluir a conta. Bom pra atendente afastada ou de férias.",
  },
  {
    icon: Trash2,
    title: "Excluir usuário",
    body:
      "Apaga a conta e todo o progresso dela. Use só quando a atendente for desligada da loja.",
  },
  {
    icon: ShieldCheck,
    title: "Definir como admin",
    body:
      "Dá pra outra pessoa os mesmos poderes que você tem. Use com moderação — quem for admin pode aprovar prova, visualizar contas e excluir usuários.",
  },
];

function TreinamentoPage() {
  return (
    <div className="min-h-screen">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para Usuários
        </Link>

        {/* Hero */}
        <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[oklch(0.55_0.22_295)]/20 via-white/[0.04] to-[oklch(0.7_0.16_175)]/15 p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[oklch(0.65_0.2_295)]/25 blur-3xl" aria-hidden />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur">
              <GraduationCap className="h-7 w-7 text-[oklch(0.85_0.13_295)]" />
            </div>
            <div className="min-w-0">
              <Badge className="mb-2 gap-1 rounded-full border border-white/10 bg-white/[0.06] text-foreground/80 hover:bg-white/[0.06]">
                <Sparkles className="h-3 w-3" />
                Treinamento do gerente
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Como usar a Trilha Santa Bronx com a sua atendente
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Este é o passo a passo do que você, gerente, precisa fazer todo dia
                com quem entrou na fila de atendimento. Leia com calma antes de
                começar — se você seguir esse fluxo, a ferramenta faz o trabalho
                pesado sozinha.
              </p>
            </div>
          </div>
        </Card>

        {/* Regra de ouro */}
        <Card className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-50/95 leading-relaxed">
              <strong className="font-semibold">Regra de ouro:</strong> durante uma
              prova você{" "}
              <span className="underline decoration-amber-300/50">precisa</span>{" "}
              estar dentro da conta dela usando o botão{" "}
              <em>Ver como este usuário</em>. É esse acompanhamento em tempo real
              que impede cola e faz o resultado ter valor.
            </div>
          </div>
        </Card>

        {/* Passo a passo */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              O dia a dia com a atendente
            </h2>
            <Badge className="rounded-full border border-white/10 bg-white/[0.06] text-muted-foreground hover:bg-white/[0.06] gap-1">
              <Clock className="h-3 w-3" />
              7 passos
            </Badge>
          </div>

          <ol className="space-y-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n}>
                  <Card
                    className={`overflow-hidden rounded-2xl border bg-gradient-to-br ${s.tint} backdrop-blur-xl`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono tracking-wider text-muted-foreground">
                              PASSO {String(s.n).padStart(2, "0")}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold leading-snug">
                            {s.title}
                          </h3>
                          <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">
                            {s.body}
                          </p>
                          <ul className="mt-3 space-y-1.5">
                            {s.details.map((d, i) => (
                              <li
                                key={i}
                                className="flex gap-2 text-[13px] text-muted-foreground leading-relaxed"
                              >
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/50" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Referência das ferramentas */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            O que cada botão faz (menu Ações do usuário)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Todo esse painel fica em <strong>Admin → nome da pessoa → Ações</strong>.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Card
                  key={t.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <Icon className="h-4 w-4 text-foreground/85" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{t.title}</h3>
                      <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                        {t.body}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Checklist final */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            Seu checklist de todo dia
          </h2>
          <Card className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <ol className="space-y-2.5 text-sm">
              {[
                "Abrir o app e conferir o sininho de pendências.",
                "Aprovar (ou rejeitar) as solicitações de prova que aparecerem.",
                "Sempre que uma atendente for fazer prova: abrir Ver como este usuário e ficar acompanhando ao vivo.",
                "Corrigir as provas que caíram pra revisão.",
                "Passar rápido pela lista de Usuários pra ver se alguém está travada há muito tempo no mesmo módulo.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[oklch(0.7_0.16_175)]/40 bg-[oklch(0.7_0.16_175)]/15 text-[11px] font-semibold text-[oklch(0.82_0.14_175)]">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        <div className="mt-10 flex justify-end">
          <Button asChild size="lg" className="rounded-full gap-2">
            <Link to="/admin">
              Ir para a lista de usuários
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
