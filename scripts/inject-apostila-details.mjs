// Injeta uma seção "Detalhes dos modelos/produtos" nas apostilas de excitantes e vibradores,
// com as informações cobradas nas perguntas de revisão.
import fs from "node:fs";
import path from "node:path";

const DIR = "src/content/produtos";

const DETAILS = {
  "apostila_excitantes.html": {
    title: "Detalhes de cada excitante",
    subtitle: "Decore qual é qual — cai na revisão",
    intro:
      "Cada excitante tem uma combinação específica de efeitos. Memorize qual produto faz cada coisa para indicar com precisão.",
    items: [
      { name: "Pico Pulse (unissex, sabor melancia)", info: "SUGA + VIBRA + PULSA + REFRESCA. É o único da casa com efeito de SUCÇÃO realista." },
      { name: "Vibration (unissex, sabor morango)", info: "VIBRA + aumenta sensibilidade + AQUECE. Estimula clitóris e glande, facilita o orgasmo." },
      { name: "Meltesão (unissex)", info: "Efeitos parecidos com o Vibration. O diferencial é o SABOR DE MEL e a fórmula SEM AÇÚCAR." },
      { name: "Clito em Gotas (feminino, extra forte, beijável)", info: "4 efeitos: SHOCK + REFRESCA + AQUECE + sensação de INCHAÇO. Usar pouca quantidade." },
      { name: "Goze (feminino)", info: "Facilita e potencializa o orgasmo, aumenta sensibilidade." },
      { name: "Xana Loka (feminino)", info: "4 efeitos ao mesmo tempo: ESQUENTA + ESFRIA + VIBRA + LUBRIFICA." },
      { name: "Super Macho (masculino)", info: "Vasodilatador — proposta de ereção mais firme e duradoura. Efeito temporário." },
      { name: "Excitante Masculino em Spray", info: "Aplicação em spray, efeito rápido para excitação e firmeza." },
      { name: "Pau de Cavalo (masculino)", info: "Vasodilatador. NUNCA prometer crescimento permanente — o efeito existe APENAS enquanto o produto está ativo." },
    ],
  },

  "apostila_vibrador-rabbit.html": {
    title: "Detalhes técnicos do Rabbit",
    subtitle: "Características que caem na revisão",
    intro:
      "O Rabbit tem características únicas que diferenciam ele dos outros vibradores. Decore cada uma para indicar com segurança.",
    items: [
      { name: "Estímulo duplo simultâneo", info: "Haste interna estimula penetração + ponto G; orelhinhas externas estimulam o clitóris ao mesmo tempo." },
      { name: "Motores independentes", info: "Modelos premium têm motores separados na haste e nas orelhinhas — permite controlar intensidade interna e externa de forma independente." },
      { name: "Pode ser usado sem penetração", info: "As orelhinhas funcionam isoladamente como estimulador clitoriano, mesmo sem inserir a haste." },
      { name: "Indicação certeira", info: "Para quem busca orgasmo combinado (vaginal + clitoriano) sem precisar coordenar dois brinquedos." },
      { name: "Higienização correta", info: "Limpar com água morna e sabão neutro (ou higienizador de brinquedos), secar bem antes de guardar. NUNCA usar álcool ou água sanitária." },
    ],
  },

  "apostila_sugador-de-clitoris.html": {
    title: "Detalhes técnicos do Sugador",
    subtitle: "Características que caem na revisão",
    intro:
      "O sugador NÃO é um vibrador comum — funciona de forma diferente. Decore o mecanismo e o posicionamento correto.",
    items: [
      { name: "Mecanismo: ondas de pressão", info: "Não vibra mecanicamente — usa ondas de pressão/sucção sobre o clitóris, SEM contato direto na pele." },
      { name: "Por que funciona tão bem", info: "O estímulo por sucção/pressão costuma ser mais eficaz que vibração para muitas mulheres — indicado para quem nunca atingiu orgasmo clitoriano facilmente." },
      { name: "Posicionamento correto", info: "Encostar o bocal sobre o clitóris SEM pressionar forte — o vácuo é o que gera a sensação. Não é para penetração." },
      { name: "Pode usar lubrificante?", info: "Sim, base d'água. Pode aumentar a sensação para quem prefere a área mais lubrificada." },
      { name: "Para quem indicar", info: "Cliente que quer estimulação clitoriana intensa, rápida e sem contato direto irritante na pele. Costuma induzir orgasmos rápidos." },
    ],
  },

  "apostila_vibrador-de-calcinha.html": {
    title: "Detalhes técnicos do Vibrador de Calcinha",
    subtitle: "Características que caem na revisão",
    intro:
      "O grande diferencial é o uso DISCRETO e a brincadeira À DISTÂNCIA. Decore as diferenças entre controle físico e por app.",
    items: [
      { name: "Proposta principal", info: "Mini vibrador discreto preso dentro da calcinha, estimulando o clitóris. Pensado para uso em público e brincadeiras à distância." },
      { name: "Controle remoto FÍSICO", info: "Alcance limitado — geralmente até 10 metros. Sem internet, conexão local." },
      { name: "Controle via APP", info: "Pode ser controlado a longas distâncias pela internet (Wi-Fi/4G). Ideal para casais que viajam." },
      { name: "Indicação ideal", info: "Casais em jantares, viagens, encontros — o parceiro controla as variações criando antecipação." },
      { name: "Cuidado a mencionar", info: "Pode fazer barulho audível em ambientes silenciosos — orientar a cliente a TESTAR em casa antes de usar em público." },
      { name: "NÃO indicar para", info: "Cliente que busca estimulação interna profunda (vaginal ou anal) — esse não é o produto certo." },
    ],
  },

  "apostila_maquina-de-sexo.html": {
    title: "Detalhes técnicos da Máquina de Sexo",
    subtitle: "Características que caem na revisão",
    intro:
      "Produto premium, ticket alto. Decore o diferencial, o perfil de cliente e a orientação de primeira vez.",
    items: [
      { name: "O que faz", info: "Realiza movimentos contínuos de penetração de forma automatizada, com velocidade E amplitude reguláveis — sem esforço físico do usuário." },
      { name: "Perfil de cliente ideal", info: "Cliente experiente em brinquedos, com orçamento maior, que busca uma experiência intensa e \"mãos livres\". NÃO é para iniciante." },
      { name: "Compatibilidade dos encaixes", info: "Verificar compatibilidade das próteses encaixáveis — cada marca tem padrão diferente. Confirmar antes de fechar a venda." },
      { name: "Primeira vez — orientação", info: "Começar com velocidade e amplitude BAIXAS, usar bastante lubrificante e aumentar gradualmente conforme o conforto." },
      { name: "Posicionamento premium", info: "Ticket alto, tecnologia envolvida e experiência diferenciada de penetração mecânica — por isso ocupa posição premium na loja." },
    ],
  },

  "apostila_vibrador-de-casal.html": {
    title: "Detalhes técnicos do Vibrador de Casal",
    subtitle: "Características que caem na revisão",
    intro:
      "Pensado para uso SIMULTÂNEO durante a penetração. Decore como ele se posiciona e por que tem controle remoto.",
    items: [
      { name: "Como funciona", info: "É inserido dentro da vagina e fica entre os dois durante a penetração: estimula ELA (clitóris + ponto G) e ELE (base do pênis) ao mesmo tempo." },
      { name: "Vantagem central", info: "Estimulação simultânea dos dois parceiros DURANTE a penetração, sem precisar pausar para usar outro brinquedo." },
      { name: "Por que tem controle remoto/app", info: "Para liberar as mãos do casal durante a relação e permitir que um parceiro controle o estímulo do outro." },
      { name: "Quando indicar", info: "Quando a cliente quer INCLUIR o brinquedo na relação com o parceiro — não para uso solo (nesse caso indicar sugador)." },
      { name: "Material padrão", info: "Silicone medicinal — flexível, hipoalergênico e fácil de higienizar." },
    ],
  },

  "apostila_vibrador-de-aplicativo.html": {
    title: "Detalhes técnicos do Vibrador de Aplicativo",
    subtitle: "Características que caem na revisão",
    intro:
      "Controle via celular é o coração do produto. Decore a diferença entre Bluetooth e internet, e os cuidados de privacidade.",
    items: [
      { name: "Diferencial central", info: "Controlado pelo celular via app — permite controle remoto, padrões personalizados de vibração e brincadeira à distância." },
      { name: "Bluetooth vs Internet", info: "Bluetooth = alcance CURTO (mesma sala). Internet (Wi-Fi/4G) = controle a longas distâncias, até cidades diferentes." },
      { name: "Perfil ideal", info: "Casais em relacionamento à DISTÂNCIA, que querem brincar juntos mesmo separados fisicamente." },
      { name: "Recursos do app", info: "Padrões customizados de vibração, sincronização com música e até com voz — experiências personalizadas." },
      { name: "Cuidado de privacidade", info: "App deve ser baixado oficialmente e conta protegida — controle à distância exige cuidado com quem tem acesso à conta." },
      { name: "O que NÃO prometer", info: "Não prometer alcance ilimitado por Bluetooth, nem garantir conexão sem internet boa dos dois lados." },
    ],
  },

  "apostila_varinha-magica.html": {
    title: "Detalhes técnicos da Varinha Mágica",
    subtitle: "Características que caem na revisão",
    intro:
      "Vibração potente é a marca registrada. Decore para quem indicar e os cuidados específicos de uso.",
    items: [
      { name: "O que define", info: "Massageador grande em forma de cetro, cabeça grande arredondada e vibração EXTREMAMENTE POTENTE. Pensada também para massagem corporal." },
      { name: "Para quem indicar", info: "Cliente que tem dificuldade de se excitar com estímulos suaves e busca vibração FORTE e ampla." },
      { name: "Cuidado com a potência", info: "Pela potência alta, uso prolongado direto no clitóris pode causar DORMÊNCIA TEMPORÁRIA — recomendar começar pela intensidade baixa." },
      { name: "Acessórios encaixáveis", info: "Existem cabeças intercambiáveis em silicone que transformam a vibração em estímulo penetrativo ou em formatos específicos." },
      { name: "Recarregável sem fio vs com fio", info: "Modelos recarregáveis são mais portáteis e flexíveis — uso na cama, no banho (à prova d'água) e em viagens." },
      { name: "Pode usar sobre a roupa", info: "Sim — uma forma de suavizar a intensidade para quem está começando." },
    ],
  },

  "apostila_mini-vibrador.html": {
    title: "Detalhes técnicos do Mini Vibrador",
    subtitle: "Características que caem na revisão",
    intro:
      "Porta de entrada da categoria. Decore o perfil ideal, os formatos e por que serve bem como upsell.",
    items: [
      { name: "Apelo de venda", info: "Discreto, portátil e ticket ACESSÍVEL — porta de entrada para quem nunca teve brinquedo erótico." },
      { name: "Perfil ideal", info: "Cliente iniciante, com curiosidade e orçamento limitado, que quer experimentar sem grande investimento." },
      { name: "Limitação honesta", info: "Costumam ter MENOS níveis de intensidade e MENOR potência que vibradores maiores — ideais para estímulo leve/moderado." },
      { name: "Formatos comuns", info: "Lipstick (batom), bullet (ovinho) e mini cilindros — fáceis de esconder e levar na bolsa." },
      { name: "Bom para upsell", info: "Pelo preço acessível, pode ser adicionado ao carrinho sem aumentar muito o ticket e ainda entrega experiência de vibração." },
      { name: "Diferença vs Varinha Mágica", info: "Mini é compacto, discreto, potência menor. Varinha é grande, com potência forte para estímulo externo intenso." },
    ],
  },
};

function buildSection(d) {
  const items = d.items
    .map(
      (i, idx) =>
        `<div class="item"><div class="num">${idx + 1}</div><p><strong>${i.name}:</strong> ${i.info}</p></div>`,
    )
    .join("");
  return `
  <section class="section">
    <div class="section-title"><div class="icon gold">📋</div><div><h2>${d.title}</h2><span>${d.subtitle}</span></div></div>
    <p class="text">${d.intro}</p>
    <div class="list">${items}</div>
  </section>

`;
}

const MARK = "<!-- DETAILS_SECTION_INJECTED -->";

for (const [file, data] of Object.entries(DETAILS)) {
  const full = path.join(DIR, file);
  let html = fs.readFileSync(full, "utf8");
  // Remove an old injected block if it exists (idempotent re-runs).
  if (html.includes(MARK)) {
    html = html.replace(
      new RegExp(`${MARK}[\\s\\S]*?<!-- END_DETAILS_SECTION -->\\s*`, "g"),
      "",
    );
  }
  const section =
    MARK + "\n" + buildSection(data) + "<!-- END_DETAILS_SECTION -->\n";
  // Insert before the "Cuidados importantes" section.
  const needle = '  <section class="section">\n    <div class="section-title"><div class="icon red">';
  if (!html.includes(needle)) {
    console.error(`No anchor in ${file}`);
    process.exit(1);
  }
  html = html.replace(needle, section + needle);
  fs.writeFileSync(full, html);
  console.log("✓", file);
}
