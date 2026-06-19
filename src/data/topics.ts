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

export type OpenQuestion = {
  question: string;
  expectedAnswer: string;
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
      source:
        | "apostila"
        | "checklist"
        | "organizacao"
        | "responsabilidade"
        | "responsabilidade_checklist"
        | "app_apostila"
        | "app_checklist"
        | "vendas_apostila"
        | "vendas_checklist"
        | "objecoes_apostila"
        | "objecoes_checklist"
        | "dores_apostila"
        | "dores_checklist";
      openLabel?: string;
      helperText?: string;
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
        source:
          | "apostila"
          | "checklist"
          | "organizacao"
          | "responsabilidade"
          | "responsabilidade_checklist"
          | "app_apostila"
          | "app_checklist"
          | "vendas_apostila"
          | "vendas_checklist"
          | "objecoes_apostila"
          | "objecoes_checklist"
          | "dores_apostila"
          | "dores_checklist";
        openLabel: string;
        confirmLabel: string;
        helperText?: string;
      };
      second: {
        source:
          | "apostila"
          | "checklist"
          | "organizacao"
          | "responsabilidade"
          | "responsabilidade_checklist"
          | "app_apostila"
          | "app_checklist"
          | "vendas_apostila"
          | "vendas_checklist"
          | "objecoes_apostila"
          | "objecoes_checklist"
          | "dores_apostila"
          | "dores_checklist";
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
const IG_APRESENTACAO = "https://www.instagram.com/stories/highlights/17958057917908256/";
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
        url: IG_APRESENTACAO,
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
      {
        id: "apresentacao.padrao.video",
        kind: "video",
        title: "4. Padrão de organização — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18089212679196183/",
      },
      {
        id: "apresentacao.padrao.checklist",
        kind: "inline_html",
        title: "4. Padrão de organização — ver checklist de organização",
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
        title: "5. Apresentação do site — assistir destaque",
        url: "https://www.instagram.com/stories/highlights/18095535212221625/",
      },
      {
        id: "apresentacao.site.checklist",
        kind: "checklist",
        title: "5. Apresentação do site — checklist",
        items: [
          "Acessar o site: https://santabronxaraguari.com.br/",
          "Acesse o menu de categorias",
          "Entre na subcategoria \"Varinha Mágica\"",
          "Pegue este link e envie para a pessoa que está te auxiliando (gestor)",
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
        title: "6. Antes da prova — assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo, avisa que o gestor vai acompanhar a prova em tempo real e reforça a regra de 70% para passar.",
        url: "https://www.instagram.com/stories/highlights/17958057917908256/",
      },
      {
        id: "apresentacao.prova.exam",
        kind: "open_evaluation",
        title: "6. Prova: Apresentação da Loja",
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
        id: "embalar.prova.video",
        kind: "video",
        title: "3. Antes da prova — assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo, avisa que o gestor vai acompanhar a prova em tempo real e reforça a regra de 70% para passar.",
        url: "https://www.instagram.com/stories/highlights/PLACEHOLDER_EMBALAR/",
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
        id: "vendas.prova.video",
        kind: "video",
        title: "5. Antes da prova — assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo, avisa que o gestor vai acompanhar a prova em tempo real e reforça a regra de 70% para passar.",
        url: "https://www.instagram.com/stories/highlights/17958057917908256/",
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
        id: "objecoes.prova.video",
        kind: "video",
        title: "5. Antes da prova — Assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo e reforça as regras da avaliação.",
        url: "https://www.instagram.com/stories/highlights/17958057917908256/",
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
        id: "dores.prova.video",
        kind: "video",
        title: "5. Antes da prova — Assistir vídeo do Bruno",
        description:
          "Vídeo de alinhamento antes da prova. Recapitula o módulo e reforça as regras da avaliação.",
        url: "https://www.instagram.com/stories/highlights/17958057917908256/",
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
