import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Hand,
  ListChecks,
  Lightbulb,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Topic } from "@/data/topics";

type Props = {
  topic: Topic;
  storageKey: string;
  onClose: () => void;
};

const TOTAL = 3;

const CONFIRMATIONS = [
  "Entendi o objetivo deste tópico",
  "Entendi como este tópico funciona",
  "Entendi como este tópico funciona e vou seguir as etapas na ordem.",
];

export function TopicIntroGuide({ topic, storageKey, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false]);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
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

  const kinds = useMemo(() => new Set(topic.subtasks.map((s) => s.kind)), [topic]);

  function toggle(i: number, v: boolean) {
    setConfirmed((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  function markSeenAndClose() {
    if (closing) return;
    setClosing(true);
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {
      // ignore
    }
    onClose();
  }

  const canAdvance = confirmed[step];
  const isLast = step === TOTAL - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-2xl my-auto">
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
            Tela {step + 1} de {TOTAL}
          </span>
        </div>

        <div
          key={step}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0f2e]/95 via-[#0f1419]/95 to-[#0a1014]/95 p-5 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {step === 0 && <ScreenWhat topic={topic} />}
          {step === 1 && <ScreenHow kinds={kinds} />}
          {step === 2 && <ScreenFinish />}

          <div className="mt-6 rounded-2xl border border-[#5eead4]/30 bg-[#5eead4]/[0.06] p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`topic-confirm-${step}`}
                checked={confirmed[step]}
                onCheckedChange={(v) => toggle(step, !!v)}
                className="mt-0.5 data-[state=checked]:bg-[#5eead4] data-[state=checked]:border-[#5eead4] data-[state=checked]:text-black"
              />
              <Label
                htmlFor={`topic-confirm-${step}`}
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
              if (isLast) markSeenAndClose();
              else setStep((s) => s + 1);
            }}
            disabled={!canAdvance || closing}
            size="lg"
            className={cn(
              "mt-5 w-full text-base font-semibold h-12",
              isLast
                ? "bg-[#ec4899] hover:bg-[#db2777] text-white"
                : "bg-[#7c3aed] hover:bg-[#6d28d9] text-white",
            )}
          >
            {isLast ? (
              <>
                <Rocket className="h-5 w-5" /> Começar tópico <ArrowRight className="h-5 w-5" />
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

type CardItem = { Icon: LucideIcon; label: string; sub: string; color: string };

function CardsGrid({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {items.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 flex items-start gap-3"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${c.color} 22%, transparent)` }}
          >
            <c.Icon className="h-5 w-5" style={{ color: c.color }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-[15px] font-semibold leading-tight text-foreground">
              {c.label}
            </p>
            <p className="mt-1 text-xs sm:text-[13px] leading-snug text-muted-foreground">
              {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------- Tela 1: O que você vai aprender ----------------- */
function ScreenWhat({ topic }: { topic: Topic }) {
  const desc =
    (topic as { description?: string }).description?.trim() ||
    topic.summary?.trim() ||
    "Neste tópico, você vai entender os principais pontos para executar essa parte do atendimento com segurança e padrão Santa Bronx.";

  const cards: CardItem[] = [
    {
      Icon: Target,
      label: "Objetivo do tópico",
      sub: "Aprender o essencial para aplicar no dia a dia.",
      color: "#a78bfa",
    },
    {
      Icon: Sparkles,
      label: "Padrão Santa Bronx",
      sub: "Seguir o jeito Santa Bronx de atender e vender.",
      color: "#f472b6",
    },
    {
      Icon: Lightbulb,
      label: "Aprendizado na prática",
      sub: "Conteúdo curto, direto e fácil de aplicar.",
      color: "#5eead4",
    },
  ];

  return (
    <>
      <Heading eyebrow="Antes de começar — Tela 1 de 3" title={topic.title} subtitle={desc} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-center"
          >
            <div
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${c.color} 22%, transparent)` }}
            >
              <c.Icon className="h-5 w-5" style={{ color: c.color }} />
            </div>
            <p className="mt-2 text-sm font-semibold leading-tight text-foreground">{c.label}</p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------- Tela 2: Como este tópico funciona ----------------- */
function ScreenHow({ kinds }: { kinds: Set<string> }) {
  const items: CardItem[] = [];

  if (kinds.has("video")) {
    items.push({
      Icon: Play,
      label: "Assista",
      sub: "Veja o conteúdo inicial para entender o contexto.",
      color: "#f472b6",
    });
  }
  if (kinds.has("reading") || kinds.has("apostila")) {
    items.push({
      Icon: BookOpen,
      label: "Leia",
      sub: "Use a apostila para fixar os pontos importantes.",
      color: "#a78bfa",
    });
  }
  if (
    kinds.has("practice") ||
    kinds.has("checklist") ||
    kinds.has("multi_checklist") ||
    kinds.has("inline_html") ||
    kinds.has("dual_inline_html") ||
    kinds.has("external_html")
  ) {
    items.push({
      Icon: ClipboardCheck,
      label: "Pratique",
      sub: "Faça exercícios, checklists e atividades para aplicar o que aprendeu.",
      color: "#5eead4",
    });
  }
  if (kinds.has("product_links")) {
    items.push({
      Icon: Tag,
      label: "Conheça os produtos",
      sub: "Abra os produtos indicados para entender nomes, imagens e detalhes.",
      color: "#fbbf24",
    });
  }
  if (kinds.has("evaluation") || kinds.has("open_evaluation")) {
    items.push({
      Icon: ShieldCheck,
      label: "Comprove",
      sub: "Quando houver prova, responda com atenção e aguarde a correção.",
      color: "#60a5fa",
    });
  }
  if (kinds.has("credentials")) {
    items.push({
      Icon: Hand,
      label: "Acesso",
      sub: "Guarde as credenciais — você vai precisar nas próximas etapas.",
      color: "#fb7185",
    });
  }

  // Garante no mínimo um card
  if (items.length === 0) {
    items.push({
      Icon: ListChecks,
      label: "Etapas guiadas",
      sub: "Siga cada etapa na ordem para concluir o tópico.",
      color: "#5eead4",
    });
  }

  // Limita visualmente a no máximo 5 cards
  const limited = items.slice(0, 5);

  return (
    <>
      <Heading
        eyebrow="Tela 2 de 3"
        title="Como este tópico funciona"
        subtitle="As etapas estão agrupadas por tipo. Você avança em sequência, sem pular."
      />
      <CardsGrid items={limited} />
    </>
  );
}

/* ----------------- Tela 3: Como concluir corretamente ----------------- */
function ScreenFinish() {
  const items: CardItem[] = [
    {
      Icon: ArrowRight,
      label: "Siga a ordem",
      sub: "Complete as etapas na sequência para liberar os próximos passos.",
      color: "#a78bfa",
    },
    {
      Icon: Eye,
      label: "Não marque sem fazer",
      sub: "Só confirme uma etapa depois de realmente assistir, ler ou responder.",
      color: "#5eead4",
    },
    {
      Icon: Trophy,
      label: "Aproveite o feedback",
      sub: "Nas provas, o gestor corrige e orienta seu desenvolvimento.",
      color: "#f472b6",
    },
    {
      Icon: CheckCircle2,
      label: "Conclua com atenção",
      sub: "Concluir certo desbloqueia os próximos tópicos da trilha.",
      color: "var(--success)",
    },
  ];

  return (
    <>
      <Heading
        eyebrow="Tela 3 de 3"
        title="Como concluir corretamente"
        subtitle="Algumas regras simples para você aproveitar melhor o tópico."
      />
      <CardsGrid items={items} />
    </>
  );
}

export function topicIntroStorageKey(userId: string, topicId: string, version: string | null) {
  const v = version ?? "init";
  return `sbx:topic-intro:v2:${userId}:${topicId}:reset=${v}`;
}

// Suppress unused import lints for icons reserved for future use
void Check;
