// Banco de perguntas para revisão dos PRODUTOS (Módulo 7).
// 3 grupos: Cosméticos, Acessórios e Vibradores.
// Cada produto tem 5 perguntas com alternativas difíceis.
// O sistema sorteia 3 por sessão.

import type { RevisionQuestion } from "@/data/revisao";

export type ProductRevisionGroupId = "cosmeticos" | "vibradores";

export type ProductRevisionItem = {
  productId: string;
  productLabel: string;
  /** Resumo curto exibido no card de leitura (Fase 1). */
  summary: string;
  questions: RevisionQuestion[]; // 5 por produto
};

export type ProductRevisionGroup = {
  id: ProductRevisionGroupId;
  title: string;
  /** ID do exame final do grupo na trilha (subtask). Quando esse exame é concluído, o grupo entra na fila de revisão. */
  examSubtaskId: string;
  products: ProductRevisionItem[];
};

const Q = (
  question: string,
  options: string[],
  correctIndex: number,
): RevisionQuestion => ({ question, options, correctIndex });

// =============================================================
// GRUPO 1 — COSMÉTICOS
// =============================================================

const EXCITANTES: ProductRevisionItem = {
  productId: "excitantes",
  productLabel: "Excitantes",
  summary:
    "Família de géis e sprays que estimulam órgãos genitais com efeitos como vibrar, refrescar, esquentar, suga, anestesiar e vasodilatar. Tem versões femininas (Goze, Clito em Gotas, Xana Loka, Vibration, Meltesão, Pico Pulse) e masculinas (Super Macho, Pau de Cavalo, spray excitante).",
  questions: [
    Q("Qual excitante tem efeito de SUCÇÃO realista além de vibrar e refrescar?", ["Vibration", "Xana Loka", "Pico Pulse", "Meltesão"], 2),
    Q("O Vibration e o Meltesão têm efeitos parecidos. O que diferencia o Meltesão?", ["Tem efeito de sucção", "É exclusivo feminino", "Tem sabor de mel e é sem açúcar", "Refresca em vez de aquecer"], 2),
    Q("O Clito em Gotas é descrito como extra forte. Quais são seus 4 efeitos?", ["Vibra, pulsa, aquece e lubrifica", "Shock, refresca, aquece e sensação de inchaço", "Suga, vibra, refresca e anestesia", "Aquece, lubrifica, vibra e refresca"], 1),
    Q("Qual excitante feminino tem efeito de esquentar, esfriar, vibrar e lubrificar ao mesmo tempo?", ["Goze", "Clito em Gotas", "Pico Pulse", "Xana Loka"], 3),
    Q("Por que nunca se deve prometer crescimento permanente ao vender o Pau de Cavalo?", ["Porque o produto é fraco e raramente funciona", "Porque o efeito é vasodilatador e temporário — dura enquanto o produto está ativo", "Porque a ANVISA proíbe esse tipo de promessa", "Porque só funciona com uso contínuo por 90 dias"], 1),
  ],
};

const PERFUMES: ProductRevisionItem = {
  productId: "perfumes_feromonios",
  productLabel: "Perfumes com Feromônios",
  summary:
    "Perfumes que combinam fragrância com feromônios sintéticos para potencializar a atração. Não substituem perfume tradicional do dia a dia, mas funcionam como aliados em momentos de paquera/conquista.",
  questions: [
    Q("Qual é o principal apelo de venda do perfume com feromônios?", ["Durar mais que perfumes comuns no corpo", "Potencializar a sensação de atração e presença em interações sociais e íntimas", "Substituir desodorante por causa do efeito antibacteriano", "Estimular sexualmente quem usa, como um excitante"], 1),
    Q("Como a feromônio age na proposta do produto?", ["Como um excitante químico aplicado na pele do parceiro", "Como uma substância natural percebida inconscientemente que reforça a percepção de atração", "Como uma fragrância concentrada que dura 48h", "Como um afrodisíaco ingerido pela boca"], 1),
    Q("Para qual situação faz mais sentido indicar o perfume com feromônio?", ["Para uso diário no trabalho como perfume principal", "Para encontros, festas e situações de paquera ou intimidade", "Para usar no ambiente da loja como aromatizador", "Para presentear casais que querem engravidar"], 1),
    Q("Qual promessa NUNCA deve ser feita ao vender perfume com feromônio?", ["Que potencializa a sensação de atração", "Que tem fragrância marcante", "Que garante conquistar qualquer pessoa que sentir o cheiro", "Que pode ser combinado com outros perfumes"], 2),
    Q("Como responder uma cliente que pergunta se o perfume substitui o dela do dia a dia?", ["Sim, esse perfume substitui qualquer outro porque é mais potente", "Não — ele é complementar, indicado para momentos específicos de atração e intimidade", "Sim, mas só se aplicar duas vezes por dia", "Depende do tipo de pele da cliente"], 1),
  ],
};

const ADSTRINGENTE: ProductRevisionItem = {
  productId: "adstringente",
  productLabel: "Adstringente",
  summary:
    "Produto íntimo feminino (gel ou bolinha) que dá sensação TEMPORÁRIA de canal vaginal mais apertado. Beneficia os dois parceiros pelo aumento do atrito.",
  questions: [
    Q("Qual é a proposta do adstringente íntimo?", ["Aumentar a lubrificação vaginal permanentemente", "Proporcionar sensação temporária de canal mais apertado", "Tratar ressecamento vaginal crônico", "Anestesiar levemente para reduzir dor na penetração"], 1),
    Q("Qual promessa NUNCA se deve fazer ao vender adstringente?", ["Que tem versão em gel e bolinha", "Que dá sensação temporária de aperto", "Que reconstrói permanentemente o canal vaginal", "Que beneficia os dois parceiros pelo maior atrito"], 2),
    Q("Qual é a diferença entre adstringente em gel e bolinha efervescente?", ["A bolinha é para uso anal e o gel para vaginal", "O gel é espalhado; a bolinha é inserida e libera o ativo ao se dissolver", "São o mesmo produto — a bolinha dissolve antes de ser aplicada", "O gel tem efeito mais duradouro"], 1),
    Q("Para qual situação específica o adstringente faz mais sentido indicar?", ["Quando a cliente tem ressecamento vaginal frequente", "Quando o casal quer mais sensação de atrito e aperto durante a relação", "Quando a cliente tem dificuldade de chegar ao orgasmo por falta de estímulo", "Quando o cliente quer retardar a ejaculação"], 1),
    Q("Como o adstringente beneficia os dois parceiros?", ["Ela sente o aperto e ele sente maior atrito pela sensação de canal mais comprimido", "Os dois sentem vibração pela reação química do produto", "Ela sente aperto e ele sente anestesia para durar mais", "Os dois sentem resfriamento que prolonga a relação"], 0),
  ],
};

const ESTIMULANTES: ProductRevisionItem = {
  productId: "estimulantes_sexuais",
  productLabel: "Estimulantes Sexuais",
  summary:
    "Cápsulas (uso contínuo, libido) e sachês/energéticos afrodisíacos (efeito pontual e imediato). Indicação muda conforme a necessidade do cliente: rotina ou momento específico.",
  questions: [
    Q("Qual é a diferença entre cápsula de libido e sachê estimulante?", ["Sachê é mais forte; cápsula é para iniciantes", "Cápsula é de uso contínuo para libido baixa; sachê tem efeito imediato e pontual", "Cápsula é feminina; sachê é masculino", "São o mesmo produto em formatos diferentes"], 1),
    Q("Para um cliente com libido baixa de forma recorrente, qual indicação faz mais sentido?", ["Sachê estimulante para tomar antes de cada relação", "Excitante gel para aplicar na hora", "Cápsula de libido de uso contínuo", "Energético afrodisíaco para consumir diariamente"], 2),
    Q("Para um cliente que quer algo pontual só para uma noite especial, o que indicar?", ["Cápsula de libido — tem efeito acumulativo melhor", "Sachê estimulante ou energético afrodisíaco", "Hidratante vaginal para deixar mais preparada", "Excitante de uso externo apenas"], 1),
    Q("Energético afrodisíaco difere de sachê estimulante em qual aspecto?", ["O energético tem efeito mais rápido e o sachê demora mais", "O energético combina estímulo energético com ingredientes afrodisíacos — além de libido, dá disposição física", "São equivalentes — apenas o formato de consumo difere", "O sachê é mais forte e o energético é mais suave"], 1),
    Q("Por que perguntar se o cliente quer uso contínuo ou pontual antes de indicar estimulante?", ["Para calcular o preço correto do produto", "Porque cápsula e sachê têm preços muito diferentes", "Porque a indicação muda completamente — cápsula para uso contínuo, sachê para efeito imediato", "Apenas para entender o orçamento do cliente"], 2),
  ],
};

const RETARDANTE: ProductRevisionItem = {
  productId: "retardante",
  productLabel: "Retardante",
  summary:
    "Spray masculino que reduz levemente a sensibilidade da glande sem anular a ereção, ajudando a durar mais. Aplicado alguns minutos antes da relação.",
  questions: [
    Q("Como o spray retardante ajuda o homem a durar mais?", ["Aumenta o fluxo sanguíneo, mantendo a ereção por mais tempo", "Anestesia completamente a glande, impedindo o orgasmo", "Reduz a sensibilidade da glande de forma controlada, sem anular a ereção", "Contrai os músculos do períneo para retardar a ejaculação"], 2),
    Q("Qual objeção comum o cliente tem sobre o retardante e como responder?", ["Que vai queimar — explicar que é gel neutro sem componente irritante", "Que vai perder totalmente a sensibilidade ou \"broxar\" — explicar que apenas reduz levemente, sem anular o prazer", "Que funciona só na primeira vez — explicar que o efeito é consistente", "Que não pode usar com preservativo — explicar que é compatível"], 1),
    Q("Para qual situação o retardante é mais indicado?", ["Para homens com disfunção erétil moderada", "Para homens que chegam ao orgasmo mais rápido do que gostariam", "Para homens que querem aumentar o volume peniano", "Para homens com libido baixa que querem mais disposição"], 1),
    Q("O retardante pode ser usado junto com excitante feminino?", ["Não — os dois produtos têm reações químicas incompatíveis", "Sim — ele retarda o homem e o excitante estimula a mulher, equilibrando a relação", "Só se for o mesmo fabricante", "Não — o retardante anula o efeito do excitante"], 1),
    Q("Onde o spray retardante deve ser aplicado?", ["Na base do pênis, próximo ao escroto", "Na glande e corpo do pênis, alguns minutos antes da relação", "No pênis inteiro e nos testículos", "Na parte interna da vagina da parceira"], 1),
  ],
};

const LUBRIFICANTE: ProductRevisionItem = {
  productId: "lubrificante",
  productLabel: "Lubrificante",
  summary:
    "Existem 3 tipos principais: base d'água (compatível com tudo), base oleosa (não usar com látex) e silicone (mais duradouro). Lubrificante ≠ hidratante vaginal: lubrificante é pontual, hidratante é tratamento contínuo.",
  questions: [
    Q("Qual é a diferença entre lubrificante e hidratante vaginal?", ["São o mesmo produto com nomes diferentes", "Lubrificante é para uso anal; hidratante é vaginal", "Lubrificante é uso pontual durante a relação; hidratante é tratamento contínuo para ressecamento crônico", "Hidratante é mais espesso e lubrifica melhor durante o ato"], 2),
    Q("Por que saliva não substitui lubrificante no sexo anal?", ["Porque tem pH incompatível com o tecido anal", "Porque o ânus não tem lubrificação própria e a saliva seca rapidamente, aumentando o risco de lesão", "Porque contém bactérias que causam infecção", "Porque não tem viscosidade suficiente para produtos maiores"], 1),
    Q("Quais são os tipos de lubrificante que a atendente deve conhecer?", ["Apenas base d'água e base oleosa", "Base d'água, base oleosa e silicone — cada um com indicação diferente", "Apenas lubrificante neutro e com sabor", "Lubrificante feminino e masculino"], 1),
    Q("Por que lubrificante base oleosa não deve ser usado com preservativo?", ["Porque tem cheiro forte que incomoda", "Porque reage com o látex e pode romper o preservativo", "Porque é muito espesso para uso com preservativo", "Porque reduz a sensibilidade peniana"], 1),
    Q("Quando indicar lubrificante anal especificamente?", ["Quando a cliente tem ressecamento vaginal crônico", "Sempre que houver penetração anal — o ânus não produz lubrificação própria", "Apenas quando o cliente pedir explicitamente", "Somente quando combinado com plug anal"], 1),
  ],
};

const ANESTESICOS: ProductRevisionItem = {
  productId: "anestesicos",
  productLabel: "Anestésicos",
  summary:
    "Anestésico de garganta (suave, reduz ânsia no oral profundo) e anestésico anal (mais forte, reduz desconforto da penetração). Sempre combinar anestésico anal com lubrificante.",
  questions: [
    Q("Para que serve o anestésico de garganta?", ["Para reduzir ânsia e desconforto no oral profundo", "Para anestesiar o clitóris e facilitar o orgasmo", "Para reduzir a sensibilidade peniana e retardar a ejaculação", "Para uso anal, reduzindo o desconforto da penetração"], 0),
    Q("Como o anestésico anal difere do anestésico de garganta?", ["São o mesmo produto — apenas o nome muda conforme a loja", "Anestésico anal é mais forte e não pode ser ingerido; anestésico de garganta é mais suave e seguro para uso oral", "Anestésico de garganta é mais potente", "O anal tem lubrificante integrado e o de garganta não"], 1),
    Q("Qual é a orientação principal ao indicar anestésico anal?", ["Usar em grande quantidade para garantir o efeito", "Aplicar e esperar 30 minutos antes da penetração", "Usar junto com bastante lubrificante — o anestésico reduz o desconforto mas não substitui o lubrificante", "Não usar com plug anal, apenas na penetração direta"], 2),
    Q("Um cliente quer experimentar sexo oral pela primeira vez mas tem muito reflexo de ânsia. O que indicar?", ["Lubrificante com sabor para facilitar", "Anestésico de garganta aplicado no fundo da garganta", "Excitante feminino para ajudar no relaxamento", "Não existe produto para isso — é uma questão de treino"], 1),
    Q("O anestésico deve ser indicado sozinho para penetração anal?", ["Sim — é suficiente por si só", "Não — deve ser sempre combinado com lubrificante adequado", "Só sozinho se for anestésico extra forte", "Depende do tamanho do produto utilizado"], 1),
  ],
};

// =============================================================
// GRUPO 2 — ACESSÓRIOS
// =============================================================

const CAPAS_PENIANAS: ProductRevisionItem = {
  productId: "capas_penianas",
  productLabel: "Capa Peniana",
  summary:
    "Acessório vestido sobre o pênis que aumenta volume e/ou comprimento. Pode ter texturas e relevo. NÃO substitui preservativo — não protege contra ISTs ou gravidez. Usar com lubrificante.",
  questions: [
    Q("Qual é a principal função da capa peniana?", ["Substituir o preservativo durante a relação", "Aumentar de forma temporária o volume e/ou comprimento do pênis durante a relação", "Tratar disfunção erétil leve", "Reduzir a sensibilidade peniana para o homem durar mais"], 1),
    Q("O que a consultora deve esclarecer obrigatoriamente sobre a capa peniana antes de fechar a venda?", ["Que ela deve ser lavada com álcool após o uso", "Que dura no máximo 3 relações", "Que NÃO substitui camisinha e não oferece proteção contra ISTs ou gravidez", "Que reduz a sensibilidade do homem em 50%"], 2),
    Q("Para qual tipo de cliente a capa peniana com relevo/texturas é mais indicada?", ["Casais que querem variar o estímulo da parceira durante a penetração", "Homens com disfunção erétil severa", "Mulheres que sofrem com ressecamento vaginal crônico", "Clientes que querem retardar a ejaculação"], 0),
    Q("Por que a capa peniana sempre deve ser usada com lubrificante?", ["Porque sem lubrificante o material rasga facilmente", "Porque o material não desliza naturalmente como a pele e gera atrito desconfortável sem lubrificante", "Porque o lubrificante ativa o relevo da capa", "Porque o lubrificante neutraliza o cheiro do material"], 1),
    Q("Como responder um cliente que pergunta se o efeito da capa é permanente?", ["Sim, com uso contínuo o pênis aumenta de tamanho", "Não — o efeito existe apenas enquanto a capa está sendo usada na relação", "Depende do organismo do cliente", "Sim, mas apenas após 30 dias de uso diário"], 1),
  ],
};

const PLUG_ANAL: ProductRevisionItem = {
  productId: "plug_anal",
  productLabel: "Plug Anal",
  summary:
    "Brinquedo inserido no ânus, com base alargada (de segurança) para não entrar por completo. Vem em vários tamanhos — iniciante começa pequeno. Usar SEMPRE com lubrificante adequado (base d'água ou silicone, nunca oleoso com brinquedos de silicone).",
  questions: [
    Q("Qual é a função da base alargada (\"saia\") do plug anal?", ["Estimular o períneo durante o uso", "Servir como apoio para o parceiro segurar o plug", "Impedir que o plug entre por completo e fique preso dentro do reto", "Aumentar a vibração transmitida ao corpo"], 2),
    Q("Qual orientação a consultora deve dar ao indicar plug para uma pessoa iniciante?", ["Começar pelo modelo médio para ganhar tempo no uso", "Começar pelo menor tamanho disponível e usar muito lubrificante para a dilatação ser gradual", "Começar com plug vibratório para relaxar a musculatura", "Pode começar por qualquer tamanho, desde que use anestésico anal"], 1),
    Q("Qual tipo de lubrificante NÃO deve ser usado com plug de silicone?", ["Lubrificante base d'água", "Lubrificante de silicone — pode danificar a superfície do plug", "Lubrificante anal específico", "Lubrificante neutro sem fragrância"], 1),
    Q("Para que serve o plug com pedra/joia decorativa na ponta?", ["Aumentar o peso para estimulação interna mais intensa", "Função estética/visual para quem gosta de elemento decorativo enquanto usa", "Indicar a temperatura corporal do usuário", "Servir como tampa de proteção do orifício do plug"], 1),
    Q("Por que NÃO se deve usar plug improvisado (objetos sem base alargada)?", ["Porque pode oxidar dentro do corpo", "Porque pode entrar por completo no reto e exigir intervenção médica para retirada", "Porque rapidamente perde a forma", "Porque não tem material aprovado pela ANVISA"], 1),
  ],
};

const ANEL_PENIANO: ProductRevisionItem = {
  productId: "anel_peniano",
  productLabel: "Anel Peniano",
  summary:
    "Anel que envolve a base do pênis (e às vezes os testículos) para reter o fluxo sanguíneo e prolongar a ereção. Pode ter vibração que estimula clitóris durante a penetração. Tempo máximo de uso contínuo: 20-30 min.",
  questions: [
    Q("Qual é o mecanismo de funcionamento do anel peniano?", ["Aumenta a produção natural de testosterona", "Pressiona a base do pênis, retardando o retorno venoso e mantendo a ereção mais firme e duradoura", "Estimula eletricamente o nervo pudendo", "Anestesia levemente a base para o homem durar mais"], 1),
    Q("Qual é a principal orientação de segurança ao vender anel peniano?", ["Pode ser usado a noite toda", "Não usar por mais de 20-30 minutos contínuos para evitar comprometer a circulação", "Aplicar gelo antes para reduzir desconforto", "Lavar com álcool antes de cada uso"], 1),
    Q("Qual é a vantagem específica do anel peniano vibratório?", ["Aumentar a sensibilidade do homem", "Estimular o clitóris da parceira durante a penetração, sem precisar de outro brinquedo", "Funcionar como retardante automático", "Aumentar permanentemente o tamanho do pênis"], 1),
    Q("Para qual cliente o anel peniano de silicone elástico é mais indicado em relação ao de material rígido?", ["Quem nunca usou — é mais confortável e ajustável", "Quem tem disfunção erétil severa — segura mais firme", "Quem quer efeito permanente", "Quem não quer estimular a parceira"], 0),
    Q("O anel peniano pode ser usado com qualquer pessoa?", ["Sim, é seguro para todos", "Pessoas com problemas circulatórios ou em uso de anticoagulantes devem consultar médico antes — a consultora deve recomendar cautela", "Apenas homens acima de 30 anos", "Apenas em quem já fez vasectomia"], 1),
  ],
};

const SADO: ProductRevisionItem = {
  productId: "sado",
  productLabel: "Sado (BDSM)",
  summary:
    "Linha de algemas, vendas, mordaças, chicotes, palmatórias e similares para práticas BDSM consensuais. Foco em segurança, palavra de segurança e materiais de qualidade.",
  questions: [
    Q("Qual conceito é fundamental para uma indicação responsável de produtos da linha sado?", ["Que o produto seja o mais resistente possível", "Que o casal combine antecipadamente práticas, limites e uma \"palavra de segurança\"", "Que o parceiro dominante decida sozinho a intensidade", "Que sejam usados apenas com bebida alcoólica para relaxar"], 1),
    Q("Qual é a indicação ideal para um casal iniciante em BDSM?", ["Kit completo com chicote, mordaça e cordas avançadas", "Kit introdutório com algema de tecido/velcro e venda — itens leves e confortáveis", "Apenas chicote, para entender o impacto", "Mordaça com bola, para silenciar a parceira"], 1),
    Q("Por que algema de metal pode não ser ideal para iniciantes?", ["Por ser muito cara", "Por machucar os pulsos se a pessoa se mexer muito e não ter regulagem confortável como as de velcro/tecido", "Por enferrujar rápido", "Por ter cheiro forte"], 1),
    Q("Qual é a função da venda nos olhos em práticas BDSM consensuais?", ["Impedir que o parceiro veja o ambiente para evitar vazamento de imagens", "Suprimir a visão para intensificar os outros sentidos e a sensação de surpresa/entrega", "Servir como sinal de que a relação acabou", "Reduzir o desconforto da luz forte do quarto"], 1),
    Q("Qual recomendação a consultora deve sempre fazer ao vender uma mordaça?", ["Usar por no mínimo 1 hora para criar tolerância", "Combinar um sinal não verbal de segurança (ex: tocar 3 vezes no parceiro) já que a pessoa não conseguirá falar", "Aplicar lubrificante antes do uso", "Lavar apenas com sabão neutro pH 5.5"], 1),
  ],
};

const MASTURBADOR_MASCULINO: ProductRevisionItem = {
  productId: "masturbador_masculino",
  productLabel: "Masturbador Masculino",
  summary:
    "Acessórios para uso solo masculino: modelos com texturas internas, com sucção, vibração ou aquecimento. Material cyber skin é mais realista que o PVC convencional. Sempre usar com lubrificante base d'água.",
  questions: [
    Q("Qual é o diferencial do masturbador em material cyber skin em relação a modelos básicos de PVC?", ["É mais barato", "Textura e consistência mais próximas da pele humana, oferecendo sensação mais realista", "Tem vibração integrada", "Não precisa ser limpo após o uso"], 1),
    Q("Qual tipo de lubrificante deve ser indicado para masturbadores de TPE/cyber skin?", ["Base oleosa, porque dura mais", "Base d'água, porque é compatível com o material sem danificá-lo", "Saliva é suficiente", "Lubrificante de silicone — derrete impurezas"], 1),
    Q("Qual cuidado de higiene é essencial após o uso do masturbador?", ["Apenas guardar na embalagem original", "Lavar com água morna e sabão neutro, secar bem e guardar em local arejado para evitar mofo e proliferação bacteriana", "Passar álcool 70% para esterilizar", "Lavar com água sanitária diluída"], 1),
    Q("Para que serve o sistema de sucção em alguns modelos de masturbador?", ["Aquecer internamente o brinquedo", "Simular a sensação de sexo oral com pressão variável", "Vibrar em batidas no ritmo da música", "Reduzir o uso de lubrificante"], 1),
    Q("Para qual cliente os masturbadores com formato discreto (\"egg\" ou ovinho) são mais indicados?", ["Quem quer um produto bem volumoso e visual", "Quem quer algo portátil, discreto e mais acessível para experimentar a categoria", "Apenas homens muito experientes em brinquedos", "Quem não quer usar lubrificante"], 1),
  ],
};

const ROUPAS: ProductRevisionItem = {
  productId: "roupas",
  productLabel: "Roupas / Lingerie",
  summary:
    "Lingeries, fantasias e moda íntima para apimentar momentos e elevar a autoestima. Foco na ocasião (data especial, fantasia temática, conforto sensual do dia a dia) e no caimento.",
  questions: [
    Q("Qual é a abordagem mais eficaz para indicar lingerie a uma cliente indecisa?", ["Mostrar a peça mais cara primeiro", "Perguntar a ocasião (data especial, surpresa, uso pessoal) e o estilo que ela se sente confortável", "Indicar sempre a peça mais ousada para ela sair da zona de conforto", "Mostrar várias peças sem perguntar nada"], 1),
    Q("Quando indicar fantasia temática (enfermeira, policial etc.) em vez de lingerie clássica?", ["Para uso diário no trabalho", "Para casais que querem brincar com roleplay/encenação e mudar a dinâmica da relação", "Para clientes que nunca usaram lingerie", "Para presentear amigas em chá de panela"], 1),
    Q("Qual é o cuidado principal sobre tamanho ao vender lingerie online ou por WhatsApp?", ["Mandar sempre tamanho M para mulheres e G para homens", "Confirmar medidas (manequim, busto, quadril) antes de fechar, porque tamanhos variam por fornecedor", "Indicar sempre o maior tamanho para não apertar", "Tamanho de lingerie não importa, todas servem em qualquer corpo"], 1),
    Q("Como apresentar lingerie de tamanho plus size com a mesma valorização das demais?", ["Mostrar separadamente em uma seção \"especial\"", "Tratar como mais uma opção do catálogo, destacando caimento, conforto e modelos pensados para valorizar curvas", "Indicar apenas em cores escuras", "Avisar que pode não servir antes de mostrar"], 1),
    Q("Qual produto frequentemente é vendido em combinação com lingerie/fantasia?", ["Anestésico anal", "Perfume com feromônio, vela aromática ou óleo de massagem para compor a ambientação", "Plug anal extra grande", "Máquina de sexo"], 1),
  ],
};

const PENIS_REALISTICO: ProductRevisionItem = {
  productId: "penis_realistico",
  productLabel: "Pênis Realístico (Prótese)",
  summary:
    "Próteses penianas com formato/textura realistas. Materiais comuns: PVC (mais rígido e barato) e cyber skin (mais realista, macio). Modelos com ventosa fixam em superfícies, alguns têm vibração ou escroto inflável.",
  questions: [
    Q("Qual é a principal diferença prática entre próteses de PVC e cyber skin?", ["PVC é mais barato e durável; cyber skin tem textura mais próxima da pele humana e oferece sensação mais realista", "PVC é hipoalergênico e cyber skin não", "Cyber skin não pode ser lavado", "PVC é mais flexível que cyber skin"], 0),
    Q("Para que serve a ventosa em alguns modelos de prótese?", ["Indicar pressão durante o uso", "Permitir fixação em superfícies lisas (parede, chão, box) liberando as mãos", "Aumentar a vibração", "Servir como suporte para guardar a prótese de pé"], 1),
    Q("Como orientar a primeira compra de prótese para uma cliente iniciante?", ["Sempre o maior tamanho disponível, para já se acostumar com o maior", "Começar por um tamanho compatível com a experiência dela, em material confortável e com lubrificante base d'água", "Indicar sempre prótese com vibração para ser mais empolgante", "Não dar orientação — deixar a cliente decidir sozinha"], 1),
    Q("Qual é a função do escroto inflável em alguns modelos de prótese?", ["Servir de reservatório para lubrificante", "Simular ejaculação ao apertar (libera líquido pelo orifício da glande)", "Aumentar o peso para estimulação mais intensa", "Esquentar a prótese durante o uso"], 1),
    Q("Qual lubrificante deve ser indicado para próteses de cyber skin?", ["Base oleosa, porque dura mais", "Base d'água — é compatível e não compromete o material", "Saliva, porque é a opção mais natural", "Lubrificante de silicone, porque preserva melhor"], 1),
  ],
};

// =============================================================
// GRUPO 3 — VIBRADORES
// =============================================================

const VIBRADOR_RABBIT: ProductRevisionItem = {
  productId: "vibrador_rabbit",
  productLabel: "Vibrador Rabbit",
  summary:
    "Vibrador com dois pontos de estímulo: haste para penetração vaginal (com ponto G) + \"orelhinhas\" externas para estímulo direto do clitóris. Tem múltiplos modos de vibração independentes em alguns modelos.",
  questions: [
    Q("Qual é a característica que define o Rabbit?", ["Tem ventosa para fixar na parede", "Tem dois pontos de estímulo: penetração interna + estímulo externo do clitóris ao mesmo tempo", "Funciona via aplicativo de celular", "É o vibrador mais silencioso do mercado"], 1),
    Q("Para qual cliente o Rabbit é a indicação mais certeira?", ["Para quem só quer estímulo externo no clitóris", "Para quem busca orgasmo combinado (vaginal + clitoriano) sem precisar coordenar dois brinquedos", "Para casais — uso compartilhado", "Para uso anal exclusivamente"], 1),
    Q("Qual é a vantagem de Rabbits com motores independentes na haste e nas orelhinhas?", ["Duram mais bateria", "Permitem controlar separadamente intensidade interna e externa, ajustando para cada momento", "São à prova d'água", "Pesam menos que os modelos comuns"], 1),
    Q("Como responder uma cliente que pergunta se o Rabbit pode ser usado também sem penetração?", ["Não, foi feito apenas para uso interno", "Sim — as orelhinhas funcionam isoladamente como estimulador clitoriano, mesmo sem inserir a haste", "Só se for modelo recarregável", "Apenas com lubrificante específico"], 1),
    Q("Qual cuidado é essencial após o uso do Rabbit?", ["Guardar dentro de saco plástico fechado a vácuo", "Limpar com água morna e sabão neutro (ou higienizador de brinquedos), secar bem antes de guardar", "Esterilizar com álcool 70% após cada uso", "Lavar com água sanitária diluída para máxima higiene"], 1),
  ],
};

const SUGADOR_DE_CLITORIS: ProductRevisionItem = {
  productId: "sugador_de_clitoris",
  productLabel: "Sugador de Clitóris",
  summary:
    "Brinquedo que utiliza ondas de pressão de ar (não vibra — \"suga\"/pulsa) sobre o clitóris, sem contato direto. Geralmente recarregável, com vários níveis de intensidade. Reconhecido por induzir orgasmos rápidos e diferentes dos vibradores comuns.",
  questions: [
    Q("Qual é o diferencial técnico do sugador de clitóris em relação a um vibrador comum?", ["É mais barato", "Usa ondas de pressão/sucção em vez de vibração mecânica direta, gerando sensação distinta", "Tem formato anatômico encaixado no canal vaginal", "É exclusivamente para uso anal"], 1),
    Q("Por que o sugador é frequentemente indicado para quem nunca atingiu orgasmo clitoriano facilmente?", ["Porque o estímulo por sucção/pressão é direto, indireto na pele e costuma ser mais eficaz para muitas mulheres", "Porque tem o motor mais potente do mercado", "Porque é o mais barato", "Porque vibra simultaneamente em 5 pontos"], 0),
    Q("Qual é a forma correta de posicionar o sugador?", ["Penetrar com ele, como um vibrador comum", "Encostar a abertura do bocal sobre o clitóris (sem precisar de pressão forte) para criar o vácuo", "Pressionar fortemente o bocal contra os grandes lábios", "Usar apenas sobre a roupa íntima"], 1),
    Q("Pode-se usar lubrificante com o sugador?", ["Não — vai entupir o bocal", "Sim, base d'água, e pode aumentar a sensação para quem prefere a área mais lubrificada", "Apenas lubrificante oleoso", "Não, porque é à prova d'água"], 1),
    Q("Para qual cliente o sugador é uma indicação especialmente forte?", ["Quem busca penetração vaginal profunda", "Quem quer estimulação clitoriana intensa, rápida e sem contato direto irritante na pele", "Quem quer usar com parceiro durante a penetração anal", "Quem prefere brinquedos discretos para esconder na bolsa"], 1),
  ],
};

const VIBRADOR_CALCINHA: ProductRevisionItem = {
  productId: "vibrador_de_calcinha",
  productLabel: "Vibrador de Calcinha",
  summary:
    "Mini vibrador discreto que é colocado dentro da calcinha e estimula o clitóris. Muitos modelos vêm com controle remoto sem fio (ou via app), permitindo que outra pessoa controle a vibração à distância.",
  questions: [
    Q("Qual é a principal proposta do vibrador de calcinha com controle remoto?", ["Substituir totalmente o Rabbit", "Permitir uso discreto em público e brincadeiras a distância em que o parceiro controla a vibração", "Funcionar como anel peniano", "Ser usado durante a corrida para tonificar a musculatura"], 1),
    Q("Qual é a indicação ideal para usar o vibrador de calcinha em casal?", ["Apenas em casa, sozinho", "Em jantares, viagens, encontros — o parceiro controla as variações via remoto/app criando antecipação", "Apenas durante a relação sexual", "Como brinquedo para crianças aprenderem sobre o corpo"], 1),
    Q("Qual é a diferença entre vibrador de calcinha com remoto físico e via aplicativo?", ["O remoto físico tem mais alcance que o app", "O remoto físico tem alcance limitado (geralmente 10m); via app pode ser controlado a longas distâncias pela internet", "Não há diferença prática", "O remoto físico não tem variação de intensidade"], 1),
    Q("Qual cuidado a consultora deve mencionar sobre o uso em público?", ["Avisar que o produto pode fazer barulho audível em ambientes silenciosos — testar antes em casa", "Que pode interferir no Wi-Fi do estabelecimento", "Que precisa estar conectado à tomada", "Que dura apenas 5 minutos por uso"], 0),
    Q("Para qual perfil de cliente o vibrador de calcinha NÃO é a primeira indicação?", ["Casal que viaja muito e quer brincadeiras à distância", "Cliente que busca estimulação interna profunda (vaginal/anal)", "Cliente que quer apimentar encontros em público", "Cliente que quer um brinquedo discreto de bolsa"], 1),
  ],
};

const MAQUINA_DE_SEXO: ProductRevisionItem = {
  productId: "maquina_de_sexo",
  productLabel: "Máquina de Sexo",
  summary:
    "Equipamento mecânico que realiza movimentos de penetração automatizados, com velocidade e amplitude reguláveis. Costuma aceitar diferentes próteses encaixáveis. Produto premium, para uso solo ou em casal.",
  questions: [
    Q("Qual é a principal vantagem da máquina de sexo em relação a um vibrador convencional?", ["Vibrar mais forte", "Realizar movimentos contínuos de penetração com velocidade e amplitude reguláveis, sem esforço físico do usuário", "Ser mais barata", "Ser totalmente silenciosa"], 1),
    Q("Para qual perfil de cliente faz mais sentido indicar máquina de sexo?", ["Cliente que está experimentando brinquedos pela primeira vez", "Cliente experiente em brinquedos, com orçamento maior, que busca uma experiência mais intensa e \"mãos livres\"", "Adolescentes curiosos", "Cliente que quer um brinquedo discreto e portátil"], 1),
    Q("Qual é uma característica importante a verificar antes de fechar a venda da máquina de sexo?", ["Que veio com plug anal incluso", "Compatibilidade dos encaixes para próteses (cada marca tem padrão diferente)", "Cor do equipamento", "Se vem com chicote BDSM incluído"], 1),
    Q("Qual orientação de uso a consultora deve dar para a primeira vez com a máquina?", ["Já começar na velocidade máxima para sentir o impacto", "Começar com velocidade e amplitude baixas, usar bastante lubrificante e aumentar gradualmente conforme o conforto", "Não usar lubrificante, atrapalha o motor", "Usar combinada com anestésico anal sempre"], 1),
    Q("Por que a máquina de sexo costuma ter posicionamento de venda premium na loja?", ["Por ser o produto mais barato do mix", "Pelo ticket alto, pela tecnologia envolvida e por entregar experiência diferenciada de penetração mecânica", "Por ser fabricada artesanalmente", "Por ter validade muito curta"], 1),
  ],
};

const VIBRADOR_CASAL: ProductRevisionItem = {
  productId: "vibrador_de_casal",
  productLabel: "Vibrador de Casal",
  summary:
    "Vibrador desenhado para uso simultâneo do casal durante a penetração: uma parte fica dentro da vagina estimulando ponto G e a outra fica externamente, estimulando o clitóris da mulher e a base do pênis do parceiro. Geralmente com controle remoto ou via app.",
  questions: [
    Q("Como o vibrador de casal funciona durante a relação?", ["É inserido apenas pelo homem", "É posicionado dentro da vagina e fica entre os dois durante a penetração, estimulando ela (clitóris+G) e ele (base do pênis)", "É usado apenas antes da relação como preliminar", "É um anel peniano com vibração"], 1),
    Q("Qual é a principal vantagem do vibrador de casal sobre brinquedos solo durante a penetração?", ["Substitui a necessidade de penetração", "Permite estimulação simultânea dos dois parceiros durante a penetração, sem precisar pausar para usar outro brinquedo", "É o mais potente do mercado", "Pode ser usado também como massageador de pescoço"], 1),
    Q("Por que muitos vibradores de casal têm controle remoto ou via app?", ["Para liberar as mãos do casal durante a relação e permitir que um parceiro controle o estímulo do outro", "Porque o controle físico do brinquedo desligaria sozinho", "Para diminuir o consumo de bateria", "Para conectar à TV"], 0),
    Q("Quando indicar vibrador de casal em vez de sugador de clitóris para uma cliente?", ["Quando ela está sozinha e quer orgasmo rápido", "Quando ela quer incluir o brinquedo na relação com o parceiro, estimulando os dois ao mesmo tempo", "Quando ela busca brinquedo para uso anal", "Quando o orçamento é muito baixo"], 1),
    Q("Qual material é mais comum e seguro nos vibradores de casal?", ["Plástico ABS rígido", "Silicone medicinal — flexível, hipoalergênico e fácil de higienizar", "Madeira tratada", "Borracha látex comum"], 1),
  ],
};

const VIBRADOR_APP: ProductRevisionItem = {
  productId: "vibrador_de_aplicativo",
  productLabel: "Vibrador de Aplicativo",
  summary:
    "Vibrador controlado via aplicativo de celular (Bluetooth ou internet). Permite controle remoto à distância, criação de padrões personalizados de vibração e até sincronização com música ou voz.",
  questions: [
    Q("Qual é o diferencial central do vibrador controlado por aplicativo?", ["Ter motor mais potente que vibradores comuns", "Ser controlado via celular (Bluetooth ou internet), permitindo controle à distância e padrões personalizados", "Ser sempre o modelo mais barato", "Não precisar de carregamento"], 1),
    Q("Qual conexão usar para controle a distâncias muito grandes (cidades diferentes)?", ["Bluetooth do celular", "Conexão via internet (Wi-Fi/4G) integrada ao app — Bluetooth tem alcance curto", "Cabo USB conectado ao computador", "Sinal de rádio AM"], 1),
    Q("Para qual perfil de cliente esse tipo de vibrador é uma indicação especialmente forte?", ["Cliente sem smartphone", "Casais em relacionamento à distância, que querem brincar juntos mesmo separados fisicamente", "Cliente que prefere brinquedos manuais sem tecnologia", "Cliente iniciante absoluto em vibradores"], 1),
    Q("Qual cuidado de privacidade a consultora pode mencionar sobre esse tipo de produto?", ["Que o brinquedo grava som ambiente", "Que o app deve ser baixado oficialmente e a conta protegida — controle à distância exige cuidado com quem tem acesso", "Que o app é incompatível com iPhone", "Que precisa ser usado sempre offline"], 1),
    Q("Qual recurso normalmente disponível nesses aplicativos permite criar experiências personalizadas?", ["Apenas ligar e desligar", "Criação de padrões customizados de vibração, sincronização com música e até com voz", "Reservar consulta médica", "Comprar baterias automaticamente"], 1),
  ],
};

const VARINHA_MAGICA: ProductRevisionItem = {
  productId: "varinha_magica",
  productLabel: "Varinha Mágica",
  summary:
    "Massageador grande, em forma de cetro, com cabeça grande arredondada e vibração muito potente. Originalmente vendida como massageador corporal — também muito usada como estimulador clitoriano externo. Ideal para quem precisa de vibração mais intensa.",
  questions: [
    Q("Qual é a principal característica que diferencia a varinha mágica de vibradores comuns?", ["É a mais discreta do mercado", "Vibração extremamente potente, com cabeça grande para estímulo externo amplo — pensada também para massagem corporal", "É o vibrador mais barato", "É controlada por aplicativo apenas"], 1),
    Q("Para qual cliente a varinha mágica é indicação especialmente boa?", ["Cliente que precisa de brinquedo super discreto e silencioso", "Cliente que tem dificuldade para se excitar com estímulos suaves e busca vibração forte e ampla", "Cliente que quer apenas penetração profunda", "Cliente que quer brinquedo pequeno de bolsa"], 1),
    Q("Qual cuidado a consultora deve mencionar sobre o uso da varinha mágica?", ["Que não pode ser ligada na tomada", "Que pela potência alta, o uso prolongado direto no clitóris pode causar dormência temporária — recomenda-se começar pela intensidade baixa", "Que só funciona molhada", "Que dura apenas 30 segundos por uso"], 1),
    Q("Existe acessório encaixável para varinha mágica? Para que serve?", ["Não existem acessórios para varinha", "Sim — encaixes/cabeças intercambiáveis (silicone) que transformam a vibração em estímulo penetrativo ou em formatos específicos", "Sim — acessório para usar como ventilador de teto", "Sim — apenas para mudar a cor da luz indicadora"], 1),
    Q("Qual é a vantagem das varinhas mágicas recarregáveis sem fio em relação às antigas com fio?", ["Vibram menos forte", "Sem dependência de tomada — mais portáteis e flexíveis para uso na cama, no banho (modelos à prova d'água) e em viagens", "São mais baratas", "Não precisam ser limpas"], 1),
  ],
};

const MINI_VIBRADOR: ProductRevisionItem = {
  productId: "mini_vibrador",
  productLabel: "Mini Vibrador",
  summary:
    "Vibradores compactos e discretos, perfeitos como porta de entrada na categoria e para uso em viagens. Costumam usar pilha ou USB, com 1 a poucas velocidades. Ticket de entrada mais acessível.",
  questions: [
    Q("Qual é o principal apelo de venda do mini vibrador?", ["Ser o brinquedo mais potente do mix", "Ser discreto, portátil e ter ticket acessível — porta de entrada para quem nunca teve brinquedo erótico", "Ter mais funções avançadas que qualquer outro modelo", "Vir com pênis realístico encaixável"], 1),
    Q("Para qual perfil de cliente o mini vibrador é a melhor indicação?", ["Cliente experiente que busca vibração muito forte", "Cliente iniciante, com curiosidade e orçamento limitado, que quer experimentar sem grande investimento", "Casal experiente que busca brinquedo de aplicativo", "Cliente que quer máquina de penetração mecânica"], 1),
    Q("Qual é uma limitação comum dos mini vibradores que a consultora pode mencionar com honestidade?", ["Não podem ser usados por mulheres", "Costumam ter menos níveis de intensidade e menor potência que vibradores maiores — ideais para estímulo leve/moderado", "Têm validade de 30 dias", "Não funcionam com lubrificante"], 1),
    Q("Quais formatos costumam compor a linha mini vibrador?", ["Apenas formato anatômico realista", "Formatos discretos como batom (lipstick), ovinho (bullet) e mini cilindros — fáceis de esconder e levar", "Formato exclusivo de varinha mágica grande", "Apenas formato de anel peniano"], 1),
    Q("Por que mini vibradores são bons como sugestão de upsell em vendas pequenas?", ["Porque obrigam a recompra constante de pilhas", "Pelo preço acessível, podem ser adicionados ao carrinho sem aumentar muito o ticket e ainda assim entregar experiência completa de vibração", "Porque substituem qualquer outro vibrador do mix", "Porque vêm sempre com lubrificante grátis"], 1),
  ],
};

// =============================================================
// EXPORT
// =============================================================

// Revisão por flashcard (Módulo 7) cobre apenas Cosméticos (Excitantes + Lubrificantes)
// e Vibradores. Demais produtos foram retirados da fila de revisão por decisão de
// produto — eles seguem sendo estudados/avaliados na trilha, mas não viram flashcard.
// As variáveis abaixo permanecem importadas para manter o banco de perguntas pronto
// caso essas categorias voltem para a revisão no futuro.
void PERFUMES;
void ADSTRINGENTE;
void ESTIMULANTES;
void RETARDANTE;
void ANESTESICOS;
void CAPAS_PENIANAS;
void PLUG_ANAL;
void ANEL_PENIANO;
void SADO;
void MASTURBADOR_MASCULINO;
void ROUPAS;
void PENIS_REALISTICO;

export const PRODUCT_REVISION_GROUPS: ProductRevisionGroup[] = [
  {
    id: "cosmeticos",
    title: "Cosméticos",
    examSubtaskId: "produtos.cosmeticos.exam",
    products: [EXCITANTES, LUBRIFICANTE],
  },
  {
    id: "vibradores",
    title: "Vibradores",
    examSubtaskId: "produtos.vibradores.exam",
    products: [VIBRADOR_RABBIT, SUGADOR_DE_CLITORIS, VIBRADOR_CALCINHA, MAQUINA_DE_SEXO, VIBRADOR_CASAL, VIBRADOR_APP, VARINHA_MAGICA, MINI_VIBRADOR],
  },
];

/** Subcategorias do Módulo 7 efetivamente cobertas pela revisão por flashcards. */
export const M7_REVIEW_ALLOWED_SUBCATEGORIES: Record<ProductRevisionGroupId, string[]> = {
  cosmeticos: ["excitantes", "lubrificante"],
  vibradores: [
    "vibrador-rabbit",
    "sugador-de-clitoris",
    "vibrador-de-calcinha",
    "maquina-de-sexo",
    "vibrador-de-casal",
    "vibrador-de-aplicativo",
    "varinha-magica",
    "mini-vibrador",
  ],
};

export function getProductRevisionGroup(
  id: ProductRevisionGroupId,
): ProductRevisionGroup | null {
  return PRODUCT_REVISION_GROUPS.find((g) => g.id === id) ?? null;
}
