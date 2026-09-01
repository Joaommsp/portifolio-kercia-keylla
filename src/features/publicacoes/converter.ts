/**
 * Conversão entre o documento do Firestore e a publicação de domínio.
 *
 * O documento é dado externo: pode ter sido gravado por uma versão anterior do
 * painel e vir sem um campo. A conversão nunca lança — campo ausente vira o
 * default declarado aqui, e data ausente vira `null`, jamais uma data inválida
 * que quebraria a formatação lá na frente (PUB-01).
 */

import type {
  Publicacao,
  PublicacaoFormulario,
} from "@/features/publicacoes/schemas";

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

/** Objeto que expõe `toDate()` — é assim que o Timestamp do Firestore chega. */
type ComToDate = { toDate: () => Date };

function temToDate(valor: unknown): valor is ComToDate {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "toDate" in valor &&
    typeof (valor as ComToDate).toDate === "function"
  );
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Texto opcional: ausente e vazio são a mesma coisa — `null`. */
function textoOuNulo(valor: unknown): string | null {
  const limpo = texto(valor);
  return limpo === "" ? null : limpo;
}

function booleano(valor: unknown): boolean {
  return valor === true;
}

/**
 * Converte o valor de um campo de data. Timestamp do Firestore, `Date` e
 * ausência são tratados; qualquer outra coisa vira `null`, para a ausência de
 * data nunca ser confundida com uma data real.
 */
export function paraData(valor: unknown): Date | null {
  const data = temToDate(valor)
    ? valor.toDate()
    : valor instanceof Date
      ? valor
      : null;

  if (data === null || Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

/** Converte o documento lido do Firestore na publicação de domínio. */
export function paraPublicacao(
  id: string,
  dados: Record<string, unknown> | undefined,
): Publicacao {
  const documento = dados ?? {};

  return {
    id,
    titulo: texto(documento.titulo),
    slug: texto(documento.slug),
    resumo: texto(documento.resumo),
    corpo: typeof documento.corpo === "string" ? documento.corpo : "",
    imagemUrl: textoOuNulo(documento.imagemUrl),
    tag: textoOuNulo(documento.tag),
    publicado: booleano(documento.publicado),
    publicadoEm: paraData(documento.publicadoEm),
    atualizadoEm: paraData(documento.atualizadoEm),
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
    titulo: formulario.titulo.trim(),
    slug: formulario.slug.trim(),
    resumo: formulario.resumo.trim(),
    corpo: formulario.corpo,
    imagemUrl: textoOuNulo(formulario.imagemUrl),
    tag: textoOuNulo(formulario.tag),
    publicado: formulario.publicado,
  };
}
