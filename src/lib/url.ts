import { siteUrl } from "@/content/site";

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
