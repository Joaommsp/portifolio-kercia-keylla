import { Container } from "@/components/layout/container";
import { PhotoFrame } from "@/components/layout/photo-frame";
import { SectionHeading } from "@/components/layout/section-heading";
import { secaoSobre } from "@/content/site";

/** Bloco sobre a profissional, com assinatura e espaço da foto em contexto. */
export function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-cabecalho bg-surface-2 py-14 duo:py-24">
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

          <PhotoFrame
            legenda={secaoSobre.legendaFoto}
            className="bg-linear-to-br from-surface to-surface-2"
          />
        </div>
      </Container>
    </section>
  );
}
