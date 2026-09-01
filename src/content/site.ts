/**
 * Conteúdo fixo do site. Nenhum texto de interface deve ser escrito dentro de
 * componentes — tudo que não vem do Firestore vive aqui.
 *
 * PENDENTE: os campos marcados com `PENDENTE` aguardam os dados reais da Keylla
 * (telefone, e-mail, cidade e o texto do "Sobre" escrito por ela).
 */

import { formatarTelefoneBR } from "@/lib/format";

export const PENDENTE = "PENDENTE" as const;

/**
 * Ids das âncoras da página única. O `id` da seção e o `href` que aponta para
 * ela saem daqui, para renomear uma seção não exigir acertar os dois lados.
 */
export const ancoras = {
  topo: "topo",
  at: "at",
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
  selo: ["Presença que", "constrói", "autonomia"],
} as const;

export const navegacao = [
  { rotulo: "O que é uma AT", href: ancora(ancoras.at) },
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
  legendaFoto: "Foto de apresentação",
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

/** Pontuação que une dois dados na mesma linha ("Instituição · 180 horas"). */
export const separadorDeMeta = " · ";

export const secaoFormacao = {
  eyebrow: "Trajetória",
  titulo: "Formação e certificações",
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

export const rodape = {
  copyright: (ano: number) => `© ${ano} ${perfil.nome} · ${perfil.papel}`,
  assinatura: "Feito com carinho pelo filho",
} as const;

/**
 * Hosts permitidos para a imagem externa das publicações. A lista mora em
 * `@/content/imagens` porque o `next.config.ts` também precisa dela e não
 * resolve o alias `@/` — aqui ela é só reexportada.
 */
export { hostsDeImagemPermitidos } from "./imagens";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://keyllamelo.com.br";
