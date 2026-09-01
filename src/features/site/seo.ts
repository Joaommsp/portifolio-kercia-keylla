/**
 * Metadados sociais e dados estruturados da home (SEO-02).
 *
 * Tudo aqui é derivado de `content/site.ts` e de `lib/url.ts`: o que o buscador
 * lê é o mesmo que o visitante vê, e trocar o nome, o papel ou o Instagram em
 * um lugar só continua trocando nos dois. A rota apenas consome — `app/` só
 * roteia (AD-002).
 */

import type { Metadata } from "next";

import { contato, linksContato, perfil } from "@/content/site";
import { juntarMeta } from "@/lib/format";
import { CAMINHO_HOME } from "@/lib/rotas";
import { urlDoSite } from "@/lib/url";

/** Como o site se apresenta ao ser compartilhado: "Nome · Papel". */
export const TITULO_DA_HOME = juntarMeta(perfil.nome, perfil.papel);

/**
 * Open Graph e Twitter da home. O caminho vai relativo: o `metadataBase` do
 * layout raiz resolve a origem (AD-019).
 */
export const metadadosDaHome: Metadata = {
  alternates: { canonical: CAMINHO_HOME },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: perfil.nome,
    title: TITULO_DA_HOME,
    description: perfil.apresentacao,
    url: CAMINHO_HOME,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_DA_HOME,
    description: perfil.apresentacao,
  },
};

/**
 * Dados estruturados da autora, em schema.org `Person`. A `url` sai absoluta
 * porque JSON-LD não tem base para resolver caminho relativo, ao contrário do
 * `metadata` do Next.
 */
export const pessoaDaAutora = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: perfil.nome,
  jobTitle: perfil.papel,
  description: perfil.apresentacao,
  url: urlDoSite(CAMINHO_HOME),
  sameAs: [linksContato.instagram],
  areaServed: contato.regiao,
} as const;

/** O JSON-LD como ele vai para dentro do `<script>` da home. */
export const jsonLdDaAutora = JSON.stringify(pessoaDaAutora);
