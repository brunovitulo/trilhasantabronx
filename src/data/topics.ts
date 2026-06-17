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
      body: string;
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
      passingScore?: number;
      questions: QuizQuestion[];
    };

export type Topic = {
  id: string;
  order: number;
  title: string;
  summary: string;
  accent: string;
  subtasks: Subtask[];
};

export const PASSING_SCORE = 70;

const IG = "https://instagram.com/formar.atendente";

export const TOPICS: Topic[] = [
  {
    id: "apresentacao",
    order: 1,
    title: "Apresentação da Loja",
    summary:
      "Conhecer a Santa Bronx: história, organização, produtos e site de pedidos.",
    accent: "from-fuchsia-500 to-purple-600",
    subtasks: [
      // 1 - Nossa História
      {
        id: "apresentacao.historia.video",
        kind: "video",
        title: "1. Nossa História — assistir destaque",
        description: "Assista o destaque 'História' no Instagram da loja.",
        url: IG,
      },
      {
        id: "apresentacao.historia.quiz",
        kind: "evaluation",
        title: "1. Nossa História — quiz",
        description: "Quiz rápido sobre a história. Nota mínima 70%.",
        questions: [
          {
            question: "Qual é o diferencial do atendimento da Santa Bronx?",
            options: [
              "Empurrar o produto mais caro",
              "Indicar a solução certa para a dor do cliente",
              "Falar o mínimo possível",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual é o tom de comunicação da loja?",
            options: ["Formal e técnico", "Descontraído e sem julgamento", "Silencioso"],
            correctIndex: 1,
          },
        ],
      },
      // 2 - Onde fica as coisas na loja
      {
        id: "apresentacao.organizacao.video",
        kind: "video",
        title: "2. Onde fica as coisas na loja — assistir destaque",
        url: IG,
      },
      {
        id: "apresentacao.organizacao.checklist",
        kind: "checklist",
        title: "2. Onde fica as coisas na loja — checklist",
        items: [
          "Identificar onde ficam os lubrificantes",
          "Identificar onde ficam os vibradores e plugs",
          "Identificar onde ficam as lingeries e fantasias",
          "Identificar onde ficam os cosméticos e géis",
          "Identificar onde ficam os acessórios BDSM",
        ],
      },
      // 3 - Pegar os produtos na mão
      {
        id: "apresentacao.produtos.video",
        kind: "video",
        title: "3. Familiarizar com produtos — assistir destaques",
        url: IG,
      },
      {
        id: "apresentacao.produtos.checklist",
        kind: "checklist",
        title: "3. Familiarizar com produtos — checklist",
        items: [
          "Pegar e examinar 3 lubrificantes diferentes",
          "Pegar e examinar 3 vibradores diferentes",
          "Pegar e examinar 2 cosméticos (excitante, retardante etc.)",
          "Pegar e examinar 2 acessórios (algema, venda, plug etc.)",
        ],
      },
      // 4 - Como a loja deve ser organizada
      {
        id: "apresentacao.padrao.video",
        kind: "video",
        title: "4. Padrão de organização — assistir destaque",
        url: IG,
      },
      {
        id: "apresentacao.padrao.apostila",
        kind: "reading",
        title: "4. Padrão de organização — ler apostila",
        body: `Leia com atenção a apostila de padrão de organização da loja. **Mantenha o arquivo sempre acessível** durante o expediente para consulta.

Pontos-chave:
- Cada categoria tem uma posição fixa.
- Produtos repostos devem voltar exatamente para o mesmo local.
- Vitrine e prateleiras seguem o padrão visual definido.`,
      },
      // 5 - Site / pedidos
      {
        id: "apresentacao.site.video",
        kind: "video",
        title: "5. Apresentação do site — assistir destaque",
        url: IG,
      },
      {
        id: "apresentacao.site.checklist",
        kind: "checklist",
        title: "5. Apresentação do site — checklist",
        items: [
          "Acessar o site",
          "Navegar pelas categorias",
          "Adicionar produto ao carrinho",
          "Finalizar 1º pedido teste no site",
          "Finalizar 2º pedido teste no site",
        ],
      },
    ],
  },
  {
    id: "embalar",
    order: 2,
    title: "Embalar e Despachar Pedidos",
    summary:
      "Aprender como embalar, chamar o 99 Entregas e evitar os principais erros.",
    accent: "from-rose-500 to-pink-600",
    subtasks: [
      // 1 - Embalar + 99 + erros
      {
        id: "embalar.intro.video",
        kind: "video",
        title: "1. Como embalar e chamar o 99 — assistir destaque",
        url: IG,
      },
      {
        id: "embalar.intro.apostila",
        kind: "reading",
        title: "1. Apostila de embalagem e despacho",
        body: `**Passo a passo de embalagem e despacho**

1. Conferir o pedido no sistema interno.
2. Separar os produtos certos (nome e quantidade).
3. Embalar com discrição — embalagem neutra, sem indicar o conteúdo.
4. Solicitar a entrega no app **99 Entregas** com os dados corretos.
5. Marcar o pedido como **despachado** no sistema.

**Principais erros a evitar:** embalagem aberta, endereço errado no 99, esquecer item, não marcar como despachado.`,
      },
      {
        id: "embalar.intro.checklist",
        kind: "reading",
        title: "1. Baixar checklist para usar no início",
        body: `Baixe e imprima a **checklist de embalagem** e mantenha junto à bancada nas primeiras semanas.

A checklist serve para garantir que nenhum passo seja pulado enquanto o processo ainda não está automático.`,
      },
      {
        id: "embalar.checklist.video",
        kind: "video",
        title: "1. Destaque sobre uso da checklist — assistir",
        url: IG,
      },
      // 2 - Exercício prático
      {
        id: "embalar.pratica.video",
        kind: "video",
        title: "2. Exercício de embalar na prática — assistir destaque",
        url: IG,
      },
      {
        id: "embalar.pratica.arquivo",
        kind: "reading",
        title: "2. Baixar arquivo com os pedidos do exercício",
        body: `Baixe o arquivo com a lista de pedidos do exercício prático e separe o material para realizar a atividade.`,
      },
      {
        id: "embalar.pratica.checklist",
        kind: "checklist",
        title: "2. Realizar a atividade prática",
        items: [
          "Separar produtos do pedido 1, embalar e cadastrar no 99",
          "Separar produtos do pedido 2, embalar e cadastrar no 99",
          "Separar produtos do pedido 3, embalar e cadastrar no 99",
          "Conferir se todos foram marcados como despachados",
        ],
      },
    ],
  },
  {
    id: "responsabilidade",
    order: 3,
    title: "Primeira Responsabilidade: Embalar Pedidos",
    summary:
      "Alinhar expectativas (atrasos, erros) e conhecer o app de pedidos que será usado no dia a dia.",
    accent: "from-amber-500 to-orange-600",
    subtasks: [
      // 1 - Alinhamento
      {
        id: "responsabilidade.expectativas.video",
        kind: "video",
        title: "1. O que é esperado (atrasos, erros) — assistir destaque",
        url: IG,
      },
      // 2 - App de pedidos
      {
        id: "responsabilidade.app.video",
        kind: "video",
        title: "2. App de pedidos — assistir destaque",
        description:
          "Conhecer o app onde aparecem os pedidos com produtos, cliente e endereço.",
        url: IG,
      },
      {
        id: "responsabilidade.app.checklist",
        kind: "checklist",
        title: "2. Navegar pelo app de pedidos",
        items: [
          "Fazer login no app",
          "Localizar a lista de pedidos do dia",
          "Abrir um pedido e identificar produtos, cliente e endereço",
          "Marcar um pedido teste como 'despachado'",
        ],
      },
    ],
  },
  {
    id: "objecoes",
    order: 4,
    title: "Principais Objeções (Sex Shop)",
    summary:
      "Aprender as principais objeções do nicho e como respondê-las. (Em breve)",
    accent: "from-sky-500 to-blue-600",
    subtasks: [],
  },
  {
    id: "vendas",
    order: 5,
    title: "Fundamentos de Vendas",
    summary: "Abordagem, escuta, oferta e fechamento. (Em breve)",
    accent: "from-emerald-500 to-teal-600",
    subtasks: [],
  },
  {
    id: "dores",
    order: 6,
    title: "Principais Dores x Soluções",
    summary:
      "As dores mais comuns dos clientes e quais soluções oferecemos. (Em breve — apostila será gerada a partir do áudio)",
    accent: "from-violet-500 to-purple-700",
    subtasks: [],
  },
  {
    id: "produtos",
    order: 7,
    title: "Decorar Principais Produtos",
    summary:
      "Conhecer e decorar os produtos mais indicados por categoria. (Em breve)",
    accent: "from-indigo-500 to-blue-700",
    subtasks: [],
  },
  {
    id: "presencial",
    order: 8,
    title: "Atendimento Presencial",
    summary: "Como atender bem o cliente que entra na loja. (Em breve)",
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
