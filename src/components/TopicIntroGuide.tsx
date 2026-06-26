import { useEffect, useState } from "react";
import { ArrowRight, Rocket, AlertTriangle } from "lucide-react";
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

type Card = { icon: string; title: string; text: string; color: string };

type IntroContent = {
  subtitle: string;
  importanceCards: Card[];
  formationCards: Card[];
  riskCards: Card[];
};

const COLORS = {
  teal: "#5eead4",
  purple: "#a78bfa",
  pink: "#f472b6",
  amber: "#fbbf24",
  blue: "#60a5fa",
  rose: "#fb7185",
  green: "#86efac",
  orange: "#fb923c",
};

const TOPIC_INTRO_CONTENT: Record<string, IntroContent> = {
  apresentacao: {
    subtitle:
      "Conhecer a loja por dentro é o primeiro passo para falar com segurança e parecer parte da Santa Bronx desde o primeiro dia.",
    importanceCards: [
      { icon: "🏪", title: "Conhecer a loja", text: "Saber onde fica cada coisa para responder rápido.", color: COLORS.teal },
      { icon: "🧭", title: "Padrão da marca", text: "Entender o jeito Santa Bronx de atender.", color: COLORS.purple },
      { icon: "💻", title: "Site na ponta", text: "Saber navegar para mostrar produtos ao cliente.", color: COLORS.pink },
      { icon: "✨", title: "Boa impressão", text: "Loja organizada transmite confiança.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "📖", title: "História", text: "Contar a origem da loja quando a cliente perguntar.", color: COLORS.purple },
      { icon: "🧹", title: "Organização", text: "Manter a loja apresentável o dia todo.", color: COLORS.teal },
      { icon: "🎯", title: "Padrão visual", text: "Reconhecer o que é Santa Bronx e o que não é.", color: COLORS.pink },
      { icon: "🛒", title: "Site", text: "Encontrar produtos e categorias rapidinho.", color: COLORS.blue },
    ],
    riskCards: [
      { icon: "❓", title: "Travar em pergunta básica", text: "Não saber explicar sobre a loja passa insegurança.", color: COLORS.rose },
      { icon: "😶", title: "Parecer despreparada", text: "Cliente percebe quando você não conhece o lugar.", color: COLORS.orange },
      { icon: "🐢", title: "Demorar no site", text: "Perder tempo procurando produto na frente da cliente.", color: COLORS.amber },
      { icon: "🪟", title: "Loja desleixada", text: "Quebra a primeira impressão e afasta cliente.", color: COLORS.pink },
    ],
  },
  embalar: {
    subtitle:
      "A embalagem é o último contato com a cliente. Bem feita, ela vira presente. Mal feita, vira reclamação e prejuízo.",
    importanceCards: [
      { icon: "📦", title: "Cliente feliz", text: "Receber um pedido bonito gera encantamento.", color: COLORS.teal },
      { icon: "🛡️", title: "Sem dano", text: "Produto chega íntegro, sem troca nem reembolso.", color: COLORS.purple },
      { icon: "🤫", title: "Discrição", text: "Embalagem neutra protege a privacidade da cliente.", color: COLORS.pink },
      { icon: "🚚", title: "Saída rápida", text: "Pedido pronto na hora certa não atrasa entrega.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "📋", title: "Checklist", text: "Conferir tudo antes de fechar a caixa.", color: COLORS.teal },
      { icon: "🎁", title: "Padrão visual", text: "Embalar do jeito Santa Bronx, não improvisado.", color: COLORS.purple },
      { icon: "🏷️", title: "Etiquetas", text: "Colar a etiqueta certa no pedido certo.", color: COLORS.blue },
      { icon: "✅", title: "Conferência", text: "Garantir que nada está faltando antes de despachar.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "💥", title: "Produto quebrado", text: "Embalagem fraca gera prejuízo e reclamação.", color: COLORS.rose },
      { icon: "🔁", title: "Pedido trocado", text: "Mandar item errado obriga reenvio e perda.", color: COLORS.orange },
      { icon: "👀", title: "Quebra de sigilo", text: "Embalagem indiscreta expõe a cliente.", color: COLORS.pink },
      { icon: "⭐", title: "Avaliação ruim", text: "Cliente insatisfeita derruba reputação da loja.", color: COLORS.amber },
    ],
  },
  responsabilidade: {
    subtitle:
      "Aqui você entende o que se espera de você como atendente Santa Bronx e como usar as ferramentas certas do dia a dia.",
    importanceCards: [
      { icon: "🤝", title: "Compromisso", text: "Cliente confia em quem assume responsabilidade.", color: COLORS.teal },
      { icon: "📱", title: "Ferramentas", text: "Saber usar o app evita erro e retrabalho.", color: COLORS.purple },
      { icon: "⏰", title: "Pontualidade", text: "Tempo da cliente é tempo de venda.", color: COLORS.pink },
      { icon: "🎯", title: "Postura", text: "Atitude profissional faz parte do padrão.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "🔐", title: "Acessos", text: "Entrar nos sistemas certos com segurança.", color: COLORS.teal },
      { icon: "📚", title: "Materiais", text: "Saber onde achar apostilas e referências.", color: COLORS.purple },
      { icon: "✅", title: "Expectativas", text: "Entender o que será cobrado de você.", color: COLORS.blue },
      { icon: "💪", title: "Autonomia", text: "Resolver mais sem precisar perguntar tudo.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "🚪", title: "Não acessar sistemas", text: "Fica travada e atrasa o atendimento.", color: COLORS.rose },
      { icon: "🤷", title: "Falta de postura", text: "Cliente percebe e perde confiança.", color: COLORS.orange },
      { icon: "❌", title: "Quebrar regras", text: "Erro evitável vira advertência.", color: COLORS.pink },
      { icon: "📉", title: "Baixo desempenho", text: "Sem padrão, os resultados caem.", color: COLORS.amber },
    ],
  },
  vendas: {
    subtitle:
      "Esse tópico mostra por que vender bem começa antes de oferecer produto: começa em ouvir, entender e conduzir o cliente com segurança.",
    importanceCards: [
      { icon: "⚡", title: "Resposta rápida", text: "Evita que o cliente esfrie ou compre em outra loja.", color: COLORS.teal },
      { icon: "👂", title: "Escuta ativa", text: "Ajuda a descobrir a real necessidade antes de indicar.", color: COLORS.purple },
      { icon: "🤝", title: "Confiança", text: "Faz a cliente sentir que está sendo bem orientada.", color: COLORS.pink },
      { icon: "🎯", title: "Venda melhor", text: "A oferta fica mais certeira e mais fácil de fechar.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "💬", title: "Abordagem", text: "Iniciar o atendimento sem parecer insistente.", color: COLORS.teal },
      { icon: "🔎", title: "Diagnóstico", text: "Fazer perguntas para entender o que o cliente precisa.", color: COLORS.purple },
      { icon: "🛍️", title: "Oferta com motivo", text: "Indicar produtos explicando por que fazem sentido.", color: COLORS.blue },
      { icon: "✅", title: "Fechamento", text: "Conduzir a cliente para a decisão com segurança.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "❌", title: "Indicar errado", text: "A solução pode não atender a necessidade.", color: COLORS.rose },
      { icon: "⏳", title: "Perder venda", text: "A demora faz a cliente desistir.", color: COLORS.orange },
      { icon: "😕", title: "Cliente inseguro", text: "A conversa parece sem direção.", color: COLORS.pink },
      { icon: "🔁", title: "Refazer etapas", text: "Dificuldade nos exercícios e provas.", color: COLORS.amber },
    ],
  },
  objecoes: {
    subtitle:
      "Toda venda tem objeções. Saber respondê-las com calma e argumento é o que separa atendente comum de atendente que fecha.",
    importanceCards: [
      { icon: "🛡️", title: "Não travar", text: "Ter resposta pronta evita perder a venda no susto.", color: COLORS.teal },
      { icon: "🧠", title: "Argumento real", text: "Responder com motivo, não com desculpa.", color: COLORS.purple },
      { icon: "💖", title: "Empatia", text: "Acolher a dúvida antes de rebater.", color: COLORS.pink },
      { icon: "📈", title: "Mais fechamento", text: "Cada objeção bem tratada vira venda.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "💸", title: "Preço", text: "Mostrar valor, não baixar preço de cara.", color: COLORS.teal },
      { icon: "🤔", title: "Vou pensar", text: "Reabrir a conversa sem pressionar.", color: COLORS.purple },
      { icon: "❓", title: "Funciona mesmo?", text: "Trazer prova social e segurança.", color: COLORS.blue },
      { icon: "⏱️", title: "Agora não", text: "Criar urgência sem soar insistente.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "🙊", title: "Ficar muda", text: "Sem resposta, a cliente sai da conversa.", color: COLORS.rose },
      { icon: "😤", title: "Discutir", text: "Confrontar a cliente queima a venda.", color: COLORS.orange },
      { icon: "💔", title: "Desistir cedo", text: "Aceitar 'não' no primeiro obstáculo.", color: COLORS.pink },
      { icon: "📉", title: "Baixa conversão", text: "Muitos atendimentos, poucas vendas.", color: COLORS.amber },
    ],
  },
  dores: {
    subtitle:
      "Cliente compra solução, não produto. Reconhecer a dor por trás da pergunta é o que faz a indicação acertar em cheio.",
    importanceCards: [
      { icon: "❤️‍🩹", title: "Entender a dor", text: "A cliente quer resolver algo, não comprar 'qualquer coisa'.", color: COLORS.teal },
      { icon: "🎯", title: "Indicação certa", text: "Sabendo a dor, você acerta o produto.", color: COLORS.purple },
      { icon: "🤐", title: "Tema sensível", text: "Saber conduzir conversa íntima com respeito.", color: COLORS.pink },
      { icon: "🌟", title: "Cliente fiel", text: "Quem se sente entendida volta a comprar.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "👂", title: "Identificar dor", text: "Reconhecer pelas palavras da cliente.", color: COLORS.teal },
      { icon: "🗣️", title: "Conversa segura", text: "Falar sobre intimidade sem constrangimento.", color: COLORS.purple },
      { icon: "💡", title: "Solução real", text: "Conectar a dor ao produto certo.", color: COLORS.blue },
      { icon: "🤲", title: "Acolhimento", text: "Validar o sentimento antes de oferecer.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "🙅", title: "Cliente travada", text: "Sem acolhimento, ela não conta a dor real.", color: COLORS.rose },
      { icon: "🎲", title: "Vender no chute", text: "Indicar sem entender e errar a solução.", color: COLORS.orange },
      { icon: "😳", title: "Constrangimento", text: "Falar mal o tema afasta a cliente.", color: COLORS.pink },
      { icon: "↩️", title: "Devolução", text: "Produto errado vira troca e reclamação.", color: COLORS.amber },
    ],
  },
  produtos: {
    subtitle:
      "Conhecer cada produto pelo nome, função e diferencial é o que permite indicar com firmeza, em vez de empurrar 'qualquer coisa parecida'.",
    importanceCards: [
      { icon: "🧠", title: "Domínio", text: "Saber o que vende dá autoridade na hora de indicar.", color: COLORS.teal },
      { icon: "🔍", title: "Diferenciais", text: "Mostrar por que esse produto é melhor pra cliente.", color: COLORS.purple },
      { icon: "💬", title: "Resposta firme", text: "Sem 'acho que' — você sabe o que está vendendo.", color: COLORS.pink },
      { icon: "💰", title: "Ticket maior", text: "Quem conhece produto faz combos e upgrades.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "🏷️", title: "Nomes", text: "Chamar cada produto pelo nome certo.", color: COLORS.teal },
      { icon: "⚙️", title: "Função", text: "Saber pra que serve e como funciona.", color: COLORS.purple },
      { icon: "👥", title: "Pra quem", text: "Identificar pra qual cliente cada produto serve.", color: COLORS.blue },
      { icon: "🔗", title: "Combinações", text: "Sugerir produtos que combinam entre si.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "🤔", title: "Não saber explicar", text: "Cliente percebe e perde a confiança na indicação.", color: COLORS.rose },
      { icon: "🌀", title: "Confundir produto", text: "Mandar item errado por não reconhecer.", color: COLORS.orange },
      { icon: "💸", title: "Perder upsell", text: "Sem domínio, você só vende o básico.", color: COLORS.pink },
      { icon: "📝", title: "Mal na prova", text: "Conteúdo extenso — sem atenção, não passa.", color: COLORS.amber },
    ],
  },
  presencial: {
    subtitle:
      "Atender presencialmente é diferente de atender no chat. Postura, olhar, tempo de resposta e abordagem mudam tudo.",
    importanceCards: [
      { icon: "👋", title: "Recepção", text: "A cliente decide nos primeiros segundos se confia.", color: COLORS.teal },
      { icon: "🚶‍♀️", title: "Condução", text: "Levar a cliente pela loja com naturalidade.", color: COLORS.purple },
      { icon: "💎", title: "Experiência", text: "Atendimento presencial bem feito vira recompra.", color: COLORS.pink },
      { icon: "🤐", title: "Discrição", text: "Tema delicado pede tato no presencial.", color: COLORS.amber },
    ],
    formationCards: [
      { icon: "🙂", title: "Abordagem", text: "Receber sem pressão e sem ignorar.", color: COLORS.teal },
      { icon: "👁️", title: "Leitura", text: "Perceber se a cliente quer conversar ou olhar.", color: COLORS.purple },
      { icon: "🛍️", title: "Demonstração", text: "Mostrar produto na mão com segurança.", color: COLORS.blue },
      { icon: "💳", title: "Fechamento", text: "Conduzir até o caixa com leveza.", color: COLORS.green },
    ],
    riskCards: [
      { icon: "😬", title: "Cliente sem graça", text: "Abordagem errada faz ela ir embora.", color: COLORS.rose },
      { icon: "🤫", title: "Falar alto demais", text: "Quebrar a discrição em tema íntimo.", color: COLORS.orange },
      { icon: "🚪", title: "Cliente saindo", text: "Sem condução, a venda escapa pela porta.", color: COLORS.pink },
      { icon: "👎", title: "Má reputação", text: "Atendimento ruim presencial vira boca a boca.", color: COLORS.amber },
    ],
  },
};

const FALLBACK: IntroContent = {
  subtitle:
    "Este tópico faz parte da formação Santa Bronx. Cada etapa foi pensada para você atender com mais segurança e padrão.",
  importanceCards: [
    { icon: "🎯", title: "Foco no cliente", text: "Conteúdo direto para aplicar no dia a dia.", color: COLORS.teal },
    { icon: "✨", title: "Padrão Santa Bronx", text: "Seguir o jeito da casa em cada atendimento.", color: COLORS.purple },
    { icon: "📚", title: "Base sólida", text: "Conhecimento que sustenta as próximas etapas.", color: COLORS.pink },
    { icon: "💪", title: "Mais confiança", text: "Você responde com firmeza no atendimento.", color: COLORS.amber },
  ],
  formationCards: [
    { icon: "📖", title: "Conteúdo", text: "Leitura e vídeo para entender o tema.", color: COLORS.teal },
    { icon: "✅", title: "Prática", text: "Exercícios para fixar o aprendizado.", color: COLORS.purple },
    { icon: "🛡️", title: "Validação", text: "Provas para comprovar o domínio.", color: COLORS.blue },
    { icon: "🚀", title: "Aplicação", text: "Levar para a rotina real da loja.", color: COLORS.green },
  ],
  riskCards: [
    { icon: "❌", title: "Aplicar errado", text: "Sem base, o atendimento sai fora do padrão.", color: COLORS.rose },
    { icon: "😕", title: "Insegurança", text: "Dúvidas atrapalham a venda.", color: COLORS.orange },
    { icon: "🔁", title: "Refazer", text: "Dificuldade nos exercícios e na prova.", color: COLORS.pink },
    { icon: "📉", title: "Resultados fracos", text: "Sem domínio, os números caem.", color: COLORS.amber },
  ],
};

const TOTAL = 3;
const CONFIRMATIONS = [
  "Entendi por que este tópico é importante",
  "Entendi o que vou desenvolver neste tópico",
  "Entendi por que este tópico é importante para meu atendimento.",
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

  const content = TOPIC_INTRO_CONTENT[topic.id] ?? FALLBACK;

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
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0f2e]/95 via-[#0f1419]/95 to-[#0a1014]/95 p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {step === 0 && (
            <Screen
              eyebrow="Antes de começar — Tela 1 de 3"
              title={topic.title}
              subtitle={content.subtitle}
              cards={content.importanceCards}
            />
          )}
          {step === 1 && (
            <Screen
              eyebrow="Tela 2 de 3 — Sua formação"
              title="O que você vai desenvolver"
              subtitle="Habilidades concretas que este tópico constrói na sua rotina de atendimento."
              cards={content.formationCards}
            />
          )}
          {step === 2 && (
            <Screen
              eyebrow="Tela 3 de 3 — Atenção"
              title="Se não prestar atenção, o que pode acontecer?"
              subtitle="Esses são os erros mais comuns de quem pula etapas. Evite cada um deles."
              cards={content.riskCards}
              variant="risk"
            />
          )}

          <div className="mt-6 rounded-2xl border border-[#5eead4]/30 bg-[#5eead4]/[0.07] p-3 sm:p-4">
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

function Screen({
  eyebrow,
  title,
  subtitle,
  cards,
  variant,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: Card[];
  variant?: "risk";
}) {
  const isRisk = variant === "risk";
  return (
    <>
      <div className="mb-5 text-center">
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.2em] mb-2",
            isRisk ? "text-[#fb7185]" : "text-[#a78bfa]",
          )}
        >
          {eyebrow}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          {isRisk && (
            <AlertTriangle className="inline-block h-6 w-6 mr-2 -mt-1 text-[#fb7185]" />
          )}
          {title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
          isRisk &&
            "rounded-2xl border border-[#fb7185]/25 bg-[#fb7185]/[0.05] p-3",
        )}
      >
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 flex items-start gap-3 transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, ${c.color} 14%, transparent), rgba(255,255,255,0.03))`,
              borderColor: `color-mix(in oklab, ${c.color} 30%, transparent)`,
            }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: `color-mix(in oklab, ${c.color} 25%, transparent)` }}
            >
              <span aria-hidden>{c.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-[15px] font-semibold leading-tight text-foreground">
                {c.title}
              </p>
              <p className="mt-1 text-xs sm:text-[13px] leading-snug text-muted-foreground">
                {c.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function topicIntroStorageKey(userId: string, topicId: string, version: string | null) {
  const v = version ?? "init";
  return `sbx:topic-intro:v3:${userId}:${topicId}:reset=${v}`;
}
