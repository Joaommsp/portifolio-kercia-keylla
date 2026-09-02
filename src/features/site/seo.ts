/**
 * Metadados sociais e dados estruturados da home (SEO-02).
 *
 * Tudo aqui é derivado de `content/site.ts` e de `lib/url.ts`: o que o buscador
 * lê é o mesmo que o visitante vê, e trocar o nome, o papel ou o Instagram em
 * um lugar só continua trocando nos dois. A rota apenas consome — `app/` só
 * roteia (AD-002).
 */

import type { Metadata } from "next";

import {
  contato,
  linksContato,
  metadadosDoSite,
  perfil,
} from "@/content/site";
import { CAMINHO_HOME } from "@/lib/rotas";
import { urlDoSite } from "@/lib/url";

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
    title: metadadosDoSite.titulo,
    description: metadadosDoSite.descricao,
    url: CAMINHO_HOME,
  },
  twitter: {
    // `opengraph-image.tsx` do grupo `(site)` gera a imagem 1200×630; o Next a
    // injeta em ambos os cartões, então aqui o cartão pode ser o grande.
    card: "summary_large_image",
    title: metadadosDoSite.titulo,
    description: metadadosDoSite.descricao,
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
  description: metadadosDoSite.descricao,
  url: urlDoSite(CAMINHO_HOME),
  sameAs: [linksContato.instagram],
  areaServed: contato.regiao,
  email: contato.email,
  telephone: `+${contato.whatsapp.numero}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paulo Afonso",
    addressRegion: "BA",
    addressCountry: "BR",
  },
  knowsAbout: [...metadadosDoSite.palavrasChave],
} as const;

/**
 * O JSON-LD como ele vai para dentro do `<script>` da home. O `<` sai escapado
 * porque um "</script" em qualquer campo de texto fecharia a tag no meio do
 * bloco — e esses campos são editoriais, feitos para serem reescritos.
 */
export const jsonLdDaAutora = JSON.stringify(pessoaDaAutora).replaceAll(
  "<",
  "\\u003c",
);
