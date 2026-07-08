import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Circle,
  Play,
  BookOpen,
  ClipboardCheck,
  Check,
  FilePen,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Rocket,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { forceStopImpersonationNow, isImpersonating } from "@/components/ImpersonationBanner";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  onFinish: () => void;
};

const TOTAL = 3;

export function OnboardingFlow({ userId, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false]);
  const [saving, setSaving] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [exitingImpersonation, setExitingImpersonation] = useState(false);

  useEffect(() => {
    setImpersonating(isImpersonating());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  async function exitImpersonation() {
    if (exitingImpersonation) return;
    setExitingImpersonation(true);
    const result = forceStopImpersonationNow();
    window.location.replace(result.restored ? "/admin" : "/auth");
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", userId);
    onFinish();
  }


  function toggle(i: number, v: boolean) {
    setConfirmed((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  const canAdvance = confirmed[step];
  const isLast = step === TOTAL - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      {impersonating && (
        <Button
          type="button"
          onPointerDownCapture={(event) => {
            event.preventDefault();
            event.stopPropagation();
            exitImpersonation();
          }}
          onClick={exitImpersonation}
          disabled={exitingImpersonation}
          className="fixed right-4 top-4 z-[2147483647] h-10 gap-2 rounded-full border border-amber-300/50 bg-amber-400 px-4 text-sm font-bold text-amber-950 shadow-xl hover:bg-amber-300 disabled:opacity-80 sm:right-6 sm:top-6"
        >
          {exitingImpersonation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Voltar para minha conta
        </Button>
      )}
      <div className="w-full max-w-2xl my-auto">
        {/* Indicador superior */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-10 bg-[#5eead4]" : i < step ? "w-6 bg-[#5eead4]/60" : "w-6 bg-white/15",
                )}
              />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {step + 1} de {TOTAL}
          </span>
        </div>

        <div
          key={step}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0f2e]/95 via-[#0f1419]/95 to-[#0a1014]/95 p-5 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {step === 0 && <ScreenTopics />}
          {step === 1 && <ScreenSequence />}
          {step === 2 && <ScreenExams />}

          <div className="mt-6 rounded-2xl border border-[#5eead4]/30 bg-[#5eead4]/[0.06] p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`confirm-${step}`}
                checked={confirmed[step]}
                onCheckedChange={(v) => toggle(step, !!v)}
                className="mt-0.5 data-[state=checked]:bg-[#5eead4] data-[state=checked]:border-[#5eead4] data-[state=checked]:text-black"
              />
              <Label
                htmlFor={`confirm-${step}`}
                className="cursor-pointer text-sm sm:text-base font-medium leading-snug text-foreground"
              >
                {CONFIRMATIONS[step]}
              </Label>
            </div>
            {!canAdvance && (
              <p className="mt-2 pl-7 text-[11px] text-muted-foreground">
                Marque a confirmação acima para liberar o botão.
              </p>
            )}
          </div>

          <Button
            onClick={() => {
              if (!canAdvance) return;
              if (isLast) finish();
              else setStep((s) => s + 1);
            }}
            disabled={!canAdvance || saving}
            size="lg"
            className={cn(
              "mt-5 w-full text-base font-semibold h-12",
              isLast
                ? "bg-[#ec4899] hover:bg-[#db2777] text-white"
                : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white",
            )}
          >
            {saving ? (
              "Carregando..."
            ) : isLast ? (
              <>
                <Rocket className="h-5 w-5" /> Finalizar guia
              </>
            ) : (
              <>
                Entendi, próximo <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const CONFIRMATIONS = [
  "Entendi que os tópicos são sequenciais",
  "Entendi que devo seguir a ordem das etapas",
  "Entendi que as provas precisam de aprovação",
];

function Heading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78bfa] mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{title}</h2>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

/* ----------------- Tela 1: Tópicos sequenciais ----------------- */
function ScreenTopics() {
  // Mini-visual de trilha vertical
  const items = [
    { state: "done" as const, label: "Tópico concluído", sub: "100% completo" },
    { state: "current" as const, label: "Tópico atual", sub: "Liberado para você avançar" },
    { state: "locked" as const, label: "Próximo tópico", sub: "Desbloqueia ao concluir o atual" },
  ];
  return (
    <>
      <Heading
        eyebrow="Tela 1 de 3"
        title="Tópicos sequenciais"
        subtitle="Você aprende seguindo uma trilha organizada por tópicos. Conclua um tópico por completo para desbloquear o próximo."
      />

      <div className="relative pl-7 sm:pl-9">
        {/* Linha vertical */}
        <span className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--success)] via-[#7c3aed] to-white/10 rounded-full" />
        <div className="space-y-3">
          {items.map((it, i) => {
            const Icon =
              it.state === "done" ? CheckCircle2 : it.state === "current" ? Circle : Lock;
            const color =
              it.state === "done" ? "var(--success)" : it.state === "current" ? "#5eead4" : "#94a3b8";
            return (
              <div
                key={i}
                className={cn(
                  "relative rounded-2xl border p-3 sm:p-4 flex items-center gap-3",
                  it.state === "current"
                    ? "border-[#5eead4]/40 bg-[#5eead4]/[0.06]"
                    : it.state === "done"
                      ? "border-[var(--success)]/30 bg-[var(--success)]/[0.06]"
                      : "border-white/10 bg-white/[0.03] opacity-70",
                )}
              >
                <span
                  className="absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#0f1419] border-2"
                  style={{ borderColor: color }}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                    {it.label}
                  </p>
                  <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5">{it.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { Icon: ClipboardCheck, label: "Ordem inteligente" },
          { Icon: Check, label: "Desbloqueio automático" },
          { Icon: ArrowRight, label: "Progresso contínuo" },
        ].map((p) => (
          <div
            key={p.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center"
          >
            <p.Icon className="h-4 w-4 mx-auto text-[#5eead4]" />
            <p className="mt-1.5 text-[11px] sm:text-xs font-medium leading-tight text-foreground/90">
              {p.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------- Tela 2: Sequência por tópico ----------------- */
function ScreenSequence() {
  const steps = [
    {
      Icon: Play,
      title: "1. Assista ao vídeo ou destaque",
      sub: "Cole o link, abra em outra aba e assista por completo.",
      color: "#f472b6",
    },
    {
      Icon: BookOpen,
      title: "2. Leia a apostila",
      sub: "Leia até o final para fixar o conteúdo antes de praticar.",
      color: "#a78bfa",
    },
    {
      Icon: ClipboardCheck,
      title: "3. Faça o exercício ou atividade",
      sub: "Pratique o que aprendeu respondendo as perguntas.",
      color: "#5eead4",
    },
    {
      Icon: Check,
      title: "4. Marque como concluído",
      sub: "Só marque depois de realmente terminar a etapa.",
      color: "var(--success)",
    },
  ];
  return (
    <>
      <Heading
        eyebrow="Tela 2 de 3"
        title="Vídeo → Apostila → Exercício"
        subtitle="Cada tópico segue uma sequência pensada para você aprender, revisar e praticar. Não pule etapas."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {steps.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 flex items-start gap-3"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${s.color} 22%, transparent)` }}
            >
              <s.Icon className="h-5 w-5" style={{ color: s.color }} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-[15px] font-semibold leading-tight text-foreground">
                {s.title}
              </p>
              <p className="mt-1 text-xs sm:text-[13px] leading-snug text-muted-foreground">
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------- Tela 3: Provas ----------------- */
function ScreenExams() {
  const cards = [
    { Icon: ShieldCheck, label: "Mínimo de 70%", sub: "Para avançar de tópico." },
    { Icon: FilePen, label: "Correção manual", sub: "Questões abertas são lidas pelo gestor." },
    { Icon: MessageSquare, label: "Feedback do gestor", sub: "Você recebe o retorno de cada resposta." },
    { Icon: CheckCircle2, label: "Aprovação libera", sub: "Só avança quem atinge a nota mínima." },
  ];
  return (
    <>
      <Heading
        eyebrow="Tela 3 de 3"
        title="Provas com aprovação mínima"
        subtitle="Para avançar, você precisa atingir a pontuação mínima nas provas. O gestor corrige as questões abertas e envia o feedback."
      />

      <div className="mb-4 flex items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-[#5eead4]/30 to-[#7c3aed]/30 flex items-center justify-center border-2 border-[#5eead4]/40 shadow-[0_0_40px_-5px_rgba(94,234,212,0.4)]">
            <span className="text-2xl sm:text-3xl font-bold text-[#5eead4]">70%</span>
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-[#0f1419] px-2">
            Nota mínima
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-3.5 flex items-start gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5eead4]/15 border border-[#5eead4]/30">
              <c.Icon className="h-4 w-4 text-[#5eead4]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-foreground">{c.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
