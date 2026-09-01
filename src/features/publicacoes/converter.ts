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
    corpo: typeof documento.corpo === "string" ? documento.corpo : "",
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
    titulo: formulario.titulo.trim(),
    slug: formulario.slug.trim(),
    resumo: formulario.resumo.trim(),
    corpo: formulario.corpo,
    imagemUrl: campoTextoOuNulo(formulario.imagemUrl),
    tag: campoTextoOuNulo(formulario.tag),
    publicado: formulario.publicado,
  };
}
