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
  CAMINHO_PAINEL_FORMACOES,
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
  { rotulo: "Certificações", href: ancora(ancoras.formacao) },
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

export const secaoSobre = {
  eyebrow: "Sobre mim",
  titulo: "Educação como ponto de partida",
  paragrafos: [
    // PENDENTE: substituir pelo texto escrito pela Keylla.
    "Sou educadora de formação e Assistente Terapêutica por escolha. Comecei na sala de aula e, ao acompanhar de perto alunos com deficiência e transtornos do desenvolvimento, encontrei no acompanhamento terapêutico o lugar onde consigo apoiar cada criança individualmente.",
    "Trabalho lado a lado com psicólogos, terapeutas ocupacionais, fonoaudiólogos e professores — o plano é da equipe, e o meu papel é fazê-lo acontecer no cotidiano.",
  ],
  assinatura: "Keylla Melo",
  legendaFoto: "Foto em contexto",
} as const;

/**
 * O REGISTRO da formação: instituição, ano e situação, vindos do Firestore.
 * O argumento — o que cada frente faz no atendimento — é da seção Pedagogia
 * (AD-044). Nomes de curso podem aparecer nas duas; os papéis é que não se
 * misturam.
 */
export const secaoFormacao = {
  eyebrow: "Trajetória",
  titulo: "Certificações",
  /** Acompanha o ano de uma formação ainda em curso: "2026 —". */
  sufixoEmAndamento: " —",
  rotulos: {
    concluido: "Concluído",
    em_andamento: "Em andamento",
  },
} as const;

export const secaoPublicacoes = {
  eyebrow: "Conteúdo",
  titulo: "Publicações",
  vazio: "Nenhuma publicação por aqui ainda.",
  voltar: "Voltar para a página inicial",
} as const;

/** PENDENTE: telefone, e-mail, perfil e cidade reais. */
export const contato = {
  whatsapp: {
    numero: "5500000000000",
    mensagem: "Olá, Keylla! Vim pelo seu site e gostaria de conversar.",
  },
  email: "contato@exemplo.com.br",
  instagram: "keylla_melo",
  regiao: "Cidade / atendimento a domicílio e em escolas",
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
  navegacao: [
    { rotulo: "Publicações", href: CAMINHO_PAINEL },
    { rotulo: "Formações", href: CAMINHO_PAINEL_FORMACOES },
  ],
  rotuloNavegacao: "Seções do painel",
  sair: { rotulo: "Sair", emAndamento: "Saindo…" },
  verSite: "Ver o site",
  formacoes: {
    titulo: "Formações",
    carregando: "Carregando as formações…",
    vazio: "Nenhuma formação cadastrada ainda.",
    novo: "Nova formação",
    edicao: "Editar formação",
    campos: {
      titulo: "Curso",
      instituicao: "Instituição",
      descricao: "Descrição",
      ano: "Ano",
      status: "Situação",
      ordem: "Ordem na lista",
    },
    ajuda: {
      ordem: "Quem tem o número menor aparece antes na página.",
    },
    situacoes: secaoFormacao.rotulos,
    semAno: "Sem ano",
    semOrdem: "Sem ordem",
    colunas: {
      formacao: "Formação",
      ano: "Ano",
      situacao: "Situação",
      ordem: "Ordem",
      acoes: "Ações",
    },
    acoes: {
      salvar: "Salvar formação",
      emAndamento: "Salvando…",
      cancelar: "Cancelar a edição",
      editar: "Editar",
      excluir: "Excluir",
    },
    exclusao: {
      titulo: "Excluir esta formação?",
      mensagem: (titulo: string) =>
        `“${titulo}” será apagada em definitivo, e não dá para desfazer.`,
      confirmar: "Excluir em definitivo",
      cancelar: "Manter a formação",
    },
  },
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
