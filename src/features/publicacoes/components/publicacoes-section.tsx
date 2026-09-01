/**
 * Seção de publicações da home.
 *
 * Recebe o resultado da leitura por prop — quem busca é a `page.tsx` (AD-002) —
 * e resolve os três estados possíveis: lista, vazio e erro. O título da seção
 * aparece nos três, porque a âncora `#publicacoes` do menu precisa existir
 * mesmo quando não há texto publicado (PUB-01, PUB-03, PUB-05).
 */

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { SectionMessage } from "@/components/layout/section-message";
import { ancoras, secaoPublicacoes } from "@/content/site";
import { PublicacaoCard } from "@/features/publicacoes/components/publicacao-card";
import {
  LIMITE_PUBLICACOES_HOME,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import type { Resultado } from "@/lib/resultado";

function Conteudo({ resultado }: { resultado: Resultado<Publicacao[]> }) {
  if ("erro" in resultado) {
    return <SectionMessage tom="erro">{resultado.erro}</SectionMessage>;
  }

  if (resultado.dados.length === 0) {
    return <SectionMessage>{secaoPublicacoes.vazio}</SectionMessage>;
  }

  return (
    <div className="grid gap-5.5 grade:grid-cols-3">
      {resultado.dados.slice(0, LIMITE_PUBLICACOES_HOME).map((publicacao) => (
        <PublicacaoCard key={publicacao.id} publicacao={publicacao} />
      ))}
    </div>
  );
}

export function PublicacoesSection({
  resultado,
}: {
  resultado: Resultado<Publicacao[]>;
}) {
  return (
    <section
      id={ancoras.publicacoes}
      className="scroll-mt-cabecalho bg-surface-2 py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          eyebrow={secaoPublicacoes.eyebrow}
          titulo={secaoPublicacoes.titulo}
        />
        <Conteudo resultado={resultado} />
      </Container>
    </section>
  );
}
