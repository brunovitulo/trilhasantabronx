// Estrutura da trilha. Adicione/edite tópicos e subtarefas aqui.
// IDs devem ser únicos e estáveis (são salvos no banco como subtask_id).

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type ApostilaBadgeColor =
  | "purple"
  | "pink"
  | "blue"
  | "green"
  | "orange"
  | "gray";

export type ApostilaItem = {
  badge: string;
  badgeColor: ApostilaBadgeColor;
  title: string;
  description: string;
};

export type ApostilaSection = {
  icon: string;
  iconBg: string; // hex color
  title: string;
  subtitle: string;
  items: ApostilaItem[];
  tip?: { label: string; text: string };
};

export type Subtask =
  | { id: string; title: string; kind: "video"; url: string; description?: string }
  | { id: string; title: string; kind: "reading"; description?: string; body: string }
  | { id: string; title: string; kind: "checklist"; description?: string; items: string[] }
  | {
      id: string;
      title: string;
      kind: "apostila";
      description?: string;
      intro: string;
      sections: ApostilaSection[];
      extrasTitle?: string;
      extras?: ApostilaItem[];
      faq?: { question: string; answer: string }[];
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
        description: "Quiz rápido. Nota mínima 70%.",
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
      "Alinhar expectativas (atrasos, erros) e conhecer o app de pedidos do dia a dia.",
    accent: "from-amber-500 to-orange-600",
    subtasks: [
      {
        id: "responsabilidade.expectativas.video",
        kind: "video",
        title: "1. O que é esperado (atrasos, erros) — assistir destaque",
        url: IG,
      },
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
      "Pense como médico: o cliente vem resolver uma dor. Entenda a dor antes de decorar produtos.",
    accent: "from-violet-500 to-purple-700",
    subtasks: [
      {
        id: "dores.apostila",
        kind: "apostila",
        title: "Apostila: Dores dos clientes & produtos certos",
        description:
          "Conceito-base + cada dor com as soluções da loja. Leia tudo antes do quiz.",
        intro:
          "Pense como médico: o cliente não vem comprar um produto — vem resolver uma dor. Sua função é entender o problema e indicar a solução certa. Entenda as dores antes de decorar funções de produtos.",
        sections: [
          {
            icon: "💊",
            iconBg: "#fde8ec",
            title: "Disfunção erétil",
            subtitle: "Dificuldade de ereção ou de manutenção",
            items: [
              {
                badge: "Tratamento",
                badgeColor: "purple",
                title: "Testo Viril (cápsula diária)",
                description:
                  "1 cápsula/dia. Efeito em 7–14 dias. Para indisposição sexual constante no dia a dia.",
              },
              {
                badge: "Imediato",
                badgeColor: "orange",
                title: "Sachê estimulante (mel)",
                description:
                  "Tomar 2h antes. Efeito rápido de energia e disposição sexual.",
              },
              {
                badge: "Avançado",
                badgeColor: "blue",
                title: "Bomba peniana",
                description:
                  "Sucção mecânica que puxa sangue para a região. Indicar apenas nos casos severos (fisiológicos) — inclusive por fisioterapeutas.",
              },
            ],
            tip: {
              label: "⚠ Atenção",
              text: "Se a causa for psicológica (pornografia, ansiedade), nenhum produto resolve — indicar psicólogo.",
            },
          },
          {
            icon: "⏱",
            iconBg: "#e6f0fb",
            title: "Ejaculação precoce",
            subtitle: "Orgasmo rápido, afeta autoestima e satisfação da parceira",
            items: [
              {
                badge: "Principal",
                badgeColor: "blue",
                title: "Spray retardante",
                description:
                  "Aplicar na glande. Reduz sensibilidade parcialmente. Efeito em 5–10 seg, dura 20–30 min. Pode reaplicar. Tem vasodilatador — não faz broxar.",
              },
            ],
            tip: {
              label: 'Objeção comum — "vou broxar?"',
              text: "Não. O homem é visual e se mantém excitado. O vasodilatador do spray compensa a redução de sensibilidade.",
            },
          },
          {
            icon: "🔋",
            iconBg: "#e6f5ed",
            title: "Falta de libido",
            subtitle: "Cansaço, estresse, queda de vitaminas",
            items: [
              {
                badge: "Tratamento",
                badgeColor: "green",
                title: "Cápsulas vitamínicas (masc./fem.)",
                description:
                  "Só vitaminas ligadas à libido. Sem 'extras' genéricos como vitamina C da farmácia.",
              },
              {
                badge: "Imediato",
                badgeColor: "orange",
                title: "Sachê estimulante (versão fem.)",
                description: "Tomar 2h antes. Efeito rápido para a noite.",
              },
              {
                badge: "Recomendado",
                badgeColor: "purple",
                title: "Energético com Catuaba + Maca Peruana",
                description:
                  "Afrodisíaco natural. Melhor que tesão de vaca/touro, que tem resultado mais fraco na prática.",
              },
            ],
          },
          {
            icon: "🌸",
            iconBg: "#fde8ec",
            title: "Dificuldade de orgasmo (feminino)",
            subtitle: "Muito comum — parte nunca chegou ao orgasmo",
            items: [
              {
                badge: "Gel/pomada",
                badgeColor: "pink",
                title: "Excitante vasodilatador",
                description:
                  "Aplicar no clitóris e vulva. Mais fluxo sanguíneo → mais sensibilidade. Efeitos possíveis: calor, frio ou vibração (formigamento).",
              },
              {
                badge: "Acessório",
                badgeColor: "purple",
                title: "Vibrador",
                description:
                  "Perguntar sempre: clitóris, penetração ou ambos? → indica o modelo certo. Quanto maior o preço, melhor a qualidade e a vibração. Para clitóris, o sugador é o campeão.",
              },
            ],
          },
          {
            icon: "💧",
            iconBg: "#EEEDFE",
            title: "Dor na penetração vaginal",
            subtitle: "Falta de lubrificação ou vaginismo",
            items: [
              {
                badge: "Uso no ato",
                badgeColor: "purple",
                title: "Lubrificante",
                description: "Preferir versões que demoram mais para secar.",
              },
              {
                badge: "Tratamento",
                badgeColor: "green",
                title: "Hidratante vaginal (pomada + tubinhos)",
                description:
                  "10 tubinhos, 1 por noite antes de dormir. Restaura a lubrificação natural. Para ressecamento severo.",
              },
              {
                badge: "Específico",
                badgeColor: "gray",
                title: "Kit dilatadores vaginais",
                description:
                  "7 próteses progressivas. Para vaginismo forte ou preparo pré-cirúrgico.",
              },
            ],
          },
          {
            icon: "🔑",
            iconBg: "#fef0e3",
            title: "Dor na penetração anal",
            subtitle: "Falta de lubrificação e tensão muscular",
            items: [
              {
                badge: "Essencial",
                badgeColor: "orange",
                title: "Lubrificante de qualidade",
                description:
                  "O ânus não tem lubrificação própria. Saliva seca rápido — lubrificante é o item mais importante.",
              },
              {
                badge: "Complemento",
                badgeColor: "blue",
                title: "Anestésico anal (gel)",
                description:
                  "Aplicar por fora e na entrada. Esperar 1 min. Não lubrifica — usar junto com lubrificante.",
              },
              {
                badge: "Preparação",
                badgeColor: "purple",
                title: "Plug anal",
                description:
                  "Formato cônico dilata os esfíncteres gradualmente. Torna a penetração muito mais confortável.",
              },
            ],
          },
          {
            icon: "📏",
            iconBg: "#EEEDFE",
            title: "Tamanho do pênis",
            subtitle: "Homem querendo aumentar o volume",
            items: [
              {
                badge: "Única solução",
                badgeColor: "pink",
                title: "Capa peniana",
                description:
                  "Capa de silicone que aumenta grossura e tamanho. Não substitui camisinha. Tranquilizar o cliente: a parceira geralmente aprova o acessório.",
              },
            ],
            tip: {
              label: "⚠ Atenção",
              text: "Óleos, comprimidos e 'fórmulas' que prometem aumentar o pênis são enganação. Só cirurgia e ácido hialurônico funcionam — ambos médicos.",
            },
          },
        ],
        extrasTitle: "Outros produtos importantes",
        extras: [
          {
            badge: "Homem",
            badgeColor: "blue",
            title: "Anel peniano",
            description:
              "Prende sangue → sensação de inchaço + retarda ejaculação. Modelos com vibrador estimulam o clitóris durante a penetração.",
          },
          {
            badge: "Oral",
            badgeColor: "gray",
            title: "Anestésico de garganta (spray)",
            description:
              "Spritar no fundo da garganta. Reduz ânsia no oral profundo.",
          },
          {
            badge: "Inovação",
            badgeColor: "purple",
            title: "Bolinhas explosivas",
            description:
              "Introduzidas no canal vaginal — estouram na penetração com efeito (frio, calor, choque, vibração). O corpo dissolve naturalmente. Dica de venda: sugerir surpresa ao parceiro.",
          },
          {
            badge: "Sensorial",
            badgeColor: "orange",
            title: "Vela para massagem",
            description:
              "Derrete em óleo beijável com sabor. Sem parafina — não queima. Para massagem ou sexo oral.",
          },
          {
            badge: "Atração",
            badgeColor: "green",
            title: "Perfume com feromônio",
            description:
              "Moléculas do cheiro natural de cada gênero que atraem o sexo oposto.",
          },
          {
            badge: "Clássico",
            badgeColor: "gray",
            title: "Colar de pérolas",
            description:
              "Enrolar no pênis ou na mão para masturbação. Também estimula o clitóris.",
          },
        ],
        faq: [
          {
            question: "Diferença entre indicar o mel e o Testo Viril para disfunção erétil?",
            answer:
              "Mel: efeito imediato (2h antes). Testo Viril: tratamento diário com resultado constante em 7–14 dias.",
          },
          {
            question: "Quando indicar a bomba peniana?",
            answer:
              "Apenas em disfunção erétil severa e fisiológica — quando a ereção simplesmente não ocorre. Indicada até por fisioterapeutas.",
          },
          {
            question: "O spray retardante faz o homem broxar?",
            answer:
              "Não. O homem é visual e se mantém excitado. O spray tem vasodilatador que compensa a redução de sensibilidade.",
          },
          {
            question: "Quais perguntas fazer antes de indicar um vibrador?",
            answer:
              "1) Ela sente mais no clitóris, na penetração ou em ambos? 2) Qual o valor que está disposta a investir?",
          },
          {
            question: "Diferença do excitante em gel para o vibrador?",
            answer:
              "Excitante age quimicamente (vasodilatação, calor, frio, vibração). Vibrador estimula mecanicamente de forma contínua, gerando orgasmos mais fortes.",
          },
          {
            question: "Por que a saliva não basta para o sexo anal?",
            answer:
              "Seca muito rápido. O ânus não tem lubrificação própria — lubrificante de qualidade é indispensável.",
          },
          {
            question: "Diferença entre hidratante vaginal e lubrificante?",
            answer:
              "Lubrificante é para o ato. Hidratante é um tratamento de 10 dias que restaura a lubrificação natural para ressecamento severo.",
          },
          {
            question: "Por que a capa peniana não substitui a camisinha?",
            answer:
              "Não oferece proteção contra ISTs nem evita gravidez. É só um acessório de volume — não é contraceptivo.",
          },
          {
            question: "Como funciona e como vender a bolinha explosiva?",
            answer:
              "Introduzida no canal vaginal, estoura na penetração soltando óleo com efeito. Dica: sugerir inserir escondida para surpreender o parceiro.",
          },
          {
            question:
              "Por que o energético com Catuaba é melhor que tesão de vaca/touro?",
            answer:
              "Tem compostos afrodisíacos comprovados (catuaba e maca peruana). O tesão de vaca/touro vende pelo nome mas tem resultado mais fraco.",
          },
          {
            question: "Para que serve o plug anal antes da penetração?",
            answer:
              "Dilata os esfíncteres gradualmente com seu formato cônico. Facilita muito a penetração posterior, tornando a experiência mais confortável.",
          },
          {
            question: "Diferencial do multivitamínico da loja frente ao da farmácia?",
            answer:
              "Contém apenas vitaminas diretamente ligadas à libido. O da farmácia mistura vitaminas genéricas que não têm relação com desejo sexual.",
          },
        ],
      },
      {
        id: "dores.quiz",
        kind: "evaluation",
        title: "Avaliação: dores x soluções",
        description: "Nota mínima 70%. Pode refazer.",
        questions: [
          {
            question:
              "Cliente chega com queixa de disfunção erétil leve, falta de disposição no dia a dia. Qual a melhor indicação?",
            options: [
              "Bomba peniana",
              "Testo Viril (tratamento) ou sachê de mel (imediato)",
              "Capa peniana",
            ],
            correctIndex: 1,
          },
          {
            question: "Cliente pergunta se o spray retardante vai fazê-lo broxar. O que responder?",
            options: [
              "Sim, é um efeito comum",
              "Não — o homem é visual e o spray tem vasodilatador que compensa",
              "Depende do tamanho do pênis",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Mulher diz que sente mais prazer no clitóris e quer um vibrador. Qual indicar?",
            options: [
              "Vibrador para ponto G",
              "Sugador de clitóris",
              "Anel peniano",
            ],
            correctIndex: 1,
          },
          {
            question: "Para sexo anal confortável, qual é o item mais importante?",
            options: [
              "Anestésico anal",
              "Lubrificante de qualidade",
              "Plug anal",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Cliente com ressecamento vaginal severo quer uma solução duradoura. Indicar:",
            options: [
              "Lubrificante comum",
              "Hidratante vaginal (10 tubinhos, 1 por noite)",
              "Excitante em gel",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Cliente pergunta se a capa peniana substitui camisinha. Resposta correta:",
            options: [
              "Sim, protege igual",
              "Não — é só acessório de volume, não protege contra IST nem gravidez",
              "Depende do material",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Por que indicamos o energético com catuaba/maca peruana em vez de tesão de vaca/touro?",
            options: [
              "É mais barato",
              "Tem afrodisíacos comprovados e resultado melhor na prática",
              "Tem nome mais forte",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Cliente quer saber a diferença do nosso multivitamínico para o da farmácia:",
            options: [
              "Nenhuma diferença",
              "O nosso tem só vitaminas ligadas à libido; o da farmácia mistura vitaminas genéricas",
              "O da farmácia é mais forte",
            ],
            correctIndex: 1,
          },
          {
            question: "Para que serve introduzir um plug anal antes da penetração?",
            options: [
              "Substituir o lubrificante",
              "Dilatar os esfíncteres gradualmente, facilitando a penetração",
              "Anestesiar a região",
            ],
            correctIndex: 1,
          },
          {
            question: "Cliente com disfunção erétil causada por ansiedade/pornografia:",
            options: [
              "Indicar bomba peniana",
              "Indicar Testo Viril",
              "Nenhum produto resolve — encaminhar para psicólogo",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
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
