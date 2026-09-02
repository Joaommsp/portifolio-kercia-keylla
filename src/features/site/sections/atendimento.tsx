import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoAtendimento, secaoCompetencias } from "@/content/site";

/**
 * Fecha as competências com as mesmas etiquetas em forma escaneável e os
 * contextos de atendimento. As especialidades saem de `secaoCompetencias`, e
 * não de uma lista própria: duas cópias divergiriam no primeiro ajuste.
 */
export function Atendimento() {
  const especialidades = secaoCompetencias.grupos.flatMap((grupo) =>
    grupo.competencias.map((competencia) => competencia.titulo),
  );

  return (
    <section
      id={ancoras.atendimento}
      className="scroll-mt-cabecalho bg-olive py-14 text-on-olive duo:py-20"
    >
      <Container>
        <SectionHeading
          stacked
          onOlive
          eyebrow={secaoAtendimento.eyebrow}
          titulo={secaoAtendimento.titulo}
        />
        <p className="max-w-chamada text-on-olive/85">
          {secaoAtendimento.chamada}
        </p>

        <p className="mt-7 text-xs uppercase tracking-sobretitulo text-on-olive/70">
          {secaoAtendimento.rotulos.especialidades}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {especialidades.map((especialidade) => (
            <li
              key={especialidade}
              className="rounded-full border border-on-olive/35 px-4 py-2 text-sm"
            >
              {especialidade}
            </li>
          ))}
        </ul>

        <p className="mt-7 text-xs uppercase tracking-sobretitulo text-on-olive/70">
          {secaoAtendimento.rotulos.contextos}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {secaoAtendimento.contextos.map((contexto) => (
            <li
              key={contexto}
              className="rounded-full bg-on-olive/15 px-4 py-2 text-sm"
            >
              {contexto}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
