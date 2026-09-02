import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoExperiencia } from "@/content/site";

/**
 * Os 15 anos de sala de aula.
 *
 * A seção existe porque a página inteira falava da Assistente Terapêutica e
 * tratava a docência como detalhe — é o contrário: a prática veio antes, e é
 * ela que faz o acompanhamento ser diferente.
 */
export function Experiencia() {
  return (
    <section
      id={ancoras.experiencia}
      className="scroll-mt-cabecalho bg-surface py-14 duo:py-24"
    >
      <Container>
        <div className="grid gap-8 duo:grid-cols-[auto_1fr] duo:items-start duo:gap-16">
          <div data-revelar>
            <p className="font-display text-6xl leading-none tracking-titulo text-olive duo:text-7xl">
              {secaoExperiencia.destaque.numero}
            </p>
            <p className="mt-2 max-w-nota text-xs uppercase tracking-rotulo text-brass">
              {secaoExperiencia.destaque.rotulo}
            </p>
          </div>

          <div>
            <SectionHeading
              stacked
              eyebrow={secaoExperiencia.eyebrow}
              titulo={secaoExperiencia.titulo}
            />
            <p className="max-w-chamada text-ink-soft">
              {secaoExperiencia.chamada}
            </p>

            <dl className="mt-9 grid gap-7 cartao:grid-cols-3">
              {secaoExperiencia.frentes.map((frente) => (
                <div key={frente.titulo} data-revelar>
                  <dt className="border-b border-line pb-2.5 font-display text-lg text-olive">
                    {frente.titulo}
                  </dt>
                  <dd className="mt-3 text-sm text-ink-soft">
                    {frente.descricao}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
