/**
 * Contrato de uma publicação: limites de campo, validação e tipos.
 *
 * Os limites vivem aqui e em nenhum outro lugar — formulário, contador de
 * caracteres e gravação leem desta mesma fonte (ADM-04).
 */

import { z } from "zod/v4";

import { hostsDeImagemPermitidos } from "@/content/site";

/** Nome da coleção no Firestore. */
export const COLECAO_PUBLICACOES = "publicacoes";

/** Limites de tamanho de cada campo de texto, em caracteres. */
export const LIMITES_PUBLICACAO = {
  titulo: 120,
  slug: 120,
  resumo: 220,
  corpo: 20000,
  tag: 40,
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

const textoObrigatorio = (rotulo: string, limite: number) =>
  z
    .string()
    .trim()
    .min(1, { message: `Informe ${rotulo}.` })
    .max(limite, {
      message: `${rotulo[0].toUpperCase()}${rotulo.slice(1)} deve ter no máximo ${limite} caracteres.`,
    });

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
    .max(2048)
    .refine((valor) => valor === "" || ehUrlDeImagemPermitida(valor), {
      message: `A imagem precisa ser uma URL https de um destes domínios: ${hostsDeImagemPermitidos.join(", ")}.`,
    }),
  tag: z.string().trim().max(LIMITES_PUBLICACAO.tag, {
    message: `A tag deve ter no máximo ${LIMITES_PUBLICACAO.tag} caracteres.`,
  }),
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
