import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoSobre } from "@/content/site";

/**
 * Bloco sobre a profissional. Sem foto: só existe o retrato do hero, e uma
 * moldura vazia aqui dizia menos que o texto ocupando a largura de leitura.
 */
export function Sobre() {
  return (
    <section
      id={ancoras.sobre}
      className="scroll-mt-cabecalho bg-surface-2 py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          stacked
          eyebrow={secaoSobre.eyebrow}
          titulo={secaoSobre.titulo}
        />

        <div className="max-w-leitura">
          {secaoSobre.paragrafos.map((paragrafo) => (
            <p key={paragrafo} className="mb-4 text-ink-soft">
              {paragrafo}
            </p>
          ))}

          <p className="mt-2 font-script text-3xl text-brass">
            {secaoSobre.assinatura}
          </p>
        </div>
      </Container>
    </section>
  );
}
