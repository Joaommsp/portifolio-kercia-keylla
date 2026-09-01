/**
 * Metadados de uma publicação (PUB-07).
 *
 * Mora na feature pelo mesmo motivo do `PublicacaoArtigo`: transformar a
 * entidade no que o buscador e a rede social leem é domínio, não roteamento — a
 * `page.tsx` resolve `params`, leitura e desfecho, e delega esta parte
 * (AD-002). Espelha `features/site/seo.ts`, que faz o mesmo pela home.
 */

import type { Metadata } from "next";

import {
  imagemExibivel,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { caminhoDaPublicacao } from "@/lib/rotas";

/**
 * Título, descrição, canonical e Open Graph de um texto publicado.
 *
 * Os caminhos vão relativos: o `metadataBase` do layout raiz resolve a origem
 * (AD-019).
 */
export function metadadosDaPublicacao(publicacao: Publicacao): Metadata {
  const caminho = caminhoDaPublicacao(publicacao.slug);
  const imagem = imagemExibivel(publicacao.imagemUrl);

  return {
    title: publicacao.titulo,
    description: publicacao.resumo,
    alternates: { canonical: caminho },
    openGraph: {
      type: "article",
      title: publicacao.titulo,
      description: publicacao.resumo,
      url: caminho,
      publishedTime: publicacao.publicadoEm?.toISOString(),
      images: imagem === null ? undefined : [imagem],
    },
  };
}
