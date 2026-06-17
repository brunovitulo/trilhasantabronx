// Estrutura da trilha. Adicione/edite tópicos e subtarefas aqui.
// IDs devem ser únicos e estáveis (são salvos no banco como subtask_id).

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type Subtask =
  | {
      id: string;
      title: string;
      kind: "video";
      url: string;
      description?: string;
    }
  | {
      id: string;
      title: string;
      kind: "reading";
      description?: string;
      body: string; // markdown-ish (renderizado como prose)
    }
  | {
      id: string;
      title: string;
      kind: "checklist";
      description?: string;
      items: string[];
    }
  | {
      id: string;
      title: string;
      kind: "evaluation";
      description?: string;
      passingScore?: number; // default 70
      questions: QuizQuestion[];
    };

export type Topic = {
  id: string;
  order: number;
  title: string;
  summary: string;
  accent: string; // tailwind color class for the topic accent
  subtasks: Subtask[];
};

export const PASSING_SCORE = 70;

export const TOPICS: Topic[] = [
  {
    id: "apresentacao",
    order: 1,
    title: "Apresentação da loja",
    summary:
      "Conhecer a Santa Bronx: história, organização da loja e onde ficam os produtos.",
    accent: "from-fuchsia-500 to-purple-600",
    subtasks: [
      {
        id: "apresentacao.video",
        kind: "video",
        title: "Assistir destaque '1. História'",
        description:
          "Vá no Instagram @formar.atendente e assista o destaque 'História' do início ao fim.",
        url: "https://instagram.com/formar.atendente",
      },
      {
        id: "apresentacao.apostila",
        kind: "reading",
        title: "Ler apostila de apresentação",
        body: `**A Santa Bronx** é uma loja de produtos eróticos focada em atender com discrição, simpatia e conhecimento real do que cada cliente precisa.

**O que você precisa saber agora:**
- O nome da loja e o estilo da nossa comunicação (descontraído, sem julgamento).
- Onde ficam fisicamente as principais categorias de produto na loja.
- O nosso diferencial: indicar **a solução certa para a dor do cliente**, não empurrar produto.

**Próximos passos depois desta leitura:** assistir os destaques de organização e começar a aprender a despachar pedidos.`,
      },
      {
        id: "apresentacao.quiz",
        kind: "evaluation",
        title: "Avaliação: apresentação da loja",
        description: "Quiz de fixação. Nota mínima: 70%.",
        questions: [
          {
            question: "Qual o principal diferencial do atendimento da Santa Bronx?",
            options: [
              "Empurrar o produto mais caro",
              "Indicar a solução certa para a dor do cliente",
              "Falar o mínimo possível com o cliente",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual é o tom da comunicação da loja?",
            options: [
              "Formal e técnico",
              "Descontraído e sem julgamento",
              "Silencioso",
            ],
            correctIndex: 1,
          },
          {
            question: "Depois desta apresentação, o que vem em seguida na trilha?",
            options: [
              "Atender presencialmente sozinha",
              "Aprender a embalar e despachar pedidos",
              "Fechar o caixa",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "embalar",
    order: 2,
    title: "Embalar e despachar pedidos",
    summary:
      "Aprender o passo a passo de embalagem e despacho pelo app da 99 Entregas.",
    accent: "from-rose-500 to-pink-600",
    subtasks: [
      {
        id: "embalar.video",
        kind: "video",
        title: "Assistir destaque '2. embalar'",
        url: "https://instagram.com/formar.atendente",
      },
      {
        id: "embalar.checklist",
        kind: "checklist",
        title: "Checklist: embalar 3 pedidos reais",
        description: "Marque cada item conforme for executando ao vivo na loja.",
        items: [
          "Conferir o pedido no sistema interno",
          "Separar os produtos certos (nome e quantidade)",
          "Embalar com discrição (embalagem neutra)",
          "Solicitar entrega no app 99 Entregas",
          "Marcar o pedido como despachado no sistema",
        ],
      },
      {
        id: "embalar.quiz",
        kind: "evaluation",
        title: "Avaliação: processo de embalagem e despacho",
        questions: [
          {
            question: "Qual é o primeiro passo antes de embalar um pedido?",
            options: [
              "Chamar o motoboy",
              "Conferir o pedido no sistema interno",
              "Tirar foto do produto",
            ],
            correctIndex: 1,
          },
          {
            question: "Como deve ser a embalagem?",
            options: [
              "Sempre transparente",
              "Discreta, neutra, sem indicar o conteúdo",
              "Com o nome da loja em destaque",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual app usamos para despachar entregas?",
            options: ["iFood", "99 Entregas", "Uber"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "sistema",
    order: 3,
    title: "Sistema de pedidos",
    summary: "Acessar e usar o sistema interno onde ficam os pedidos da loja.",
    accent: "from-amber-500 to-orange-600",
    subtasks: [
      {
        id: "sistema.video",
        kind: "video",
        title: "Assistir destaque '6. Site'",
        url: "https://instagram.com/formar.atendente",
      },
      {
        id: "sistema.checklist",
        kind: "checklist",
        title: "Acessar o sistema e navegar",
        items: [
          "Entrar no sistema com o login fornecido",
          "Localizar a lista de pedidos do dia",
          "Abrir um pedido e identificar produtos, cliente e endereço",
          "Marcar um pedido teste como 'despachado'",
        ],
      },
      {
        id: "sistema.quiz",
        kind: "evaluation",
        title: "Avaliação: sistema de pedidos",
        questions: [
          {
            question: "Onde você encontra os pedidos do dia?",
            options: [
              "No grupo do WhatsApp",
              "Na lista de pedidos do sistema interno",
              "No e-mail",
            ],
            correctIndex: 1,
          },
          {
            question: "O que você marca no sistema depois de entregar o pedido ao motoboy?",
            options: ["Cancelado", "Despachado", "Em separação"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "objecoes",
    order: 4,
    title: "Objeções",
    summary: "Como responder às principais objeções dos clientes. (Em breve)",
    accent: "from-sky-500 to-blue-600",
    subtasks: [],
  },
  {
    id: "vendas",
    order: 5,
    title: "Fundamentos de venda",
    summary: "Abordagem, escuta e fechamento. (Em breve)",
    accent: "from-emerald-500 to-teal-600",
    subtasks: [],
  },
  {
    id: "dores",
    order: 6,
    title: "Dores dos clientes e soluções",
    summary:
      "As principais dores que aparecem na loja e qual categoria de produto resolve cada uma. (Em breve)",
    accent: "from-violet-500 to-purple-700",
    subtasks: [],
  },
  {
    id: "produtos",
    order: 7,
    title: "Produtos",
    summary:
      "Produtos específicos por categoria que a Santa Bronx mais indica. (Em breve)",
    accent: "from-indigo-500 to-blue-700",
    subtasks: [],
  },
  {
    id: "presencial",
    order: 8,
    title: "Atendimento presencial e WhatsApp",
    summary:
      "Atender bem na loja e responder no WhatsApp (Bot Conversa). (Em breve)",
    accent: "from-pink-500 to-rose-700",
    subtasks: [],
  },
];

export function findTopic(id: string) {
  return TOPICS.find((t) => t.id === id);
}

export function findSubtask(subtaskId: string) {
  for (const topic of TOPICS) {
    const sub = topic.subtasks.find((s) => s.id === subtaskId);
    if (sub) return { topic, subtask: sub };
  }
  return null;
}
