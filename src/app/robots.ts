/**
 * robots.txt: o site inteiro liberado, o painel fora do índice (SEO-01).
 *
 * `Disallow: /admin` vale por prefixo, então cobre também `/admin/login` e as
 * telas internas. Não é proteção — quem protege é o `firestore.rules`; é para
 * o buscador não indexar tela de trabalho.
 */

import type { MetadataRoute } from "next";

import {
  CAMINHO_HOME,
  CAMINHO_PAINEL,
  CAMINHO_SITEMAP,
} from "@/lib/rotas";
import { urlDoSite } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: CAMINHO_HOME,
      disallow: CAMINHO_PAINEL,
    },
    sitemap: urlDoSite(CAMINHO_SITEMAP),
  };
}
