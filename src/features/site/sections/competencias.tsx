import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoCompetencias } from "@/content/site";

/**
 * Competências agrupadas pelo que resolvem. Cada uma vem com a linha que
 * explica o problema que ela responde — "Comunicação Alternativa (CAA)"
 * sozinho não diz nada para a família que chega aqui.
 */
export function Competencias() {
  return (
    <section
      id={ancoras.competencias}
      className="scroll-mt-cabecalho py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          stacked
          eyebrow={secaoCompetencias.eyebrow}
          titulo={secaoCompetencias.titulo}
        />

        <div className="mt-10 grid gap-9 cartao:grid-cols-2 grade:grid-cols-4">
          {secaoCompetencias.grupos.map((grupo) => (
            <article key={grupo.familia} className="entra-ao-rolar">
              <h3 className="border-b border-line pb-2.5 text-xs font-semibold uppercase tracking-rotulo text-brass">
                {grupo.familia}
              </h3>
              <ul className="mt-3.5 grid gap-3.5">
                {grupo.competencias.map((competencia) => (
                  <li key={competencia.titulo}>
                    <b className="block font-display text-lg font-normal leading-snug text-olive">
                      {competencia.titulo}
                    </b>
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {competencia.descricao}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
