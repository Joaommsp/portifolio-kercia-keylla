import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { secaoSobre } from "@/content/site";

/** Bloco sobre a profissional, com assinatura e espaço da foto em contexto. */
export function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-20 bg-surface-2 py-14 duo:py-24">
      <Container>
        <div className="grid items-center gap-8 duo:grid-cols-2 duo:gap-16">
          <div>
            <SectionHeading
              stacked
              eyebrow={secaoSobre.eyebrow}
              titulo={secaoSobre.titulo}
            />

            {secaoSobre.paragrafos.map((paragrafo) => (
              <p key={paragrafo} className="mb-4 text-ink-soft">
                {paragrafo}
              </p>
            ))}

            <p className="mt-2 font-script text-3xl text-brass">
              {secaoSobre.assinatura}
            </p>
          </div>

          {/* Espaço reservado da foto em contexto até a entrega da imagem real. */}
          <div className="grid aspect-4/5 place-items-center rounded-t-full rounded-b-md border border-line bg-linear-to-br from-surface to-surface-2 text-center">
            <small className="px-8 text-xs uppercase tracking-sobretitulo text-ink-soft">
              {secaoSobre.legendaFoto}
            </small>
          </div>
        </div>
      </Container>
    </section>
  );
}
