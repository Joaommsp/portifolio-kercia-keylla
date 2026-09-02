/**
 * Endereço público do site e composição de URL absoluta.
 *
 * Mora em `lib/` e não em `content/site.ts` por dois motivos: é configuração de
 * ambiente, não texto editorial (mesmo critério do AD-020), e assim este módulo
 * continua folha — `content/site.ts` importa de `lib/`, nunca o contrário.
 */

/** Endereço usado quando o ambiente não informa outro. */
export const URL_PADRAO_DO_SITE = "https://kercia-keylla.vercel.app";

/**
 * Endereço público do site.
 *
 * Variável ausente e variável em branco são o mesmo caso — sem valor útil —,
 * como em `lib/firebase/config.ts`. A distinção importa: `.env.example` traz a
 * chave vazia, e um `""` aqui faria `new URL("")` lançar no layout raiz,
 * derrubando todas as páginas por causa de uma variável opcional.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || URL_PADRAO_DO_SITE;

/**
 * URL absoluta de um caminho do site.
 *
 * O `metadata` das páginas resolve caminho relativo sozinho, contra o
 * `metadataBase` (AD-019). Sitemap e robots não: os dois são arquivos lidos por
 * robô de busca, onde o endereço precisa vir escrito por extenso.
 */
export function urlDoSite(caminho: string): string {
  return new URL(caminho, siteUrl).href;
}
