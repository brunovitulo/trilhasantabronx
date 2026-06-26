// Estrutura da trilha. Adicione/edite tópicos e subtarefas aqui.
// IDs devem ser únicos e estáveis (são salvos no banco como subtask_id).

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  // Campos opcionais usados pela Revisão Inteligente.
  // Quando ausentes, são inferidos automaticamente por palavras-chave
  // em `src/lib/reviews.ts` (inferQuestionMeta).
  theme?: string;
  tags?: string[];
  isCritical?: boolean;
  memoryTip?: string;
  wrongAnswerExplanation?: string;
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

export type OpenQuestion = {
  question: string;
  expectedAnswer?: string;
  // Quando preenchidos, a questão é tratada como múltipla escolha
  // (corrigida automaticamente). Quando ausentes, é tratada como aberta
  // (vai para correção do gestor).
  options?: string[];
  correctIndex?: number;
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
    }
  | {
      id: string;
      title: string;
      kind: "practice";
      description?: string;
      questions: QuizQuestion[];
    }
  | {
      id: string;
      title: string;
      kind: "open_evaluation";
      description?: string;
      passingScore?: number;
      questions: OpenQuestion[];
    }
  | {
      id: string;
      title: string;
      kind: "external_html";
      description?: string;
      url: string;
      openLabel?: string;
      downloadAs?: string;
      confirmLabel: string;
    }
  | {
      id: string;
      title: string;
      kind: "inline_html";
      description?: string;
      source: string;
      openLabel?: string;
      helperText?: string;
      confirmLabel: string;
    }
  | {
      id: string;
      title: string;
      kind: "product_links";
      description?: string;
      links: { label: string; url: string }[];
      confirmLabel: string;
    }
  | {
      id: string;
      title: string;
      kind: "credentials";
      description?: string;
      url: string;
      stores: { name: string; user: string; pass: string }[];
      confirmLabel: string;
    }
  | {
      id: string;
      title: string;
      kind: "dual_inline_html";
      description?: string;
      first: {
        source: string;
        openLabel: string;
        confirmLabel: string;
        helperText?: string;
      };
      second: {
        source: string;
        openLabel: string;
        confirmLabel: string;
        helperText?: string;
      };
    }
  | {
      id: string;
      title: string;
      kind: "multi_checklist";
      description?: string;
      groups: { title: string; subtitle?: string; items: string[] }[];
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

const IG = "https://www.instagram.com/stories/highlights/18105686552513262/";
const IG_APRESENTACAO = "https://www.instagram.com/stories/highlights/17892062016515877/";
const IG_ENVIO_PEDIDOS = "https://www.instagram.com/stories/highlights/17861958711572094/";
const IG_VENDAS = "https://www.instagram.com/stories/highlights/17896097712329686/";
const IG_OBJECOES = "https://www.instagram.com/stories/highlights/17979827337034215/";
const IG_DORES = "https://www.instagram.com/stories/highlights/18024602042657823/";


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
        description: "Assista o destaque 'Apresentação Inicial' no Instagram da loja.",
        url: "https://www.instagram.com/stories/highlights/17958057917908256/",
      },
      {
        id: "apresentacao.organizacao.video",

        kind: "video",
        title: "2. Onde fica as coisas na loja — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18330806407255229/",
      },
      {
        id: "apresentacao.organizacao.checklist",
        kind: "checklist",
        title: "2. Onde fica as coisas na loja — checklist",
        items: [
          "Identificar aonde fica as sacolas",
          "Identificar aonde fica as embalagens com lacre",
          "Identificar aonde fica os brindes na mesinha de embalagem",
          "Identifica aonde ficam os brindes abaixo do filtro",
          "Pegar o cesto aonde tem o plástico bolha e ver tudo que tem dentro dele",
          "Abrir cestinho branco e olhar o que tem dentro dele",
        ],
      },
      {
        id: "apresentacao.padrao.video",
        kind: "video",
        title: "3. Padrão de organização — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18089212679196183/",
      },
      {
        id: "apresentacao.padrao.checklist",
        kind: "inline_html",
        title: "3. Padrão de organização — ver checklist de organização",
        description:
          "Use este checklist diariamente para garantir que a loja está sempre organizada e bem apresentada antes de atender.",
        source: "organizacao",
        openLabel: "Ver checklist",
        helperText:
          "Este checklist também fica sempre disponível no ícone do topo do site.",
        confirmLabel: "Já vi o checklist e sei onde acessá-lo no topo do site.",
      },
      {
        id: "apresentacao.site.video",
        kind: "video",
        title: "4. Apresentação do site — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18095535212221625/",
      },
      {
        id: "apresentacao.site.checklist",
        kind: "checklist",
        title: "4. Apresentação do site — checklist",
        items: [
          "Acessar o site: https://santabronxaraguari.com.br/",
          "Acesse o menu de categorias",
          "Entre na subcategoria \"Varinha Mágica\"",
          "Abra a aba de pesquisa clicando na lupinha",
          "Encontre o produto \"Xana Loka\" e clique nele",
          "Clique no botão \"Comprar no WhatsApp\"",
          "Clique no botão de \"Add ao Carrinho\"",
          "Visite a página de carrinho",
          "Ache algum produto no site que possui vídeo na descrição e dê play no vídeo",
          "Encontre o carrossel com os diferenciais da nossa loja e leia todos eles",
          "Realize o pedido pelo WhatsApp em nossa loja",
          "Realize o pedido pelo site",
        ],
      },
      {
        id: "apresentacao.prova.video",
        kind: "video",
        title: "5. Antes da prova — assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo, avisa que o gestor vai acompanhar a prova em tempo real e reforça a regra de 70% para passar.",
        url: "https://www.instagram.com/stories/highlights/17892062016515877/",
      },
      {
        id: "apresentacao.prova.exam",
        kind: "open_evaluation",
        title: "5. Prova: Apresentação da Loja",
        description: "Prova dissertativa final do tópico. Nota mínima 70%.",
        passingScore: 70,
        questions: [
          { question: "Qual o investimento inicial feito pelo Bruno pra começar o sex shop?", expectedAnswer: "" },
          { question: "O que Bruno quer dizer ao falar que nossa empresa é uma empresa de marketing aonde o entregável é produto erótico?", expectedAnswer: "" },
          { question: "Pra que serve a vela de massagem?", expectedAnswer: "" },
          { question: "Qual a sensação que você sentiu na língua ao passar o Vibration nela?", expectedAnswer: "" },
          { question: "Pra que que serve a ventosa?", expectedAnswer: "" },
          { question: "Qual a diferença do material de cyber skin para os modelos de PVC (que é o da maioria das próteses)?", expectedAnswer: "" },
          { question: "Explique com suas palavras como a loja deve estar organizada e por que isso é importante.", expectedAnswer: "" },
          { question: "Qual a diferença dos botões \"Comprar via WhatsApp\" e \"Adicionar ao carrinho\" no site?", expectedAnswer: "" },
          { question: "Cite 2 diferenciais da nossa loja (que está escrito no carrossel) do nosso site.", expectedAnswer: "" },
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
        url: IG_ENVIO_PEDIDOS,
      },
      {
        id: "embalar.intro.apostila",
        kind: "inline_html",
        title: "1. Como embalar e chamar o 99 — ler apostila completa",
        description: "Baixe e leia a apostila por completo para fixar tudo que você assistiu.",
        source: "apostila",
        openLabel: "Abrir apostila",
        confirmLabel: "Li todo o conteúdo da apostila.",
      },
      {
        id: "embalar.checklist.video",
        kind: "video",
        title: "1. Como embalar e chamar o 99 — assistir destaque: checklist de embalagem",
        description: "Copie o link, cole em outra aba, assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18105686552513262/",
      },
      {
        id: "embalar.checklist.baixar",
        kind: "inline_html",
        title: "1. Como embalar e chamar o 99 — ver checklist de embalagem",
        description:
          "Veja o checklist e use sempre que for embalar um pedido, principalmente nos primeiros dias.",
        source: "checklist",
        openLabel: "Ver checklist",
        helperText:
          "O checklist também fica sempre disponível no ícone do topo do site, para você acessar rapidamente sempre que for embalar.",
        confirmLabel: "Já vi o checklist e sei onde acessá-lo no topo do site.",
      },
      {
        id: "embalar.pratica.video",
        kind: "video",
        title: "2. Exercício de embalar na prática — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18119892343771884/",
      },
      {
        id: "embalar.pratica.pedidos",
        kind: "multi_checklist",
        title: "2. Exercício de embalar na prática — embalar os pedidos do exercício",
        description:
          "Embale os 3 pedidos abaixo, um por vez. Para cada pedido: embale, preencha as informações no 99 Entregas e peça ao responsável para avaliar antes de passar para o próximo.",
        groups: [
          {
            title: "Pedido 1 — Maurilio",
            subtitle:
              "Tel: 34997654835 · Produtos: PNI75 / POT01 / EXC46 · Rua Itumbiara, 268 (muro azul)",
            items: [
              "Separei os produtos e embalei o pedido",
              "Preenchi as informações no 99 Entregas",
              "Pedi ao responsável para avaliar",
            ],
          },
          {
            title: "Pedido 2 — Beatriz Silva",
            subtitle:
              "Tel: 34985212578 · Produtos: PLU40 / EST12 · Rua C, 240 (deixar na caixinha de correio)",
            items: [
              "Separei os produtos e embalei o pedido",
              "Preenchi as informações no 99 Entregas",
              "Pedi ao responsável para avaliar",
            ],
          },
          {
            title: "Pedido 3 — Aline Campos",
            subtitle: "Tel: 34987563254 · Produtos: COL03 / VEL02 · Rua Cláudio Manoel, 512",
            items: [
              "Separei os produtos e embalei o pedido",
              "Preenchi as informações no 99 Entregas",
              "Pedi ao responsável para avaliar",
            ],
          },
        ],
      },
      {
        id: "embalar.pratica.fixacao",
        kind: "practice",
        title: "2. Exercício de embalar na prática — exercício de fixação (20 questões)",
        description:
          "Múltipla escolha autocorrigido. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Quais são os 4 materiais indispensáveis para embalar um pedido corretamente?",
            options: [
              "Sacola, fita adesiva, caneta e caixa de papelão",
              "Sacola, saquinho com lacre, grampeador e post-it com caneta",
              "Saquinho com lacre, fita dupla face, etiqueta e sacola",
              "Grampeador, caixa, lacre e post-it",
            ],
            correctIndex: 1,
          },
          {
            question: "O que deve estar escrito no post-it colado na sacola?",
            options: [
              "Apenas o nome do cliente",
              "Nome do cliente e final do número do WhatsApp",
              "Nome, rua, número e complemento do endereço do cliente",
              "Só o endereço e o telefone",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que o post-it deve ser grampeado na sacola além de colado?",
            options: [
              "Para ficar mais bonito",
              "Porque a cola do post-it é fraca e ele pode soltar durante o transporte",
              "Para o motoboy não conseguir tirar",
              "É opcional",
            ],
            correctIndex: 1,
          },
          {
            question: "Um produto com formato de pênis deve ser embalado como?",
            options: [
              "Direto no saquinho com lacre, sem preparo extra",
              "Em uma sacola diferente, sem saquinho interno",
              "Envolto em plástico bolha antes de colocar no saquinho, para disfarçar o formato",
              "Apenas com a sacola externa, sem saquinho interno",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que todo produto eletrônico deve ser testado antes de lacrar?",
            options: [
              "Para ver se a cor está certa",
              "Para garantir que funciona — se chegar com defeito, paga-se outro motoboy para buscar",
              "É uma exigência do app 99",
              "Para verificar se a bateria está carregada",
            ],
            correctIndex: 1,
          },
          {
            question: "Como escolher o tamanho correto da embalagem?",
            options: [
              "Sempre usar a maior disponível",
              "Usar o tamanho padrão independente do produto",
              "Usar a menor embalagem que cabe o produto sem forçar",
              "O tamanho não importa",
            ],
            correctIndex: 2,
          },
          {
            question: "Qual o processo correto para trabalhar com vários pedidos ao mesmo tempo?",
            options: [
              "Embalar todos de uma vez e organizar no final",
              "Abrir todos os pedidos no sistema ao mesmo tempo e embalar em paralelo",
              "Um pedido por vez: abrir o resumo, separar os produtos, embalar, colar post-it com todas as informações e só então passar para o próximo",
              "Embalar todos os produtos primeiro e organizar os post-its depois",
            ],
            correctIndex: 2,
          },
          {
            question: "O nome do cliente deve ser inserido no app 99 de que forma?",
            options: [
              "Como está no WhatsApp",
              "Em letras minúsculas",
              "Em LETRAS MAIÚSCULAS — com vários motoboys na porta ao mesmo tempo fica fácil identificar qual sacola é de quem",
              "Não precisa colocar o nome, só o telefone",
            ],
            correctIndex: 2,
          },
          {
            question: "A caixinha de \"código de coleta\" no app 99 deve estar:",
            options: [
              "Sempre marcada, independente da cidade",
              "Sempre desmarcada para agilizar",
              "Desmarcada em Araguari (não há vários entregadores juntos) — em outras cidades como Uberlândia, deve ficar marcada",
              "Marcada apenas quando houver mais de 3 pedidos",
            ],
            correctIndex: 2,
          },
          {
            question: "O que acontece se a \"caixinha 2\" (código do cliente) for desmarcada no 99?",
            options: [
              "O pedido fica mais rápido de finalizar",
              "O motoboy pode finalizar a corrida sem o cliente estar presente, sem nenhuma segurança",
              "O cliente recebe uma notificação extra",
              "Nada muda",
            ],
            correctIndex: 1,
          },
          {
            question: "Como funciona o código de 4 dígitos gerado pelo app 99?",
            options: [
              "É o código de rastreamento para o cliente acompanhar",
              "É o código que o motoboy usa para encontrar o endereço",
              "É um código que o cliente passa para o motoboy na entrega — sem ele, o 99 não finaliza a corrida",
              "É gerado apenas quando o cliente solicita",
            ],
            correctIndex: 2,
          },
          {
            question: "Qual o primeiro passo para validar o endereço de um cliente antes de enviar?",
            options: [
              "Ligar para o cliente para confirmar",
              "Jogar direto no 99 e ver se aparece algum resultado",
              "Copiar a rua e número e pesquisar no Google, gerando um ponto no mapa para comparar",
              "Confiar no que o cliente digitou",
            ],
            correctIndex: 2,
          },
          {
            question: "Onde fica salvo o link da localização real do cliente?",
            options: [
              "No WhatsApp da loja",
              "Nas observações do pedido no sistema de gestão",
              "No histórico do app 99",
              "Precisa pedir para o cliente reenviar",
            ],
            correctIndex: 1,
          },
          {
            question: "O que fazer quando o ponto do Google não bate com a localização real do cliente?",
            options: [
              "Enviar assim mesmo",
              "Cancelar o pedido e pedir o endereço novamente",
              "Usar a opção \"marcar local no mapa\" dentro do app 99 para posicionar o ponto correto manualmente",
              "Ligar para o cliente e pedir que ele saia na porta para esperar",
            ],
            correctIndex: 2,
          },
          {
            question: "O que é o fluxo de pré-envio e quando deve ser enviado?",
            options: [
              "Uma mensagem enviada após o motoboy sair confirmando o envio",
              "Uma mensagem enviada antes de chamar o motoboy, perguntando se o cliente está online e pode receber agora",
              "Um formulário preenchido no sistema antes de embalar",
              "Uma notificação automática do app 99",
            ],
            correctIndex: 1,
          },
          {
            question: "O que fazer se o cliente não responder o fluxo de pré-envio?",
            options: [
              "Enviar assim mesmo",
              "Esperar 5 minutos e enviar sem confirmação",
              "Não enviar — esperar a resposta ou ligar pelo WhatsApp antes de chamar o motoboy",
              "Chamar o motoboy e avisar que o cliente pode não estar em casa",
            ],
            correctIndex: 2,
          },
          {
            question: "Quando se usa motoboy particular em vez do app 99?",
            options: [
              "Sempre que o pedido for urgente",
              "Quando o cliente morar longe do centro",
              "Somente quando houver pedidos acumulados para entregar de uma vez",
              "Nunca — o 99 deve ser usado em todos os casos",
            ],
            correctIndex: 2,
          },
          {
            question: "Qual desses é um dos erros mais comuns no processo de envio?",
            options: [
              "Usar grampos demais na sacola",
              "Esquecer de colocar o brinde quando o cliente tiver ganhado",
              "Usar o app 99 no modo corrida em vez de entrega",
              "Não colocar o telefone do cliente no 99",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que confirmar a variação do produto (cor, sabor ou tamanho) é tão importante?",
            options: [
              "Porque o sistema não registra variações automaticamente",
              "Porque variação errada obriga a pagar outro motoboy para buscar o produto de volta",
              "Porque o cliente sempre muda de ideia na hora",
              "É importante apenas para produtos eletrônicos",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que é importante ter calma ao embalar pedidos com atraso acumulado?",
            options: [
              "Porque o cliente está sempre esperando e vai ligar cobrando",
              "Porque o app 99 exige um tempo mínimo entre pedidos",
              "Porque erros cometidos com pressa geram custos maiores do que o tempo perdido sendo cuidadoso",
              "Porque o motoboy precisa de tempo para chegar",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "embalar.prova.exam",
        kind: "open_evaluation",
        title: "3. Antes da prova — prova dissertativa (15 questões)",
        description:
          "Prova dissertativa final do tópico. Nota mínima 70%.",
        passingScore: 70,
        questions: [
          { question: "Quais são os materiais necessários para embalar um pedido e por que é importante sempre verificar o estoque deles antes de precisar?", expectedAnswer: "" },
          { question: "Quais informações devem estar escritas no post-it colado na sacola, e por que ele precisa ser grampeado além de colado?", expectedAnswer: "" },
          { question: "O que deve ser feito com produtos que têm formato de pênis antes de embalar, e por que isso é importante?", expectedAnswer: "" },
          { question: "Por que todo produto eletrônico deve ser testado antes de ser lacrado e enviado? O que acontece se não for testado?", expectedAnswer: "" },
          { question: "Como escolher o tamanho correto da embalagem, e por que usar uma embalagem maior do que o necessário é um problema?", expectedAnswer: "" },
          { question: "Descreva o processo correto para embalar vários pedidos ao mesmo tempo sem se confundir, do começo ao fim.", expectedAnswer: "" },
          { question: "Por que o nome do cliente deve ser inserido em letras maiúsculas no app 99?", expectedAnswer: "" },
          { question: "Explique o que são as duas caixinhas do app 99, se cada uma deve ficar marcada ou desmarcada, e por quê.", expectedAnswer: "" },
          { question: "Como funciona o código de 4 dígitos do app 99 e qual a importância dele para a segurança da loja?", expectedAnswer: "" },
          { question: "Descreva o processo completo de validar o endereço de um cliente antes de chamar o motoboy.", expectedAnswer: "" },
          { question: "O que fazer quando o ponto do Google e o link de localização do cliente não batem?", expectedAnswer: "" },
          { question: "O que é o fluxo de pré-envio, quando deve ser enviado, e o que fazer se o cliente não responder?", expectedAnswer: "" },
          { question: "Em quais situações se usa motoboy particular em vez do app 99, e como funciona o processo?", expectedAnswer: "" },
          { question: "Cite e explique pelo menos 4 erros comuns no processo de envio e como cada um pode ser evitado.", expectedAnswer: "" },
          { question: "Por que é importante ter calma ao embalar pedidos com atraso acumulado, e o que fazer quando a mente estiver confusa com muitos pedidos ao mesmo tempo?", expectedAnswer: "" },
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
        id: "responsabilidade.app.video",
        kind: "video",
        title: "1. App de pedidos — assistir destaque",
        description:
          "Conhecer o app onde aparecem os pedidos com produtos, cliente e endereço.",
        url: IG,
      },
      {
        id: "responsabilidade.app.login",
        kind: "credentials",
        title: "1. App de pedidos — acessar a plataforma de pedidos",
        description: "Acesse o link abaixo e faça login com as suas credenciais.",
        url: "https://santabronx.com.br/pedidos/",
        stores: [
          { name: "Santa Bronx Araguari", user: "atendentearaguari", pass: "santa12345" },
          { name: "Santa Bronx Uberlândia", user: "atendenteuberlandia", pass: "santa12345" },
        ],
        confirmLabel: "Já fiz login na plataforma com sucesso.",
      },
      {
        id: "responsabilidade.app.materiais",
        kind: "dual_inline_html",
        title: "1. App de pedidos — ler apostila e checklist do app de pedidos",
        description:
          "Antes de praticar, leia a apostila e o checklist para entender o fluxo completo.",
        first: {
          source: "app_apostila",
          openLabel: "Abrir apostila",
          confirmLabel: "Li a apostila por completo.",
        },
        second: {
          source: "app_checklist",
          openLabel: "Ver checklist",
          confirmLabel: "Vi o checklist e sei onde acessá-lo.",
          helperText:
            "Este checklist estará disponível no ícone do topo para usar sempre que for processar um pedido.",
        },
      },
      {
        id: "responsabilidade.app.pratica",
        kind: "external_html",
        title: "1. App de pedidos — praticar no app de pedidos",
        description:
          "Agora acesse a plataforma e siga o que foi mostrado no destaque. Abra um pedido fechado, leia o resumo, identifique os produtos, quantidades e endereço. Quando terminar de explorar, marque como concluído.",
        url: "https://santabronx.com.br/pedidos/",
        openLabel: "Abrir plataforma",
        confirmLabel:
          "Pratiquei na plataforma e entendo como funciona o fluxo de pedidos.",
      },

      {
        id: "responsabilidade.expectativas.video",
        kind: "video",
        title: "2. O que é esperado — assistir destaque",
        description: "Copie o link, cole em outra aba, assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18094983292984570/",
      },
      {
        id: "responsabilidade.expectativas.apostila",
        kind: "inline_html",
        title: "2. O que é esperado — ler apostila de responsabilidades",
        description:
          "Leia com atenção — esta apostila resume o que é esperado de você a partir de agora na loja.",
        source: "responsabilidade",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila e entendo o que é esperado de mim.",
      },
      {
        id: "responsabilidade.expectativas.fixacao",
        kind: "practice",
        title: "2. O que é esperado — exercício de fixação (10 questões)",
        description:
          "Responda as questões abaixo para fixar o que você leu. Sem nota mínima — apenas fixação.",
        questions: [
          {
            question: "Qual é a principal responsabilidade da atendente a partir deste módulo?",
            options: [
              "Atender clientes presenciais",
              "Embalar, enviar e garantir que os pedidos cheguem sem erros ao cliente",
              "Organizar o estoque da loja",
              "Fazer o atendimento pelo WhatsApp",
            ],
            correctIndex: 1,
          },
          {
            question: "O que deve ser feito antes de lacrar qualquer produto eletrônico?",
            options: [
              "Verificar se a embalagem está no tamanho certo",
              "Confirmar o endereço do cliente",
              "Testar se o produto está funcionando corretamente",
              "Escrever o post-it com o nome do cliente",
            ],
            correctIndex: 2,
          },
          {
            question: "O que significa ter \"atenção\" no trabalho segundo os pilares da Santa Bronx?",
            options: [
              "Responder rápido as mensagens do gestor",
              "Verificar cor, tamanho e quantidade certos antes de embalar — um segundo de atenção evita retrabalho",
              "Manter a loja sempre aberta no horário certo",
              "Decorar todos os produtos da loja",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que nunca se deve se apressar com pedidos acumulados?",
            options: [
              "Porque o cliente não tem pressa",
              "Porque o motoboy demora para chegar de qualquer forma",
              "Porque erros cometidos com pressa geram custos maiores do que o tempo perdido sendo cuidadoso",
              "Porque o gestor precisa revisar cada pedido",
            ],
            correctIndex: 2,
          },
          {
            question: "O que fazer em caso de dúvida durante o trabalho?",
            options: [
              "Tentar resolver sozinha para não incomodar o gestor",
              "Esperar o gestor entrar em contato",
              "Perguntar ao gestor pelo Discord antes de errar — perguntar é sempre melhor do que cometer um erro evitável",
              "Consultar o catálogo de produtos",
            ],
            correctIndex: 2,
          },
          {
            question: "O que é o fluxo de pré-envio e quando deve ser usado?",
            options: [
              "Uma mensagem enviada ao gestor confirmando que o pedido foi embalado",
              "Uma mensagem enviada ao cliente antes de chamar o motoboy, confirmando que ele está no endereço e pode receber agora",
              "Um formulário preenchido no sistema após o envio",
              "Uma notificação automática gerada pelo app 99",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual erro é considerado um dos mais comuns e custosos no dia a dia?",
            options: [
              "Usar embalagem de tamanho errado",
              "Não anotar o nome do motoboy",
              "Enviar produto com variação errada (cor, sabor ou tamanho diferente do pedido)",
              "Não fechar o app 99 após o pedido",
            ],
            correctIndex: 2,
          },
          {
            question: "Quais são os 5 pilares esperados de uma boa atendente na Santa Bronx?",
            options: [
              "Velocidade, simpatia, pontualidade, criatividade e flexibilidade",
              "Agilidade, organização, atenção, calma e comprometimento",
              "Honestidade, dedicação, pontualidade, simpatia e velocidade",
              "Organização, obediência, rapidez, simpatia e proatividade",
            ],
            correctIndex: 1,
          },
          {
            question: "Como o gestor acompanha o trabalho da atendente?",
            options: [
              "Apenas através das câmeras de segurança da loja",
              "Pelo sistema de pedidos e pelo Discord durante o horário de funcionamento",
              "Somente através dos relatórios semanais",
              "O gestor não acompanha — a atendente trabalha de forma completamente autônoma",
            ],
            correctIndex: 1,
          },
          {
            question: "O que deve ser feito sempre, sem exceção, antes de enviar qualquer pedido?",
            options: [
              "Tirar uma foto da embalagem para registrar",
              "Ligar para o cliente confirmando o endereço por voz",
              "Enviar o pré-envio, confirmar que o cliente está no endereço, validar o endereço no mapa e só então chamar o motoboy",
              "Avisar o gestor que o pedido está saindo",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "responsabilidade.expectativas.checklist",
        kind: "inline_html",
        title: "2. O que é esperado — ver checklist de responsabilidades",
        description:
          "Este checklist resume tudo que é esperado de você no dia a dia. Leia com atenção e marque cada item — ele estará disponível nas suas tarefas diárias toda vez que você entrar na loja.",
        source: "responsabilidade_checklist",
        openLabel: "Abrir checklist",
        helperText:
          "Este checklist também fica sempre disponível na aba de tarefas do dia no topo do site.",
        confirmLabel: "Li e marquei todos os itens do checklist por completo.",
      },
      {
        id: "apresentacao.produtos.video",
        kind: "video",
        title: "3. Familiarizar com produtos — assistir destaques",
        url: "https://www.instagram.com/stories/highlights/18094082618461071/",
      },
      {
        id: "apresentacao.produtos.checklist",
        kind: "checklist",
        title: "3. Familiarizar com produtos — checklist",
        items: [
          "Abrir as 2 algemas e analisar elas por completo",
          "Abrir as velas de massagem e sentir o cheiro delas",
          "Abrir todos masturbadores masculinos em cyber skin e analisá-los por completo",
          "Sentir o cheiro dos perfumes existentes",
          "Sentir o efeito na língua dos 2 excitantes (Meltesão e Vibration)",
          "Sentir o efeito do Excitante Pico Pulse (https://sexshopsantabronx.com.br/produto/excitante-unissex-pico-pulse-suga-vibra-pulsa-e-refresca-sabor-melancia/)",
          "Analisar todos os anéis penianos",
          "Analisar todos os vibradores (é necessário ligar eles — não todos)",
          "Pegar os plugs anais na mão e analisar",
          "Abrir e ver material do body stocking e meia",
          "Pegar uma prótese com ventosa e colar ela na parede e chão",
          "Abrir um modelo de prótese em cyber skin pra sentir a diferença do material",
        ],
      },
    ],
  },
  {
    id: "vendas",
    order: 4,
    title: "Fundamentos de Vendas",
    summary: "Abordagem, escuta, oferta e fechamento.",
    accent: "from-emerald-500 to-teal-600",
    subtasks: [
      {
        id: "vendas.video",
        kind: "video",
        title: "1. Fundamentos de vendas — assistir destaque",
        description: "Copie o link, cole em outra aba, assista o destaque por completo.",
        url: IG_VENDAS,
      },
      {
        id: "vendas.apostila",
        kind: "inline_html",
        title: "2. Ler apostila — Fundamentos de Vendas",
        description: "Leia a apostila por completo antes de fazer os exercícios.",
        source: "vendas_apostila",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "vendas.fixacao",
        kind: "practice",
        title: "3. Exercício de fixação — Fundamentos de Vendas (15 questões)",
        description:
          "Múltipla escolha autocorrigido. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Por que responder o cliente rapidamente é essencial?",
            options: [
              "Para parecer mais profissional",
              "Porque o cliente provavelmente está comparando outras lojas ao mesmo tempo e quem responde primeiro ganha a atenção dele",
              "Porque o sistema de atendimento exige tempo de resposta curto",
              "Para evitar que o cliente faça perguntas demais",
            ],
            correctIndex: 1,
          },
          {
            question: "O que acontece se você demorar 3 ou 4 minutos para responder um cliente?",
            options: [
              "Ele vai entender e esperar pacientemente",
              "Ele vai mandar uma mensagem reclamando",
              "Ele pode voltar ao Google e comprar em outro lugar, ou se distrair e esquecer a compra",
              "Nada — ele já escolheu a nossa loja",
            ],
            correctIndex: 2,
          },
          {
            question: "O que significa \"pessoas amam comprar, mas odeiam vendedor\"?",
            options: [
              "Que os clientes preferem comprar sozinhos sem atendimento",
              "Que os clientes gostam de receber muitas opções de produto",
              "Que o cliente sente repulsa quando percebe que estão tentando empurrar produto nele em vez de ajudá-lo de verdade",
              "Que os clientes nunca gostam de ser abordados",
            ],
            correctIndex: 2,
          },
          {
            question: "Qual é a diferença entre ser consultora e ser vendedora no contexto da nossa loja?",
            options: [
              "Consultora vende mais produtos, vendedora vende menos",
              "Consultora se preocupa em ajudar o cliente a encontrar a melhor solução; vendedora tenta empurrar produto sem se importar com o que o cliente precisa",
              "Consultora atende presencialmente, vendedora atende online",
              "Não há diferença — são a mesma coisa",
            ],
            correctIndex: 1,
          },
          {
            question: "Um cliente pede indicação de vibrador. Qual é a atitude correta?",
            options: [
              "Enviar o modelo mais vendido da loja",
              "Enviar o modelo mais caro para aumentar o ticket",
              "Fazer perguntas antes — o cliente quer recarregável? Pequeno ou grande? Para uso individual ou a dois? — e só então indicar",
              "Pedir para o cliente especificar o que quer antes de responder qualquer coisa",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que você deve explicar o porquê ao indicar um produto?",
            options: [
              "Para parecer mais inteligente ao cliente",
              "Para cumprir uma regra da loja",
              "Porque justificar a indicação com base nas qualidades do produto e na necessidade do cliente demonstra interesse real e ajuda o cliente a tomar a decisão",
              "Para o cliente não fazer perguntas",
            ],
            correctIndex: 2,
          },
          {
            question: "O que é uma objeção de venda?",
            options: [
              "Uma reclamação do cliente após a compra",
              "Uma dúvida, medo ou crença que está impedindo o cliente de comprar",
              "Uma pergunta técnica sobre o produto",
              "Uma solicitação de desconto",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que muitos clientes desistem da compra sem perguntar nada?",
            options: [
              "Porque mudam de ideia rapidamente",
              "Porque preferem pesquisar sozinhos",
              "Porque têm medos ou dúvidas na cabeça que não expressam — e se a atendente não quebrar essas objeções, eles simplesmente vão embora",
              "Porque o preço está alto",
            ],
            correctIndex: 2,
          },
          {
            question: "Um cliente pergunta \"vocês têm loja física?\". O que provavelmente está por trás dessa pergunta?",
            options: [
              "Ele quer saber o endereço para ir pessoalmente",
              "Ele tem medo de ser visto entrando em um sex shop e quer saber se a entrada é discreta",
              "Ele quer saber se pode devolver o produto na loja",
              "Ele está apenas curioso sobre o negócio",
            ],
            correctIndex: 1,
          },
          {
            question: "Um cliente pergunta \"vocês entregam?\". Qual resposta quebra melhor as objeções?",
            options: [
              "\"Sim, entregamos para toda a cidade.\"",
              "\"Sim! A entrega é totalmente discreta — embalagem sem identificação, sem escritos, e o motoboy não anuncia nada na porta.\"",
              "\"Sim, pode ficar tranquilo.\"",
              "\"Sim, temos motoboy próprio.\"",
            ],
            correctIndex: 1,
          },
          {
            question: "O que é o pré-requisito para que todos os fundamentos de venda funcionem?",
            options: [
              "Conhecer bem todos os produtos da loja",
              "Responder rápido",
              "Ser uma pessoa simpática — transmitir leveza e estar genuinamente disponível para ajudar, independente de como está emocionalmente",
              "Ter experiência anterior em vendas",
            ],
            correctIndex: 2,
          },
          {
            question: "O que pode acontecer se você tentar empurrar produtos para um cliente?",
            options: [
              "Ele vai comprar mais do que planejava",
              "Ele vai ficar satisfeito com o atendimento",
              "Ele vai sentir repulsa, pode nunca mais voltar e ainda pode falar mal da loja",
              "Ele vai pedir desconto",
            ],
            correctIndex: 2,
          },
          {
            question: "Quando o cliente se sente bem atendido e assessorado de verdade, o que tende a acontecer?",
            options: [
              "Ele compra mais rápido e vai embora",
              "Ele pede mais desconto por ter ficado mais tempo no atendimento",
              "Ele se fideliza, volta a comprar e pode recomendar a loja para outras pessoas",
              "Ele sempre pede para falar com um gerente",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que é importante antecipar objeções sem esperar o cliente perguntar?",
            options: [
              "Para economizar tempo de atendimento",
              "Porque o cliente muitas vezes não vai perguntar — vai simplesmente desistir se a dúvida ficar na cabeça dele",
              "Porque é uma regra da loja sempre falar sobre tudo",
              "Para demonstrar que você conhece bem os produtos",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual das opções abaixo representa uma boa quebra de objeção sobre discrição na entrega?",
            options: [
              "\"Pode ficar tranquilo, é discreto.\"",
              "\"A gente entrega sim, não se preocupa.\"",
              "\"A entrega é feita em embalagem simples, sem nenhuma identificação de sex shop, e o motoboy não vai anunciar o conteúdo — parece qualquer outra entrega.\"",
              "\"Temos política de privacidade rigorosa.\"",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "vendas.checklist",
        kind: "inline_html",
        title: "4. Ver checklist de aprendizados — Fundamentos de Vendas",
        description:
          "Marque os aprendizados que você fixou neste módulo. Este checklist ficará disponível para revisão sempre que precisar.",
        source: "vendas_checklist",
        openLabel: "Abrir checklist",
        helperText: "Este checklist também fica disponível no ícone do topo do site.",
        confirmLabel: "Marquei todos os itens do checklist.",
      },
      {
        id: "vendas.prova.exam",
        kind: "open_evaluation",
        title: "5. Prova: Fundamentos de Vendas",
        description: "Prova dissertativa final do tópico. Nota mínima 70%.",
        passingScore: 70,
        questions: [
          { question: "Por que o tempo de resposta é considerado um dos fundamentos mais importantes no atendimento online?", expectedAnswer: "Na internet o cliente busca em várias lojas ao mesmo tempo; quem responde primeiro ganha a atenção; demorar faz o cliente voltar ao Google ou se distrair." },
          { question: "O cliente enviou mensagem às 14h e você só viu às 14h05. O que pode ter acontecido nesse intervalo e o que isso ensina sobre o tempo de resposta?", expectedAnswer: "Em 5 minutos o cliente pode ter recebido resposta de outra loja, tomado a atenção dele; reforça que cada segundo importa." },
          { question: "Explique com suas palavras o que significa \"as pessoas amam comprar, mas odeiam vendedor\".", expectedAnswer: "As pessoas gostam da experiência de comprar, mas sentem repulsa quando percebem que alguém está tentando empurrar produto em vez de ajudá-las; isso afasta o cliente." },
          { question: "Qual é a diferença entre ser consultora e ser vendedora? Como isso se aplica no nosso atendimento?", expectedAnswer: "Consultora se importa de verdade, faz perguntas, entende a necessidade e indica a melhor solução; vendedora empurra produto sem se importar com o cliente." },
          { question: "Um cliente manda \"qual vibrador você indica?\". Descreva exatamente como você responderia, aplicando o fundamento correto.", expectedAnswer: "Não indicar nada ainda; fazer perguntas de filtro (tamanho, uso individual ou a dois, recarregável ou não, faixa de preço) antes de indicar." },
          { question: "Por que nunca se deve indicar um produto apenas dizendo \"vai nesse que é o melhor\"? Como deve ser feita uma boa indicação?", expectedAnswer: "Sem justificativa, fica claro que é uma indicação vazia/empurrão; a boa indicação explica o porquê com base nas qualidades do produto e na necessidade do cliente." },
          { question: "O que é uma objeção de venda e por que ela pode impedir uma compra mesmo sem o cliente falar nada?", expectedAnswer: "Objeção é uma dúvida, medo ou crença que trava a compra; muitas vezes o cliente não pergunta, simplesmente desiste — por isso é preciso antecipar." },
          { question: "Cite 3 objeções comuns que clientes da nossa loja costumam ter, e como você quebraria cada uma delas.", expectedAnswer: "Ex.: discrição na entrega (embalagem sem identificação), medo de ser visto na loja física (entrada discreta), produto esquentar demais (explicar intensidade/uso)." },
          { question: "Um cliente pergunta \"vocês têm loja física?\". O que provavelmente está por trás dessa pergunta e como você responderia para quebrar esse medo?", expectedAnswer: "Medo de ser visto entrando num sex shop; responder que sim, que a entrada é discreta, sem movimento, pode entrar sem ser visto." },
          { question: "Um cliente pergunta \"vocês entregam?\". Como você responderia para quebrar as principais objeções de entrega de uma vez só?", expectedAnswer: "Confirmar a entrega e já antecipar: embalagem sem identificação de sex shop, motoboy não anuncia o conteúdo, entrega como qualquer outro produto." },
          { question: "Por que a simpatia é considerada um pré-requisito e não apenas mais um fundamento? O que acontece se você atender bem tecnicamente, mas sem simpatia?", expectedAnswer: "Sem simpatia, mesmo que a atendente saiba tudo, o cliente não vai se sentir bem atendido; a leveza e a disponibilidade são o que criam a conexão com o cliente." },
          { question: "Como você diferenciaria na prática um atendimento de uma consultora de um atendimento de uma vendedora comum? Dê um exemplo concreto.", expectedAnswer: "Exemplo com um produto específico — consultora pergunta, filtra, explica; vendedora envia um link sem perguntar nada." },
          { question: "Por que fidelizar um cliente é mais valioso do que simplesmente fechar uma venda?", expectedAnswer: "Cliente fidelizado volta, compra de novo e recomenda — uma venda gera uma receita, um cliente fidelizado gera receita recorrente." },
          { question: "O que você faria se percebesse que está sendo uma vendedora empurrando produto em um atendimento? Como corrigiria no meio da conversa?", expectedAnswer: "Parar de empurrar, voltar a fazer perguntas, demonstrar interesse real na necessidade do cliente, retomar o papel de consultora." },
          { question: "Resuma com suas palavras os 4 fundamentos de venda e o pré-requisito aprendidos neste módulo.", expectedAnswer: "Simpatia (pré-requisito), responder rápido, ser consultora e não vendedora, perguntar antes de indicar e explicar o porquê, prever e quebrar objeções." },
        ],
      },
    ],
  },
  {
    id: "objecoes",
    order: 5,
    title: "Principais Objeções (Sex Shop)",
    summary:
      "Aprender as principais objeções do nicho e como respondê-las.",
    accent: "from-sky-500 to-blue-600",
    subtasks: [
      {
        id: "objecoes.video",
        kind: "video",
        title: "1. Principais Objeções (Sex Shop) — Assistir vídeo",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: IG_OBJECOES,
      },
      {
        id: "objecoes.apostila",
        kind: "inline_html",
        title: "2. Ler apostila — Ler apostila",
        description: "Leia a apostila por completo antes de fazer os exercícios.",
        source: "objecoes_apostila",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "objecoes.fixacao",
        kind: "practice",
        title: "3. Exercício de fixação — Exercício de fixação",
        description:
          "Múltipla escolha autocorrigido. 15 questões. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "O que é uma objeção no atendimento de sex shop?",
            options: [
              "Um desconto que o cliente pede antes de comprar.",
              "Uma dúvida, medo ou insegurança que pode impedir o cliente de comprar.",
              "Um tipo de produto vendido apenas no atendimento presencial.",
              "Uma regra interna da loja sobre embalagem.",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que a consultora não deve esperar o cliente perguntar sobre todas as objeções?",
            options: [
              "Porque o cliente sempre fala tudo o que está pensando.",
              "Porque algumas objeções ficam apenas na cabeça do cliente e podem fazer ele desistir.",
              "Porque objeções não influenciam na venda.",
              "Porque o cliente não se importa com discrição.",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual é uma das principais objeções do cliente no nicho sex shop?",
            options: [
              "Medo da entrega não ser discreta.",
              "Medo de receber desconto.",
              "Medo de o produto chegar rápido demais.",
              "Medo de a loja ter muitas opções.",
            ],
            correctIndex: 0,
          },
          {
            question: "Quando o cliente pergunta se a loja entrega, qual é a melhor resposta?",
            options: [
              "“Entregamos.”",
              "“Sim, mas só explicamos os detalhes depois da compra.”",
              "“Entregamos sim. A entrega é totalmente discreta, com embalagem sem identificação, lacrada e sem mostrar o conteúdo.”",
              "“Entregamos, mas o motoboy sabe o que está levando.”",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que a embalagem não deve ter nome, logo ou identificação da loja?",
            options: [
              "Para deixar o pedido mais barato.",
              "Para preservar a privacidade do cliente e evitar constrangimento.",
              "Para dificultar a entrega do motoboy.",
              "Para o cliente não saber de onde veio o pedido.",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado é importante em relação ao lacre da embalagem?",
            options: [
              "A embalagem pode ir aberta se o produto for pequeno.",
              "A embalagem deve ir bem lacrada para passar confiança e proteger a privacidade do cliente.",
              "O lacre só importa em pedidos presenciais.",
              "O lacre deve ser feito pelo motoboy.",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que a embalagem não pode ser transparente?",
            options: [
              "Porque pode deixar o conteúdo visível e gerar constrangimento ao cliente.",
              "Porque embalagens transparentes são sempre mais caras.",
              "Porque o cliente precisa adivinhar o que comprou.",
              "Porque o motoboy exige embalagem colorida.",
            ],
            correctIndex: 0,
          },
          {
            question: "Qual é o cuidado necessário com produtos que têm formato mais evidente, como próteses?",
            options: [
              "Enviar sem embalagem para não marcar.",
              "Embalar de forma que o formato do produto não fique aparente.",
              "Avisar o motoboy sobre o formato do produto.",
              "Usar embalagem transparente para o cliente conferir.",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual medo o cliente pode ter em relação ao motoboy?",
            options: [
              "Que o motoboy entregue rápido demais.",
              "Que o motoboy não encontre a loja.",
              "Que o motoboy anuncie o conteúdo, use identificação da loja ou não seja discreto.",
              "Que o motoboy cobre mais caro pelo produto.",
            ],
            correctIndex: 2,
          },
          {
            question: "Quando o cliente tem receio sobre o nome que aparece na fatura do cartão, qual orientação pode ser dada?",
            options: [
              "Dizer que não existe nenhuma alternativa.",
              "Explicar que pode ser enviado um link de pagamento e que na fatura aparece apenas Santa Bronx.",
              "Dizer que sempre aparece escrito sex shop.",
              "Pedir para o cliente desistir da compra.",
            ],
            correctIndex: 1,
          },
          {
            question: "Por que algumas pessoas têm vergonha de ir à loja presencial?",
            options: [
              "Porque acham que o atendimento pode ser pesado, constrangedor ou com julgamento.",
              "Porque lojas físicas não vendem produtos de sex shop.",
              "Porque a loja não pode orientar clientes.",
              "Porque o cliente sempre prefere comprar sem atendimento.",
            ],
            correctIndex: 0,
          },
          {
            question: "Qual resposta ajuda a quebrar a objeção de vergonha de ir à loja?",
            options: [
              "“Se tiver vergonha, melhor comprar em outro lugar.”",
              "“O atendimento é rápido e não fazemos perguntas.”",
              "“Pode vir tranquila. Nosso atendimento é leve, discreto e sem julgamento.”",
              "“Você precisa saber exatamente o que quer antes de vir.”",
            ],
            correctIndex: 2,
          },
          {
            question: "Por que a consultora deve fazer perguntas antes de indicar um produto?",
            options: [
              "Para enrolar o atendimento.",
              "Para parecer curiosa sobre a vida do cliente.",
              "Para entender melhor a necessidade do cliente e indicar com mais segurança.",
              "Para evitar vender.",
            ],
            correctIndex: 2,
          },
          {
            question: "O que pode acontecer se a consultora parecer uma “vendedora chata” que só quer empurrar produto?",
            options: [
              "O cliente se sente pressionado, perde confiança e pode desistir.",
              "O cliente sempre compra mais rápido.",
              "O cliente não percebe.",
              "O atendimento fica automaticamente melhor.",
            ],
            correctIndex: 0,
          },
          {
            question: "Por que a leveza da atendente é importante?",
            options: [
              "Porque o cliente precisa sentir naturalidade, simpatia e segurança para se abrir.",
              "Porque o produto vende sozinho e o atendimento não importa.",
              "Porque a atendente não precisa explicar nada.",
              "Porque objeções só existem no atendimento online.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "objecoes.checklist",
        kind: "inline_html",
        title: "4. Ver checklist de aprendizados — Ver checklist de aprendizados",
        description:
          "Marque os aprendizados que você fixou neste módulo. Este checklist ficará disponível para revisão sempre que precisar.",
        source: "objecoes_checklist",
        openLabel: "Abrir checklist",
        helperText: "Este checklist também fica disponível no ícone do topo do site.",
        confirmLabel: "Marquei todos os itens do checklist.",
      },
      {
        id: "objecoes.prova.exam",
        kind: "open_evaluation",
        title: "5. Antes da prova — Prova: Principais Objeções (Sex Shop)",
        description: "Prova dissertativa final do tópico. Nota mínima 70%.",
        passingScore: 70,
        questions: [],
      },
    ],
  },
  {
    id: "dores",
    order: 6,
    title: "Principais Dores e Soluções",
    summary:
      "Aprender a identificar as principais dores dos clientes e indicar as soluções/produtos corretos.",
    accent: "from-violet-500 to-purple-700",
    subtasks: [
      {
        id: "dores.video",
        kind: "video",
        title: "1. Principais Dores e Soluções — Assistir vídeo",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: IG_DORES,
      },
      {
        id: "dores.apostila",
        kind: "inline_html",
        title: "2. Ler apostila — Ler apostila",
        description: "Leia a apostila por completo antes de fazer os exercícios.",
        source: "dores_apostila",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "dores.fixacao",
        kind: "practice",
        title: "3. Exercício de fixação — Exercício de fixação",
        description:
          "Múltipla escolha autocorrigido. 26 questões. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          { question: "O que é disfunção erétil?", options: ["Quando o homem sente desejo sexual excessivo.", "Quando o homem tem dificuldade de ter ou manter o pênis ereto.", "Quando a mulher tem dificuldade de chegar ao orgasmo.", "Quando o casal quer inovar na relação."], correctIndex: 1 },
          { question: "Quando a dificuldade de ereção parece estar mais avançada, qual produto foi apresentado como solução mecânica?", options: ["Perfume com feromônio.", "Bolinha explosiva.", "Bomba peniana.", "Vela para massagem."], correctIndex: 2 },
          { question: "O que caracteriza a ejaculação precoce?", options: ["Falta de lubrificação vaginal.", "O homem chegar ao orgasmo rápido demais.", "Dificuldade de sentir cheiro do perfume.", "Necessidade de usar capa peniana."], correctIndex: 1 },
          { question: "Como o spray retardante ajuda o homem a durar mais?", options: ["Aumentando o tamanho do pênis.", "Esquentando a garganta.", "Reduzindo a sensibilidade da glande.", "Lubrificando o ânus."], correctIndex: 2 },
          { question: "A falta de libido pode estar ligada a quais fatores?", options: ["Apenas ao preço dos produtos.", "Cansaço, estresse, rotina, queda de vitaminas ou falta de energia.", "Apenas ao uso de vibrador.", "Apenas ao formato da embalagem."], correctIndex: 1 },
          { question: "Qual é a diferença básica entre cápsulas de libido e sachês estimulantes?", options: ["Cápsulas são mais ligadas a uso contínuo; sachês têm proposta mais imediata.", "Sachês são apenas para massagem.", "Cápsulas servem como camisinha.", "Não existe diferença."], correctIndex: 0 },
          { question: "Por que excitantes podem ajudar na dificuldade de chegar ao orgasmo?", options: ["Porque podem aumentar sensibilidade e gerar sensações como aquecer, esfriar ou formigar.", "Porque substituem todos os vibradores.", "Porque funcionam como preservativo.", "Porque anestesiam totalmente a região."], correctIndex: 0 },
          { question: "Antes de indicar um vibrador para uma mulher, qual pergunta é essencial?", options: ["Se ela quer uma embalagem transparente.", "Se ela sente mais prazer no clitóris, na penetração ou nos dois.", "Se ela quer usar cartão de outra pessoa.", "Se ela gosta de vela decorativa."], correctIndex: 1 },
          { question: "Quais são duas causas citadas para dor na penetração vaginal?", options: ["Falta de lubrificação e vaginismo.", "Perfume e colar de pérolas.", "Excesso de embalagem.", "Discrição do motoboy."], correctIndex: 0 },
          { question: "Qual produto foi apresentado como tratamento para grande ressecamento vaginal?", options: ["Spray retardante.", "Hidratante vaginal.", "Anel peniano.", "Capa peniana."], correctIndex: 1 },
          { question: "Por que o lubrificante é fundamental no sexo anal?", options: ["Porque o ânus não possui lubrificação própria.", "Porque substitui qualquer cuidado.", "Porque serve para aumentar o pênis.", "Porque impede o uso de plug anal."], correctIndex: 0 },
          { question: "Qual é a função do plug anal no contexto de preparação?", options: ["Lubrificar sozinho a região.", "Preparar e ajudar na dilatação gradual antes da penetração.", "Substituir camisinha.", "Aumentar libido por vitaminas."], correctIndex: 1 },
          { question: "Qual é a função básica do anel peniano?", options: ["Apertar levemente o pênis para ajudar a segurar sangue na região.", "Dissolver dentro do canal vaginal.", "Anestesiar a garganta.", "Substituir lubrificante."], correctIndex: 0 },
          { question: "Qual diferencial alguns modelos de anel peniano possuem?", options: ["Tampa de spray.", "Vibrador para estimular o clitóris durante a penetração.", "Óleo beijável.", "Aplicador vaginal."], correctIndex: 1 },
          { question: "Para que serve o anestésico de garganta?", options: ["Reduzir desconforto e ânsia no oral profundo.", "Aumentar o tamanho do pênis.", "Lubrificar a vagina.", "Estimular o clitóris por vibração."], correctIndex: 0 },
          { question: "Como o anestésico de garganta normalmente é aplicado?", options: ["Em cápsula diária.", "Como spray no fundo da garganta.", "Como plug anal.", "Como colar de pérolas."], correctIndex: 1 },
          { question: "Qual é a proposta do perfume com feromônio?", options: ["Ser um perfume com apelo de atração e desejo.", "Funcionar como lubrificante anal.", "Anestesiar a glande.", "Tratar ressecamento vaginal."], correctIndex: 0 },
          { question: "Como a consultora pode explicar de forma simples o perfume com feromônio?", options: ["“É uma capa de silicone para aumentar volume.”", "“É um perfume para usar no corpo com proposta de despertar mais desejo.”", "“É um spray para o fundo da garganta.”", "“É uma bolinha que dissolve na boca.”"], correctIndex: 1 },
          { question: "Como funcionam as bolinhas explosivas?", options: ["São aplicadas na glande para reduzir sensibilidade.", "São introduzidas no canal e liberam óleo com sensação durante a penetração.", "São colocadas no cartão para mudar a fatura.", "São usadas para prender sangue no pênis."], correctIndex: 1 },
          { question: "Qual dúvida comum sobre bolinhas explosivas a consultora deve saber responder?", options: ["Se a bolinha fica presa no canal.", "Se ela serve como camisinha.", "Se ela substitui médico.", "Se ela aumenta o tamanho do pênis permanentemente."], correctIndex: 0 },
          { question: "O que acontece quando a vela para massagem é acesa?", options: ["Ela vira óleo para massagem.", "Ela vira comprimido.", "Ela vira plug.", "Ela vira bomba peniana."], correctIndex: 0 },
          { question: "Qual é uma dúvida comum sobre vela para massagem?", options: ["Se ela vai queimar a pele como vela comum.", "Se ela aparece na fatura.", "Se ela serve para segurar sangue.", "Se ela aumenta libido por vitamina."], correctIndex: 0 },
          { question: "Para que serve o colar de pérolas no contexto íntimo?", options: ["Estimular regiões íntimas com toque diferente.", "Anestesiar a garganta.", "Tratar vaginismo.", "Substituir lubrificante."], correctIndex: 0 },
          { question: "Uma forma de usar o colar de pérolas é:", options: ["Enrolar no pênis ou na mão para masturbação.", "Tomar duas horas antes da relação.", "Aplicar no fundo da garganta.", "Colocar na fatura do cartão."], correctIndex: 0 },
          { question: "O que a capa peniana faz?", options: ["Aumenta volume/tamanho durante o uso.", "Aumenta o pênis permanentemente.", "Funciona como lubrificante.", "É um perfume com feromônio."], correctIndex: 0 },
          { question: "Qual informação importante deve ser dita sobre capa peniana?", options: ["Ela substitui camisinha.", "Ela não substitui camisinha e não garante proteção.", "Ela é um tratamento médico.", "Ela dissolve com o tempo."], correctIndex: 1 },
        ],
      },
      {
        id: "dores.checklist",
        kind: "inline_html",
        title: "4. Ver checklist de aprendizados — Ver checklist de aprendizados",
        description:
          "Marque os aprendizados que você fixou neste módulo. Este checklist ficará disponível para revisão sempre que precisar.",
        source: "dores_checklist",
        openLabel: "Abrir checklist",
        helperText: "Este checklist também fica disponível no ícone do topo do site.",
        confirmLabel: "Marquei todos os itens do checklist.",
      },
      {
        id: "dores.prova.exam",
        kind: "open_evaluation",
        title: "5. Antes da prova — Prova: Principais Dores e Soluções",
        description: "Prova dissertativa final do tópico. Nota mínima 70%.",
        passingScore: 70,
        questions: [
          { question: "Explique por que a consultora deve entender a dor do cliente antes de indicar qualquer produto.", expectedAnswer: "A consultora age como médica do prazer: precisa entender a dor real do cliente antes de indicar um produto, para oferecer a solução certa e gerar confiança." },
          { question: "O que é disfunção erétil e quais soluções foram apresentadas no treinamento para diferentes níveis de dificuldade?", expectedAnswer: "Disfunção erétil é a dificuldade de ter ou manter o pênis ereto. Para casos leves, cápsulas/sachês estimulantes; para casos mais avançados, bomba peniana como solução mecânica." },
          { question: "Explique a diferença entre indicar cápsulas, sachês estimulantes e bomba peniana para um cliente com dificuldade de ereção ou disposição sexual.", expectedAnswer: "Cápsulas: uso contínuo, ajudam libido e disposição. Sachês: efeito mais imediato e pontual. Bomba peniana: solução mecânica para casos mais avançados de disfunção erétil." },
          { question: "O que é ejaculação precoce e como o spray retardante ajuda nessa dor?", expectedAnswer: "É quando o homem chega ao orgasmo rápido demais. O spray retardante reduz a sensibilidade da glande para que ele dure mais durante a relação." },
          { question: "Qual objeção um cliente pode ter sobre o spray retardante e como a consultora deve explicar isso?", expectedAnswer: "Medo de perder totalmente a sensibilidade ou broxar. Explicar que ele apenas reduz a sensibilidade da glande, sem anular, e que o efeito é controlado." },
          { question: "Explique a diferença entre cápsulas para libido, sachês estimulantes e energéticos afrodisíacos.", expectedAnswer: "Cápsulas: uso contínuo para libido baixa. Sachês: efeito imediato/pontual. Energéticos afrodisíacos: combinam estímulo energético com ingredientes que ajudam o desejo." },
          { question: "Como os excitantes podem ajudar uma pessoa com dificuldade de chegar ao orgasmo?", expectedAnswer: "Aumentam sensibilidade e geram sensações (aquecer, esfriar, formigar) na região, facilitando estímulo e chegada ao orgasmo." },
          { question: "Quais perguntas a consultora deve fazer antes de indicar um vibrador para uma mulher?", expectedAnswer: "Se ela sente mais prazer no clitóris, na penetração ou nos dois; experiência prévia com vibrador; faixa de investimento." },
          { question: "Diferencie lubrificante, hidratante vaginal e dilatadores vaginais.", expectedAnswer: "Lubrificante: uso pontual durante a relação. Hidratante vaginal: tratamento contínuo para ressecamento. Dilatadores: para vaginismo, ajudam a dilatar gradualmente." },
          { question: "Por que o lubrificante é fundamental na penetração anal e por que saliva não é suficiente?", expectedAnswer: "O ânus não tem lubrificação própria. Saliva seca rápido e não protege o tecido; sem lubrificante adequado pode causar dor e lesão." },
          { question: "Explique como anestésico anal e plug anal ajudam a tornar a penetração anal mais confortável.", expectedAnswer: "Anestésico anal reduz desconforto inicial. Plug anal prepara e dilata gradualmente a região antes da penetração principal." },
          { question: "O que é anel peniano e qual a diferença entre modelos com e sem vibrador?", expectedAnswer: "Anel peniano aperta levemente para segurar sangue, ajudando ereção e duração. Modelos com vibrador adicionam estímulo ao clitóris da parceira durante a penetração." },
          { question: "Explique a função do anestésico de garganta e em qual situação ele pode ser indicado.", expectedAnswer: "Reduz reflexo de ânsia e desconforto no oral profundo, indicado para quem quer praticar garganta profunda com mais conforto." },
          { question: "Escolha três produtos de inovação na relação — perfume com feromônio, bolinhas explosivas, vela para massagem ou colar de pérolas — e explique como cada um funciona.", expectedAnswer: "Resposta livre cobrindo três dos quatro: perfume com feromônio (atração/desejo), bolinhas explosivas (liberam óleo no canal), vela para massagem (vira óleo morno), colar de pérolas (estímulo íntimo)." },
          { question: "O que é capa peniana, o que ela resolve e quais cuidados a consultora precisa explicar ao cliente?", expectedAnswer: "Capa peniana aumenta volume/tamanho durante o uso. Importante avisar que ela não substitui camisinha e não oferece proteção contra ISTs/gravidez." },
        ],
      },
    ],
  },
  {
    id: "produtos",
    order: 7,
    title: "Decorar Principais Produtos",
    summary: "Estudar e decorar cada categoria de produto: função, indicação, fala pronta, cuidados e produtos reais no site.",
    accent: "from-indigo-500 to-blue-700",
    subtasks: [
      {
        id: "produtos.perfumes_feromonios.video",
        kind: "video",
        title: "1. Perfumes Feromônios — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18079101806153052/",
      },
      {
        id: "produtos.perfumes_feromonios.produtos",
        kind: "product_links",
        title: "1. Perfumes Feromônios — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Perfume Com Feromonio Selvage", url: "https://sexshopsantabronx.com.br/produto/perfume-com-feromonio-selvage/" },
          { label: "Perfume Com Feromonio Feminino Lady Femme", url: "https://sexshopsantabronx.com.br/produto/perfume-com-feromonio-feminino-lady-femme/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.perfumes_feromonios.fixacao",
        kind: "practice",
        title: "1. Perfumes Feromônios — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Perfumes Feromônios. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta principal de um perfume com feromônio?",
            options: ["Curar problemas de libido e disfunção sexual.", "Aumentar a atratividade percebida e reforçar a presença/autoconfiança de quem usa.", "Substituir desodorante e suor durante o dia inteiro.", "Provocar excitação instantânea em qualquer pessoa próxima."],
            correctIndex: 1,
          },
          {
            question: "Quando faz mais sentido indicar perfume com feromônio para o cliente?",
            options: ["Quando o cliente quer um produto que aja por dentro do corpo, como um excitante.", "Quando o cliente quer reforçar a presença e a sedução em encontros, baladas ou no dia a dia.", "Quando o cliente quer algo que aumente o tamanho do pênis.", "Quando o cliente busca um lubrificante para a relação."],
            correctIndex: 1,
          },
          {
            question: "Qual fala é mais adequada para apresentar um perfume com feromônio?",
            options: ["“Esse perfume garante que qualquer pessoa vai querer ficar com você.”", "“É um perfume com feromônios que ajuda a deixar sua presença mais marcante e a aumentar sua autoconfiança — não é milagroso, mas potencializa a atração.”", "“Esse aqui resolve qualquer problema sexual do casal.”", "“Não sei explicar muito, mas é o mais vendido, pode levar.”"],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer ao vender perfume com feromônio?",
            options: ["Que o aroma é agradável e pode ser usado no dia a dia.", "Que ajuda a reforçar a presença e a autoconfiança.", "Que vai fazer a pessoa desejada se apaixonar ou desejar automaticamente o cliente.", "Que existem versões masculina e feminina."],
            correctIndex: 2,
          },
          {
            question: "Qual é a diferença correta entre perfume com feromônio e excitante?",
            options: ["Os dois são iguais, só muda a embalagem.", "Perfume com feromônio age externamente, na atração; excitante é aplicado no corpo para aumentar sensações durante o ato.", "Perfume é mais forte que excitante.", "Excitante é só para uso oral; perfume é só para uso íntimo."],
            correctIndex: 1,
          },
          {
            question: "Um cliente diz que quer ‘algo para deixar a esposa mais atraída por ele em um jantar’. Qual é a abordagem mais consultiva?",
            options: ["Oferecer um retardante para durar mais à noite.", "Oferecer um anestésico para a parceira.", "Apresentar o perfume com feromônio masculino, explicando que ajuda na presença e na atração ao longo do encontro.", "Indicar um plug anal porque é novidade."],
            correctIndex: 2,
          },
          {
            question: "Qual erro deve ser evitado ao vender perfume com feromônio?",
            options: ["Mostrar versões masculina e feminina.", "Deixar claro que não é milagroso e que potencializa a atração, sem garantir conquista.", "Vender prometendo resultado garantido de conquista, como se fosse uma ‘poção do amor’.", "Perguntar a preferência de aroma do cliente."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.perfumes_feromonios.apostila",
        kind: "inline_html",
        title: "1. Perfumes Feromônios — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_perfumes_feromonios",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.excitantes.video",
        kind: "video",
        title: "2. Excitantes — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18213902995324551/",
      },
      {
        id: "produtos.excitantes.produtos",
        kind: "product_links",
        title: "2. Excitantes — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Excitante Unissex Pico Pulse Suga Vibra Pulsa E Refresca Sabor Melancia", url: "https://sexshopsantabronx.com.br/produto/excitante-unissex-pico-pulse-suga-vibra-pulsa-e-refresca-sabor-melancia/" },
          { label: "Excitante Unissex Vibration Morango Gel Vibrante Intt Facilita E Potencializa O Orgasmo...", url: "https://sexshopsantabronx.com.br/produto/excitante-unissex-vibration-morango-gel-vibrante-intt-facilita-e-potencializa-o-orgasmo-vibra-aumenta-sensibilidade-e-aquece-estimula-o-clitoris-e-glande-deixa/" },
          { label: "Meltesao Excitante Unissex Intt", url: "https://sexshopsantabronx.com.br/produto/meltesao-excitante-unissex-intt/" },
          { label: "Excitante Feminino Beijavel Extra Forte Clito Em Gotas Facilita E Potencializa O Orgasmo...", url: "https://sexshopsantabronx.com.br/produto/excitante-feminino-beijavel-extra-forte-clito-em-gotas-facilita-e-potencializa-o-orgasmo-efeito-de-shock-refrescancia-aquecimento-e-sensacao-de-inchaco-aumenta-sensibilidade-estimula-o-clito/" },
          { label: "Excitante Feminino Goze", url: "https://sexshopsantabronx.com.br/produto/excitante-feminino-goze/" },
          { label: "Excitante Feminino Xana Loka", url: "https://sexshopsantabronx.com.br/produto/excitante-feminino-xana-loka/" },
          { label: "Excitante Masculino Super Macho", url: "https://sexshopsantabronx.com.br/produto/excitante-masculino-super-macho/" },
          { label: "Excitante Masculino Em Spray", url: "https://sexshopsantabronx.com.br/produto/excitante-masculino-em-spray/" },
          { label: "Excitante Masculino Pau De Cavalo", url: "https://sexshopsantabronx.com.br/produto/excitante-masculino-pau-de-cavalo/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.excitantes.fixacao",
        kind: "practice",
        title: "2. Excitantes — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Excitantes. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função principal de um excitante (gel, gotas ou spray)?",
            options: ["Anestesiar a região para reduzir a sensibilidade.", "Aumentar a sensibilidade e o estímulo na região onde é aplicado (clitóris, vulva, glande), com efeitos como esquentar, esfriar, vibrar ou formigar.", "Aumentar o tamanho do pênis de forma permanente.", "Servir como lubrificante principal para penetração."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar um excitante feminino beijável?",
            options: ["Quando a cliente quer um produto só para passar e não ter contato oral.", "Quando o casal quer incrementar o sexo oral, podendo lamber e sentir o efeito juntos.", "Quando a cliente busca um produto para aumentar o canal vaginal.", "Quando o cliente quer durar mais tempo na penetração."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado a atendente precisa ter ao indicar excitantes ‘extra fortes’?",
            options: ["Recomendar usar a maior quantidade possível para garantir efeito.", "Avisar para começar com pouca quantidade, porque exagerar pode incomodar/arder mais que prazer.", "Garantir que não causa nenhuma reação em ninguém.", "Dizer que pode ser usado dentro do canal vaginal sem restrição."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre excitante e adstringente?",
            options: ["Excitante aumenta sensações e estímulo; adstringente dá sensação de canal mais apertado.", "Excitante e adstringente fazem exatamente a mesma coisa.", "Adstringente é só para homem; excitante é só para mulher.", "Excitante é usado depois e adstringente antes da relação."],
            correctIndex: 0,
          },
          {
            question: "Cliente pergunta: ‘esse excitante vai me fazer ter orgasmo na hora?’ Qual a melhor resposta?",
            options: ["“Sim, com certeza, é garantido.”", "“Ele potencializa as sensações na região, mas o orgasmo depende do conjunto: estímulo, conexão e momento.”", "“Não funciona, é só marketing.”", "“Só funciona se você tomar junto com um remédio.”"],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda deve ser evitado com excitante?",
            options: ["Perguntar se a pessoa prefere efeito esquenta, esfria ou vibratório.", "Mostrar que existem versões femininas, masculinas e unissex.", "Prometer ao cliente que o produto vai resolver falta de libido ou problema de ereção.", "Mostrar os sabores disponíveis nos beijáveis."],
            correctIndex: 2,
          },
          {
            question: "Um cliente quer ‘algo para esquentar e formigar no clitóris’. Qual indicação faz mais sentido?",
            options: ["Lubrificante neutro à base de água.", "Excitante feminino com efeito esquenta/formiga aplicado no clitóris.", "Retardante masculino em spray.", "Capa peniana com cerdas massageadoras."],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "produtos.excitantes.apostila",
        kind: "inline_html",
        title: "2. Excitantes — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_excitantes",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.adstringente.video",
        kind: "video",
        title: "3. Adstringente — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18110763523883412/",
      },
      {
        id: "produtos.adstringente.produtos",
        kind: "product_links",
        title: "3. Adstringente — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Adstringente Feminino Lacradinha", url: "https://sexshopsantabronx.com.br/produto/adstringente-feminino-lacradinha/" },
          { label: "Bolinha Explosiva Adstringente", url: "https://sexshopsantabronx.com.br/produto/bolinha-explosiva-adstringente/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.adstringente.fixacao",
        kind: "practice",
        title: "3. Adstringente — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Adstringente. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do adstringente íntimo feminino?",
            options: ["Aumentar permanentemente o tamanho do canal vaginal.", "Provocar sensação temporária de canal mais apertado, aumentando o atrito durante a penetração.", "Substituir o lubrificante na relação.", "Tratar infecções e problemas ginecológicos."],
            correctIndex: 1,
          },
          {
            question: "Quando faz sentido indicar adstringente?",
            options: ["Para qualquer cliente, sempre, sem entender a necessidade.", "Quando a cliente ou o casal quer mais sensação de aperto/atrito durante a relação.", "Quando o cliente quer durar mais tempo na penetração.", "Quando a cliente busca algo para o sexo oral."],
            correctIndex: 1,
          },
          {
            question: "O que NÃO se deve prometer ao vender adstringente?",
            options: ["Que dá uma sensação temporária de aperto.", "Que existe em versão gel e em versão bolinha efervescente.", "Que o efeito é permanente e ‘reconstrói’ o canal vaginal.", "Que pode beneficiar os dois pelo maior atrito."],
            correctIndex: 2,
          },
          {
            question: "Qual é a diferença correta entre adstringente em gel e bolinha efervescente?",
            options: ["São produtos completamente diferentes que não têm relação.", "O gel é aplicado e espalhado; a bolinha é inserida e libera o ativo conforme se dissolve.", "A bolinha é para uso anal e o gel para uso vaginal.", "Os dois precisam ser ingeridos para fazer efeito."],
            correctIndex: 1,
          },
          {
            question: "Cliente pergunta: ‘adstringente combina com excitante?’ Qual a melhor resposta?",
            options: ["“Não pode usar nada com nada, é perigoso.”", "“Pode-se combinar com excitante: o adstringente dá a sensação de aperto e o excitante intensifica o estímulo. Recomendo testar com pouco no primeiro uso.”", "“Combinam, e quanto mais quantidade, melhor o resultado.”", "“Só funciona junto com retardante masculino.”"],
            correctIndex: 1,
          },
          {
            question: "Qual postura é mais consultiva ao oferecer adstringente?",
            options: ["Insistir mesmo quando a cliente diz que não tem essa necessidade.", "Apresentar como opção quando o casal demonstra interesse em mais atrito/sensação de aperto, explicando que o efeito é temporário.", "Vender empurrando, dizendo que toda mulher precisa.", "Dizer que é um produto médico que ‘arruma’ o corpo da cliente."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com adstringente?",
            options: ["Explicar o tempo aproximado do efeito.", "Sugerir começar com pouca quantidade.", "Vender como se ‘consertasse’ um problema da cliente, como pós-parto.", "Mostrar opções em gel e em bolinha."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.adstringente.apostila",
        kind: "inline_html",
        title: "3. Adstringente — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_adstringente",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.capas_penianas.video",
        kind: "video",
        title: "4. Capas Penianas — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/17912793174179906/",
      },
      {
        id: "produtos.capas_penianas.produtos",
        kind: "product_links",
        title: "4. Capas Penianas — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Capa Peniana 4", url: "https://sexshopsantabronx.com.br/produto/capa-peniana-4/" },
          { label: "Masturbador Capa Peniana 2 Em 1", url: "https://sexshopsantabronx.com.br/produto/masturbador-capa-peniana-2-em-1/" },
          { label: "Capa Peniana Vazada Com Alca", url: "https://sexshopsantabronx.com.br/produto/capa-peniana-vazada-com-alca/" },
          { label: "Capa Peniana 3", url: "https://sexshopsantabronx.com.br/produto/capa-peniana-3/" },
          { label: "Capa Peniana Transparente Super Macia Possui Cerdas Massageadoras Aumenta O Tamanho Do...", url: "https://sexshopsantabronx.com.br/produto/capa-peniana-transparente-super-macia-possui-cerdas-massageadoras-aumenta-o-tamanho-do-penis-aumenta-o-prazer-na-penetracao-retarda-a-ejaculacao-glande-bem-destacada/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.capas_penianas.fixacao",
        kind: "practice",
        title: "4. Capas Penianas — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Capas Penianas. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta de uma capa peniana?",
            options: ["Substituir totalmente o pênis durante a relação.", "Encaixar sobre o pênis para aumentar volume, comprimento, textura e/ou tempo, intensificando o prazer da parceira.", "Funcionar como anticoncepcional substituindo o preservativo.", "Servir apenas como item decorativo, sem uso real."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar uma capa peniana?",
            options: ["Quando o casal quer aumentar volume/tempo na penetração ou explorar diferentes texturas.", "Quando a cliente quer um produto para usar sozinha sem o parceiro.", "Quando o cliente quer apenas um lubrificante.", "Quando o objetivo é tratar disfunção erétil de forma médica."],
            correctIndex: 0,
          },
          {
            question: "Qual é a diferença correta entre uma capa peniana e um pênis realístico?",
            options: ["Os dois são iguais e usados da mesma forma.", "A capa é encaixada sobre o pênis durante a relação; o pênis realístico é uma prótese usada sem necessidade de pênis ereto.", "Pênis realístico é usado por cima do pênis e a capa é independente.", "Capa peniana é só para uso solo e pênis realístico só para casal."],
            correctIndex: 1,
          },
          {
            question: "Sobre a capa peniana vazada com alça, o que é correto dizer?",
            options: ["Substitui a ereção completamente, mesmo sem pênis ereto.", "É indicada quando o cliente tem ereção e quer aumentar volume/comprimento, fixando-se melhor pela alça.", "Funciona apenas como masturbador masculino.", "Não pode ser usada com lubrificante."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer ao vender capa peniana?",
            options: ["Que aumenta o volume e a sensação de cheio durante a penetração.", "Que existem modelos com cerdas, relevos e diferentes tamanhos.", "Que cura disfunção erétil ou aumenta o pênis de forma permanente.", "Que pode retardar a ejaculação pelo efeito de menor sensibilidade."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘minha esposa reclama que é fininho’. Qual a indicação mais consultiva?",
            options: ["Vender um anel peniano simples.", "Indicar excitante feminino apenas.", "Apresentar capa peniana que aumente a circunferência, explicando que dá mais sensação de volume sem alterar o pênis do cliente.", "Indicar um plug anal."],
            correctIndex: 2,
          },
          {
            question: "Qual erro de venda evitar com capa peniana?",
            options: ["Recomendar uso com lubrificante para conforto.", "Explicar que algumas capas também ajudam a retardar a ejaculação.", "Prometer aumento permanente do pênis ou cura de problemas de ereção.", "Mostrar opções com diferentes texturas."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.capas_penianas.apostila",
        kind: "inline_html",
        title: "4. Capas Penianas — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_capas_penianas",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.plug_anal.video",
        kind: "video",
        title: "5. Plug Anal — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/17881692318550727/",
      },
      {
        id: "produtos.plug_anal.produtos",
        kind: "product_links",
        title: "5. Plug Anal — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Plug Anal Com Joia Em Metal P", url: "https://sexshopsantabronx.com.br/produto/plug-anal-com-joia-em-metal-p/" },
          { label: "Plug Anal Com Joia Em Metal M", url: "https://sexshopsantabronx.com.br/produto/plug-anal-com-joia-em-metal-m/" },
          { label: "Plug Anal Com Joia Em Metal G", url: "https://sexshopsantabronx.com.br/produto/plug-anal-com-joia-em-metal-g/" },
          { label: "Plug Anal P Em Silicone Macio", url: "https://sexshopsantabronx.com.br/produto/plug-anal-p-em-silicone-macio/" },
          { label: "Plug Anal Com Joia Em Coracao", url: "https://sexshopsantabronx.com.br/produto/plug-anal-com-joia-em-coracao/" },
          { label: "Plug Anal Em Plastico Com Pedra Em Formato De Coracao", url: "https://sexshopsantabronx.com.br/produto/plug-anal-em-plastico-com-pedra-em-formato-de-coracao/" },
          { label: "Plug Anal Vibrador 2", url: "https://sexshopsantabronx.com.br/produto/plug-anal-vibrador-2/" },
          { label: "Plug Anal Vibratorio Feito Em Silicone Controlado Por Aplicativo 10 Modos De Vibracao...", url: "https://sexshopsantabronx.com.br/produto/plug-anal-vibratorio-feito-em-silicone-controlado-por-aplicativo-10-modos-de-vibracao-recarregavel-resistente-a-agua-controlado-de-qualquer-distanci/" },
          { label: "Vib Estimulador De Prostata360", url: "https://sexshopsantabronx.com.br/produto/vib-estimulador-de-prostata360/" },
          { label: "Plug Anal De Vidro Temperado Rosa Tamanho M 8Cm X 5Cm", url: "https://sexshopsantabronx.com.br/produto/plug-anal-de-vidro-temperado-rosa-tamanho-m-8cm-x-5cm/" },
          { label: "Plug Anal De Vidro Temperado Modelo Transparente Com Detalhe Em Coracao Possui Revelos...", url: "https://sexshopsantabronx.com.br/produto/plug-anal-de-vidro-temperado-modelo-transparente-com-detalhe-em-coracao-possui-revelos-massageadores-17cm-comprimento-x-5cm-espessura/" },
          { label: "Kit Plug Anal Em Silicone", url: "https://sexshopsantabronx.com.br/produto/kit-plug-anal-em-silicone/" },
          { label: "Plug Anal De Silicone Grande Gg", url: "https://sexshopsantabronx.com.br/produto/plug-anal-de-silicone-grande-gg/" },
          { label: "Estimulador De Prostata 5", url: "https://sexshopsantabronx.com.br/produto/estimulador-de-prostata-5/" },
          { label: "Plug Anal Inflavel", url: "https://sexshopsantabronx.com.br/produto/plug-anal-inflavel/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.plug_anal.fixacao",
        kind: "practice",
        title: "5. Plug Anal — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Plug Anal. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do plug anal?",
            options: ["Substituir o pênis em uma relação anal completa, com movimentos automáticos.", "Estimular a região anal e ser usado para iniciação, treino ou estímulo durante outras práticas.", "Funcionar como anticoncepcional.", "Servir apenas como item decorativo."],
            correctIndex: 1,
          },
          {
            question: "Para que serve a base alargada do plug anal?",
            options: ["É só estética, sem função real.", "Evita que o plug entre por completo e fique preso dentro do corpo.", "Aumenta o tamanho do plug.", "Serve para conectar a um aplicativo."],
            correctIndex: 1,
          },
          {
            question: "Qual é a melhor indicação para um cliente iniciante na prática anal?",
            options: ["O maior plug disponível, para já se acostumar.", "Um plug pequeno, com bastante lubrificante à base de água ou específico para uso anal.", "Um pênis realístico grande, em vez de plug.", "Uma máquina de sexo no modo mais forte."],
            correctIndex: 1,
          },
          {
            question: "Qual lubrificante NÃO deve ser indicado com plug anal de silicone?",
            options: ["Lubrificante à base de água.", "Lubrificante específico para anal à base de água.", "Lubrificante à base de silicone, porque pode danificar o material do plug.", "Gel hidratante íntimo neutro à base de água."],
            correctIndex: 2,
          },
          {
            question: "Qual cuidado a atendente precisa reforçar ao vender plug anal?",
            options: ["Pode introduzir sem lubrificante e sem base alargada, sem risco.", "Sempre usar bastante lubrificação, ir devagar e nunca usar plug sem base alargada.", "Quanto maior e mais rápido, melhor para iniciantes.", "É um produto médico e dispensa orientação."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre plug anal e pênis realístico anal?",
            options: ["São o mesmo produto.", "O plug é feito para ficar inserido e estimular; o pênis realístico é usado em movimento de penetração, simulando o ato.", "O plug é só para homens; o pênis realístico só para mulheres.", "Plug é elétrico; pênis realístico não."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com plug anal?",
            options: ["Mostrar diferentes tamanhos e materiais.", "Explicar a importância da base alargada e do lubrificante.", "Indicar o tamanho maior para iniciantes só para ‘fechar venda mais alta’.", "Conversar sobre experiência prévia do cliente."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.plug_anal.apostila",
        kind: "inline_html",
        title: "5. Plug Anal — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_plug_anal",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.estimulantes_sexuais.video",
        kind: "video",
        title: "6. Estimulantes Sexuais — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/17948935620151742/",
      },
      {
        id: "produtos.estimulantes_sexuais.produtos",
        kind: "product_links",
        title: "6. Estimulantes Sexuais — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Mel Power Honey Original Melzinho Do Amor", url: "https://sexshopsantabronx.com.br/produto/mel-power-honey-original-melzinho-do-amor/" },
          { label: "Energetico Estimulante Unissex Mo Molhada Revoada Com Maca Peruana 355Ml", url: "https://sexshopsantabronx.com.br/produto/energetico-estimulante-unissex-mo-molhada-revoada-com-maca-peruana-355ml/" },
          { label: "Energetico Estimulante Sexual Masculino Mozao Mo Molhada Com Maca Peruana 355Ml Sabor De...", url: "https://sexshopsantabronx.com.br/produto/energetico-estimulante-sexual-masculino-mozao-mo-molhada-com-maca-peruana-355ml-sabor-de-blueberry/" },
          { label: "Potencializador Masculino", url: "https://sexshopsantabronx.com.br/produto/potencializador-masculino/" },
          { label: "Excitante Feminino Sex Femme", url: "https://sexshopsantabronx.com.br/produto/excitante-feminino-sex-femme/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.estimulantes_sexuais.fixacao",
        kind: "practice",
        title: "6. Estimulantes Sexuais — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Estimulantes Sexuais. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta de um estimulante sexual da nossa loja?",
            options: ["É um medicamento que substitui consulta médica para disfunção erétil.", "É um produto natural/suplementar que ajuda na disposição, libido e desempenho, sem substituir acompanhamento médico.", "É um produto anestésico para a parceira.", "É um lubrificante de longa duração."],
            correctIndex: 1,
          },
          {
            question: "Quando faz mais sentido indicar estimulante sexual?",
            options: ["Para o cliente que reclama de baixa libido ou queda de disposição na relação e quer um apoio natural.", "Para qualquer cliente, sempre.", "Apenas para o cliente que quer aumentar o tamanho do pênis.", "Apenas como presente para datas comemorativas."],
            correctIndex: 0,
          },
          {
            question: "O que a atendente NÃO deve prometer com estimulante?",
            options: ["Que pode dar mais disposição e ajudar na libido.", "Que é um produto natural/suplementar.", "Que cura disfunção erétil ou substitui tratamento médico.", "Que existem versões para homem e para mulher."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘tomei remédio para pressão, pode tomar?’ Qual é a postura correta?",
            options: ["“Pode tomar sem problema, é só natural.”", "“Como existe medicação em uso, o ideal é conversar com o médico antes de combinar com qualquer estimulante.”", "“Não, esse produto não funciona com remédios.”", "“Tome em jejum que potencializa o efeito.”"],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre estimulante sexual e excitante?",
            options: ["São o mesmo produto, só muda o nome.", "Estimulante geralmente é ingerido e age na disposição/libido; excitante é aplicado na pele e age na sensação local.", "Excitante é ingerido e estimulante é aplicado na pele.", "Os dois servem só para mulher."],
            correctIndex: 1,
          },
          {
            question: "Qual abordagem é mais consultiva ao oferecer estimulante?",
            options: ["Empurrar como ‘viagra natural’ para qualquer cliente.", "Perguntar sobre a queixa (libido, disposição), reforçar que é um suplemento e indicar conforme o caso.", "Vender prometendo ereção garantida por 8 horas.", "Dizer que substitui o tratamento médico atual."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com estimulante sexual?",
            options: ["Indicar conforme a queixa do cliente.", "Comparar com excitantes para ajudar o cliente a escolher.", "Garantir cura de impotência ou prometer efeito de medicamento controlado.", "Falar que existem opções masculinas e femininas."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.estimulantes_sexuais.apostila",
        kind: "inline_html",
        title: "6. Estimulantes Sexuais — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_estimulantes_sexuais",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.retardante.video",
        kind: "video",
        title: "7. Retardante — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18129328621565287/",
      },
      {
        id: "produtos.retardante.produtos",
        kind: "product_links",
        title: "7. Retardante — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Retardante Masculino", url: "https://sexshopsantabronx.com.br/produto/retardante-masculino/" },
          { label: "Excitante Masculino Em Spray", url: "https://sexshopsantabronx.com.br/produto/excitante-masculino-em-spray/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.retardante.fixacao",
        kind: "practice",
        title: "7. Retardante — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Retardante. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função do retardante masculino?",
            options: ["Aumentar o tamanho do pênis permanentemente.", "Diminuir a sensibilidade do pênis, ajudando o homem a controlar e adiar a ejaculação.", "Aumentar o desejo do parceiro(a) por causa do cheiro.", "Servir como lubrificante principal da relação."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar retardante?",
            options: ["Para o cliente que reclama de ejaculação muito rápida e quer durar mais na penetração.", "Para o cliente que busca aumentar o tamanho do pênis.", "Para a cliente que quer aumentar a sensibilidade no clitóris.", "Apenas em datas comemorativas."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado a atendente precisa orientar ao vender retardante?",
            options: ["Aplicar a quantidade que quiser, sem limite.", "Aplicar pequena quantidade no pênis, aguardar o tempo indicado e evitar contato direto da parceira com o produto, pois pode anestesiar a região dela também.", "Aplicar no clitóris da parceira para o casal durar mais.", "Beber o produto antes da relação."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre retardante e anel peniano?",
            options: ["São o mesmo produto.", "Retardante atua diminuindo a sensibilidade pela aplicação; o anel peniano mantém a ereção por mais tempo prendendo o fluxo sanguíneo.", "Anel peniano é ingerido e retardante é aplicado.", "Retardante serve para a mulher e o anel para o homem."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com retardante?",
            options: ["Que ajuda a aumentar o tempo até a ejaculação.", "Que existem opções em spray e em gel.", "Que cura ejaculação precoce de forma definitiva.", "Que deve aplicar com antecedência para fazer efeito."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘minha mulher reclama que sinto muito rápido, mas ela é sensível ao produto’. Melhor resposta?",
            options: ["“Pode passar nela também, sem problema.”", "“Existem retardantes que indicam aguardar e limpar o excesso antes da penetração, para evitar anestesiar a parceira. Vou te mostrar essa opção.”", "“Use anestésico forte na parceira para ela não reclamar.”", "“Não existe solução, é assim mesmo.”"],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com retardante?",
            options: ["Explicar o tempo de espera antes da relação.", "Sugerir começar com pouca quantidade.", "Vender como cura de ejaculação precoce ou medicamento.", "Apresentar opções em gel e spray."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.retardante.apostila",
        kind: "inline_html",
        title: "7. Retardante — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_retardante",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.anel_peniano.video",
        kind: "video",
        title: "8. Anel Peniano — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18007480826708456/",
      },
      {
        id: "produtos.anel_peniano.produtos",
        kind: "product_links",
        title: "8. Anel Peniano — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Anel Peniano Com Vibrador Luvkis", url: "https://sexshopsantabronx.com.br/produto/anel-peniano-com-vibrador-luvkis/" },
          { label: "Anel Peniano Com Vibrador", url: "https://sexshopsantabronx.com.br/produto/anel-peniano-com-vibrador/" },
          { label: "Anel Peniano Em Silicone Cirurgico Com Estimulador Vibratorio Estimula O Clitoris Baterias...", url: "https://sexshopsantabronx.com.br/produto/anel-peniano-em-silicone-cirurgico-com-estimulador-vibratorio-estimula-o-clitoris-baterias-inclusas/" },
          { label: "Anel Peniano Vibratorio", url: "https://sexshopsantabronx.com.br/produto/anel-peniano-vibratorio/" },
          { label: "Kit Com 03 Aneis Penianos", url: "https://sexshopsantabronx.com.br/produto/kit-com-03-aneis-penianos/" },
          { label: "Kit 03 Aneis Penianos Borracha Com 03 Opcoes De Medida", url: "https://sexshopsantabronx.com.br/produto/kit-03-aneis-penianos-borracha-com-03-opcoes-de-medida/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.anel_peniano.fixacao",
        kind: "practice",
        title: "8. Anel Peniano — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Anel Peniano. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função do anel peniano?",
            options: ["Anestesiar o pênis para retardar a ejaculação.", "Manter a ereção firme por mais tempo, prendendo levemente o fluxo sanguíneo na base do pênis.", "Substituir o pênis durante a penetração.", "Aumentar o tamanho do pênis de forma permanente."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar um anel peniano com vibração?",
            options: ["Quando o casal quer manter a ereção firme e ainda estimular o clitóris da parceira durante a penetração.", "Quando o cliente quer apenas durar mais tempo, sem estímulo extra.", "Quando a cliente quer um produto para usar sozinha sem o parceiro.", "Quando o objetivo é tratamento médico de impotência."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado a atendente precisa reforçar ao vender anel peniano?",
            options: ["Pode ficar a noite toda usando, quanto mais tempo melhor.", "Não usar por longos períodos (geralmente até 20–30 min) e retirar se sentir desconforto/dormência.", "Apertar o máximo possível para garantir efeito.", "Usar sempre sem lubrificante."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre anel peniano e capa peniana?",
            options: ["São o mesmo produto.", "O anel prende a base do pênis para manter a ereção; a capa encaixa sobre o pênis para aumentar volume/textura/comprimento.", "O anel aumenta o pênis; a capa só mantém a ereção.", "Os dois servem para a parceira usar sozinha."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com anel peniano?",
            options: ["Que ajuda a manter a ereção mais firme.", "Que pode ter vibração e estimular a parceira.", "Que cura disfunção erétil ou serve como tratamento médico.", "Que existem modelos em silicone, com vibração e sem vibração."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘perco a ereção no meio da relação’. Indicação mais consultiva?",
            options: ["Vender retardante.", "Apresentar anel peniano (com ou sem vibração), explicando que ajuda a manter a ereção firme; se persistir, recomendar avaliação médica.", "Indicar plug anal.", "Indicar adstringente para a parceira."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com anel peniano?",
            options: ["Mostrar opções com e sem vibração.", "Falar do limite de tempo de uso.", "Indicar para usar por horas seguidas como se não houvesse risco.", "Explicar como colocar e retirar."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.anel_peniano.apostila",
        kind: "inline_html",
        title: "8. Anel Peniano — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_anel_peniano",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.sado.video",
        kind: "video",
        title: "9. Sado — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18047895194583475/",
      },
      {
        id: "produtos.sado.produtos",
        kind: "product_links",
        title: "9. Sado — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Algema De Luxo", url: "https://sexshopsantabronx.com.br/produto/algema-de-luxo/" },
          { label: "Algema Metal Pelucia", url: "https://sexshopsantabronx.com.br/produto/algema-metal-pelucia/" },
          { label: "Kit Sado Bdsm Black Wolf Acompanha 10 Pecas Material Em Alta Qualidade", url: "https://sexshopsantabronx.com.br/produto/kit-sado-bdsm-black-wolf-acompanha-10-pecas-material-em-alta-qualidade/" },
          { label: "Arreio Do Pecado", url: "https://sexshopsantabronx.com.br/produto/arreio-do-pecado/" },
          { label: "Chicote", url: "https://sexshopsantabronx.com.br/produto/chicote/" },
          { label: "Chibata Reforcada De 40Cm 1", url: "https://sexshopsantabronx.com.br/produto/chibata-reforcada-de-40cm-1/" },
          { label: "Corda Bondage De 10 Metros", url: "https://sexshopsantabronx.com.br/produto/corda-bondage-de-10-metros/" },
          { label: "Corda Bondage Shibari 5 Metros", url: "https://sexshopsantabronx.com.br/produto/corda-bondage-shibari-5-metros/" },
          { label: "Mordaca Erotica", url: "https://sexshopsantabronx.com.br/produto/mordaca-erotica/" },
          { label: "Venda Tapa Olhos", url: "https://sexshopsantabronx.com.br/produto/venda-tapa-olhos/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.sado.fixacao",
        kind: "practice",
        title: "9. Sado — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Sado. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta dos produtos de sado/BDSM da loja (algemas, vendas, palmatórias, mordaças)?",
            options: ["São itens médicos para tratar problemas físicos.", "São acessórios para brincadeiras consensuais que envolvem submissão, dominação, restrição e exploração sensorial.", "Substituem o pênis durante a relação.", "São apenas itens decorativos sem uso real."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar produtos de sado?",
            options: ["Para qualquer cliente, sempre.", "Para clientes que querem incrementar a relação com elementos de fantasia, dominação/submissão consensuais ou exploração sensorial.", "Apenas para clientes que sofrem de algum problema sexual.", "Apenas para datas comemorativas, como presente."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado fundamental a atendente deve orientar ao vender produtos de sado?",
            options: ["Não precisa de combinação prévia, ‘surpresa é melhor’.", "Reforçar consentimento entre as partes, combinar uma palavra de segurança e nunca apertar/prender sem comunicação.", "Quanto mais apertado e por mais tempo, melhor a experiência.", "É um produto médico, dispensa qualquer orientação."],
            correctIndex: 1,
          },
          {
            question: "Sobre algemas de metal vs. algemas de tecido/veludo, o que é correto?",
            options: ["Não há diferença alguma, são iguais.", "As de tecido/veludo são mais confortáveis e indicadas para iniciantes; as de metal são mais firmes e podem machucar se mal usadas.", "As de metal são para iniciantes e as de veludo para experientes.", "Só as de metal funcionam de verdade."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve fazer ao vender produtos de sado?",
            options: ["Perguntar a experiência prévia do cliente.", "Recomendar começar com itens mais leves para iniciantes.", "Julgar a prática do cliente ou tratar como algo errado/estranho.", "Explicar a importância da palavra de segurança."],
            correctIndex: 2,
          },
          {
            question: "Cliente iniciante diz: ‘quero algo para começar a brincar de dominação com meu parceiro’. Indicação mais consultiva?",
            options: ["Um kit completo de sado pesado.", "Kit iniciante leve: venda nos olhos, algema confortável, talvez uma pena ou palmatória leve — explicando consentimento e palavra de segurança.", "Uma mordaça pesada de bola.", "Apenas um chicote pesado."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com sado?",
            options: ["Adaptar a indicação ao nível de experiência.", "Reforçar consentimento e palavra de segurança.", "Empurrar itens pesados para iniciantes só pelo ticket maior.", "Mostrar diferentes materiais (veludo, couro, metal)."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.sado.apostila",
        kind: "inline_html",
        title: "9. Sado — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_sado",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.lubrificante.video",
        kind: "video",
        title: "10. Lubrificante — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18203220946339583/",
      },
      {
        id: "produtos.lubrificante.produtos",
        kind: "product_links",
        title: "10. Lubrificante — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Lubrificante Intimo Lubrisex Luxo", url: "https://sexshopsantabronx.com.br/produto/lubrificante-intimo-lubrisex-luxo/" },
          { label: "Lubrificante Intimo Hidranal", url: "https://sexshopsantabronx.com.br/produto/lubrificante-intimo-hidranal/" },
          { label: "Lubrificante Intimo Siliconado D4", url: "https://sexshopsantabronx.com.br/produto/lubrificante-intimo-siliconado-d4/" },
          { label: "Lubrificante Intimo Beijavel D4 Sabor Morango A Base De Agua Nao Gorduroso Deixa O Sexo...", url: "https://sexshopsantabronx.com.br/produto/lubrificante-intimo-beijavel-d4-sabor-morango-a-base-de-agua-nao-gorduroso-deixa-o-sexo-oral-mais-saboroso-60g/" },
          { label: "Lubrificante Intimo K Med 100G", url: "https://sexshopsantabronx.com.br/produto/lubrificante-intimo-k-med-100g/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.lubrificante.fixacao",
        kind: "practice",
        title: "10. Lubrificante — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Lubrificante. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função principal do lubrificante íntimo?",
            options: ["Anestesiar a região durante a relação.", "Reduzir o atrito e aumentar o conforto durante a relação, masturbação ou uso de acessórios.", "Aumentar o tamanho do pênis.", "Substituir o preservativo como contraceptivo."],
            correctIndex: 1,
          },
          {
            question: "Para uso com brinquedo de silicone, qual lubrificante deve ser indicado?",
            options: ["Lubrificante à base de silicone, porque dura mais.", "Lubrificante à base de água, porque o de silicone pode danificar o silicone do brinquedo.", "Vaselina ou óleo de cozinha.", "Qualquer creme hidratante para o corpo."],
            correctIndex: 1,
          },
          {
            question: "Quando o lubrificante à base de silicone é mais indicado?",
            options: ["Para usar com brinquedos de silicone.", "Para relações longas, banho/piscina ou sexo anal — porque dura mais e é mais escorregadio.", "Para uso oral, porque tem ótimo sabor.", "Apenas para crianças."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre lubrificante neutro e lubrificante beijável?",
            options: ["São o mesmo produto.", "O neutro é para uso geral, sem aroma/sabor; o beijável tem sabor e pode ser usado no sexo oral.", "O beijável é apenas para uso anal.", "O neutro é só para sexo oral."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve recomendar como lubrificante?",
            options: ["Lubrificante à base de água.", "Lubrificante à base de silicone para uso com brinquedos não-silicone.", "Vaselina, óleo de cozinha ou cremes corporais como substitutos.", "Lubrificante específico para uso anal."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘minha esposa sente muito incômodo de ressecamento na hora do sexo’. Indicação mais consultiva?",
            options: ["Vender adstringente, para apertar o canal.", "Indicar lubrificante à base de água, explicando que ajuda no conforto e que ressecamento crônico merece atenção médica.", "Indicar excitante apenas, sem lubrificante.", "Indicar capa peniana com cerdas."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com lubrificante?",
            options: ["Perguntar se vai usar com brinquedo, oral ou anal.", "Mostrar versões à base de água, silicone e beijáveis.", "Falar que lubrificante é desnecessário e que é ‘falta de tesão’ usar.", "Alertar sobre compatibilidade com o material do brinquedo."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.lubrificante.apostila",
        kind: "inline_html",
        title: "10. Lubrificante — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_lubrificante",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.masturbador_masculino.video",
        kind: "video",
        title: "11. Masturbador Masculino — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18007013321712178/",
      },
      {
        id: "produtos.masturbador_masculino.produtos",
        kind: "product_links",
        title: "11. Masturbador Masculino — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Masturbador Vagina E Anus Bumbum2", url: "https://sexshopsantabronx.com.br/produto/masturbador-vagina-e-anus-bumbum2/" },
          { label: "Masturbador Vagina E Anus Ral", url: "https://sexshopsantabronx.com.br/produto/masturbador-vagina-e-anus-ral/" },
          { label: "Masturbador Vagina C Vibracao", url: "https://sexshopsantabronx.com.br/produto/masturbador-vagina-c-vibracao/" },
          { label: "Masturbador Vagina 4", url: "https://sexshopsantabronx.com.br/produto/masturbador-vagina-4/" },
          { label: "Masturbador Vagina 2", url: "https://sexshopsantabronx.com.br/produto/masturbador-vagina-2/" },
          { label: "Ovinho Masturbador Realistico", url: "https://sexshopsantabronx.com.br/produto/ovinho-masturbador-realistico/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.masturbador_masculino.fixacao",
        kind: "practice",
        title: "11. Masturbador Masculino — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Masturbador Masculino. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função principal do masturbador masculino (em cyber skin/TPE)?",
            options: ["Substituir totalmente a parceira em toda relação sexual.", "Proporcionar uma masturbação mais realista, com sensação semelhante ao toque/penetração real.", "Aumentar o tamanho do pênis permanentemente.", "Servir como item decorativo."],
            correctIndex: 1,
          },
          {
            question: "Por que se recomenda usar lubrificante à base de água com masturbador de cyber skin/TPE?",
            options: ["Porque a base de silicone pode danificar o material e ressecar o produto.", "Porque o lubrificante de silicone é mais barato.", "Porque o cyber skin precisa ser ‘alimentado’ por silicone.", "Porque é proibido por lei usar à base de água."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado de manutenção a atendente precisa orientar para masturbador?",
            options: ["Não precisa lavar, só guardar.", "Lavar antes e depois do uso com água morna e sabão neutro, secar bem e guardar protegido do pó.", "Lavar com álcool puro sempre.", "Colocar no micro-ondas para esterilizar."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre masturbador realístico (formato de vagina/boca) e ovo/manga?",
            options: ["Não há diferença alguma.", "O realístico imita o formato externo (vagina, boca, ânus) e costuma ser maior; o ovo/manga é menor, mais discreto e focado no canal interno.", "O ovo é elétrico; o realístico nunca.", "O realístico é só para uso a dois; o ovo só para uso solo."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com masturbador masculino?",
            options: ["Que oferece sensação realista.", "Que tem cuidados de limpeza específicos.", "Que cura disfunção erétil ou ‘corrige’ ejaculação precoce.", "Que pode ter texturas diferentes internas."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘meu marido viaja muito, queria algo para ele se masturbar com mais prazer’. Melhor indicação?",
            options: ["Pênis realístico para o cliente.", "Masturbador masculino, explicando os tipos (ovo, manga, realístico) e os cuidados de uso e limpeza.", "Plug anal pequeno.", "Anel peniano com vibração."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com masturbador masculino?",
            options: ["Mostrar opções com texturas e formatos diferentes.", "Explicar limpeza e conservação.", "Indicar lubrificante de silicone para usar com cyber skin.", "Apresentar lubrificante à base de água como complemento."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.masturbador_masculino.apostila",
        kind: "inline_html",
        title: "11. Masturbador Masculino — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_masturbador_masculino",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.roupas.video",
        kind: "video",
        title: "12. Roupas — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18118409227649876/",
      },
      {
        id: "produtos.roupas.produtos",
        kind: "product_links",
        title: "12. Roupas — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Body Stocking Macacao Sexy Detalhe Na Barriga Abertura Intima Tamanho Unico Veste Do 34 Ao 44", url: "https://sexshopsantabronx.com.br/produto/body-stocking-macacao-sexy-detalhe-na-barriga-abertura-intima-tamanho-unico-veste-do-34-ao-44/" },
          { label: "Body C Manga", url: "https://sexshopsantabronx.com.br/produto/body-c-manga/" },
          { label: "Body Stocking Inteiro 1", url: "https://sexshopsantabronx.com.br/produto/body-stocking-inteiro-1/" },
          { label: "Body Stocking Manga Com Strass", url: "https://sexshopsantabronx.com.br/produto/body-stocking-manga-com-strass/" },
          { label: "Body Stocking Mini Vestido", url: "https://sexshopsantabronx.com.br/produto/body-stocking-mini-vestido/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.roupas.fixacao",
        kind: "practice",
        title: "12. Roupas — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Roupas. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta das roupas/lingerie sensuais da loja?",
            options: ["Substituir roupa de uso diário.", "Provocar, criar fantasia, valorizar o corpo e incrementar a relação com elementos visuais.", "Servir como produto medicinal.", "Substituir o lubrificante."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar uma fantasia/roleplay (enfermeira, policial, colegial)?",
            options: ["Quando o casal quer trazer um elemento de fantasia/encenação para sair da rotina.", "Apenas quando a cliente pede pelo nome exato da fantasia.", "Apenas para clientes solteiros.", "Apenas em datas comemorativas."],
            correctIndex: 0,
          },
          {
            question: "Qual diferença correta entre body stocking (meia arrastão de corpo inteiro) e lingerie clássica?",
            options: ["São o mesmo produto.", "O body stocking cobre o corpo todo em tecido tipo arrastão; a lingerie clássica é em peças (sutiã, calcinha, cinta) com mais sustentação.", "O body stocking só serve para homem.", "Lingerie clássica não pode ser usada na relação."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado a atendente precisa ter ao indicar tamanho de roupa sensual?",
            options: ["Garantir que serve em todo mundo, sem perguntar.", "Confirmar manequim/medidas com a cliente, explicar que muitas peças têm tabela específica e que materiais finos são delicados.", "Sempre indicar o maior tamanho disponível.", "Dizer que não importa o tamanho, é elástico."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve fazer ao vender roupas sensuais?",
            options: ["Mostrar diferentes estilos e ocasiões.", "Sugerir combinações (lingerie + meia + acessório).", "Julgar o estilo escolhido pela cliente ou comentar sobre o corpo de forma negativa.", "Explicar como lavar/cuidar das peças."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘quero algo para apimentar a noite com meu marido, mas sou tímida’. Indicação mais consultiva?",
            options: ["Fantasia de látex cheia de detalhes.", "Camisola sensual ou conjunto de lingerie clássica mais delicado, que valorize o corpo sem ser exagerado.", "Body stocking inteiro de arrastão preto.", "Apenas acessórios de sado pesado."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com roupas?",
            options: ["Ajudar na escolha de tamanho.", "Sugerir combinações (peça + acessório).", "Empurrar uma peça muito ousada para uma cliente tímida só pelo ticket maior.", "Mostrar fantasias e lingerie clássica como opções diferentes."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.roupas.apostila",
        kind: "inline_html",
        title: "12. Roupas — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_roupas",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.anestesicos.video",
        kind: "video",
        title: "13. Anestésicos — Assistir destaque",
        description: "Copie o link, cole em outra aba e assista o destaque por completo.",
        url: "https://www.instagram.com/stories/highlights/18092275670268816/",
      },
      {
        id: "produtos.anestesicos.produtos",
        kind: "product_links",
        title: "13. Anestésicos — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Anestesico Anal Cliv Intt Gold", url: "https://sexshopsantabronx.com.br/produto/anestesico-anal-cliv-intt-gold/" },
          { label: "Anestesico Anal Cliv Intt", url: "https://sexshopsantabronx.com.br/produto/anestesico-anal-cliv-intt/" },
          { label: "Anestesico Anal Analdor", url: "https://sexshopsantabronx.com.br/produto/anestesico-anal-analdor/" },
          { label: "Anestesico Anal Sete Sensacoes", url: "https://sexshopsantabronx.com.br/produto/anestesico-anal-sete-sensacoes/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.anestesicos.fixacao",
        kind: "practice",
        title: "13. Anestésicos — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Anestésicos. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a função principal dos anestésicos íntimos vendidos na loja?",
            options: ["Aumentar a sensibilidade da região para sentir mais.", "Diminuir a sensibilidade da região, ajudando a tolerar melhor sexo anal ou retardar ejaculação (quando aplicados no pênis).", "Curar dor crônica na região íntima.", "Substituir o lubrificante."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar anestésico anal?",
            options: ["Para casais iniciantes em sexo anal, junto com bastante lubrificante específico e introdução cuidadosa.", "Para qualquer cliente, sem entender a necessidade.", "Para curar fissura anal.", "Para uso oral."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado fundamental ao vender anestésico anal?",
            options: ["Aplicar a maior quantidade possível para ‘não sentir nada’.", "Alertar que anestesiar demais pode mascarar dor de lesão; usar pouca quantidade, ir devagar e nunca usar anestésico para ‘aguentar’ algo doloroso.", "Garantir que cura qualquer problema da região.", "Recomendar usar diariamente."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre anestésico e retardante?",
            options: ["São o mesmo produto.", "Anestésico foca em reduzir sensibilidade para tolerar melhor uma prática (ex.: anal); retardante é especificamente para o pênis adiar a ejaculação.", "Anestésico é só para mulher e retardante só para homem.", "Retardante é mais forte que anestésico."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com anestésico?",
            options: ["Que diminui a sensibilidade temporariamente.", "Que precisa de lubrificação adequada.", "Que cura dor crônica ou substitui avaliação médica.", "Que existe versão para uso anal e para uso peniano."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘sinto muita dor no sexo anal, queria algo para não sentir nada’. Postura correta?",
            options: ["Vender o anestésico mais forte sem explicação.", "Explicar que dor forte pode indicar falta de lubrificação, técnica errada ou problema físico; oferecer lubrificante específico + anestésico leve, com orientação de uso cuidadoso.", "Dizer que é normal e mandar usar.", "Recomendar plug anal grande de cara."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com anestésico?",
            options: ["Combinar com lubrificante específico para anal.", "Explicar para começar com pouca quantidade.", "Vender anestésico para o cliente ‘aguentar’ algo que dói muito, sem alertar sobre o risco.", "Mostrar opções em gel e spray."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.anestesicos.apostila",
        kind: "inline_html",
        title: "13. Anestésicos — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_anestesicos",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.vibrador_rabbit.video",
        kind: "video",
        title: "14. Vibrador Rabbit — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.vibrador_rabbit.produtos",
        kind: "product_links",
        title: "14. Vibrador Rabbit — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Vibrador Rabbit Ponto G E Clitoris Recarregavel 9 Modos De Vibracao", url: "https://sexshopsantabronx.com.br/produto/vibrador-rabbit-ponto-g-e-clitoris-recarregavel-9-modos-de-vibracao/" },
          { label: "Vibrador Rabbit Recarregavel", url: "https://sexshopsantabronx.com.br/produto/vibrador-rabbit-recarregavel/" },
          { label: "Vibrador Rabbit Pilha Realistico", url: "https://sexshopsantabronx.com.br/produto/vibrador-rabbit-pilha-realistico/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.vibrador_rabbit.fixacao",
        kind: "practice",
        title: "14. Vibrador Rabbit — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Vibrador Rabbit. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a característica que define o vibrador rabbit?",
            options: ["Ter apenas um motor interno simples.", "Ter uma parte para penetração (estímulo no ponto G) e uma haste/orelhinhas externas que estimulam o clitóris ao mesmo tempo.", "Ser usado apenas externamente, sem penetração.", "Ser um vibrador exclusivamente anal."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar um rabbit?",
            options: ["Para cliente que quer estímulo duplo: clitóris e ponto G ao mesmo tempo.", "Para cliente que quer apenas estímulo no clitóris.", "Para casais que querem usar durante a penetração a dois.", "Para uso anal exclusivamente."],
            correctIndex: 0,
          },
          {
            question: "Qual é a diferença correta entre rabbit e sugador de clitóris?",
            options: ["São o mesmo produto.", "Rabbit penetra e estimula o clitóris com vibração/contato; o sugador trabalha por ondas de pressão/sucção só no clitóris, sem penetrar.", "O rabbit só é externo; o sugador penetra.", "Sugador é elétrico e rabbit não."],
            correctIndex: 1,
          },
          {
            question: "Cliente diz: ‘nunca tive orgasmo só pela penetração’. Indicação mais consultiva?",
            options: ["Vender um pênis realístico simples.", "Apresentar um vibrador rabbit, explicando que estimula clitóris e ponto G ao mesmo tempo, o que ajuda muitas mulheres a chegar ao orgasmo.", "Indicar um plug anal.", "Indicar somente lubrificante."],
            correctIndex: 1,
          },
          {
            question: "Qual lubrificante combina melhor com rabbit em silicone?",
            options: ["Lubrificante à base de silicone, porque dura mais.", "Lubrificante à base de água, para não danificar o silicone do brinquedo.", "Vaselina.", "Óleo de cozinha."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com o rabbit?",
            options: ["Que pode ter recarga USB.", "Que existem modelos com balls rotativos.", "Que garante orgasmo em 100% das mulheres.", "Que tem várias velocidades de vibração."],
            correctIndex: 2,
          },
          {
            question: "Qual erro de venda evitar com rabbit?",
            options: ["Mostrar opções com recarga USB e à pilha.", "Explicar a função de cada parte (interna e externa).", "Indicar lubrificante de silicone para um rabbit de silicone.", "Comparar com sugador para ajudar na escolha."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.vibrador_rabbit.apostila",
        kind: "inline_html",
        title: "14. Vibrador Rabbit — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_vibrador_rabbit",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.sugador_de_clitoris.video",
        kind: "video",
        title: "15. Sugador de Clitóris — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.sugador_de_clitoris.produtos",
        kind: "product_links",
        title: "15. Sugador de Clitóris — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Sugador De Clitoris Duplo", url: "https://sexshopsantabronx.com.br/produto/sugador-de-clitoris-duplo/" },
          { label: "Sugador De Clitoris Recarregavel", url: "https://sexshopsantabronx.com.br/produto/sugador-de-clitoris-recarregavel/" },
          { label: "Sugador De Clitoris Recarregavel 2", url: "https://sexshopsantabronx.com.br/produto/sugador-de-clitoris-recarregavel-2/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.sugador_de_clitoris.fixacao",
        kind: "practice",
        title: "15. Sugador de Clitóris — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Sugador de Clitóris. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Como o sugador de clitóris funciona, tecnicamente?",
            options: ["Por penetração vaginal profunda.", "Por ondas de pressão/sucção do ar sobre o clitóris, sem precisar tocar diretamente.", "Por aquecimento da região.", "Por anestesia local na área."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar o sugador de clitóris?",
            options: ["Para clientes que sentem muito prazer no estímulo clitoriano e querem uma sensação diferente (sucção/onda).", "Para clientes que querem apenas estímulo interno.", "Para clientes que querem usar durante a penetração com o parceiro.", "Apenas como presente de Natal."],
            correctIndex: 0,
          },
          {
            question: "Qual é a diferença correta entre sugador e vibrador clitoriano comum?",
            options: ["São o mesmo produto.", "O vibrador clitoriano vibra em contato; o sugador trabalha por sucção/ondas de pressão, sem necessidade de contato direto.", "Sugador é só elétrico e vibrador é só à pilha.", "Sugador penetra e vibrador não."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado importante ao usar o sugador?",
            options: ["Apertar bem forte contra o clitóris para garantir efeito.", "Apoiar o bocal sobre o clitóris sem prensar com força, usar lubrificante à base de água se for sensível, e respeitar o limite de sensibilidade.", "Usar em qualquer região do corpo, sem cuidado.", "Aquecer no fogo antes do uso."],
            correctIndex: 1,
          },
          {
            question: "Cliente diz: ‘chego ao orgasmo, mas demoro muito’. Indicação mais consultiva?",
            options: ["Vender retardante para o parceiro.", "Apresentar o sugador de clitóris, explicando que muitas mulheres relatam orgasmo mais rápido e intenso com sucção/ondas de pressão.", "Indicar adstringente.", "Indicar plug anal."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com sugador?",
            options: ["Que oferece sensação diferente dos vibradores comuns.", "Que tem várias intensidades.", "Que garante orgasmo a todas as mulheres em qualquer situação.", "Que muitos modelos são recarregáveis e à prova d’água."],
            correctIndex: 2,
          },
          {
            question: "Qual erro de venda evitar com sugador de clitóris?",
            options: ["Explicar como apoiar o bocal corretamente.", "Mostrar modelos com diferentes intensidades.", "Vender garantindo que substitui qualquer outro vibrador para qualquer mulher.", "Recomendar lubrificante à base de água."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.sugador_de_clitoris.apostila",
        kind: "inline_html",
        title: "15. Sugador de Clitóris — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_sugador_de_clitoris",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.vibrador_de_calcinha.video",
        kind: "video",
        title: "16. Vibrador de Calcinha — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.vibrador_de_calcinha.produtos",
        kind: "product_links",
        title: "16. Vibrador de Calcinha — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Calcinha Vibratoria Recarregavel Com Ima E Controle Sem Fio", url: "https://sexshopsantabronx.com.br/produto/calcinha-vibratoria-recarregavel-com-ima-e-controle-sem-fio/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.vibrador_de_calcinha.fixacao",
        kind: "practice",
        title: "16. Vibrador de Calcinha — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Vibrador de Calcinha. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do vibrador de calcinha?",
            options: ["Substituir a calcinha do dia a dia.", "Ser pequeno e discreto, fixado na calcinha, para estimular a região íntima — muitas vezes com controle remoto.", "Aumentar o tamanho do pênis.", "Servir como anel peniano."],
            correctIndex: 1,
          },
          {
            question: "Qual é o principal diferencial do vibrador de calcinha em relação a outros vibradores?",
            options: ["Tem maior potência possível.", "A discrição e o controle remoto/à distância, permitindo brincadeira a dois fora de casa.", "Sempre penetra profundamente.", "É à prova d’água em todos os modelos."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar vibrador de calcinha?",
            options: ["Para casais que querem brincar com controle à distância e estímulo discreto.", "Para cliente que quer estímulo interno profundo.", "Para uso anal exclusivamente.", "Apenas como item decorativo."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado a atendente precisa orientar com vibrador de calcinha?",
            options: ["Pode ser usado dentro d’água sempre, em qualquer modelo.", "Conferir como o brinquedo fixa (ímã, encaixe), checar bateria do controle e respeitar o alcance do controle remoto.", "Compartilhar entre várias pessoas sem higienização.", "Usar sem roupa para funcionar."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre vibrador de calcinha e vibrador de aplicativo?",
            options: ["São o mesmo produto.", "O de calcinha geralmente vem com controle remoto físico de curto alcance; o de aplicativo é controlado por celular, permitindo controle de qualquer distância via internet.", "O de aplicativo só funciona para homem.", "O de calcinha é elétrico e o de app não."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com vibrador de calcinha?",
            options: ["Que é discreto.", "Que tem controle remoto.", "Que substitui qualquer outro vibrador, inclusive penetração profunda.", "Que pode ser usado em casa ou em saídas."],
            correctIndex: 2,
          },
          {
            question: "Qual erro de venda evitar com vibrador de calcinha?",
            options: ["Explicar o alcance do controle.", "Mostrar como fixa na calcinha.", "Vender prometendo que é à prova d’água sem confirmar no modelo.", "Comparar com vibrador de aplicativo."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.vibrador_de_calcinha.apostila",
        kind: "inline_html",
        title: "16. Vibrador de Calcinha — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_vibrador_de_calcinha",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.maquina_de_sexo.video",
        kind: "video",
        title: "17. Máquina de Sexo — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.maquina_de_sexo.produtos",
        kind: "product_links",
        title: "17. Máquina de Sexo — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Maquina De Sexo Uberlandia", url: "https://sexshopsantabronx.com.br/produto/maquina-de-sexo-uberlandia/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.maquina_de_sexo.fixacao",
        kind: "practice",
        title: "17. Máquina de Sexo — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Máquina de Sexo. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta da máquina de sexo?",
            options: ["Substituir totalmente o parceiro em qualquer relação.", "Reproduzir o movimento de penetração de forma automática, com velocidades reguláveis, para uso solo ou a dois.", "Servir como item de decoração.", "Funcionar como anticoncepcional."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar uma máquina de sexo?",
            options: ["Para cliente experiente que quer um nível de estímulo diferente, com penetração automática.", "Para cliente iniciante absoluto, sem orientação.", "Para qualquer cliente, sempre.", "Apenas para uso anal."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado importante ao vender máquina de sexo?",
            options: ["Usar sempre na velocidade máxima de cara.", "Começar nas velocidades menores, usar bastante lubrificante adequado ao material do dildo e nunca usar contra dor/incômodo.", "Não precisa de lubrificação.", "Pode ser ligada na água sem cuidado."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre máquina de sexo e vibrador comum?",
            options: ["São o mesmo produto.", "O vibrador comum vibra; a máquina de sexo reproduz o movimento de vai-e-vem (penetração) de forma automática.", "Vibrador é elétrico e máquina não.", "Vibrador é só externo e máquina só anal."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com máquina de sexo?",
            options: ["Que tem velocidades reguláveis.", "Que pode trocar o dildo em alguns modelos.", "Que cura disfunção sexual ou problemas do casal.", "Que é mais indicada para quem já tem alguma experiência."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘quero algo bem intenso para usar sozinha, com penetração automática’. Indicação mais consultiva?",
            options: ["Mini vibrador clitoriano.", "Máquina de sexo, explicando regulagem de velocidade, lubrificação e cuidados de uso.", "Sugador de clitóris.", "Vibrador de calcinha."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com máquina de sexo?",
            options: ["Explicar como regular a velocidade.", "Recomendar lubrificante adequado.", "Indicar para iniciante absoluta sem alertar sobre intensidade e cuidados.", "Mostrar opções com dildo intercambiável."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.maquina_de_sexo.apostila",
        kind: "inline_html",
        title: "17. Máquina de Sexo — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_maquina_de_sexo",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.vibrador_de_casal.video",
        kind: "video",
        title: "18. Vibrador de Casal — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.vibrador_de_casal.produtos",
        kind: "product_links",
        title: "18. Vibrador de Casal — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Vibrador Para Casal Com Controle Sem Fio", url: "https://sexshopsantabronx.com.br/produto/vibrador-para-casal-com-controle-sem-fio/" },
          { label: "Vibrador Para Casal Com Relevos", url: "https://sexshopsantabronx.com.br/produto/vibrador-para-casal-com-relevos/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.vibrador_de_casal.fixacao",
        kind: "practice",
        title: "18. Vibrador de Casal — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Vibrador de Casal. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do vibrador de casal (em formato de U/V)?",
            options: ["Substituir o pênis durante a relação.", "Ser usado durante a penetração: uma parte fica interna estimulando a mulher e a outra externa estimula o clitóris (e o pênis também sente a vibração).", "Ser usado apenas pela mulher sozinha.", "Ser um vibrador exclusivamente anal."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar vibrador de casal?",
            options: ["Para o casal que quer mais estímulo durante o ato, sem trocar o parceiro pelo brinquedo.", "Para cliente que quer um brinquedo só para uso solo.", "Para uso oral exclusivo.", "Apenas como item decorativo."],
            correctIndex: 0,
          },
          {
            question: "Qual é a diferença correta entre vibrador de casal e vibrador rabbit?",
            options: ["São o mesmo produto.", "O rabbit é usado pela mulher (penetra e estimula clitóris); o de casal é desenhado para ser usado durante a relação com o parceiro, estimulando ambos.", "Os dois são iguais, só muda a cor.", "Vibrador de casal só é externo."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado a atendente precisa orientar com vibrador de casal?",
            options: ["Não precisa de lubrificante.", "Explicar o posicionamento correto (parte interna na vagina, externa no clitóris) e recomendar lubrificante à base de água se for silicone.", "Pode-se compartilhar sem higienizar.", "Sempre usar na potência máxima."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com vibrador de casal?",
            options: ["Que pode ter controle remoto ou app.", "Que o pênis também sente vibração durante a penetração.", "Que substitui qualquer problema de desempenho ou desejo do casal.", "Que estimula clitóris e ponto G ao mesmo tempo."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘queria algo para os dois sentirem prazer ao mesmo tempo durante a relação’. Indicação mais consultiva?",
            options: ["Plug anal pequeno.", "Vibrador de casal em formato U/V, explicando como se encaixa e como cada um sente o estímulo.", "Apenas lubrificante neutro.", "Apenas um pênis realístico."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com vibrador de casal?",
            options: ["Mostrar opções com app/controle.", "Explicar posicionamento.", "Vender confundindo com vibrador individual comum, sem explicar o uso a dois.", "Recomendar lubrificante adequado."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.vibrador_de_casal.apostila",
        kind: "inline_html",
        title: "18. Vibrador de Casal — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_vibrador_de_casal",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.vibrador_de_aplicativo.video",
        kind: "video",
        title: "19. Vibrador de Aplicativo — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.vibrador_de_aplicativo.produtos",
        kind: "product_links",
        title: "19. Vibrador de Aplicativo — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Vibrador Por Aplicativo Lola", url: "https://sexshopsantabronx.com.br/produto/vibrador-por-aplicativo-lola/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.vibrador_de_aplicativo.fixacao",
        kind: "practice",
        title: "19. Vibrador de Aplicativo — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Vibrador de Aplicativo. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a principal característica do vibrador de aplicativo?",
            options: ["Ser ligado apenas por controle físico de curto alcance.", "Ser controlado pelo celular via app, permitindo controle remoto via internet, padrões personalizados e brincadeira à distância.", "Não ter nenhum tipo de vibração.", "Ser um vibrador exclusivamente anal."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar vibrador de aplicativo?",
            options: ["Para casais em relacionamento à distância ou que querem brincar de longe.", "Para cliente que não tem smartphone.", "Apenas para uso solo sem nenhum controle.", "Apenas para uso médico."],
            correctIndex: 0,
          },
          {
            question: "Qual cuidado a atendente precisa orientar com vibrador de app?",
            options: ["Não importa o app, qualquer celular funciona sem configurar.", "Avisar que precisa baixar o aplicativo do fabricante, parear via Bluetooth e que recursos à distância via internet exigem conexão de ambos os lados.", "Pode usar sem carregar a bateria.", "Só funciona em celulares antigos."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre vibrador de aplicativo e vibrador de calcinha simples?",
            options: ["São o mesmo produto.", "O de aplicativo é controlado pelo celular, com alcance via internet; o de calcinha simples normalmente vem com controle remoto físico de curto alcance.", "O de calcinha sempre tem app.", "Vibrador de app não vibra."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com vibrador de aplicativo?",
            options: ["Que tem padrões de vibração personalizáveis.", "Que pode ser controlado à distância.", "Que funciona sem internet/sem bateria/sem o app instalado.", "Que é recarregável."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘meu parceiro mora em outra cidade, queria algo que ele controlasse à distância’. Indicação mais consultiva?",
            options: ["Vibrador de calcinha com controle físico de curto alcance.", "Vibrador de aplicativo, explicando a necessidade do app, Bluetooth e conexão de internet de ambos os lados.", "Anel peniano.", "Plug anal."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com vibrador de aplicativo?",
            options: ["Explicar o passo a passo de instalação do app.", "Falar sobre alcance e dependência de internet.", "Vender prometendo controle remoto sem internet e sem app.", "Mostrar funcionalidades de padrões personalizados."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.vibrador_de_aplicativo.apostila",
        kind: "inline_html",
        title: "19. Vibrador de Aplicativo — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_vibrador_de_aplicativo",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.varinha_magica.video",
        kind: "video",
        title: "20. Varinha Mágica — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.varinha_magica.produtos",
        kind: "product_links",
        title: "20. Varinha Mágica — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Vibrador Varinha Magica Luxo", url: "https://sexshopsantabronx.com.br/produto/vibrador-varinha-magica-luxo/" },
          { label: "Mini Vibrador Varinha Magica 3", url: "https://sexshopsantabronx.com.br/produto/mini-vibrador-varinha-magica-3/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.varinha_magica.fixacao",
        kind: "practice",
        title: "20. Varinha Mágica — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Varinha Mágica. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta da varinha mágica (massageador)?",
            options: ["Ser um massageador potente com cabeça grande, usado principalmente para estímulo externo, sobretudo no clitóris.", "Ser um vibrador exclusivamente anal.", "Ser um anel peniano para o homem.", "Servir apenas como item decorativo."],
            correctIndex: 0,
          },
          {
            question: "Quando é mais adequado indicar a varinha mágica?",
            options: ["Para cliente que gosta de estímulo externo bem intenso, principalmente clitoriano.", "Para cliente que quer estímulo interno profundo de ponto G.", "Para uso exclusivo anal.", "Apenas como presente, sem uso real."],
            correctIndex: 0,
          },
          {
            question: "Qual é a diferença correta entre varinha mágica e mini vibrador?",
            options: ["São o mesmo produto.", "A varinha é maior, mais potente e voltada para estímulo externo intenso; o mini é compacto, mais discreto e portátil, com potência menor.", "Mini vibrador é mais potente.", "Varinha mágica é só anal."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado a atendente precisa orientar com a varinha?",
            options: ["Apoiar a cabeça com força máxima desde o início.", "Começar nas potências menores, pode usar sobre a roupa para iniciantes (a sensibilidade pode ser muito intensa) e usar lubrificante à base de água se for sensível.", "Usar sempre dentro d’água, sem ler manual.", "Compartilhar entre várias pessoas sem higienização."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com varinha mágica?",
            options: ["Que tem potência alta.", "Que pode ser usada sobre a roupa.", "Que garante orgasmo a 100% das mulheres em qualquer situação.", "Que tem versão recarregável e com fio."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘quero algo bem potente para estímulo externo’. Indicação mais consultiva?",
            options: ["Vibrador de calcinha discreto.", "Varinha mágica, explicando potência, intensidades e que se pode usar sobre a roupa para suavizar.", "Anel peniano.", "Plug anal."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com varinha mágica?",
            options: ["Sugerir começar nas potências menores.", "Mostrar versões com e sem fio.", "Empurrar para cliente que claramente queria algo pequeno e discreto.", "Recomendar lubrificante à base de água."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.varinha_magica.apostila",
        kind: "inline_html",
        title: "20. Varinha Mágica — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_varinha_magica",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.mini_vibrador.video",
        kind: "video",
        title: "21. Mini Vibrador — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.mini_vibrador.produtos",
        kind: "product_links",
        title: "21. Mini Vibrador — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Vibrador Bullet Recarregavel Com 10 Vibracoes", url: "https://sexshopsantabronx.com.br/produto/vibrador-bullet-recarregavel-com-10-vibracoes/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.mini_vibrador.fixacao",
        kind: "practice",
        title: "21. Mini Vibrador — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Mini Vibrador. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do mini vibrador?",
            options: ["Ser um vibrador grande para penetração profunda.", "Ser um vibrador compacto, discreto e portátil, ótimo para iniciantes ou para quem quer transportar com discrição.", "Ser um anel peniano.", "Servir como item decorativo."],
            correctIndex: 1,
          },
          {
            question: "Para qual perfil de cliente o mini vibrador é mais indicado?",
            options: ["Cliente experiente que busca a maior potência possível.", "Cliente iniciante, que quer discrição ou que quer um brinquedo pequeno para viagem/bolsa.", "Cliente que quer máquina de sexo com penetração automática.", "Cliente que quer estímulo anal pesado."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre mini vibrador e varinha mágica?",
            options: ["São o mesmo produto.", "O mini é compacto e discreto, com potência menor; a varinha é maior, com potência forte para estímulo externo intenso.", "Varinha é mais discreta.", "Mini vibrador é só para uso a dois."],
            correctIndex: 1,
          },
          {
            question: "Qual cuidado importante ao indicar o mini vibrador?",
            options: ["Confiar a vida na potência máxima.", "Alertar sobre o tamanho real (mostrar foto/medida) e indicar lubrificante à base de água se for de silicone.", "Garantir que substitui qualquer vibrador grande.", "Recomendar uso sem nenhuma higienização."],
            correctIndex: 1,
          },
          {
            question: "O que a atendente NÃO deve prometer com mini vibrador?",
            options: ["Que é discreto e portátil.", "Que existem modelos recarregáveis.", "Que tem a mesma potência das varinhas mágicas grandes.", "Que pode ser usado externamente, principalmente no clitóris."],
            correctIndex: 2,
          },
          {
            question: "Cliente diz: ‘é meu primeiro vibrador, tenho um pouco de medo do tamanho’. Indicação mais consultiva?",
            options: ["Pênis realístico grande.", "Mini vibrador, explicando que é pequeno, discreto e bom para começar; apresentar lubrificante e cuidados de uso.", "Máquina de sexo.", "Plug anal grande."],
            correctIndex: 1,
          },
          {
            question: "Qual erro de venda evitar com mini vibrador?",
            options: ["Mostrar a medida real.", "Apresentar como opção para iniciantes ou para viagem.", "Vender confundindo o cliente, prometendo potência de varinha mágica.", "Recomendar lubrificante à base de água."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.mini_vibrador.apostila",
        kind: "inline_html",
        title: "21. Mini Vibrador — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_mini_vibrador",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.penis_realistico.video",
        kind: "video",
        title: "22. Pênis Realístico — Assistir destaque",
        description: "Destaque único de vibradores no Instagram. Copie o link, cole em outra aba e assista por completo.",
        url: "https://www.instagram.com/stories/highlights/18095201698892966/",
      },
      {
        id: "produtos.penis_realistico.produtos",
        kind: "product_links",
        title: "22. Pênis Realístico — Ver produtos reais no site",
        description: "Abra cada link e observe nome, imagem, descrição e preço atualizado de cada produto desta categoria.",
        links: [
          { label: "Penis De Borracha 22Cm X 4Cm 10 Modos De Vibracoes Rotacao 360 Graus Vai E Vem Aquecimento...", url: "https://sexshopsantabronx.com.br/produto/penis-de-borracha-22cm-x-4cm-10-modos-de-vibracoes-rotacao-360-graus-vai-e-vem-aquecimento-material-semelhante-a-pele-controle-sem-fio-recarregavel/" },
          { label: "Penis De Borracha 20 Cm X 4Cm 10 Modos De Vibracoes 10 Movimentos De Vai E Vem E Rotacao...", url: "https://sexshopsantabronx.com.br/produto/penis-de-borracha-20-cm-x-4cm-10-modos-de-vibracoes-10-movimentos-de-vai-e-vem-e-rotacao-aquecimento-simula-a-temperatura-humana-material-semelhante-a-pele-controle-sem-fio-recarregavel/" },
          { label: "Penis Realistico Com Vibro Vai E Vem Com Rotacao Controlado Por Aplicativo 9 Modos 215Cm X 4Cm", url: "https://sexshopsantabronx.com.br/produto/penis-realistico-com-vibro-vai-e-vem-com-rotacao-controlado-por-aplicativo-9-modos-215cm-x-4cm/" }
        ],
        confirmLabel: "Já abri os produtos e revisei nome, imagem, descrição e preço no site.",
      },
      {
        id: "produtos.penis_realistico.fixacao",
        kind: "practice",
        title: "22. Pênis Realístico — Exercício de fixação (7 questões)",
        description: "Múltipla escolha autocorrigido. 7 perguntas sobre Pênis Realístico. Sem nota mínima — você vê quantas acertou ao final.",
        questions: [
          {
            question: "Qual é a proposta do pênis realístico?",
            options: ["Ser usado encaixado sobre o pênis para aumentar volume durante a relação.", "Ser uma prótese que imita um pênis real (formato, veias, glande), usada para penetração — sozinha, com cinta-strapon ou em casal.", "Ser um anel peniano.", "Servir como item decorativo apenas."],
            correctIndex: 1,
          },
          {
            question: "Qual é a função correta da ventosa em um pênis realístico?",
            options: ["É só estética.", "Permite fixar o pênis em superfícies lisas (parede, piso, espelho) para uso ‘mãos livres’.", "Faz o brinquedo vibrar.", "Conecta ao aplicativo."],
            correctIndex: 1,
          },
          {
            question: "Qual é a diferença correta entre pênis realístico em PVC e em cyber skin (TPE/elastômero)?",
            options: ["São o mesmo material.", "O cyber skin tem toque mais macio e realista, parecido com pele; o PVC é mais firme e geralmente mais barato.", "PVC é mais macio que cyber skin.", "Cyber skin é metálico."],
            correctIndex: 1,
          },
          {
            question: "Qual lubrificante é adequado para um pênis realístico em silicone?",
            options: ["Lubrificante à base de silicone (para durar mais).", "Lubrificante à base de água, porque o de silicone pode danificar o material do brinquedo.", "Vaselina.", "Óleo de cozinha."],
            correctIndex: 1,
          },
          {
            question: "Quando é mais adequado indicar pênis realístico com escroto/testículos?",
            options: ["Para cliente que valoriza realismo visual e na pegada do brinquedo.", "Para cliente que quer o menor e mais discreto possível.", "Apenas para uso anal.", "Apenas como item decorativo."],
            correctIndex: 0,
          },
          {
            question: "O que a atendente NÃO deve prometer com pênis realístico?",
            options: ["Que existem opções com ventosa, com escroto e em diferentes tamanhos.", "Que existem versões em PVC e em cyber skin.", "Que substitui o parceiro emocionalmente ou resolve problemas do casal.", "Que pode ser usado em cinta-strapon."],
            correctIndex: 2,
          },
          {
            question: "Qual erro de venda evitar com pênis realístico?",
            options: ["Perguntar preferência de tamanho e material.", "Mostrar opções com e sem ventosa.", "Indicar lubrificante de silicone para um brinquedo de silicone.", "Explicar uso solo, com strapon ou em casal."],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "produtos.penis_realistico.apostila",
        kind: "inline_html",
        title: "22. Pênis Realístico — Ler apostila",
        description: "Leia a apostila desta categoria como material de revisão.",
        source: "produtos_penis_realistico",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila por completo.",
      },
      {
        id: "produtos.prova.exam",
        kind: "open_evaluation",
        title: "Prova Final — Decorar Principais Produtos",
        description:
          "Prova final do módulo. 22 categorias × (3 múltipla escolha + 1 aberta) = 88 questões. Solicite liberação ao gestor para iniciar. As questões objetivas são corrigidas automaticamente; as abertas vão para correção do gestor.",
        questions: [
          { question: "1. Perfumes Feromônios — Qual é a melhor forma de explicar perfume com feromônio para um cliente?", options: ["É um perfume com proposta de potencializar presença, atração e autoconfiança, sem garantir resultado automático.", "É um estimulante sexual de uso tópico que deve ser aplicado na região íntima.", "É um perfume que funciona apenas se usado junto com excitante íntimo.", "É um produto indicado apenas para pessoas com falta de libido."], correctIndex: 0 },
          { question: "1. Perfumes Feromônios — Qual cuidado a atendente deve ter ao vender perfume com feromônio?", options: ["Prometer que o produto fará qualquer pessoa sentir desejo imediato.", "Explicar que ele ajuda na presença e no clima de atração, mas não é milagroso.", "Indicar somente para clientes que já estão em relacionamento.", "Dizer que o perfume substitui atitude, conversa e cuidado pessoal."], correctIndex: 1 },
          { question: "1. Perfumes Feromônios — Qual alternativa diferencia melhor as versões masculina e feminina?", options: ["A masculina é para aplicar na roupa, e a feminina é para aplicar na pele.", "A masculina costuma ter uma proposta mais marcante/amadeirada, enquanto a feminina pode ter aroma mais doce, floral ou envolvente.", "A versão feminina tem função estimulante, e a masculina funciona apenas como perfume comum.", "As duas versões têm exatamente o mesmo aroma, mudando apenas a embalagem."], correctIndex: 1 },
          { question: "1. Perfumes Feromônios — Explique como você venderia um perfume com feromônio para um cliente sem criar promessa exagerada.", expectedAnswer: "Apresentar como perfume que potencializa presença, atração e autoconfiança; deixar claro que não é milagroso e não garante conquista; mostrar versão masculina/feminina e perguntar preferência de aroma." },
          { question: "2. Excitantes — Qual é a principal diferença entre vender um excitante e vender um lubrificante comum?", options: ["O excitante sempre substitui lubrificante em qualquer situação.", "O excitante tem foco em aumentar sensações, como aquecimento, vibração, formigamento, sensibilidade ou vasodilatação.", "O lubrificante é sempre mais forte que o excitante.", "O excitante só pode ser indicado para homens."], correctIndex: 1 },
          { question: "2. Excitantes — Qual pergunta ajuda a atendente a indicar melhor um excitante?", options: ["“Você quer um produto mais barato ou mais caro?”", "“Você quer algo para aumentar sensibilidade, ter sensação térmica, usar no oral ou ajudar na ereção?”", "“Você quer levar qualquer um que esteja em promoção?”", "“Você prefere um produto feminino mesmo sem saber sua necessidade?”"], correctIndex: 1 },
          { question: "2. Excitantes — Qual cuidado é mais importante ao orientar o uso de excitantes mais intensos?", options: ["Orientar começar com pouca quantidade e aumentar apenas se necessário.", "Orientar usar uma grande quantidade logo no primeiro uso.", "Dizer que todos os excitantes têm o mesmo nível de intensidade.", "Indicar misturar vários excitantes para garantir o efeito."], correctIndex: 0 },
          { question: "2. Excitantes — Explique a diferença entre um excitante beijável e um excitante focado apenas em uso íntimo.", expectedAnswer: "Beijável é seguro para sexo oral, costuma ter sabor e brincadeiras na boca; o de uso íntimo é focado em sensação local (aquecimento, vibração, formigamento) e nem sempre é indicado para o oral." },
          { question: "3. Adstringente — Qual é a principal proposta de um adstringente feminino?", options: ["Aumentar a lubrificação natural durante toda a relação.", "Promover sensação de contração/aperto no canal vaginal durante o uso.", "Funcionar como perfume íntimo de longa duração.", "Substituir exercícios pélvicos ou orientação profissional."], correctIndex: 1 },
          { question: "3. Adstringente — Qual explicação é mais segura para a cliente?", options: ["“Ele fecha o canal vaginal de forma permanente.”", "“Ele pode dar sensação de mais aperto e atrito, mas não muda o corpo de forma definitiva.”", "“Ele serve para tratar qualquer desconforto vaginal.”", "“Ele deve ser usado sempre que houver dor.”"], correctIndex: 1 },
          { question: "3. Adstringente — Qual diferença pode existir entre o gel adstringente e a bolinha adstringente?", options: ["O gel é aplicado diretamente, enquanto a bolinha pode dissolver ou estourar em contato com a lubrificação.", "O gel é masculino, e a bolinha é feminina.", "A bolinha é usada apenas como lubrificante anal.", "Os dois têm a mesma forma de uso e não precisam de explicação."], correctIndex: 0 },
          { question: "3. Adstringente — Explique para que tipo de cliente o adstringente pode fazer sentido e qual promessa deve ser evitada.", expectedAnswer: "Cliente que busca sensação de canal mais apertado e mais atrito; nunca prometer mudança permanente do corpo nem tratamento médico/vaginal." },
          { question: "4. Capas Penianas — Qual é a explicação correta sobre capa peniana?", options: ["É um acessório usado sobre o pênis para aumentar volume, tamanho ou estímulo durante o uso.", "É um preservativo comum com proteção garantida.", "É um produto que aumenta o tamanho do pênis permanentemente.", "É um gel para aplicar na glande antes da relação."], correctIndex: 0 },
          { question: "4. Capas Penianas — Por que modelos com alça escrotal costumam ser recomendados?", options: ["Porque substituem a camisinha.", "Porque ajudam a manter a capa mais firme durante a penetração.", "Porque aumentam permanentemente o tamanho do pênis.", "Porque dispensam qualquer cuidado de encaixe."], correctIndex: 1 },
          { question: "4. Capas Penianas — Qual é um cuidado obrigatório ao vender capa peniana?", options: ["Explicar que ela pode substituir preservativo.", "Reforçar que ela não é camisinha e não deve ser vendida como proteção.", "Dizer que qualquer modelo serve para qualquer pessoa.", "Indicar sempre o modelo maior, independentemente da experiência."], correctIndex: 1 },
          { question: "4. Capas Penianas — Explique como diferenciar uma capa peniana fechada, uma vazada e uma com alça escrotal.", expectedAnswer: "Fechada cobre a glande e aumenta volume; vazada deixa a glande livre e o homem mantém sensibilidade; com alça escrotal prende no saco e fica mais firme durante a penetração." },
          { question: "5. Plug Anal — Qual é a principal função do plug anal?", options: ["Preparar e dilatar gradualmente a região anal para facilitar a penetração.", "Substituir o lubrificante anal.", "Anestesiar completamente a região.", "Ser usado sem base para entrar totalmente."], correctIndex: 0 },
          { question: "5. Plug Anal — Qual orientação é essencial para indicar plug anal com segurança?", options: ["Começar sempre pelo maior tamanho.", "Usar plug com base segura e lubrificante adequado.", "Evitar lubrificante para o plug não escorregar.", "Empurrar o plug inteiro para dentro."], correctIndex: 1 },
          { question: "5. Plug Anal — Como diferenciar plug de silicone e plug de metal?", options: ["Silicone tende a ser mais confortável, enquanto metal é mais escorregadio e pode permitir sensação térmica.", "Silicone é sempre para avançados, e metal é sempre para iniciantes.", "Metal não pode ser higienizado.", "Não existe diferença prática entre materiais."], correctIndex: 0 },
          { question: "5. Plug Anal — Explique como você indicaria plug anal para uma pessoa iniciante, incluindo tamanho, material e cuidado de uso.", expectedAnswer: "Tamanho pequeno, material confortável (geralmente silicone), com base segura, uso com lubrificante adequado, ir devagar e respeitar limites." },
          { question: "6. Estimulantes Sexuais — Qual é a diferença principal entre sachês/energéticos e cápsulas de uso contínuo?", options: ["Sachês e energéticos costumam ser pontuais; cápsulas são mais voltadas para rotina e efeito gradual.", "Todos têm efeito imediato em segundos.", "Cápsulas são aplicadas na pele.", "Energéticos substituem qualquer tratamento médico."], correctIndex: 0 },
          { question: "6. Estimulantes Sexuais — Qual pergunta ajuda a indicar melhor um estimulante sexual?", options: ["“Você quer algo para usar hoje ou algo de uso contínuo para libido e disposição?”", "“Você quer qualquer um que seja mais forte?”", "“Você quer tomar mais de uma unidade para fazer efeito mais rápido?”", "“Você quer um produto masculino mesmo sendo para mulher?”"], correctIndex: 0 },
          { question: "6. Estimulantes Sexuais — Qual cuidado deve ser informado em relação a estimulantes sexuais?", options: ["Podem ser usados sem restrição por qualquer pessoa.", "Gestantes, lactantes e crianças não devem usar.", "Quanto maior a quantidade usada, melhor o resultado.", "Todos devem ser usados diariamente, mesmo os de dose única."], correctIndex: 1 },
          { question: "6. Estimulantes Sexuais — Explique a diferença entre um estimulante sexual de uso pontual e um estimulante em cápsulas de uso contínuo.", expectedAnswer: "Pontual (sachê/energético) age na hora para uma ocasião; contínuo (cápsulas) é tomado por mais tempo para melhorar libido, disposição e desempenho de forma gradual." },
          { question: "7. Retardante — Qual é a principal função do retardante masculino?", options: ["Reduzir parte da sensibilidade para ajudar no controle da ejaculação.", "Aumentar o tamanho do pênis permanentemente.", "Funcionar como lubrificante beijável.", "Substituir um estimulante sexual em cápsula."], correctIndex: 0 },
          { question: "7. Retardante — Qual é a diferença entre retardante e produto vasodilatador masculino?", options: ["O retardante ajuda a durar mais; o vasodilatador tem foco maior em circulação e ereção.", "Os dois têm exatamente a mesma função.", "O retardante é para mulher, e o vasodilatador é para homem.", "O vasodilatador sempre tem efeito anestésico."], correctIndex: 0 },
          { question: "7. Retardante — Como responder a objeção “isso vai me fazer brochar?”", options: ["Prometer que nunca haverá perda de ereção em nenhum caso.", "Explicar que a proposta é reduzir sensibilidade, mas sem vender como garantia absoluta.", "Dizer que quanto mais produto usar, menor o risco.", "Indicar usar junto com qualquer outro produto sem avaliar necessidade."], correctIndex: 1 },
          { question: "7. Retardante — Explique quando você indicaria apenas um retardante e quando faria sentido falar também de um produto para ereção.", expectedAnswer: "Retardante quando a queixa é durar pouco; produto para ereção/vasodilatador quando a queixa envolve firmeza/manutenção da ereção. Pode combinar quando faz sentido, sem prometer milagre." },
          { question: "8. Anel Peniano — Qual é a principal função do anel peniano simples?", options: ["Prender parte da circulação na base do pênis, ajudando na ereção mais firme e prolongada.", "Funcionar como preservativo.", "Aumentar o tamanho do pênis definitivamente.", "Ser aplicado como gel na glande."], correctIndex: 0 },
          { question: "8. Anel Peniano — Qual vantagem os modelos vibratórios podem ter?", options: ["Estimular o clitóris durante a penetração, além de ajudar na experiência do homem.", "Substituir todos os tipos de vibradores.", "Funcionar como estimulante ingerível.", "Contrair o canal vaginal."], correctIndex: 0 },
          { question: "8. Anel Peniano — Qual cuidado é importante ao orientar o uso de anel peniano?", options: ["Usar apertado pelo máximo de tempo possível.", "Não usar apertado demais nem por tempo excessivo.", "Usar como camisinha.", "Indicar qualquer tamanho sem avaliar conforto."], correctIndex: 1 },
          { question: "8. Anel Peniano — Explique como vender um anel peniano vibratório para um casal, mostrando benefício para o homem e para a parceira.", expectedAnswer: "Para o homem: ereção mais firme e duradoura. Para a parceira: estímulo no clitóris durante a penetração. Reforçar conforto e tempo de uso adequado." },
          { question: "9. Sado — Qual é a melhor abordagem ao vender produtos sado/BDSM?", options: ["Entender se o cliente quer algo leve, casual, resistente, intenso ou mais completo.", "Indicar sempre o acessório mais forte.", "Falar apenas do preço.", "Evitar explicar material e resistência."], correctIndex: 0 },
          { question: "9. Sado — Qual diferença faz sentido entre algema de metal com pelúcia e algema de couro/luxo?", options: ["A de pelúcia costuma ser mais casual; a de couro/luxo tende a ser mais confortável e resistente.", "A de metal é sempre mais confortável.", "A de couro sempre arrebenta com facilidade.", "Não existe diferença prática."], correctIndex: 0 },
          { question: "9. Sado — Qual ponto deve estar presente em qualquer orientação sobre produtos sado?", options: ["Consentimento, conforto, limites e segurança.", "Uso sem combinar limites.", "Escolha sempre pelo acessório mais intenso.", "Ignorar regulagem e material."], correctIndex: 0 },
          { question: "9. Sado — Explique como você diferenciaria um produto sado leve para iniciantes de um produto mais resistente/intenso.", expectedAnswer: "Leve: materiais macios (pelúcia, tecido), regulagem fácil, foco em brincadeira casual. Resistente/intenso: couro/luxo, maior durabilidade, indicado para quem já tem prática, sempre com consentimento e limites." },
          { question: "10. Lubrificante — Qual pergunta deve ser feita antes de indicar um lubrificante?", options: ["“Você vai usar com preservativo, sex toy, anal, oral ou no banho?”", "“Você quer qualquer um?”", "“Você quer o mais cheiroso?”", "“Você prefere não saber a base?”"], correctIndex: 0 },
          { question: "10. Lubrificante — Qual diferença entre base água e base silicone está correta?", options: ["Base água costuma ser mais versátil; silicone dura mais e resiste melhor à água, mas exige cuidado com preservativo e sex toy.", "Base silicone é sempre beijável.", "Base água nunca pode ser usada com preservativo.", "Não existe diferença relevante entre as bases."], correctIndex: 0 },
          { question: "10. Lubrificante — Quando um lubrificante beijável faz mais sentido?", options: ["Quando a pessoa quer lubrificação com possibilidade de brincadeiras e sexo oral, conforme indicação do produto.", "Quando a pessoa quer retardar ejaculação.", "Quando busca contração vaginal.", "Quando quer aumentar ereção por vasodilatação."], correctIndex: 0 },
          { question: "10. Lubrificante — Explique como você escolheria entre lubrificante à base de água, lubrificante de silicone, lubrificante anal e lubrificante beijável.", expectedAnswer: "Água: versátil, compatível com preservativo e sex toys. Silicone: dura mais, resiste à água, exige cuidado com preservativo/sex toy de silicone. Anal: mais espesso/durável. Beijável: sabor e seguro para oral." },
          { question: "11. Masturbador Masculino — Qual é o principal diferencial de um masturbador masculino?", options: ["Textura interna e sensação simulada durante o uso.", "Aroma com feromônio.", "Contração vaginal.", "Uso como anel peniano."], correctIndex: 0 },
          { question: "11. Masturbador Masculino — Qual produto costuma ser indicado junto para melhorar a experiência com masturbador?", options: ["Lubrificante adequado.", "Adstringente feminino.", "Spray de garganta.", "Perfume com feromônio obrigatório."], correctIndex: 0 },
          { question: "11. Masturbador Masculino — Qual cuidado pós-uso é mais importante?", options: ["Higienizar e secar corretamente para preservar o material.", "Guardar molhado e fechado.", "Não lavar para manter a textura.", "Compartilhar sem higienização."], correctIndex: 0 },
          { question: "11. Masturbador Masculino — Explique como você venderia um masturbador masculino diferenciando modelo simples, realístico e automático.", expectedAnswer: "Simples: foco em textura interna básica, bom preço. Realístico: visual e sensação mais próximos do real. Automático: vibração/movimento próprio, experiência mais intensa." },
          { question: "12. Roupas — Qual é a melhor lógica de venda para roupas sensuais?", options: ["Entender o estilo, a ocasião e a sensação que a cliente quer causar.", "Indicar sempre a peça mais ousada.", "Vender apenas pelo tamanho.", "Dizer que todas as peças vestem da mesma forma."], correctIndex: 0 },
          { question: "12. Roupas — Qual pergunta ajuda mais na indicação de roupas sensuais?", options: ["“Você quer algo mais elegante, provocante, fantasia ou surpresa?”", "“Você quer qualquer peça que estiver disponível?”", "“Você quer só a cor mais barata?”", "“Você quer um produto para ereção?”"], correctIndex: 0 },
          { question: "12. Roupas — Qual cuidado comercial é importante na categoria de roupas sensuais?", options: ["Explicar política de troca e higiene quando necessário.", "Prometer que qualquer tamanho serve.", "Dizer que conforto não importa.", "Ignorar estilo da cliente."], correctIndex: 0 },
          { question: "12. Roupas — Explique como você ajudaria uma cliente a escolher uma peça sensual considerando estilo, conforto e ocasião.", expectedAnswer: "Perguntar ocasião (surpresa, fantasia, autoestima), estilo (elegante, provocante, fantasia), tamanho/conforto e orientar política de troca/higiene." },
          { question: "13. Anestésicos — Qual explicação é correta sobre anestésico anal?", options: ["Ajuda a reduzir desconforto/sensibilidade, mas não substitui lubrificante, calma e cuidado.", "Elimina qualquer risco de dor ou machucado.", "Serve para aumentar libido.", "Funciona como perfume corporal."], correctIndex: 0 },
          { question: "13. Anestésicos — Qual é a diferença entre anestésico anal e spray de garganta?", options: ["Um é voltado para desconforto anal; o outro ajuda a reduzir ânsia no oral profundo.", "Os dois têm exatamente a mesma aplicação.", "Os dois são estimulantes ingeríveis.", "Ambos funcionam como lubrificantes."], correctIndex: 0 },
          { question: "13. Anestésicos — Qual orientação deve acompanhar o uso de anestésico anal?", options: ["Usar lubrificante, ir com calma e respeitar limites do corpo.", "Dispensar lubrificante.", "Usar para não sentir absolutamente nada.", "Continuar mesmo se houver dor intensa."], correctIndex: 0 },
          { question: "13. Anestésicos — Explique como indicar anestésico anal sem fazer a cliente acreditar que ele substitui lubrificante ou cuidado.", expectedAnswer: "Posicionar como auxílio para reduzir desconforto/sensibilidade; reforçar uso com lubrificante adequado, ir com calma, respeitar limites e não continuar com dor intensa." },
          { question: "14. Vibrador Rabbit — Qual é a principal característica do vibrador Rabbit?", options: ["Estimular internamente e externamente ao mesmo tempo, geralmente ponto G e clitóris.", "Ser apenas um mini vibrador externo.", "Funcionar como lubrificante.", "Ser usado exclusivamente por casal durante penetração."], correctIndex: 0 },
          { question: "14. Vibrador Rabbit — Para qual cliente o Rabbit faz mais sentido?", options: ["Cliente que gosta de penetração e também quer estímulo no clitóris.", "Cliente que não gosta de nenhum estímulo interno.", "Cliente que procura apenas perfume.", "Cliente que quer um produto para ejaculação precoce."], correctIndex: 0 },
          { question: "14. Vibrador Rabbit — Qual cuidado a atendente deve ter antes de indicar um Rabbit?", options: ["Considerar tamanho, formato, material e experiência da cliente.", "Indicar sempre o maior modelo.", "Falar apenas da cor.", "Dizer que todos os rabbits encaixam igual."], correctIndex: 0 },
          { question: "14. Vibrador Rabbit — Explique a diferença entre um vibrador Rabbit e um sugador de clitóris.", expectedAnswer: "Rabbit estimula interna (ponto G) e externamente (clitóris) ao mesmo tempo. Sugador foca só no clitóris, usando sucção/pulsação." },
          { question: "15. Sugador de Clitóris — Qual é a proposta principal do sugador de clitóris?", options: ["Estimular o clitóris de forma intensa por sucção, pulsação ou tecnologia similar.", "Estimular apenas o ponto G por penetração profunda.", "Funcionar como lubrificante íntimo.", "Ser usado como capa peniana."], correctIndex: 0 },
          { question: "15. Sugador de Clitóris — Qual cliente tem maior chance de gostar do sugador de clitóris?", options: ["Cliente que sente mais prazer com estímulo externo no clitóris.", "Cliente que quer apenas adstringente.", "Cliente que procura cápsulas de libido.", "Cliente que quer fantasia sensual."], correctIndex: 0 },
          { question: "15. Sugador de Clitóris — Como diferenciar modelos simples e completos de sugador?", options: ["Alguns focam só na sucção; outros combinam sucção, língua, vibração ou penetração.", "Todos têm exatamente a mesma função e potência.", "Modelos completos são perfumes.", "Modelos simples são lubrificantes."], correctIndex: 0 },
          { question: "15. Sugador de Clitóris — Explique como você indicaria um sugador de clitóris para uma cliente que relata dificuldade de chegar ao orgasmo.", expectedAnswer: "Apresentar como estímulo externo intenso no clitóris, com sucção/pulsação; explicar uso com lubrificante, começar em intensidade mais baixa e respeitar o próprio ritmo." },
          { question: "16. Vibrador de Calcinha — Qual é o principal diferencial do vibrador de calcinha?", options: ["Discrição e possibilidade de uso preso à calcinha, muitas vezes com controle.", "Penetração profunda obrigatória.", "Função de lubrificante.", "Ação adstringente."], correctIndex: 0 },
          { question: "16. Vibrador de Calcinha — Quando o vibrador de calcinha costuma ser bem indicado?", options: ["Para casal que quer brincadeira discreta com controle à distância.", "Para quem quer plug anal grande.", "Para quem quer retardante masculino.", "Para quem quer perfume com feromônio."], correctIndex: 0 },
          { question: "16. Vibrador de Calcinha — Qual erro deve ser evitado na venda do vibrador de calcinha?", options: ["Prometer controle ilimitado sem verificar se o modelo realmente possui essa função.", "Explicar como fixa na calcinha.", "Falar sobre bateria.", "Explicar que é discreto."], correctIndex: 0 },
          { question: "16. Vibrador de Calcinha — Explique como apresentar o vibrador de calcinha para um casal que quer uma brincadeira discreta.", expectedAnswer: "Mostrar discrição, fixação na calcinha e controle (pelo parceiro ou aplicativo, dependendo do modelo), confirmando se o modelo realmente permite o tipo de controle prometido." },
          { question: "17. Máquina de Sexo — Qual é a proposta principal da máquina de sexo?", options: ["Simular movimento automático de penetração.", "Funcionar como perfume com feromônio.", "Ser um anel peniano simples.", "Reduzir ânsia no oral."], correctIndex: 0 },
          { question: "17. Máquina de Sexo — Para qual cliente a máquina de sexo faz mais sentido?", options: ["Cliente que busca uma experiência intensa, automática e mais realística.", "Cliente que quer algo extremamente discreto e pequeno.", "Cliente que quer apenas lubrificante neutro.", "Cliente que quer roupa sensual."], correctIndex: 0 },
          { question: "17. Máquina de Sexo — Qual cuidado é importante na venda da máquina de sexo?", options: ["Explicar tamanho, potência, modo de uso e necessidade de lubrificante.", "Dizer que é igual a mini vibrador.", "Não falar sobre intensidade.", "Indicar sem entender a experiência da cliente."], correctIndex: 0 },
          { question: "17. Máquina de Sexo — Explique como diferenciar uma máquina de sexo de um pênis realístico comum.", expectedAnswer: "Máquina tem movimento automático de penetração, é mais intensa e exige espaço e lubrificação. Pênis realístico é manual ou com ventosa, sem movimento próprio." },
          { question: "18. Vibrador de Casal — Qual é a proposta do vibrador de casal?", options: ["Ser usado durante a relação para estimular os dois ao mesmo tempo.", "Ser usado apenas como perfume.", "Funcionar como anel peniano simples.", "Ser um estimulante em cápsula."], correctIndex: 0 },
          { question: "18. Vibrador de Casal — Qual é o principal argumento de venda do vibrador de casal?", options: ["Ele permite estímulo durante a penetração, podendo beneficiar o casal.", "Ele substitui todos os outros produtos íntimos.", "Ele não precisa de encaixe ou explicação.", "Ele é indicado somente para uso individual."], correctIndex: 0 },
          { question: "18. Vibrador de Casal — Qual detalhe técnico importa na categoria vibrador de casal?", options: ["Formato, encaixe, vibração, controle e conforto durante a penetração.", "Apenas a cor.", "Apenas o nome.", "Apenas o tamanho da embalagem."], correctIndex: 0 },
          { question: "18. Vibrador de Casal — Explique como vender um vibrador de casal para quem nunca usou brinquedos na relação.", expectedAnswer: "Reduzir medo: produto pensado para ser usado junto, durante a penetração, beneficiando os dois. Explicar formato/encaixe, controle e conforto, começando em intensidade baixa." },
          { question: "19. Vibrador de Aplicativo — Qual é o diferencial do vibrador de aplicativo?", options: ["Controle pelo celular, podendo permitir uso próximo ou à distância, dependendo do modelo.", "Ser sempre descartável.", "Funcionar como lubrificante.", "Ser uma roupa sensual."], correctIndex: 0 },
          { question: "19. Vibrador de Aplicativo — Qual cuidado é necessário ao falar de distância?", options: ["Verificar se o modelo permite longa distância ou apenas controle próximo.", "Prometer controle de qualquer lugar para todos os modelos.", "Não explicar o uso do aplicativo.", "Dizer que não precisa de bateria."], correctIndex: 0 },
          { question: "19. Vibrador de Aplicativo — Qual pergunta ajuda na indicação do vibrador de aplicativo?", options: ["“Você quer controlar perto ou quer uma brincadeira mesmo à distância?”", "“Você quer adstringente?”", "“Você quer capa peniana?”", "“Você quer spray de garganta?”"], correctIndex: 0 },
          { question: "19. Vibrador de Aplicativo — Explique como apresentar um vibrador de aplicativo para um casal que mora longe ou quer brincar à distância.", expectedAnswer: "Mostrar controle pelo celular, verificar se o modelo permite longa distância (não só próximo), explicar bateria, conexão e privacidade do aplicativo." },
          { question: "20. Varinha Mágica — Qual é a principal proposta da varinha mágica?", options: ["Estimulação externa potente em clitóris e zonas erógenas.", "Penetração realística com ventosa.", "Contração vaginal.", "Uso como perfume."], correctIndex: 0 },
          { question: "20. Varinha Mágica — Para quem a varinha costuma ser uma boa indicação?", options: ["Cliente que quer vibração forte e fácil de posicionar externamente.", "Cliente que quer apenas produto ingerível.", "Cliente que quer capa peniana.", "Cliente que quer algema."], correctIndex: 0 },
          { question: "20. Varinha Mágica — Qual diferença da varinha para um mini vibrador?", options: ["A varinha costuma ter área de contato maior e vibração mais potente.", "O mini vibrador sempre é mais potente.", "São exatamente iguais.", "A varinha é um lubrificante."], correctIndex: 0 },
          { question: "20. Varinha Mágica — Explique como indicar uma varinha mágica para uma cliente que quer estímulo externo forte.", expectedAnswer: "Apresentar como vibrador potente, com cabeça maior, ideal para estímulo externo intenso em clitóris e zonas erógenas; explicar modos, conforto e uso com lubrificante." },
          { question: "21. Mini Vibrador — Qual é o diferencial do mini vibrador?", options: ["Ser pequeno, discreto e focado principalmente em estímulo externo.", "Ser uma máquina automática grande.", "Ser um lubrificante.", "Ser uma capa peniana."], correctIndex: 0 },
          { question: "21. Mini Vibrador — Para qual cliente o mini vibrador faz mais sentido?", options: ["Cliente que quer algo discreto, fácil de guardar e usar no clitóris ou zonas erógenas.", "Cliente que quer penetração profunda realística obrigatória.", "Cliente que quer cápsulas de libido.", "Cliente que quer roupa sensual."], correctIndex: 0 },
          { question: "21. Mini Vibrador — Qual cuidado a atendente deve ter ao indicar mini vibrador?", options: ["Não vender como produto para penetração profunda se o formato não for esse.", "Prometer que substitui todos os vibradores.", "Dizer que todo mini vibrador é fraco.", "Ignorar bateria, material e modos."], correctIndex: 0 },
          { question: "21. Mini Vibrador — Explique a diferença entre indicar um mini vibrador e indicar uma varinha mágica.", expectedAnswer: "Mini vibrador: pequeno, discreto, vibração mais leve, fácil de guardar. Varinha mágica: maior, mais potente, área de contato grande, indicado para quem quer estímulo forte." },
          { question: "22. Pênis Realístico — Qual é a proposta principal do pênis realístico?", options: ["Simular visual e sensação de uma prótese peniana, podendo ter ventosa, vibração, aquecimento ou movimento.", "Funcionar como perfume com feromônio.", "Ser usado como anel peniano.", "Reduzir ânsia no oral."], correctIndex: 0 },
          { question: "22. Pênis Realístico — Qual pergunta ajuda mais na indicação do pênis realístico?", options: ["“Você quer realismo simples, ventosa, vibração, aquecimento ou movimento automático?”", "“Você quer apenas lubrificante?”", "“Você quer uma algema?”", "“Você quer uma cápsula?”"], correctIndex: 0 },
          { question: "22. Pênis Realístico — Qual diferencial da ventosa no pênis realístico?", options: ["Permite fixar em superfícies lisas para uso com mãos livres ou posições diferentes.", "Aumenta libido automaticamente.", "Serve como preservativo.", "Reduz sensibilidade da glande."], correctIndex: 0 },
          { question: "22. Pênis Realístico — Explique como diferenciar uma prótese realística simples de uma prótese com vibração, aquecimento ou movimento automático.", expectedAnswer: "Simples: foco no visual e na sensação realística, sem função extra. Com vibração/aquecimento/movimento: agrega tecnologia para experiência mais intensa e próxima do real, com preço mais alto." },
        ],
      },
    ],
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

// Embaralha (uma única vez, deterministicamente) as alternativas de toda
// questão de múltipla escolha — em exercícios de fixação, provas objetivas
// e provas dissertativas que tenham `options`. Mantém a coerência entre
// sessões e usuários porque a seed é o próprio texto da questão.
import { shuffleQuestion as _shuffleQuestion } from "@/lib/shuffleOptions";
for (const topic of TOPICS) {
  for (const sub of topic.subtasks) {
    if (sub.kind === "evaluation" || sub.kind === "practice" || sub.kind === "open_evaluation") {
      sub.questions = (sub.questions as Array<{ question: string; options?: string[]; correctIndex?: number }>).map(
        (q) => _shuffleQuestion(q),
      ) as typeof sub.questions;
    }
  }
}

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
