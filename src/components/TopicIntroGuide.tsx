import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FilePen,
  Hand,
  ListChecks,
  Play,
  Rocket,
  ShieldCheck,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Subtask, Topic } from "@/data/topics";

type Props = {
  topic: Topic;
  storageKey: string;
  onClose: () => void;
};

type StepMeta = {
  Icon: LucideIcon;
  label: string;
  why: string;
};

function metaFor(s: Subtask): StepMeta {
  switch (s.kind) {
    case "video":
      return {
        Icon: Play,
        label: "Vídeo / destaque",
        why: "Assista primeiro para entender o contexto de forma visual e prática.",
      };
    case "reading":
    case "apostila":
      return {
        Icon: BookOpen,
        label: "Apostila",
        why: "Leia a apostila para fixar os conceitos, exemplos e padrões que você deve seguir.",
      };
    case "practice":
      return {
        Icon: ClipboardCheck,
        label: "Exercício",
        why: "Faça o exercício para testar se você realmente entendeu antes de avançar.",
      };
    case "checklist":
    case "multi_checklist":
      return {
        Icon: ListChecks,
        label: "Checklist",
        why: "Use o checklist para conferir se consegue aplicar o conteúdo na prática.",
      };
    case "evaluation":
    case "open_evaluation":
      return {
        Icon: ShieldCheck,
        label: "Prova",
        why: "A prova confirma se você está pronta para concluir o tópico. Algumas respostas podem ser corrigidas pelo gestor.",
      };
    case "product_links":
      return {
        Icon: Tag,
        label: "Produtos",
        why: "Abra os produtos indicados para conhecer nomes, imagens, descrições e detalhes importantes para vender melhor.",
      };
    case "external_html":
    case "inline_html":
    case "dual_inline_html":
      return {
        Icon: FilePen,
        label: "Conteúdo",
        why: "Conteúdo de apoio: leia/explore com atenção antes de confirmar a conclusão.",
      };
    case "credentials":
      return {
        Icon: Hand,
        label: "Acesso",
        why: "Guarde as credenciais com cuidado — você vai precisar delas nas próximas etapas.",
      };
    default:
      return { Icon: Check, label: "Etapa", why: "Conclua esta etapa com atenção antes de seguir." };
  }
}

export function TopicIntroGuide({ topic, storageKey, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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

  function seeLater() {
    // Não persiste — vai aparecer no próximo acesso.
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0f2e]/95 via-[#0f1419]/95 to-[#0a1014]/95 p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="text-center mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a78bfa] mb-2">
              Antes de começar
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {topic.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
              Veja como este tópico funciona e por que cada etapa é importante para seu aprendizado.
            </p>
          </div>

          {/* Seção 1: O que você vai aprender */}
          <Section title="O que você vai aprender">
            <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/85">
              {topic.summary?.trim() ||
                "Neste tópico, você vai entender os principais pontos para executar essa parte do atendimento com mais segurança e padrão Santa Bronx."}
            </p>
          </Section>

          {/* Seção 2: Como seguir as etapas */}
          <Section title="Como seguir as etapas">
            <ol className="space-y-2">
              {topic.subtasks.map((s, i) => {
                const m = metaFor(s);
                return (
                  <li
                    key={s.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/25 text-[#c4b5fd] text-[12px] font-bold border border-[#7c3aed]/40">
                      {i + 1}
                    </span>
                    <m.Icon className="h-4 w-4 shrink-0 mt-1 text-[#5eead4]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] sm:text-sm font-semibold leading-tight text-foreground">
                        {s.title}
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {m.label}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[12px] sm:text-[13px] leading-snug text-muted-foreground">
                        {m.why}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>

          {/* Seção 3: Como concluir corretamente */}
          <Section title="Como concluir corretamente">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Siga a ordem das etapas — não pule.",
                "Em vídeos/destaques, assista por completo antes de clicar em Já assisti.",
                "Em apostilas, leia antes de confirmar a conclusão.",
                "Responda exercícios e provas com atenção real.",
                "Não marque como concluído sem realmente fazer.",
                "Concluir certo ajuda o sistema a liberar os próximos passos e gerar revisões melhores.",
              ].map((txt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#5eead4]" />
                  <span className="text-[12px] sm:text-[13px] leading-snug text-foreground/85">
                    {txt}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Confirmação */}
          <div className="mt-5 rounded-2xl border border-[#5eead4]/30 bg-[#5eead4]/[0.06] p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="topic-intro-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(!!v)}
                className="mt-0.5 data-[state=checked]:bg-[#5eead4] data-[state=checked]:border-[#5eead4] data-[state=checked]:text-black"
              />
              <Label
                htmlFor="topic-intro-confirm"
                className="cursor-pointer text-sm sm:text-base font-medium leading-snug text-foreground"
              >
                Entendi como este tópico funciona e vou seguir as etapas na ordem.
              </Label>
            </div>
            {!confirmed && (
              <p className="mt-2 pl-7 text-[11px] text-muted-foreground">
                Marque a confirmação acima para começar o tópico.
              </p>
            )}
          </div>

          <Button
            onClick={markSeenAndClose}
            disabled={!confirmed || closing}
            size="lg"
            className={cn(
              "mt-5 w-full text-base font-semibold h-12 bg-[#7c3aed] hover:bg-[#6d28d9] text-white",
            )}
          >
            <Rocket className="h-5 w-5" /> Começar tópico <ArrowRight className="h-5 w-5" />
          </Button>

          <button
            type="button"
            onClick={seeLater}
            disabled={closing}
            className="mt-3 mx-auto block text-xs text-muted-foreground hover:text-foreground/80 underline underline-offset-4"
          >
            Ver depois
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5eead4] mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

export function topicIntroStorageKey(userId: string, topicId: string, version: string | null) {
  const v = version ?? "init";
  return `sbx:topic-intro:${userId}:${topicId}:v=${v}`;
}
