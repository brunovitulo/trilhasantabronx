// Revisão Inteligente — matriz de revisões, pesos e mini-resumos por módulo.
//
// As perguntas usadas nas revisões vêm dos subtasks `practice`/`evaluation`
// já existentes em `src/data/topics.ts` — não há banco paralelo.

import { TOPICS, type QuizQuestion, type Topic } from "@/data/topics";

export type ModuleWeight = 1 | 2 | 3;

export type ReviewReason =
  | "D+1"
  | "D+2"
  | "D+3"
  | "D+4"
  | "D+5"
  | "D+7"
  | "D+10"
  | "D+15"
  | "D+30"
  | "Reforço por erro"
  | "Ponto crítico"
  | "Revisão inicial — primeiros 15 dias";

export type ReviewStatus = "pending" | "completed" | "expired" | "skipped";

export type ScheduledReview = {
  id: string;
  user_id: string;
  module_id: string;
  module_name: string;
  weight: ModuleWeight;
  due_date: string; // YYYY-MM-DD
  reason: ReviewReason | string;
  status: ReviewStatus;
  question_count: number;
  estimated_minutes: number;
  score_percent: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type ModuleReviewConfig = {
  weight: ModuleWeight;
  offsets: number[]; // dias a somar à data de conclusão
  questionCount: number;
  estimatedMinutes: number;
  miniSummary: string[]; // 3-5 bullets curtos
};

// Mapeamento dos módulos reais → peso, matriz e mini-resumo.
// Apenas módulos listados aqui geram revisão automática.
export const MODULE_REVIEW: Record<string, ModuleReviewConfig> = {
  apresentacao: {
    weight: 1,
    offsets: [1, 3, 7],
    questionCount: 4,
    estimatedMinutes: 4,
    miniSummary: [
      "Conheça onde fica cada categoria antes de atender — agilidade vem de saber a loja de cor.",
      "Padrão de organização é responsabilidade de todos: produto fora do lugar atrapalha venda.",
      "O site é vitrine: saiba indicar produto pelo nome correto e mostrar fotos reais.",
      "Em dúvida, peça ajuda — nunca invente informação sobre produto.",
    ],
  },
  embalar: {
    weight: 1,
    offsets: [1, 3, 7],
    questionCount: 5,
    estimatedMinutes: 5,
    miniSummary: [
      "Confira o pedido antes de embalar: produto, quantidade e voltagem.",
      "Teste todo eletrônico antes de fechar o pacote.",
      "Embalagem é sempre discreta — sem nome da loja, sem identificação do produto.",
      "Só marque como enviado quando o motoboy realmente sair com o pedido.",
      "Valide o endereço no mapa antes de chamar a corrida.",
    ],
  },
  responsabilidade: {
    weight: 2,
    offsets: [1, 2, 4, 7, 15],
    questionCount: 6,
    estimatedMinutes: 6,
    miniSummary: [
      "Você é responsável pelo pedido do início ao fim — não terceirize o erro.",
      "Status do pedido é verdade: nunca marque enviado antes da saída real.",
      "Antes do envio: produto certo, endereço certo, contato certo.",
      "Dúvida no pedido = pergunte antes de despachar.",
      "Cliente reclamou? Resolva sem julgar e sem prometer o que não pode cumprir.",
    ],
  },
  vendas: {
    weight: 2,
    offsets: [1, 2, 4, 7, 15],
    questionCount: 6,
    estimatedMinutes: 6,
    miniSummary: [
      "Pergunte antes de indicar — venda consultiva começa entendendo a necessidade.",
      "Simpatia + agilidade ganham mais que insistência.",
      "Não venda no automático: cada cliente tem uma dor diferente.",
      "Quebre objeções com informação, não com pressão.",
      "Fechamento é consequência de bom atendimento, não de empurrar produto.",
    ],
  },
  objecoes: {
    weight: 3,
    offsets: [1, 2, 3, 5, 7, 10, 15, 30],
    questionCount: 8,
    estimatedMinutes: 9,
    miniSummary: [
      "Entrega é 100% discreta: embalagem lacrada, sem nome da loja, motoboy não sabe o conteúdo.",
      "Nome na fatura: explique como aparece e tranquilize antes do cliente perguntar de novo.",
      "Vergonha do cliente é normal — atenda sem julgar e use linguagem neutra.",
      "Segurança e sigilo são argumentos fortes: reforce sempre.",
      "Objeção não é não — é pedido de mais informação.",
    ],
  },
  dores: {
    weight: 3,
    offsets: [1, 2, 3, 5, 7, 10, 15, 30],
    questionCount: 8,
    estimatedMinutes: 10,
    miniSummary: [
      "Disfunção e ejaculação precoce: indique apoio, nunca prometa cura.",
      "Dor em relação = sinal para indicar lubrificante adequado e cuidado, não anestésico solto.",
      "Libido baixa tem mil causas — produto ajuda, mas não substitui acompanhamento.",
      "Antes de indicar, pergunte: experiência anterior, objetivo, expectativa.",
      "Nunca prometa resultado milagroso. Honestidade fideliza cliente.",
    ],
  },
  produtos: {
    weight: 3,
    offsets: [1, 2, 3, 5, 7, 10, 15, 30],
    questionCount: 10,
    estimatedMinutes: 12,
    miniSummary: [
      "Capa peniana é estímulo — NÃO substitui camisinha em nenhuma hipótese.",
      "Perfume com feromônio ajuda na presença, não garante desejo automático.",
      "Anestésico é cuidado pontual, não solução para dor recorrente.",
      "Diferencie produtos parecidos: rabbit ≠ varinha mágica ≠ sugador de clitóris.",
      "Antes de indicar, pergunte: para quem é, primeira vez, objetivo.",
    ],
  },
  presencial: {
    weight: 2,
    offsets: [1, 2, 4, 7, 15],
    questionCount: 5,
    estimatedMinutes: 5,
    miniSummary: [
      "Atenda presencial com a mesma discrição do online.",
      "Linguagem neutra, sem julgar perfil de cliente.",
      "Se o cliente está acompanhado, atenda quem está comprando.",
      "Não exponha cliente em frente a outros — leve para um canto reservado se necessário.",
    ],
  },
};

// Tags consideradas críticas — qualquer questão cuja tag bate aqui é tratada
// como questão crítica (gera reforço obrigatório no dia seguinte).
export const CRITICAL_TAGS = new Set<string>([
  "capa peniana",
  "marcar enviado",
  "endereço",
  "eletrônico",
  "motoboy",
  "promessa indevida",
  "disfunção erétil",
  "ejaculação precoce",
  "anestésico",
]);

export type ReviewQuestion = QuizQuestion & {
  questionId: string;
  moduleId: string;
  theme?: string;
  tags?: string[];
  isCritical?: boolean;
  memoryTip?: string;
  wrongAnswerExplanation?: string;
};

// Coleta perguntas disponíveis em um módulo a partir dos subtasks practice/evaluation.
export function collectModuleQuestions(moduleId: string): ReviewQuestion[] {
  const topic: Topic | undefined = TOPICS.find((t) => t.id === moduleId);
  if (!topic) return [];
  const out: ReviewQuestion[] = [];
  for (const s of topic.subtasks) {
    if (s.kind !== "practice" && s.kind !== "evaluation") continue;
    s.questions.forEach((q, i) => {
      out.push({
        ...q,
        questionId: `${s.id}#${i}`,
        moduleId,
      });
    });
  }
  return out;
}

// Seleciona N perguntas embaralhadas, priorizando questões com tags
// presentes em `wrongTags` (temas que a atendente errou antes).
export function pickReviewQuestions(
  moduleId: string,
  count: number,
  wrongTags: Set<string> = new Set(),
): ReviewQuestion[] {
  const pool = collectModuleQuestions(moduleId);
  if (pool.length === 0) return [];
  // separa prioritárias e demais
  const priority: ReviewQuestion[] = [];
  const rest: ReviewQuestion[] = [];
  for (const q of pool) {
    const hasWrongTag = (q.tags ?? []).some((t) => wrongTags.has(t));
    if (hasWrongTag) priority.push(q);
    else rest.push(q);
  }
  const shuffle = <T,>(arr: T[]) => arr.slice().sort(() => Math.random() - 0.5);
  const picked = [...shuffle(priority), ...shuffle(rest)].slice(0, count);
  // se faltou, repete embaralhado
  while (picked.length < count && pool.length > 0) {
    picked.push(shuffle(pool)[0]);
  }
  return picked;
}

export function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function reasonForOffset(offset: number): ReviewReason {
  return `D+${offset}` as ReviewReason;
}

export function moduleNameOf(moduleId: string): string {
  return TOPICS.find((t) => t.id === moduleId)?.title ?? moduleId;
}
