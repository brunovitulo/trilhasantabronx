import { useEffect, useState } from "react";
import {
  Map as MapIcon,
  Unlock,
  Play,
  ShieldCheck,
  BookOpen,
  Rocket,
  ClipboardList,
  MessageCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TOPICS } from "@/data/topics";

type Props = {
  userId: string;
  onFinish: () => void;
};

export function OnboardingFlow({ userId, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Bloqueia rolagem do body enquanto o onboarding está aberto.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function finish() {
    if (saving) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", userId);
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        {/* Indicador de progresso */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "h-2.5 w-8 bg-[#5eead4]"
                  : i < step
                    ? "h-2 w-2 bg-[#5eead4]/60"
                    : "h-2 w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        <div
          key={step}
          className="rounded-3xl border border-white/10 bg-[#0f1419]/95 p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {step === 0 && <Step1 onNext={() => setStep(1)} />}
          {step === 1 && <Step2 onNext={() => setStep(2)} />}
          {step === 2 && <Step3 onStart={finish} saving={saving} />}
        </div>
      </div>
    </div>
  );
}

function Header({
  Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  Icon: typeof MapIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-6">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ background: iconBg }}
      >
        <Icon className="h-8 w-8" style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}

function InfoCard({
  Icon,
  title,
  text,
  iconColor,
}: {
  Icon: typeof MapIcon;
  title: string;
  text: string;
  iconColor: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="shrink-0">
        <Icon className="h-5 w-5 mt-0.5" style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Header
        Icon={MapIcon}
        iconBg="rgba(168, 85, 247, 0.15)"
        iconColor="#c084fc"
        title="Como funciona a trilha"
        subtitle="Antes de começar, entenda como está organizado seu aprendizado."
      />
      <div className="space-y-3">
        <InfoCard
          Icon={Unlock}
          iconColor="#c084fc"
          title="Tópicos sequenciais"
          text="Você só desbloqueia o próximo tópico após concluir o anterior por completo."
        />
        <InfoCard
          Icon={Play}
          iconColor="#c084fc"
          title="Vídeo → Apostila → Exercício"
          text="Cada tópico segue essa ordem. Não pule etapas."
        />
        <InfoCard
          Icon={ShieldCheck}
          iconColor="#c084fc"
          title="Provas com aprovação mínima"
          text="Para avançar, você precisa tirar 70% ou mais nas provas. O gestor corrige e te dá feedback."
        />
      </div>
      <Button
        onClick={onNext}
        className="w-full mt-6 bg-[#a855f7] hover:bg-[#9333ea] text-white"
        size="lg"
      >
        Entendi, próximo →
      </Button>
    </>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  // Considera "desbloqueado de início" apenas o primeiro tópico real.
  return (
    <>
      <Header
        Icon={BookOpen}
        iconBg="rgba(94, 234, 212, 0.15)"
        iconColor="#5eead4"
        title="O que você vai aprender"
        subtitle="São 8 tópicos no total. Cada um te prepara para uma parte do seu trabalho."
      />
      <ol className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
        {TOPICS.map((topic, idx) => {
          const locked = idx > 0;
          return (
            <li
              key={topic.id}
              className={`flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 ${
                locked ? "opacity-50" : ""
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5eead4]/20 text-[#5eead4] text-xs font-bold">
                {topic.order}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm flex items-center gap-2">
                  {topic.title}
                  {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {locked ? "Desbloqueado conforme você avança" : topic.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <Button
        onClick={onNext}
        className="w-full mt-6 bg-[#14b8a6] hover:bg-[#0d9488] text-white"
        size="lg"
      >
        Próximo →
      </Button>
    </>
  );
}

function Step3({ onStart, saving }: { onStart: () => void; saving: boolean }) {
  return (
    <>
      <Header
        Icon={Rocket}
        iconBg="rgba(244, 114, 182, 0.15)"
        iconColor="#f472b6"
        title="Pronta para começar?"
        subtitle="Seu gestor vai acompanhar seu progresso. Faça cada etapa com calma e atenção."
      />
      <div className="space-y-3">
        <InfoCard
          Icon={ClipboardList}
          iconColor="#f472b6"
          title="Tarefas diárias"
          text="Todo dia você terá tarefas para revisar o que aprendeu. Acesse pelo ícone no topo."
        />
        <InfoCard
          Icon={MessageCircle}
          iconColor="#f472b6"
          title="Dúvidas?"
          text="Seu gestor está disponível no Discord durante o horário de trabalho. Pergunte antes de errar."
        />
      </div>
      <Button
        onClick={onStart}
        disabled={saving}
        className="w-full mt-6 bg-[#ec4899] hover:bg-[#db2777] text-white"
        size="lg"
      >
        {saving ? "Carregando..." : "Iniciar minha trilha 🚀"}
      </Button>
    </>
  );
}
