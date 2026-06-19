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
      source: "apostila" | "checklist" | "organizacao" | "responsabilidade";
      openLabel?: string;
      helperText?: string;
      confirmLabel: string;
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
        url: "https://www.instagram.com/stories/highlights/17908962375245598/",
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
              "Sempre desmarcada para agilizar",
              "Marcada — em Uberlândia costuma ter vários entregadores juntos, o código evita que o pacote seja retirado pelo motoboy errado",
              "Marcada apenas quando houver mais de 2 pedidos",
              "Tanto faz",
            ],
            correctIndex: 1,
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
        id: "responsabilidade.expectativas.apostila",
        kind: "inline_html",
        title: "1. O que é esperado (atrasos, erros) — ler apostila de responsabilidades",
        description:
          "Leia com atenção — esta apostila resume o que é esperado de você a partir de agora na loja.",
        source: "responsabilidade",
        openLabel: "Abrir apostila",
        confirmLabel: "Li a apostila e entendo o que é esperado de mim.",
      },
      {
        id: "responsabilidade.expectativas.fixacao",
        kind: "practice",
        title: "1. O que é esperado (atrasos, erros) — exercício de fixação (10 questões)",
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
      "Aprender as principais objeções do nicho e como respondê-las.",
    accent: "from-sky-500 to-blue-600",
    subtasks: [
      {
        id: "objecoes.video",
        kind: "video",
        title: "1. Principais objeções — assistir destaque",
        description: "Assista o destaque 'Principais Objeções' no Instagram da loja.",
        url: IG_OBJECOES,
      },
    ],
  },
  {
    id: "vendas",
    order: 5,
    title: "Fundamentos de Vendas",
    summary: "Abordagem, escuta, oferta e fechamento.",
    accent: "from-emerald-500 to-teal-600",
    subtasks: [
      {
        id: "vendas.video",
        kind: "video",
        title: "1. Fundamentos de vendas — assistir destaque",
        description: "Assista o destaque 'Fundamentos de Vendas' no Instagram da loja.",
        url: IG_VENDAS,
      },
    ],
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
        id: "dores.video",
        kind: "video",
        title: "1. Assistir destaque — Dores dos clientes",
        description: "Assista o destaque '10. Dores' no Instagram da loja antes de ler a apostila.",
        url: IG_DORES,
      },
      {
        id: "dores.apostila",
        kind: "apostila",
        title: "2. Ler apostila — Dores x Soluções",
        description:
          "Conceito-base + cada dor com as soluções da loja. Leia tudo antes do exercício.",

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
          {
            question: "Como abordar uma cliente que diz ter dor na penetração?",
            answer:
              "Antes de produto, identifique a causa: ressecamento → hidratante vaginal + lubrificante; falta de excitação → preliminares + excitante feminino; canal estreito ou pós-parto/menopausa → kit de dilatadores. Nunca empurre só lubrificante se a dor for estrutural.",
          },
          {
            question: "Qual a diferença entre lubrificante à base de água, silicone e óleo?",
            answer:
              "Água: leve, seca rápido, compatível com brinquedos e camisinha. Silicone: dura muito mais, ótimo para anal e para o chuveiro, mas não usar com brinquedos de silicone. Óleo: deslizamento intenso, mas DANIFICA a camisinha de látex — só para sexo sem preservativo.",
          },
          {
            question: "Quando indicar o anel peniano e quando indicar o spray retardante?",
            answer:
              "Anel peniano: ajuda a manter a ereção firme por mais tempo (segura o sangue no pênis). Spray retardante: reduz a sensibilidade para retardar a ejaculação precoce. Problemas diferentes: o anel ajuda a manter, o spray ajuda a durar mais antes de gozar.",
          },
          {
            question: "Cliente diz que perdeu o tesão pelo parceiro — o que sugerir primeiro?",
            answer:
              "Foque em quebrar a rotina antes de vender estímulo químico: jogos eróticos, fantasias, cartas de desejo, lingerie nova. Excitantes e energéticos com catuaba entram como reforço, não como solução isolada — desejo se recupera com novidade, não só com produto.",
          },
          {
            question: "Como apresentar brinquedos para casais que nunca usaram?",
            answer:
              "Comece pelos mais leves e de uso conjunto: anel peniano com vibração, vibrador de clitóris pequeno (formato discreto), óleo comestível ou gel beijável. Evite começar por plugs anais, vibradores grandes ou produtos BDSM — assusta e fecha a venda.",
          },
          {
            question: "Diferença entre vibrador de ponto G, sugador de clitóris e varinha mágica?",
            answer:
              "Ponto G: curvado, estimula internamente. Sugador (pressure wave): cria pulsos de ar/sucção direto no clitóris — orgasmo rápido e intenso. Varinha mágica: vibração potente e ampla, ótima para quem nunca teve orgasmo ou tem sensibilidade reduzida. Pergunte ONDE ela sente mais antes de indicar.",
          },
          {
            question: "Cliente está envergonhada e não fala a dor — como conduzir?",
            answer:
              "Tire o peso da conversa: fale você primeiro de forma técnica e natural (\"a maioria das clientes que chega aqui tem alguma dessas três situações...\"). Dê opções múltiplas em vez de pedir para ela descrever. Use linguagem médica/profissional, nunca chula. Vergonha some quando ela vê que pra você é assunto normal.",
          },
          {
            question: "Como justificar o preço de um produto mais caro frente a um similar barato?",
            answer:
              "Foque no resultado, não no produto. Ex.: \"a versão mais simples cumpre, mas essa aqui tem motor mais silencioso, bateria que dura X horas e material médico — você compra uma vez e dura anos\". Compare custo por uso, não preço de etiqueta. E sempre pergunte o orçamento antes de mostrar, para não constranger.",
          },
        ],

      },
      {
        id: "dores.pratica",
        kind: "practice",
        title: "3. Exercício de fixação — 20 perguntas",
        description:
          "Treino com correção imediata. Não bloqueia o avanço — é só para fixar.",
        questions: [
          {
            question:
              "Um cliente diz que tem disfunção erétil avançada e já tentou outras opções. Qual produto é o mais indicado?",
            options: ["Sachê de mel", "Testo Viril", "Bomba peniana", "Spray retardante"],
            correctIndex: 2,
          },
          {
            question:
              "Qual é a diferença principal entre o sachê de mel e o Testo Viril para disfunção erétil?",
            options: [
              "Um é fisiológico e outro psicológico",
              "O mel tem efeito imediato (2h antes); o Testo Viril é um tratamento contínuo de 7-14 dias",
              "Não há diferença, são o mesmo produto",
              "O Testo Viril só serve para mulheres",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Se a causa da disfunção erétil for psicológica, qual a conduta correta?",
            options: [
              "Indicar a bomba peniana mesmo assim",
              "Indicar o Testo Viril em dose dobrada",
              "Nenhum produto resolve — encaminhar para acompanhamento psicológico",
              "Indicar o spray retardante",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Por que o spray retardante não faz o homem perder a ereção, mesmo anestesiando a glande?",
            options: [
              "Porque o efeito dura só 5 segundos",
              "Porque ele tem vasodilatador, que compensa a menor sensibilidade com mais fluxo sanguíneo",
              "Porque ele não anestesia de verdade",
              "Porque o homem nem sente o produto",
            ],
            correctIndex: 1,
          },
          {
            question: "Quanto tempo dura o efeito do spray retardante depois de aplicado?",
            options: ["5 minutos", "20 a 30 minutos", "2 horas", "O dia inteiro"],
            correctIndex: 1,
          },
          {
            question:
              "Qual a vantagem da cápsula vitamínica vendida na loja em relação a um multivitamínico comum de farmácia?",
            options: [
              "É mais barata",
              "Tem sabor melhor",
              "Contém especificamente vitaminas ligadas à libido, em vez de vitaminas genéricas",
              "Serve só para homens",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Por que o energético com catuaba e maca peruana é considerado melhor que o tesão de vaca/touro?",
            options: [
              "Porque é mais barato",
              "Porque tem registro do governo",
              "Porque tem compostos afrodisíacos reais para homem e mulher, enquanto os outros têm resultado mais fraco na prática",
              "Porque dura mais tempo na prateleira",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Uma cliente diz que sente mais prazer no clitóris e tem dificuldade de chegar ao orgasmo. Qual vibrador é mais indicado?",
            options: [
              "Modelo de penetração",
              "Sugador de clitóris",
              "Anel peniano",
              "Plug anal",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Além de saber onde a cliente sente mais prazer, qual a segunda pergunta importante antes de indicar um vibrador?",
            options: [
              "Se ela já usou vibrador antes",
              "Quanto ela está disposta a investir (preço geralmente reflete qualidade, silêncio e bateria)",
              "Qual a cor preferida",
              "Se o parceiro aprova",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Quais efeitos um excitante em gel pode ter, além de vasodilatar?",
            options: [
              "Apenas hidratar",
              "Esquentar, esfriar ou dar sensação de vibração (formigamento)",
              "Anestesiar completamente",
              "Colorir a pele",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Uma cliente relata ressecamento vaginal severo e quer um tratamento, não só algo pontual. Qual produto é o indicado?",
            options: [
              "Lubrificante comum",
              "Hidratante vaginal, tratamento de 10 dias",
              "Kit dilatador",
              "Excitante em gel",
            ],
            correctIndex: 1,
          },
          {
            question: "Como se usa o hidratante vaginal?",
            options: [
              "Um tubinho por semana",
              "Um tubinho por dia, à noite, por 10 dias",
              "Aplicação única",
              "Três vezes ao dia por 3 dias",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual é a função do kit dilatador vaginal?",
            options: [
              "Lubrificar durante o ato sexual",
              "Tratar ressecamento em 10 dias",
              "Dilatar gradualmente a vagina em casos de vaginismo forte ou preparo pré-cirúrgico",
              "Aumentar a sensibilidade do clitóris",
            ],
            correctIndex: 2,
          },
          {
            question:
              "Por que sempre se deve indicar anestésico anal junto com lubrificante, e nunca um sem o outro?",
            options: [
              "Porque são vendidos no mesmo kit",
              "Porque o anestésico não lubrifica, e o ânus não tem lubrificação própria",
              "Porque juntos ficam mais baratos",
              "Porque a lei exige a venda conjunta",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Qual é a função do plug anal antes da penetração principal?",
            options: [
              "Substituir o lubrificante",
              "Dilatar gradualmente os esfíncteres, preparando a região",
              "Anestesiar a região",
              "Aumentar o volume do pênis",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Um cliente pergunta se existe algum remédio ou pílula que realmente aumenta o tamanho do pênis. Qual a resposta correta?",
            options: [
              "Sim, vendemos esse remédio na loja",
              "Não existe nenhuma forma real de aumentar",
              "Só cirurgia ou ácido hialurônico funcionam de verdade — não vendemos nenhum dos dois, mas vendemos a capa peniana, que aumenta o volume percebido",
              "Apenas exercícios físicos funcionam",
            ],
            correctIndex: 2,
          },
          {
            question: "Quais são as duas funções principais do anel peniano?",
            options: [
              "Lubrificar e aquecer",
              "Prender sangue (sensação de inchaço) e retardar a ejaculação",
              "Aumentar o tamanho permanentemente",
              "Substituir a camisinha",
            ],
            correctIndex: 1,
          },
          {
            question: "Para que serve o anestésico de garganta?",
            options: [
              "Para tratar dor de garganta comum",
              "Para reduzir a ânsia de vômito durante sexo oral profundo",
              "Para aumentar a libido",
              "Para tratar afta",
            ],
            correctIndex: 1,
          },
          {
            question:
              "O que acontece com a bolinha explosiva depois de usada no canal vaginal?",
            options: [
              "Precisa ser removida manualmente depois",
              "O corpo dissolve naturalmente, não fica retida",
              "Ela derrete em poucos segundos sem efeito",
              "Precisa de receita médica para comprar",
            ],
            correctIndex: 1,
          },
          {
            question:
              "Por que a vela de massagem não queima a pele ao ser usada?",
            options: [
              "Porque tem muito pouca cera",
              "Porque não contém parafina, então o óleo não fica quente o suficiente para queimar",
              "Porque é feita de gelo",
              "Porque precisa ser diluída em água antes",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "dores.avaliacao_final",
        kind: "open_evaluation",
        title: "4. Avaliação final — 15 perguntas dissertativas",
        description:
          "Responda com suas palavras. A gestora corrige depois — o próximo tópico é liberado assim que você enviar.",
        passingScore: 70,
        questions: [
          {
            question:
              "Um cliente chega na loja com queixa de disfunção erétil, mas diz que o problema começou depois de uma fase de muita ansiedade no trabalho. O que você faria nesse atendimento?",
            expectedAnswer:
              "Identificar se a causa é psicológica ou fisiológica. Se psicológica (ansiedade, estresse), nenhum produto resolve — orientar a buscar acompanhamento psicológico, sem tentar vender um produto que não vai funcionar.",
          },
          {
            question:
              "Explique, com suas palavras, quando você indicaria o sachê de mel e quando indicaria o Testo Viril para um cliente com disfunção erétil.",
            expectedAnswer:
              "Mel para efeito imediato/pontual (2h antes da relação); Testo Viril para tratamento contínuo, efeito gradual em 7-14 dias, para indisposição constante.",
          },
          {
            question:
              "Uma cliente pergunta por que o spray retardante não vai fazer o parceiro dela 'broxar' durante a relação. Como você explicaria isso para ela?",
            expectedAnswer:
              "O spray reduz a sensibilidade sem anestesiar 100%, e tem vasodilatador, que aumenta o fluxo de sangue na região, compensando a perda de sensibilidade; o homem também se mantém excitado pelo estímulo visual.",
          },
          {
            question:
              "Um cliente quer saber a diferença entre as cápsulas vitamínicas da loja e um multivitamínico comprado em farmácia. O que você responderia?",
            expectedAnswer:
              "O multivitamínico de farmácia tem vitaminas genéricas sem relação direta com a libido; a cápsula da loja é formulada especificamente com vitaminas ligadas ao desejo sexual.",
          },
          {
            question:
              "Por que a loja vende tesão de vaca e tesão de touro mesmo considerando que o resultado real desses produtos é fraco?",
            expectedAnswer:
              "Porque são produtos muito conhecidos e procurados pelo nome forte; se a loja não vender, o cliente compra em outro lugar. O ideal é recomendar o energético com catuaba e maca peruana como opção mais eficaz.",
          },
          {
            question:
              "Uma cliente diz que tem dificuldade de chegar ao orgasmo. Quais perguntas você faria para indicar o melhor produto para ela?",
            expectedAnswer:
              "Perguntar onde sente mais prazer (clitóris, penetração ou ambos) para indicar entre excitante, sugador de clitóris, vibrador de penetração ou modelo combinado, e também a faixa de preço que está disposta a investir.",
          },
          {
            question:
              "Explique a diferença entre o excitante em gel e o vibrador como soluções para dificuldade de orgasmo feminino.",
            expectedAnswer:
              "O excitante age quimicamente (vasodilatação, calor, frio, vibração); o vibrador estimula mecanicamente de forma contínua, podendo gerar orgasmos mais fortes ou sequenciais.",
          },
          {
            question:
              "Uma cliente relata ressecamento vaginal forte e recorrente, não apenas um desconforto pontual. Que produto você indicaria e como explicaria o uso para ela?",
            expectedAnswer:
              "Hidratante vaginal, tratamento de 10 dias (não lubrificante pontual); um tubinho por dia, à noite, durante 10 dias, restaurando a lubrificação natural.",
          },
          {
            question:
              "Qual é a diferença entre lubrificante, hidratante vaginal e kit dilatador? Em que situação cada um é indicado?",
            expectedAnswer:
              "Lubrificante é de uso pontual; hidratante vaginal é tratamento de 10 dias para ressecamento severo; kit dilatador é para vaginismo forte ou preparo pré-cirúrgico, com introdução gradual de tamanhos.",
          },
          {
            question:
              "Por que nunca se deve vender apenas o anestésico anal sem o lubrificante?",
            expectedAnswer:
              "O anestésico não lubrifica, só reduz dor/desconforto. O ânus não tem lubrificação própria, então sem lubrificante a penetração pode causar lesão mesmo com a região anestesiada.",
          },
          {
            question:
              "Explique para que serve o plug anal e por que ele é recomendado antes da penetração principal.",
            expectedAnswer:
              "O ânus dilata gradualmente em 'anéis' (esfíncteres). O plug, por ter formato cônico, prepara e dilata essa região progressivamente antes da penetração com o pênis, tornando o processo mais confortável.",
          },
          {
            question:
              "Um cliente pergunta sobre opções para aumentar o tamanho do pênis e menciona ter visto anúncios de pílulas milagrosas. Como você orientaria esse cliente?",
            expectedAnswer:
              "Explicar que pílulas, óleos e fórmulas desse tipo são enganação. As únicas formas reais são cirurgia ou ácido hialurônico, procedimentos médicos que a loja não realiza. A loja vende a capa peniana, que aumenta o volume percebido, sem ser permanente.",
          },
          {
            question:
              "Um cliente tem vergonha de comprar a capa peniana, com medo de que a parceira ache estranho ou feio. Como você lidaria com essa objeção durante o atendimento?",
            expectedAnswer:
              "Explicar que, em geral, a parceira não se incomoda — ao contrário, costuma valorizar que ele esteja buscando satisfazê-la mais.",
          },
          {
            question:
              "Explique a diferença entre o anel peniano com vibrador e o anel peniano sem vibrador.",
            expectedAnswer:
              "Ambos prendem o sangue na base do pênis (sensação de inchaço e retardo da ejaculação). O modelo com vibrador também estimula o clitóris da parceira durante a penetração; o sem vibrador serve apenas para retenção de sangue.",
          },
          {
            question:
              "Um cliente pergunta se a bolinha explosiva pode ficar presa dentro do corpo depois do uso. O que você responderia, e que dica extra de venda você daria?",
            expectedAnswer:
              "O material é dissolvido naturalmente pelo corpo, não fica retido. Dica de venda: sugerir introduzir a bolinha escondida do parceiro, para criar uma surpresa durante a relação.",
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
