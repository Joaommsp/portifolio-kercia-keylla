/**
 * Caminhos internos do site. O padrão da URL de uma publicação mora aqui para
 * o card, o detalhe e o sitemap não escreverem o mesmo prefixo três vezes.
 */

/** Página inicial do site. */
export const CAMINHO_HOME = "/";

/** Prefixo das rotas de publicação. */
export const PREFIXO_PUBLICACOES = "/publicacoes";

/** Caminho do detalhe de uma publicação, a partir do seu slug (PUB-02). */
export function caminhoDaPublicacao(slug: string): string {
  return `${PREFIXO_PUBLICACOES}/${slug}`;
}
