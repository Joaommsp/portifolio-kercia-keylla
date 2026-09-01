/**
 * Sitemap do site: a home e cada publicação no ar (SEO-01).
 *
 * A lista sai de `listarPublicadas`, a mesma leitura da home — é ela que filtra
 * `publicado == true`, então rascunho não tem como entrar aqui. O painel fica
 * de fora por não ser página pública.
 */

import type { MetadataRoute } from "next";

import { listarPublicadas } from "@/features/publicacoes/queries";
import { LIMITE_PUBLICACOES_SITEMAP } from "@/features/publicacoes/schemas";
import { CAMINHO_HOME, caminhoDaPublicacao } from "@/lib/rotas";
import { urlDoSite } from "@/lib/url";

/**
 * Segundos entre revalidações, no mesmo ritmo das páginas indexadas. O número
 * fica escrito aqui porque o Next exige literal na configuração de segmento.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resultado = await listarPublicadas(LIMITE_PUBLICACOES_SITEMAP);

  // Firestore fora do ar não pode derrubar a geração: sem a lista, o sitemap
  // sai só com a home, que é conteúdo estático (PUB-05).
  const publicacoes = "erro" in resultado ? [] : resultado.dados;

  return [
    { url: urlDoSite(CAMINHO_HOME) },
    ...publicacoes.map((publicacao) => ({
      url: urlDoSite(caminhoDaPublicacao(publicacao.slug)),
      lastModified:
        publicacao.atualizadoEm ?? publicacao.publicadoEm ?? undefined,
    })),
  ];
}
