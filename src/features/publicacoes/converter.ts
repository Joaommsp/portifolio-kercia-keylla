/**
 * Conversão entre o documento do Firestore e a publicação de domínio.
 *
 * A leitura de cada campo é defensiva (ver `@/lib/documento`): a conversão
 * nunca lança, campo ausente vira o default do tipo e data ausente vira
 * `null`, jamais uma data inválida que quebraria a formatação adiante
 * (PUB-01).
 */

import type {
  Publicacao,
  PublicacaoFormulario,
} from "@/features/publicacoes/schemas";
import {
  campoBooleano,
  campoData,
  campoTexto,
  campoTextoBruto,
  campoTextoOuNulo,
} from "@/lib/documento";

/** Documento como ele é gravado no Firestore, sem as datas de controle. */
export type DocumentoPublicacao = {
  readonly titulo: string;
  readonly slug: string;
  readonly resumo: string;
  readonly corpo: string;
  readonly imagemUrl: string | null;
  readonly tag: string | null;
  readonly publicado: boolean;
};

/** Converte o documento lido do Firestore na publicação de domínio. */
export function paraPublicacao(
  id: string,
  dados: Record<string, unknown> | undefined,
): Publicacao {
  const documento = dados ?? {};

  return {
    id,
    titulo: campoTexto(documento.titulo),
    slug: campoTexto(documento.slug),
    resumo: campoTexto(documento.resumo),
    corpo: campoTextoBruto(documento.corpo),
    imagemUrl: campoTextoOuNulo(documento.imagemUrl),
    tag: campoTextoOuNulo(documento.tag),
    publicado: campoBooleano(documento.publicado),
    publicadoEm: campoData(documento.publicadoEm),
    atualizadoEm: campoData(documento.atualizadoEm),
  };
}

/**
 * Converte o formulário do painel no documento a gravar. As datas de controle
 * ficam a cargo da escrita, que usa o relógio do servidor.
 */
export function paraDocumentoDePublicacao(
  formulario: PublicacaoFormulario,
): DocumentoPublicacao {
  return {
    titulo: campoTexto(formulario.titulo),
    slug: campoTexto(formulario.slug),
    resumo: campoTexto(formulario.resumo),
    corpo: campoTextoBruto(formulario.corpo),
    imagemUrl: campoTextoOuNulo(formulario.imagemUrl),
    tag: campoTextoOuNulo(formulario.tag),
    publicado: formulario.publicado,
  };
}

/**
 * Publicação em branco, como o formulário do painel começa uma nova. É uma
 * constante estável de propósito: um objeto novo a cada render viraria
 * dependência instável no formulário.
 */
export const PUBLICACAO_EM_BRANCO: PublicacaoFormulario = {
  titulo: "",
  slug: "",
  resumo: "",
  corpo: "",
  imagemUrl: "",
  tag: "",
  publicado: false,
};

/**
 * Converte a publicação lida do Firestore nos valores do formulário: o painel
 * manipula texto vazio, nunca `null`, para o campo controlado não alternar
 * entre controlado e não controlado.
 */
export function paraFormularioDePublicacao(
  publicacao: Publicacao,
): PublicacaoFormulario {
  return {
    titulo: publicacao.titulo,
    slug: publicacao.slug,
    resumo: publicacao.resumo,
    corpo: publicacao.corpo,
    imagemUrl: publicacao.imagemUrl ?? "",
    tag: publicacao.tag ?? "",
    publicado: publicacao.publicado,
  };
}

/**
 * Monta a publicação que a prévia do painel renderiza, a partir do que está no
 * formulário. Caminho inverso de `paraFormularioDePublicacao`.
 *
 * Existe para a prévia usar o MESMO componente da página pública: sem isto ela
 * seria uma segunda versão do artigo, e divergiria dele no primeiro ajuste —
 * deixando de servir para conferir como o texto vai sair.
 *
 * O `id` é de mentira porque nada o lê na apresentação, e a data pode ser nula:
 * rascunho ainda não tem data, e o artigo já sabe omiti-la.
 */
export function paraPublicacaoDePrevia(
  formulario: PublicacaoFormulario,
  publicadoEm: Date | null,
): Publicacao {
  return {
    id: "previa",
    titulo: formulario.titulo,
    slug: formulario.slug,
    resumo: formulario.resumo,
    corpo: formulario.corpo,
    imagemUrl: formulario.imagemUrl === "" ? null : formulario.imagemUrl,
    tag: formulario.tag === "" ? null : formulario.tag,
    publicado: formulario.publicado,
    publicadoEm,
    atualizadoEm: null,
  };
}

/**
 * Ordena as publicações como o painel as lista: da mais recente para a mais
 * antiga. Publicação sem data fica no fim, e não some — no painel é justamente
 * ela que precisa ser vista e corrigida.
 *
 * A regra é pura e mora aqui, e não na leitura, porque o painel não pode
 * importar de `queries.ts` (AD-002).
 */
export function ordenarPublicacoes(
  publicacoes: readonly Publicacao[],
): Publicacao[] {
  return [...publicacoes].sort((a, b) => {
    if (a.publicadoEm === null && b.publicadoEm === null) {
      return 0;
    }

    if (a.publicadoEm === null) {
      return 1;
    }

    if (b.publicadoEm === null) {
      return -1;
    }

    return b.publicadoEm.getTime() - a.publicadoEm.getTime();
  });
}
