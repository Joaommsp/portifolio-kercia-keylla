/**
 * Home do site.
 *
 * A leitura das publicações roda aqui, no servidor, e desce por prop para a
 * seção (AD-002). Ela não lança: `listarPublicadas` devolve `{ erro }` quando o
 * Firestore falha, então a falha degrada a própria seção e o resto da página
 * continua de pé (PUB-05). Formação é conteúdo fixo (AD-046).
 *
 * Os metadados sociais e o JSON-LD da autora vêm prontos de `features/site/seo`
 * (SEO-02); aqui eles só são declarados e impressos.
 */

import { PublicacoesSection } from "@/features/publicacoes/components/publicacoes-section";
import { listarPublicadas } from "@/features/publicacoes/queries";
import { Contato } from "@/features/site/sections/contato";
import { Hero } from "@/features/site/sections/hero";
import { OQueFazUmaAt } from "@/features/site/sections/o-que-faz-uma-at";
import { Atendimento } from "@/features/site/sections/atendimento";
import { Competencias } from "@/features/site/sections/competencias";
import { Formacao } from "@/features/site/sections/formacao";
import { Pedagogia } from "@/features/site/sections/pedagogia";
import { Sobre } from "@/features/site/sections/sobre";
import { jsonLdDaAutora, metadadosDaHome } from "@/features/site/seo";

/** Segundos entre revalidações do conteúdo vindo do Firestore. */
export const revalidate = 300;

export const metadata = metadadosDaHome;

export default async function Home() {
  const publicacoes = await listarPublicadas();

  return (
    <>
      {/* Conteúdo próprio, serializado por `JSON.stringify` — não há entrada de
          terceiro neste bloco. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdDaAutora }}
      />

      <Hero />
      <OQueFazUmaAt />
      <Pedagogia />
      <Competencias />
      <Atendimento />
      <Sobre />
      <Formacao />
      <PublicacoesSection resultado={publicacoes} />
      <Contato />
    </>
  );
}
