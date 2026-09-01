/**
 * Conteúdo fixo do site. Nenhum texto de interface deve ser escrito dentro de
 * componentes — tudo que não vem do Firestore vive aqui.
 *
 * PENDENTE: os campos marcados com `PENDENTE` aguardam os dados reais da Keylla
 * (telefone, e-mail, cidade e o texto do "Sobre" escrito por ela).
 */

export const PENDENTE = "PENDENTE" as const;

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
  { rotulo: "O que é uma AT", href: "#at" },
  { rotulo: "Sobre", href: "#sobre" },
  { rotulo: "Formação", href: "#formacao" },
  { rotulo: "Publicações", href: "#publicacoes" },
  { rotulo: "Contato", href: "#contato" },
] as const;

export const acoesHero = {
  primaria: { rotulo: "Conversar comigo", href: "#contato" },
  secundaria: { rotulo: "Entenda o trabalho de uma AT", href: "#at" },
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

export const secaoFormacao = {
  eyebrow: "Trajetória",
  titulo: "Formação e certificações",
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

export const secaoContato = {
  eyebrow: "Vamos conversar",
  titulo: "Precisa de uma AT para o seu filho?",
  chamada:
    "Me conte a rotina, a idade e o que a equipe já vem trabalhando. Respondo pessoalmente.",
  acao: "Chamar no WhatsApp",
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

export const rodape = {
  descricao: `${perfil.nome} · ${perfil.papel}`,
} as const;

/** Hosts permitidos para a imagem externa das publicações. */
export const hostsDeImagemPermitidos = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "firebasestorage.googleapis.com",
  "lh3.googleusercontent.com",
] as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://keyllamelo.com.br";
