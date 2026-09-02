import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoPedagogia } from "@/content/site";

/**
 * Trilha das frentes de formação. O traço que liga os números existe para dizer
 * que uma frente sustenta a próxima — some abaixo de `grade`, onde os blocos
 * deixam de ficar lado a lado e ligá-los não diria nada.
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

        <ol className="mt-11 grid gap-9 cartao:grid-cols-2 grade:grid-cols-4 grade:gap-0">
          {secaoPedagogia.frentes.map((frente, indice) => (
            <li
              key={frente.titulo}
              data-revelar
              // Cada frente entra um pouco depois da anterior: a ordem é o
              // argumento da seção — uma sustenta a próxima.
              style={
                { "--atraso-da-entrada": `${indice * 110}ms` } as CSSProperties
              }
              // O traço sai de cada item, não da lista: assim ele para no
              // último número em vez de sobrar uma coluna à direita, e a `ol`
              // fica só com `li`, como o HTML exige.
              className="relative grade:pr-6 grade:not-last:after:absolute grade:not-last:after:top-[calc(var(--spacing)*4.75)] grade:not-last:after:right-0 grade:not-last:after:left-9.5 grade:not-last:after:h-px grade:not-last:after:bg-line grade:not-last:after:content-['']"
            >
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
