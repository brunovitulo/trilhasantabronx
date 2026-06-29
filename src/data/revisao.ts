// Conteúdo de Revisão do Dia por módulo (tópico principal).
// 8 perguntas de revisão por módulo (banco SEPARADO do exercício de fixação).

import embalarApostila from "@/content/embalar/apostila.html?raw";
import embalarChecklist from "@/content/embalar/checklist.html?raw";
import responsabilidadeApostila from "@/content/responsabilidade/apostila.html?raw";
import responsabilidadeChecklist from "@/content/responsabilidade/checklist.html?raw";
import vendasApostila from "@/content/vendas/apostila.html?raw";
import vendasChecklist from "@/content/vendas/checklist.html?raw";
import objecoesApostila from "@/content/objecoes/apostila.html?raw";
import objecoesChecklist from "@/content/objecoes/checklist.html?raw";
import doresApostila from "@/content/dores/apostila.html?raw";
import doresChecklist from "@/content/dores/checklist.html?raw";
import organizacaoChecklist from "@/content/organizacao/checklist.html?raw";

export type RevisionQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type RevisionContent = {
  topicId: string;
  title: string;
  apostilaHtml: string;
  checklistHtml: string;
  quiz: RevisionQuestion[]; // 8 perguntas (ou vazio se ainda não cadastrado)
};

// Apresentação não tem apostila/checklist em arquivo único — usamos um resumo inline.
const APRESENTACAO_APOSTILA_HTML = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8"/>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:24px;max-width:760px;margin:0 auto;color:#18181b;line-height:1.55}
h1{font-size:22px;margin:0 0 12px}
h2{font-size:15px;margin:20px 0 8px;color:#7c3aed;text-transform:uppercase;letter-spacing:.08em}
p,li{font-size:14.5px}
ul{padding-left:18px}
.card{border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;margin-bottom:12px;background:#fafafa}
.tag{display:inline-block;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:8px}
</style></head><body>
<h1>Apresentação da Loja — Resumo de revisão</h1>

<div class="card">
<span class="tag">História</span>
<p>A Santa Bronx é uma <b>empresa de marketing cujo entregável é o produto erótico</b>, não apenas uma loja de produtos. O Bruno começou o negócio com investimento inicial baixo e construiu uma marca que se diferencia pela experiência, organização e atendimento.</p>
</div>

<div class="card">
<span class="tag">Organização da loja</span>
<ul>
<li>Cliente presencial forma a primeira impressão pela aparência da loja — ambiente desorganizado transmite descuido e afasta.</li>
<li>Padrão de organização deve ser mantido <b>diariamente</b>, antes de atender.</li>
<li>O checklist de organização está sempre disponível no ícone do topo do site.</li>
</ul>
</div>

<div class="card">
<span class="tag">Site & pedidos</span>
<ul>
<li><b>Comprar via WhatsApp</b>: inicia um atendimento humano.</li>
<li><b>Adicionar ao carrinho</b>: compra direta pelo site sem atendimento.</li>
<li>Diferenciais da Santa Bronx aparecem no carrossel do site — conhecê-los é parte do atendimento.</li>
</ul>
</div>

<div class="card">
<span class="tag">Materiais & produtos</span>
<ul>
<li><b>Cyber skin</b>: textura e consistência próximas da pele humana — experiência mais realista que o PVC comum.</li>
<li><b>Ventosa</b>: fixa o produto em superfícies (parede, chão), liberando as mãos.</li>
<li><b>Vibration</b>: provoca formigamento/vibração quando aplicado na língua.</li>
</ul>
</div>
</body></html>`;

const APRESENTACAO_CHECKLIST_HTML = organizacaoChecklist;

const Q = (
  question: string,
  options: string[],
  correctIndex: number,
): RevisionQuestion => ({ question, options, correctIndex });

const QUIZ_APRESENTACAO: RevisionQuestion[] = [
  Q(
    "Qual é a principal diferença entre a Santa Bronx e um sex shop convencional segundo a apresentação?",
    [
      "A Santa Bronx só vende online",
      "A Santa Bronx é uma empresa de marketing cujo entregável é o produto erótico, não apenas uma loja de produtos",
      "A Santa Bronx tem preços mais baixos que os concorrentes",
      "A Santa Bronx só atende por WhatsApp",
    ],
    1,
  ),
  Q(
    "Por que a organização visual da loja é tão importante para o negócio?",
    [
      "Porque facilita o trabalho de embalagem",
      "Porque o cliente presencial forma a primeira impressão da loja pela aparência — ambiente desorganizado transmite descuido e afasta",
      "Porque o sistema de pedidos exige que os produtos estejam organizados por categoria",
      "Porque produtos organizados vencem mais rápido",
    ],
    1,
  ),
  Q(
    "Qual é a diferença entre os botões \"Comprar via WhatsApp\" e \"Adicionar ao carrinho\" no site?",
    [
      "Um é para produtos físicos e outro para digitais",
      "\"Comprar via WhatsApp\" inicia um atendimento humano; \"Adicionar ao carrinho\" é uma compra direta pelo site sem atendimento",
      "\"Adicionar ao carrinho\" é mais barato para o cliente",
      "Não há diferença funcional entre os dois",
    ],
    1,
  ),
  Q(
    "O que o material de cyber skin tem de diferente em relação ao PVC comum nas próteses?",
    [
      "Cyber skin é mais barato e mais fácil de limpar",
      "Cyber skin é mais rígido e durável",
      "Cyber skin tem textura e consistência mais próxima da pele humana, tornando a experiência mais realista",
      "Cyber skin é apenas uma marca, não um material diferente",
    ],
    2,
  ),
  Q(
    "Para que serve a ventosa em alguns modelos de prótese?",
    [
      "Para regular a intensidade da vibração",
      "Para fixar o produto em superfícies como parede ou chão, liberando as mãos durante o uso",
      "Para facilitar a limpeza do produto",
      "Para ajustar o tamanho do produto",
    ],
    1,
  ),
  Q(
    "Qual sensação o Vibration provoca quando passado na língua?",
    [
      "Ardência intensa",
      "Resfriamento imediato",
      "Formigamento/vibração causado pelo componente ativo do produto",
      "Nenhuma sensação perceptível",
    ],
    2,
  ),
  Q(
    "Qual foi o investimento inicial do Bruno para começar o sex shop?",
    [
      "Menos de R$ 500",
      "Entre R$ 5.000 e R$ 10.000",
      "A resposta correta está no vídeo de história da loja — a atendente deve ter assistido e lembrar o valor mencionado",
      "Acima de R$ 50.000",
    ],
    2,
  ),
  Q(
    "Cite 2 diferenciais da Santa Bronx mencionados no carrossel do site. Qual das opções abaixo representa corretamente esses diferenciais?",
    [
      "Menor preço da cidade e entrega em 10 minutos",
      "Os diferenciais estão descritos no carrossel do site — a atendente deve conhecê-los de ter acessado o site durante o módulo",
      "Único sex shop com loja física em Araguari e catálogo de 500 produtos",
      "Atendimento 24 horas e troca garantida em qualquer produto",
    ],
    1,
  ),
];

const QUIZ_EMBALAR: RevisionQuestion[] = [
  Q(
    "Qual é o risco de usar uma embalagem maior do que o necessário para o produto?",
    [
      "O produto pode se mover dentro da embalagem e quebrar",
      "O motoboy pode suspeitar do conteúdo pelo tamanho",
      "Embalagens maiores têm custo mais alto — usar tamanho errado gera gasto desnecessário acumulado ao longo do tempo",
      "O cliente pode reclamar do excesso de embalagem",
    ],
    2,
  ),
  Q(
    "Por que o post-it deve ser grampeado na sacola além de colado?",
    [
      "Para o cliente não conseguir abrir a sacola pelo post-it",
      "Para ficar mais visível para o motoboy",
      "Porque a cola do post-it é fraca e ele pode soltar durante o transporte, causando confusão com outras sacolas",
      "É apenas um padrão estético da loja, sem necessidade funcional",
    ],
    2,
  ),
  Q(
    "O nome do cliente é inserido em maiúsculas no app 99. Em qual situação isso é especialmente útil?",
    [
      "Quando o cliente tem nome difícil de pronunciar",
      "Quando o motoboy não tem celular para ver o pedido",
      "Quando chegam vários motoboys ao mesmo tempo — o nome em maiúsculas facilita identificar rapidamente qual sacola é de qual motoboy",
      "O app 99 exige letras maiúsculas por padrão",
    ],
    2,
  ),
  Q(
    "Qual é a diferença entre a caixinha 1 e a caixinha 2 do app 99, e como cada uma deve ser configurada em Araguari?",
    [
      "Ambas devem ficar marcadas em qualquer situação",
      "Caixinha 1 (código de coleta): desmarcar em Araguari para agilizar; Caixinha 2 (código do cliente): NUNCA desmarcar — garante entrega confirmada",
      "Ambas devem ficar desmarcadas para agilizar o processo",
      "Caixinha 1 marcada, caixinha 2 desmarcada — o oposto do que parece intuitivo",
    ],
    1,
  ),
  Q(
    "O que deve ser feito se os dois pontos do mapa (Google vs localização do cliente) não baterem?",
    [
      "Ligar para o cliente e pedir que ele saia na porta para esperar",
      "Usar o endereço do Google, pois é mais confiável",
      "Dentro do app 99, arrastar o campo de endereço para baixo e usar \"marcar local no mapa\" para posicionar o ponto correto manualmente",
      "Cancelar o pedido e pedir novo endereço ao cliente",
    ],
    2,
  ),
  Q(
    "Por que nunca se deve chamar o motoboy sem antes enviar o pré-envio e receber confirmação do cliente?",
    [
      "Porque o app 99 bloqueia o pedido sem confirmação prévia",
      "Porque o cliente pode não estar no endereço — se o motoboy chegar e ninguém atender, a loja paga outra corrida",
      "Porque o cliente precisa assinar um termo antes da entrega",
      "É apenas uma formalidade, não tem impacto financeiro real",
    ],
    1,
  ),
  Q(
    "Em qual situação é correto usar motoboy particular em vez do app 99?",
    [
      "Quando o cliente mora em bairro distante",
      "Quando o pedido é urgente e o 99 está demorando",
      "Apenas quando houver pedidos acumulados para entregar de uma vez — para um pedido só, o 99 é sempre mais rápido e barato",
      "Quando o produto é grande demais para o baú de uma moto comum",
    ],
    2,
  ),
  Q(
    "Qual é o erro mais custoso que pode acontecer no processo de envio e por quê?",
    [
      "Usar embalagem do tamanho errado",
      "Esquecer de colocar o post-it",
      "Enviar produto eletrônico sem testar — se chegar com defeito, paga-se novo motoboy para buscar o produto de volta, além de gerar má experiência ao cliente",
      "Não colocar o telefone do cliente no app 99",
    ],
    2,
  ),
];

const QUIZ_RESPONSABILIDADE: RevisionQuestion[] = [
  Q(
    "Qual é a diferença entre a primeira e a segunda responsabilidade da atendente?",
    [
      "A primeira é atender clientes, a segunda é organizar o estoque",
      "A primeira é manter a loja organizada e bonita desde que entra; a segunda é tomar conta dos envios de pedidos",
      "A primeira é fazer o checklist, a segunda é fazer o exercício",
      "Não há distinção — são responsabilidades equivalentes",
    ],
    1,
  ),
  Q(
    "Por que o comprometimento é considerado o pilar mais importante acima dos outros?",
    [
      "Porque é o que o gestor mais avalia nas câmeras",
      "Porque sem comprometimento, mesmo que a atendente seja tecnicamente boa, a loja não pode contar com ela — e isso inviabiliza tudo",
      "Porque é o único pilar que não pode ser ensinado",
      "Porque clientes conseguem perceber quando a atendente não é comprometida",
    ],
    1,
  ),
  Q(
    "O que acontece operacionalmente quando um pedido atrasa por descuido da atendente?",
    [
      "O sistema cancela o pedido automaticamente",
      "O gestor assume o atendimento",
      "Gera má experiência ao cliente, aumenta o risco de ele não voltar a comprar e pode gerar custo extra com logística",
      "A atendente recebe uma advertência automática no sistema",
    ],
    2,
  ),
  Q(
    "Como a atendente deve reagir quando o gestor der um feedback sobre seu trabalho?",
    [
      "Explicar o motivo do erro antes de aceitar o feedback",
      "Concordar com tudo para não criar conflito",
      "Ouvir com atenção e tranquilidade, assimilar o que foi dito e colocar em prática — saber ouvir é um dos 3 pilares principais",
      "Anotar e verificar se o feedback faz sentido antes de aplicar",
    ],
    2,
  ),
  Q(
    "No app de pedidos, em qual coluna a atendente deve focar seu trabalho diariamente?",
    [
      "Em atendimento",
      "Enviado",
      "Pedido fechado — é onde chegam os pedidos que foram fechados e precisam ser embalados e despachados",
      "Em todas as colunas igualmente",
    ],
    2,
  ),
  Q(
    "O que o ícone de caminhão verde no app de pedidos significa e quando deve ser clicado?",
    [
      "Indica que o motoboy já está a caminho — deve ser clicado quando o 99 confirmar a rota",
      "Marca o pedido como enviado — deve ser clicado somente após o motoboy sair com o pedido de fato",
      "Abre o mapa de rastreamento do pedido",
      "Cancela o pedido caso o motoboy não apareça",
    ],
    1,
  ),
  Q(
    "Por que perguntar ao gestor antes de tomar uma decisão incerta é mais inteligente do que tentar resolver sozinha?",
    [
      "Porque o gestor precisa saber de tudo que acontece na loja",
      "Porque a atendente não tem autonomia para tomar decisões",
      "Porque erros que poderiam ser evitados com uma simples pergunta são os mais difíceis de justificar — e o custo de um erro é sempre maior que o tempo de uma pergunta",
      "Para manter o gestor informado sobre o andamento do dia",
    ],
    2,
  ),
  Q(
    "O que significa dizer que \"ser trabalhadora é algo que não dá para mudar em você\"?",
    [
      "Que a loja não oferece treinamento para quem não é dedicado",
      "Que a disposição para o trabalho é uma característica de personalidade que a pessoa já tem ou não — e o gestor vai observar isso naturalmente no dia a dia",
      "Que a atendente deve trabalhar em ritmo acelerado o tempo todo",
      "Que o gestor não vai cobrar resultados de quem não tem perfil",
    ],
    1,
  ),
];

const QUIZ_VENDAS: RevisionQuestion[] = [
  Q(
    "Por que responder em menos de 1 minuto é mais importante do que responder com uma resposta perfeita após 5 minutos?",
    [
      "Porque o sistema de atendimento penaliza respostas lentas",
      "Porque o cliente provavelmente já foi atendido por outra loja nesse intervalo — velocidade de resposta vale mais do que perfeição na resposta",
      "Porque clientes online têm tempo de atenção muito curto",
      "Porque o bot de atendimento só funciona nos primeiros 60 segundos",
    ],
    1,
  ),
  Q(
    "Como identificar na prática se você está sendo consultora ou vendedora em um atendimento?",
    [
      "Consultora usa linguagem mais formal; vendedora usa linguagem mais casual",
      "Consultora vende mais produtos por atendimento; vendedora vende menos",
      "Consultora faz perguntas para entender a necessidade antes de indicar; vendedora envia produtos sem perguntar",
      "Consultora atende presencialmente; vendedora atende online",
    ],
    2,
  ),
  Q(
    "Um cliente diz \"quero algo para melhorar minha vida sexual\". Qual é a resposta mais adequada segundo os fundamentos?",
    [
      "Enviar os 3 produtos mais vendidos da loja",
      "Perguntar se é para ele ou para o casal, qual é a principal dificuldade que quer resolver e qual faixa de preço está considerando",
      "Indicar o produto mais completo e caro disponível",
      "Pedir para ele acessar o catálogo do site e escolher o que preferir",
    ],
    1,
  ),
  Q(
    "Por que explicar o porquê de uma indicação aumenta a chance de conversão?",
    [
      "Porque o cliente se sente obrigado a comprar após ouvir uma explicação longa",
      "Porque demonstra conhecimento técnico que impressiona o cliente",
      "Porque conecta as qualidades do produto à necessidade específica do cliente, reduzindo a incerteza e aumentando a confiança na decisão",
      "Porque o cliente sempre quer entender tudo antes de comprar",
    ],
    2,
  ),
  Q(
    "Um cliente pergunta sobre plug anal e não menciona nenhuma dúvida. O que uma boa atendente faz proativamente?",
    [
      "Enviar o produto direto sem perguntas adicionais",
      "Perguntar o tamanho que o cliente prefere",
      "Já quebrar as objeções mais comuns desse produto (ex: material, como usar com segurança, importância do lubrificante) sem esperar o cliente perguntar",
      "Aguardar o cliente fazer perguntas antes de dar qualquer informação extra",
    ],
    2,
  ),
  Q(
    "O que diferencia uma objeção de uma reclamação?",
    [
      "Reclamação acontece antes da compra; objeção acontece depois",
      "Objeção é uma dúvida ou medo que impede o cliente de comprar; reclamação é uma insatisfação após a compra",
      "Objeção é sempre sobre preço; reclamação é sobre qualidade",
      "São sinônimos no contexto de vendas",
    ],
    1,
  ),
  Q(
    "Por que a simpatia é um pré-requisito e não apenas mais um fundamento?",
    [
      "Porque clientes de sex shop são especialmente sensíveis ao julgamento",
      "Porque sem simpatia os outros fundamentos não funcionam — o cliente não vai se abrir, não vai confiar e não vai comprar de quem o faz sentir desconfortável",
      "Porque a simpatia compensa a falta de conhecimento sobre os produtos",
      "Porque o gestor avalia principalmente a simpatia no atendimento",
    ],
    1,
  ),
  Q(
    "Um cliente ficou com medo após você indicar um excitante que esquenta. Como você quebraria essa objeção?",
    [
      "Dizer que o produto é seguro e aprovado pela ANVISA",
      "Sugerir um produto diferente que não esquenta",
      "Explicar que o efeito é progressivo e controlável, que a intensidade depende da quantidade aplicada e que é reversível com água — dando ao cliente controle sobre a experiência",
      "Pedir para o cliente testar uma amostra antes de comprar",
    ],
    2,
  ),
];

const QUIZ_OBJECOES: RevisionQuestion[] = [
  Q(
    "Uma cliente pergunta se a entrega é discreta. Qual resposta quebra melhor todas as objeções de uma vez?",
    [
      "\"Entregamos sim, pode ficar tranquila — nosso motoboy é de confiança.\"",
      "\"Entregamos com embalagem sem identificação, lacrada, sem mostrar o conteúdo — parece qualquer outra entrega.\"",
      "\"Entregamos normalmente, igual qualquer outro produto online.\"",
      "\"Pode vir buscar na loja se preferir — temos loja física também.\"",
    ],
    1,
  ),
  Q(
    "Por que a consultora deve antecipar objeções em vez de esperar o cliente perguntar?",
    [
      "Porque o cliente se sente mais confortável quando a atendente faz perguntas primeiro.",
      "Porque antecipar mostra domínio do produto e impressiona o cliente.",
      "Porque muitas objeções ficam apenas na cabeça do cliente e podem fazê-lo desistir silenciosamente sem dar chance de resposta.",
      "Porque o gestor exige que todas as dúvidas sejam respondidas antes de fechar a venda.",
    ],
    2,
  ),
  Q(
    "Um cliente tem medo de que o nome da loja apareça na fatura do cartão. Como responder corretamente?",
    [
      "Sugerir que o cliente use pix para evitar qualquer registro na fatura.",
      "Explicar que na fatura aparece apenas 'Santa Bronx', sem identificação do nicho.",
      "Dizer que a fatura vem em nome do banco, então não aparece nada.",
      "Oferecer parcelamento para diluir o valor e o nome aparecer menor.",
    ],
    1,
  ),
  Q(
    "Qual cuidado é obrigatório ao embalar produtos com formato evidente, como próteses?",
    [
      "Usar caixa de papelão rígida para que o formato não apareça por fora.",
      "Avisar o motoboy para manusear com cuidado e não apertar a embalagem.",
      "Envolver o produto em plástico bolha antes de lacrar, para disfarçar o formato.",
      "Colocar outros itens junto para que o formato se perca entre os demais produtos.",
    ],
    2,
  ),
  Q(
    "Um cliente tem receio de ser visto entrando na loja presencial. Qual resposta transmite mais segurança?",
    [
      "\"A loja é discreta por fora, ninguém vai perceber que é um sex shop.\"",
      "\"Pode vir em horário de menor movimento, como de manhã cedo.\"",
      "\"Pode vir tranquila. Nosso atendimento é leve, discreto e sem julgamento — e a entrada não chama atenção.\"",
      "\"Temos câmeras internas que garantem a privacidade de quem visita.\"",
    ],
    2,
  ),
  Q(
    "O que diferencia uma consultora de uma vendedora no atendimento da Santa Bronx?",
    [
      "A consultora vende produtos mais caros e tem comissão maior.",
      "A consultora faz perguntas para entender a necessidade e indica a solução certa; a vendedora empurra produto sem entender o que o cliente precisa.",
      "A consultora só atende clientes que já conhecem os produtos.",
      "A consultora foca em fechar rápido; a vendedora dedica mais tempo ao cliente.",
    ],
    1,
  ),
  Q(
    "Por que a leveza e simpatia são fundamentais especialmente no atendimento de sex shop?",
    [
      "Porque clientes desse nicho costumam ser mais exigentes e reclamam mais.",
      "Porque simpatia compensa a falta de conhecimento técnico sobre os produtos.",
      "Porque o cliente precisa sentir naturalidade e segurança para se abrir sobre necessidades íntimas — sem isso ele não fala o que realmente precisa.",
      "Porque o gestor avalia principalmente a simpatia nas gravações de atendimento.",
    ],
    2,
  ),
  Q(
    "Um cliente pergunta se a embalagem pode revelar o formato do produto por fora. O que responder?",
    [
      "\"Não garantimos em produtos maiores, mas tentamos empacotar bem.\"",
      "\"Embalamos com cuidado e usamos plástico bolha quando necessário — nenhum formato fica aparente por fora.\"",
      "\"A embalagem é opaca, então mesmo sem plástico bolha nada aparece.\"",
      "\"Orientamos o motoboy para segurar a embalagem de forma que não marque.\"",
    ],
    1,
  ),
];

const QUIZ_DORES: RevisionQuestion[] = [
  Q(
    "Um cliente relata dificuldade de ereção ocasional e quer algo pontual para usar antes da relação. Qual indicação faz mais sentido?",
    [
      "Cápsulas de libido de uso contínuo, pois têm efeito acumulativo mais eficaz.",
      "Bomba peniana, pois é a solução mais completa independente da gravidade.",
      "Sachê estimulante, pois tem proposta de efeito mais imediato e pontual.",
      "Anel peniano, pois sustenta a ereção durante toda a relação sem precisar de preparo.",
    ],
    2,
  ),
  Q(
    "Por que o spray retardante não causa perda de ereção mesmo reduzindo sensibilidade?",
    [
      "Porque é aplicado externamente e o corpo compensa com mais lubrificação natural.",
      "Porque contém vasodilatador que mantém o fluxo sanguíneo na região, compensando a redução de sensibilidade.",
      "Porque a redução de sensibilidade é tão leve que o cérebro não registra diferença.",
      "Porque age só na pele superficial e não afeta os nervos responsáveis pela ereção.",
    ],
    1,
  ),
  Q(
    "Uma cliente com ressecamento vaginal severo e recorrente busca tratamento. O que indicar e por quê?",
    [
      "Lubrificante de uso contínuo, pois é o produto mais acessível para ressecamento.",
      "Excitante vaginal, pois aumenta a sensibilidade e compensa o ressecamento.",
      "Hidratante vaginal, pois é um tratamento de uso contínuo focado em restaurar a hidratação — diferente do lubrificante que é apenas pontual.",
      "Dilatador vaginal, pois o ressecamento severo costuma vir acompanhado de tensão muscular.",
    ],
    2,
  ),
  Q(
    "Qual é a diferença prática entre lubrificante e hidratante vaginal que a consultora deve saber explicar?",
    [
      "Lubrificante é para uso anal; hidratante é exclusivo para uso vaginal.",
      "Lubrificante tem efeito imediato e pontual durante a relação; hidratante é um tratamento de uso contínuo para ressecamento crônico.",
      "Hidratante tem textura mais grossa e lubrifica melhor durante o ato do que o lubrificante comum.",
      "São o mesmo produto — a diferença é só na embalagem e no público-alvo.",
    ],
    1,
  ),
  Q(
    "Por que saliva não é suficiente como lubrificante no sexo anal?",
    [
      "Porque a saliva tem pH incompatível com o tecido anal e causa irritação.",
      "Porque a saliva contém bactérias que aumentam o risco de infecção local.",
      "Porque o ânus não tem lubrificação própria e a saliva seca rapidamente, aumentando o atrito e o risco de lesão.",
      "Porque a saliva não tem viscosidade suficiente para produtos maiores.",
    ],
    2,
  ),
  Q(
    "Um casal quer experimentar penetração anal pela primeira vez. Qual combinação de produtos é mais adequada?",
    [
      "Anestésico anal + lubrificante, pois eliminar o desconforto é o passo mais importante.",
      "Plug anal pequeno + lubrificante + anestésico anal, para dilatar gradualmente e reduzir o desconforto.",
      "Vibrador de penetração + lubrificante, pois a vibração relaxa a musculatura naturalmente.",
      "Lubrificante abundante sozinho, pois com quantidade suficiente não há necessidade de preparo adicional.",
    ],
    1,
  ),
  Q(
    "O que a consultora deve esclarecer sobre capa peniana antes de fechar a venda?",
    [
      "Que ela deve ser usada junto com lubrificante para não ressecar durante o uso.",
      "Que o efeito de aumento de volume é permanente com uso regular.",
      "Que ela não substitui camisinha e não oferece proteção contra ISTs ou gravidez.",
      "Que ela é indicada apenas para homens com disfunção erétil moderada.",
    ],
    2,
  ),
  Q(
    "Uma cliente pergunta se a bolinha explosiva pode ficar presa. Como responder com segurança e precisão?",
    [
      "Explicar que existe risco em modelos maiores, mas que o corpo elimina naturalmente em até 72h.",
      "Dizer que o produto é seguro e que qualquer dúvida ela pode consultar um ginecologista após o uso.",
      "Explicar que o corpo dissolve a bolinha naturalmente durante o uso — ela não fica presa.",
      "Garantir que a bolinha é pequena o suficiente para não oferecer nenhum risco independente do modelo.",
    ],
    2,
  ),
];

export const REVISION_CONTENT: Record<string, RevisionContent> = {
  apresentacao: {
    topicId: "apresentacao",
    title: "Apresentação da Loja",
    apostilaHtml: APRESENTACAO_APOSTILA_HTML,
    checklistHtml: APRESENTACAO_CHECKLIST_HTML,
    quiz: QUIZ_APRESENTACAO,
  },
  embalar: {
    topicId: "embalar",
    title: "Embalar e Despachar Pedidos",
    apostilaHtml: embalarApostila,
    checklistHtml: embalarChecklist,
    quiz: QUIZ_EMBALAR,
  },
  responsabilidade: {
    topicId: "responsabilidade",
    title: "Primeira Responsabilidade",
    apostilaHtml: responsabilidadeApostila,
    checklistHtml: responsabilidadeChecklist,
    quiz: QUIZ_RESPONSABILIDADE,
  },
  vendas: {
    topicId: "vendas",
    title: "Fundamentos de Vendas",
    apostilaHtml: vendasApostila,
    checklistHtml: vendasChecklist,
    quiz: QUIZ_VENDAS,
  },
  objecoes: {
    topicId: "objecoes",
    title: "Principais Objeções",
    apostilaHtml: objecoesApostila,
    checklistHtml: objecoesChecklist,
    quiz: QUIZ_OBJECOES,
  },
  dores: {
    topicId: "dores",
    title: "Principais Dores e Soluções",
    apostilaHtml: doresApostila,
    checklistHtml: doresChecklist,
    quiz: QUIZ_DORES,
  },
};

export function getRevisionContent(topicId: string): RevisionContent | null {
  return REVISION_CONTENT[topicId] ?? null;
}
