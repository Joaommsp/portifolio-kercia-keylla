/**
 * Home do site.
 *
 * As duas leituras rodam aqui, no servidor, e descem por prop para as seções
 * (AD-002). Nenhuma delas lança: `listarPublicadas` e `listarFormacoes`
 * devolvem `{ erro }` quando o Firestore falha, então a falha de uma consulta
 * degrada a própria seção e o resto da página continua de pé (PUB-05, FOR-03).
 *
 * Os metadados sociais e o JSON-LD da autora vêm prontos de `features/site/seo`
 * (SEO-02); aqui eles só são declarados e impressos.
 */

import { FormacoesSection } from "@/features/formacoes/components/formacoes-section";
import { listarFormacoes } from "@/features/formacoes/queries";
import { PublicacoesSection } from "@/features/publicacoes/components/publicacoes-section";
import { listarPublicadas } from "@/features/publicacoes/queries";
import { Contato } from "@/features/site/sections/contato";
import { Hero } from "@/features/site/sections/hero";
import { OQueFazUmaAt } from "@/features/site/sections/o-que-faz-uma-at";
import { Pedagogia } from "@/features/site/sections/pedagogia";
import { Sobre } from "@/features/site/sections/sobre";
import { jsonLdDaAutora, metadadosDaHome } from "@/features/site/seo";

/** Segundos entre revalidações do conteúdo vindo do Firestore. */
export const revalidate = 300;

export const metadata = metadadosDaHome;

export default async function Home() {
  const [publicacoes, formacoes] = await Promise.all([
    listarPublicadas(),
    listarFormacoes(),
  ]);

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
      <Sobre />
      <FormacoesSection resultado={formacoes} />
      <PublicacoesSection resultado={publicacoes} />
      <Contato />
    </>
  );
}
