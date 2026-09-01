/**
 * Contrato de uma publicação: limites de campo, validação e tipos.
 *
 * Os limites vivem aqui e em nenhum outro lugar — formulário, contador de
 * caracteres e gravação leem desta mesma fonte (ADM-04).
 */

import { z } from "zod/v4";

import { hostsDeImagemPermitidos } from "@/content/imagens";
import { textoObrigatorio, textoOpcional } from "@/lib/validacao";

/** Nome da coleção no Firestore. */
export const COLECAO_PUBLICACOES = "publicacoes";

/** Quantas publicações a home exibe (PUB-01). */
export const LIMITE_PUBLICACOES_HOME = 6;

/**
 * Teto de documentos que o painel carrega de uma vez. É uma trava de tráfego,
 * não uma paginação: a base é de uma autora só. Fica ao lado do limite da home
 * para a diferença entre os dois ser visível de uma vez (AD-015).
 */
export const LIMITE_PUBLICACOES_PAINEL = 200;

/** Limites de tamanho de cada campo de texto, em caracteres. */
export const LIMITES_PUBLICACAO = {
  titulo: 120,
  slug: 120,
  resumo: 220,
  corpo: 20000,
  tag: 40,
  imagemUrl: 2048,
} as const;

/** Slug legível: minúsculas, dígitos e hífen simples entre os blocos. */
export const PADRAO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Único protocolo aceito para imagem externa. */
const PROTOCOLO_PERMITIDO = "https:";

/**
 * Uma URL de imagem só é aceita se for https e apontar para um host da
 * allowlist — imagem de terceiro arbitrário viraria proxy aberto no
 * `next/image`.
 */
export function ehUrlDeImagemPermitida(valor: string): boolean {
  let url: URL;

  try {
    url = new URL(valor);
  } catch {
    return false;
  }

  if (url.protocol !== PROTOCOLO_PERMITIDO) {
    return false;
  }

  return (hostsDeImagemPermitidos as readonly string[]).includes(url.hostname);
}

/**
 * A imagem que a publicação pode exibir: a URL gravada só passa se apontar
 * para host da allowlist. Fora dela vira `null`, e quem renderiza omite a
 * imagem em vez de deixar um buraco no layout.
 */
export function imagemExibivel(imagemUrl: string | null): string | null {
  if (imagemUrl === null || !ehUrlDeImagemPermitida(imagemUrl)) {
    return null;
  }

  return imagemUrl;
}

export const publicacaoSchema = z.object({
  titulo: textoObrigatorio("o título", LIMITES_PUBLICACAO.titulo),
  slug: textoObrigatorio("o slug", LIMITES_PUBLICACAO.slug).regex(PADRAO_SLUG, {
    message:
      "O slug aceita apenas letras minúsculas sem acento, números e hífen.",
  }),
  resumo: textoObrigatorio("o resumo", LIMITES_PUBLICACAO.resumo),
  corpo: textoObrigatorio("o corpo do texto", LIMITES_PUBLICACAO.corpo),
  imagemUrl: z
    .string()
    .trim()
    .max(LIMITES_PUBLICACAO.imagemUrl, {
      message: `O endereço da imagem deve ter no máximo ${LIMITES_PUBLICACAO.imagemUrl} caracteres.`,
    })
    .refine((valor) => valor === "" || ehUrlDeImagemPermitida(valor), {
      message: `A imagem precisa ser uma URL https de um destes domínios: ${hostsDeImagemPermitidos.join(", ")}.`,
    }),
  tag: textoOpcional("a tag", LIMITES_PUBLICACAO.tag),
  publicado: z.boolean(),
});

/** Dados como o formulário do painel os manipula: texto vazio, nunca `null`. */
export type PublicacaoFormulario = z.infer<typeof publicacaoSchema>;

/** Publicação já convertida do Firestore, como as telas públicas a consomem. */
export type Publicacao = {
  readonly id: string;
  readonly titulo: string;
  readonly slug: string;
  readonly resumo: string;
  readonly corpo: string;
  readonly imagemUrl: string | null;
  readonly tag: string | null;
  readonly publicado: boolean;
  readonly publicadoEm: Date | null;
  readonly atualizadoEm: Date | null;
};
