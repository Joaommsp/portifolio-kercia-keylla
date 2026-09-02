import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoPedagogia } from "@/content/site";

/**
 * Trilha das frentes de formação. A linha que liga os números existe para
 * dizer que uma frente sustenta a próxima — some abaixo de `grade`, onde os
 * blocos deixam de ficar lado a lado e a linha perderia o sentido.
 */
export function Pedagogia() {
  return (
    <section
      id={ancoras.pedagogia}
      className="scroll-mt-cabecalho bg-surface py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          stacked
          eyebrow={secaoPedagogia.eyebrow}
          titulo={secaoPedagogia.titulo}
        />
        <p className="max-w-chamada text-ink-soft">{secaoPedagogia.chamada}</p>

        <ol className="relative mt-11 grid gap-9 cartao:grid-cols-2 grade:grid-cols-4 grade:gap-0">
          <span
            aria-hidden
            className="absolute inset-x-0 top-4.5 hidden h-px bg-line grade:block"
          />
          {secaoPedagogia.frentes.map((frente, indice) => (
            <li key={frente.titulo} className="relative grade:pr-6">
              <span className="relative grid size-9.5 place-items-center rounded-full border border-brass bg-surface font-display text-sm tabular-nums text-brass">
                {String(indice + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-display text-xl tracking-titulo text-olive">
                {frente.titulo}
              </h3>
              <p className="mt-3 text-sm text-ink-soft">{frente.descricao}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
