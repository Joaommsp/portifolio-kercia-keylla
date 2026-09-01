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

/** Raiz do painel: a listagem de publicações (ADM-01). */
export const CAMINHO_PAINEL = "/admin";

/** Tela de entrada do painel. */
export const CAMINHO_LOGIN = "/admin/login";

/** Tela de manutenção das formações. */
export const CAMINHO_PAINEL_FORMACOES = "/admin/formacoes";

/** Id que a rota de edição usa para dizer "publicação nova" (ADM-05). */
export const ID_NOVA_PUBLICACAO = "nova";

/** Caminho do formulário de uma publicação no painel. */
export function caminhoDaEdicao(id: string): string {
  return `/admin/publicacoes/${id}`;
}

/** Caminho do formulário de uma publicação ainda inexistente. */
export const CAMINHO_NOVA_PUBLICACAO = caminhoDaEdicao(ID_NOVA_PUBLICACAO);
