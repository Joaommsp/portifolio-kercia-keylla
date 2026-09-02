/**
 * Conteúdo fixo do site. Nenhum texto de interface deve ser escrito dentro de
 * componentes — tudo que não vem do Firestore vive aqui.
 *
 * PENDENTE: os campos marcados com `PENDENTE` aguardam os dados reais da Keylla
 * (telefone, e-mail, cidade e o texto do "Sobre" escrito por ela).
 */

import { formatarTelefoneBR, juntarMeta } from "@/lib/format";
import {
  CAMINHO_HOME,
  CAMINHO_PAINEL,
} from "@/lib/rotas";

export const PENDENTE = "PENDENTE" as const;

/**
 * Ids das âncoras da página única. O `id` da seção e o `href` que aponta para
 * ela saem daqui, para renomear uma seção não exigir acertar os dois lados.
 */
export const ancoras = {
  topo: "topo",
  at: "at",
  pedagogia: "pedagogia",
  competencias: "competencias",
  atendimento: "atendimento",
  sobre: "sobre",
  formacao: "formacao",
  publicacoes: "publicacoes",
  contato: "contato",
} as const;

const ancora = (id: string) => `#${id}`;

export const perfil = {
  nome: "Keylla Melo",
  nomeEmLinhas: ["Keylla", "Melo"],
  papel: "Assistente Terapêutica",
  saudacao: "Olá, eu sou a",
  apresentacao:
    "Acompanho crianças e adolescentes na escola e no dia a dia, criando vínculo, mediando atividades e sustentando a autonomia de cada um — sempre junto da família e da equipe terapêutica.",
  /** Frase da placa ancorada à esquerda do retrato. */
  selo: "Presença que constrói autonomia",
} as const;

/**
 * Como o site se apresenta a buscador e a rede social. Mora aqui como todo
 * texto fixo (AD-004): o `<title>` do layout raiz, o Open Graph da home e o
 * `Person` do JSON-LD leem daqui, e não de literal espalhado.
 */
export const metadadosDoSite = {
  titulo: juntarMeta(perfil.nome, perfil.papel),
  /** `%s` é o título da página; o Next completa o resto. */
  gabaritoDeTitulo: `%s · ${perfil.nome}`,
  descricao:
    "Assistente Terapêutica: acompanhamento de crianças e adolescentes na escola e na rotina, com vínculo, mediação e incentivo à autonomia.",
} as const;

export const navegacao = [
  { rotulo: "O que é uma AT", href: ancora(ancoras.at) },
  { rotulo: "Pedagogia", href: ancora(ancoras.pedagogia) },
  { rotulo: "Sobre", href: ancora(ancoras.sobre) },
  { rotulo: "Formação", href: ancora(ancoras.formacao) },
  { rotulo: "Publicações", href: ancora(ancoras.publicacoes) },
  { rotulo: "Contato", href: ancora(ancoras.contato) },
] as const;

export const cabecalho = {
  marca: "K",
  rotuloNavegacao: "Seções do site",
  acao: { rotulo: "Fale comigo", href: ancora(ancoras.contato) },
} as const;

export const secaoHero = {
  /**
   * Retrato de abertura. O arquivo em `public/` já vem recortado em 4:5, a
   * mesma proporção da moldura — assim o arco corta só o entorno, nunca o rosto.
   */
  foto: {
    src: "/keylla-melo.jpg",
    alt: `${perfil.nome}, ${perfil.papel}`,
  },
  acoes: {
    primaria: { rotulo: "Conversar comigo", href: ancora(ancoras.contato) },
    secundaria: {
      rotulo: "Entenda o trabalho de uma AT",
      href: ancora(ancoras.at),
    },
  },
} as const;

export type IconePilar =
  | "acolhimento"
  | "observacao"
  | "mediacao"
  | "autonomia"
  | "inclusao"
  | "familia";

export type Pilar = {
  readonly icone: IconePilar;
  readonly titulo: string;
  readonly descricao: string;
};

export const secaoAt = {
  eyebrow: "Você sabe",
  titulo: "O que faz uma AT?",
  chamada:
    "A Assistente Terapêutica atua onde a terapia acontece de verdade: na sala de aula, no parque, na rotina de casa.",
  pilares: [
    {
      icone: "acolhimento",
      titulo: "Acolhimento e vínculo",
      descricao:
        "Antes de qualquer meta, uma relação de confiança. É o vínculo que abre espaço para tudo o que vem depois.",
    },
    {
      icone: "observacao",
      titulo: "Observação e registro",
      descricao:
        "Registro diário do que avança e do que trava, para a equipe terapêutica decidir com dados, não com impressão.",
    },
    {
      icone: "mediacao",
      titulo: "Mediação de atividades",
      descricao:
        "Adapto a proposta ao tempo e ao interesse da criança, para que ela participe de verdade — e não apenas assista.",
    },
    {
      icone: "autonomia",
      titulo: "Incentivo à autonomia",
      descricao:
        "Ajudo o suficiente para que dê certo e recuo o quanto der, até a criança fazer sozinha.",
    },
    {
      icone: "inclusao",
      titulo: "Adaptação e inclusão",
      descricao:
        "Materiais, rotina e ambiente ajustados junto da escola, para que a inclusão seja prática e não só o nome no papel.",
    },
    {
      icone: "familia",
      titulo: "Parceria com a família",
      descricao:
        "Orientação e devolutiva constantes, para que a rotina de casa siga a mesma direção do trabalho terapêutico.",
    },
  ] satisfies readonly Pilar[],
} as const;

export type FrenteDeFormacao = {
  readonly titulo: string;
  readonly descricao: string;
};

/**
 * As quatro frentes que sustentam o atendimento. A ORDEM é o argumento da
 * seção — a formação em educação vem antes do acompanhamento, não depois — e
 * por isso vive aqui; o número exibido é derivado dela na apresentação.
 */
export const secaoPedagogia = {
  eyebrow: "Formação que sustenta a prática",
  titulo: "Pedagogia",
  chamada:
    "Quatro frentes que se somam no mesmo atendimento — cada uma responde por uma parte do que a criança precisa.",
  frentes: [
    {
      titulo: "Pedagogia escolar",
      descricao:
        "A base de tudo: como a criança aprende, o que a trava e como o professor pode ser aliado. É daqui que vem a leitura de sala de aula que um acompanhamento sem formação em educação não alcança.",
    },
    {
      titulo: "Pedagogia hospitalar",
      descricao:
        "Acompanhamento de crianças em tratamento e internação, para que o afastamento da escola não vire perda de vínculo nem de aprendizagem.",
    },
    {
      titulo: "Educação e inclusão",
      descricao:
        "Adaptação de material, rotina e avaliação junto da escola — a parte que transforma a matrícula em participação real.",
    },
    {
      titulo: "Acompanhamento terapêutico",
      descricao:
        "O trabalho de AT no dia a dia, sustentado pelas três frentes acima e conduzido junto da família e da equipe terapêutica.",
    },
  ] satisfies readonly FrenteDeFormacao[],
} as const;

export type Competencia = {
  readonly titulo: string;
  readonly descricao: string;
};

export type FamiliaDeCompetencia = {
  readonly familia: string;
  readonly competencias: readonly Competencia[];
};

/**
 * Competências do currículo, agrupadas pelo que resolvem — não pela ordem em
 * que aparecem no diploma. Ficaram de fora "metodologia de pesquisa" e
 * "redação e produção textual": são acadêmicas e não respondem nada a quem
 * procura acompanhamento para o filho.
 */
export const secaoCompetencias = {
  eyebrow: "Áreas de atuação",
  titulo: "Competências",
  grupos: [
    {
      familia: "Inclusão",
      competencias: [
        {
          titulo: "Educação inclusiva",
          descricao:
            "Adaptar material, rotina e avaliação para a criança participar de verdade.",
        },
        {
          titulo: "Educação especial",
          descricao:
            "Atendimento individualizado a quem precisa de suporte contínuo.",
        },
        {
          titulo: "Autismo e práticas inclusivas",
          descricao:
            "Formação específica em TEA, com foco no que funciona em sala.",
        },
      ],
    },
    {
      familia: "Comunicação",
      competencias: [
        {
          titulo: "Comunicação Alternativa (CAA)",
          descricao:
            "Pranchas, símbolos e recursos para quem não se comunica pela fala.",
        },
        {
          titulo: "Libras — básico",
          descricao: "Comunicação com a criança surda e ponte com a família.",
        },
      ],
    },
    {
      familia: "Aprendizagem",
      competencias: [
        {
          titulo: "Dificuldades de aprendizagem",
          descricao: "Identificar o que trava e desenhar o caminho possível.",
        },
        {
          titulo: "Psicopedagogia",
          descricao: "Leitura do processo de aprender, para além do conteúdo.",
        },
        {
          titulo: "Psicomotricidade",
          descricao:
            "Corpo e movimento como base do aprender — 240 horas de formação.",
        },
      ],
    },
    {
      familia: "Contextos",
      competencias: [
        {
          titulo: "Pedagogia hospitalar",
          descricao: "Continuidade escolar durante tratamento e internação.",
        },
        {
          titulo: "Acompanhamento terapêutico",
          descricao: "A prática no dia a dia, junto da família e da equipe.",
        },
      ],
    },
  ] satisfies readonly FamiliaDeCompetencia[],
} as const;

/**
 * Faixa que fecha as competências: as mesmas etiquetas, agora escaneáveis, mais
 * os contextos em que o atendimento acontece — a pergunta que a família faz
 * antes de qualquer outra ("ela vai até a escola?").
 */
export const secaoAtendimento = {
  eyebrow: "Atendimento",
  titulo: "Especialidades e onde atendo",
  chamada: "O acompanhamento vai até a criança — não o contrário.",
  rotulos: {
    especialidades: "Especialidades",
    contextos: "Onde o acompanhamento acontece",
  },
  contextos: [
    "Na escola, junto do professor",
    "Em casa, na rotina da família",
    "Em ambiente hospitalar, durante o tratamento",
    "Em clínica, junto da equipe terapêutica",
    "Paulo Afonso e região",
  ],
} as const;

export const secaoSobre = {
  eyebrow: "Sobre mim",
  titulo: "Educação como ponto de partida",
  paragrafos: [
    "Sou pedagoga e trabalho para o desenvolvimento integral de cada aluno, com práticas inclusivas, acolhedoras e individualizadas — atenção especial à educação especial, às dificuldades de aprendizagem e ao acompanhamento educacional.",
    "Minha formação é multidisciplinar: pedagogia, educação inclusiva, psicopedagogia, psicomotricidade e pedagogia hospitalar. É o que me permite ler cada criança por mais de um ângulo antes de decidir por onde começar.",
    "Trabalho lado a lado com psicólogos, terapeutas ocupacionais, fonoaudiólogos e professores — o plano é da equipe, e o meu papel é fazê-lo acontecer no cotidiano.",
  ],
  assinatura: "Keylla Melo",
  legendaFoto: "Foto em contexto",
} as const;

export type ItemDeFormacao = {
  readonly titulo: string;
  readonly instituicao: string;
  /** Carga horária, modalidade ou período. Omitir quando não houver. */
  readonly detalhe?: string;
  /** Ano de conclusão. Ausente quando o currículo não registra a data. */
  readonly ano?: number;
};

/**
 * Formação da Keylla, transcrita do currículo. É conteúdo fixo: muda de tempos
 * em tempos e não vale a superfície de um CRUD.
 *
 * Onde o currículo não traz a data, o `ano` fica de fora — a linha aparece sem
 * ano, em vez de com uma data inventada.
 */
export const secaoFormacao = {
  eyebrow: "Trajetória",
  titulo: "Formação",
  grupos: [
    {
      titulo: "Formação acadêmica",
      itens: [
        {
          titulo: "Pós-graduação em Pedagogia Hospitalar",
          instituicao: "Faculdade Venda Nova do Imigrante — FAVENI",
          detalhe: "720 horas",
        },
        {
          titulo: "Licenciatura em Pedagogia",
          instituicao: "Centro Universitário Leonardo da Vinci — UNIASSELVI",
          detalhe: "Semipresencial · 2018–2022",
          ano: 2022,
        },
        {
          titulo: "Formação de Missionários Transculturais",
          instituicao: "Instituto Missionário Shekinah",
          detalhe: "Presencial · 2001–2002",
          ano: 2002,
        },
        {
          titulo: "Curso Sócio-Cultural e Linguístico",
          instituicao: "Instituto Linguístico Ebenézer",
          detalhe: "Presencial · 2º semestre",
          ano: 2002,
        },
        {
          titulo: "Curso Médio em Teologia",
          instituicao: "Instituto Bíblico e Missionário Macedônia",
          detalhe: "Presencial · 1998–2000",
          ano: 2000,
        },
      ],
    },
    {
      titulo: "Aperfeiçoamento e capacitação",
      itens: [
        {
          titulo: "Psicomotricidade e Aprendizagem",
          instituicao: "FAVENI",
          detalhe: "240 horas",
        },
        {
          titulo: "Formação de Assistentes Terapêuticos",
          instituicao: "Edu Ciranda",
          detalhe: "120 horas",
        },
        {
          titulo: "Educação Escolar e Inclusão Escolar",
          instituicao: "FAVENI",
          detalhe: "80 horas",
        },
        {
          titulo: "Práticas Inclusivas para Formação de Professores",
          instituicao: "UNIASSELVI",
          detalhe: "40 horas",
        },
        {
          titulo: "Dificuldade de Aprendizagem",
          instituicao: "UEMA — Cursos Abertos",
          detalhe: "45 horas",
        },
        {
          titulo: "Psicopedagogia",
          instituicao: "Centro Educacional Sete de Setembro",
          detalhe: "40 horas",
        },
        {
          titulo: "Nivelamento em Libras I e II",
          instituicao: "UNIASSELVI",
          detalhe: "40 horas cada",
        },
        {
          titulo: "Comunicação Alternativa na Escola",
          instituicao: "CAA — Comunicação Alternativa",
          detalhe: "4 horas",
          ano: 2026,
        },
        {
          titulo: "Seminário Nacional de Autismo",
          instituicao: "UNIASSELVI",
          detalhe: "3 horas",
        },
        {
          titulo: "Metodologia de Pesquisa",
          instituicao: "UNIASSELVI",
          detalhe: "40 horas",
        },
        {
          titulo: "Redação",
          instituicao: "UNIASSELVI",
          detalhe: "40 horas",
        },
      ],
    },
  ],
} as const;

export const secaoPublicacoes = {
  eyebrow: "Conteúdo",
  titulo: "Publicações",
  vazio: "Nenhuma publicação por aqui ainda.",
  voltar: "Voltar para a página inicial",
} as const;

export const contato = {
  whatsapp: {
    /** (75) 99177-7430, no formato que o wa.me exige: DDI + DDD + número. */
    numero: "5575991777430",
    mensagem: "Olá, Keylla! Vim pelo seu site e gostaria de conversar.",
  },
  email: "kerciamelo77@gmail.com",
  instagram: "keylla_melo",
  regiao: "Paulo Afonso e região — BA",
} as const;

export const linksContato = {
  whatsapp: `https://wa.me/${contato.whatsapp.numero}?text=${encodeURIComponent(
    contato.whatsapp.mensagem,
  )}`,
  email: `mailto:${contato.email}`,
  instagram: `https://instagram.com/${contato.instagram}`,
} as const;

export const secaoContato = {
  eyebrow: "Vamos conversar",
  titulo: "Precisa de uma AT para o seu filho?",
  chamada:
    "Me conte a rotina, a idade e o que a equipe já vem trabalhando. Respondo pessoalmente.",
  acao: { rotulo: "Chamar no WhatsApp", href: linksContato.whatsapp },
} as const;

export type IconeContato = "email" | "telefone" | "instagram" | "regiao";

export type CanalContato = {
  readonly icone: IconeContato;
  readonly rotulo: string;
  readonly href: string | null;
  readonly externo: boolean;
};

export const canaisContato = [
  {
    icone: "email",
    rotulo: contato.email,
    href: linksContato.email,
    externo: false,
  },
  {
    icone: "telefone",
    rotulo: formatarTelefoneBR(contato.whatsapp.numero),
    href: linksContato.whatsapp,
    externo: true,
  },
  {
    icone: "instagram",
    rotulo: `@${contato.instagram}`,
    href: linksContato.instagram,
    externo: true,
  },
  {
    icone: "regiao",
    rotulo: contato.regiao,
    href: null,
    externo: false,
  },
] satisfies readonly CanalContato[];

/**
 * Página 404. O rótulo do caminho de volta é o mesmo do detalhe de uma
 * publicação: quem cai aqui costuma vir justamente de um link de texto que
 * saiu do ar.
 */
export const paginaNaoEncontrada = {
  codigo: "404",
  titulo: "Esta página não existe",
  mensagem:
    "O endereço pode ter mudado, ou o texto que estava aqui pode ter saído do ar.",
  acao: { rotulo: secaoPublicacoes.voltar, href: CAMINHO_HOME },
} as const;

export const rodape = {
  copyright: (ano: number) =>
    juntarMeta(`© ${ano} ${perfil.nome}`, perfil.papel),
  assinatura: "Feito com carinho pelo filho",
} as const;

/**
 * Textos do painel da autora. Ficam aqui pelo mesmo motivo dos textos do site:
 * nenhuma string de interface é escrita dentro de componente.
 */
export const painel = {
  marca: "Painel",
  verificandoSessao: "Verificando sua sessão…",
  redirecionando: "Levando você para o lugar certo…",
  navegacao: [{ rotulo: "Publicações", href: CAMINHO_PAINEL }],
  rotuloNavegacao: "Seções do painel",
  sair: { rotulo: "Sair", emAndamento: "Saindo…" },
  verSite: "Ver o site",
  listaDePublicacoes: {
    titulo: "Publicações",
    carregando: "Carregando as publicações…",
    vazio: "Nenhuma publicação criada ainda.",
    colunas: {
      titulo: "Título",
      estado: "Estado",
      data: "Publicado em",
      acoes: "Ações",
    },
    estados: { publicado: "No ar", rascunho: "Rascunho" },
    semData: "Sem data",
    acoes: {
      criar: "Nova publicação",
      editar: "Editar",
      publicar: "Publicar",
      despublicar: "Tirar do ar",
      excluir: "Excluir",
      emAndamento: "Aguarde…",
    },
    exclusao: {
      titulo: "Excluir esta publicação?",
      mensagem: (titulo: string) =>
        `“${titulo}” será apagada em definitivo, e não dá para desfazer.`,
      confirmar: "Excluir em definitivo",
      cancelar: "Manter a publicação",
    },
  },
  publicacao: {
    novo: "Nova publicação",
    edicao: "Editar publicação",
    carregando: "Carregando a publicação…",
    naoEncontrada:
      "Publicação não encontrada. Ela pode ter sido excluída em outra aba.",
    campos: {
      titulo: "Título",
      slug: "Endereço do texto",
      resumo: "Resumo",
      corpo: "Texto",
      imagemUrl: "Endereço da imagem",
      tag: "Tag",
    },
    ajuda: {
      slug: "É o fim do link do texto. Sugerido pelo título; dá para mudar.",
      imagemUrl: "Opcional. Cole o endereço de uma imagem já publicada na internet.",
    },
    acoes: {
      publicar: "Publicar",
      rascunho: "Salvar rascunho",
      emAndamento: "Salvando…",
      voltar: "Voltar para a lista",
    },
  },
  login: {
    titulo: "Entrar no painel",
    chamada: "Use o e-mail e a senha cadastrados no Firebase.",
    email: { rotulo: "E-mail", obrigatorio: "Informe o e-mail." },
    senha: { rotulo: "Senha", obrigatorio: "Informe a senha." },
    acao: { rotulo: "Entrar", emAndamento: "Entrando…" },
  },
} as const;
