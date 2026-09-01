import {
  Blocks,
  ClipboardList,
  Heart,
  type LucideIcon,
  Target,
  Users,
  Workflow,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, secaoAt, type IconePilar } from "@/content/site";

const ICONES: Record<IconePilar, LucideIcon> = {
  acolhimento: Heart,
  observacao: ClipboardList,
  mediacao: Workflow,
  autonomia: Target,
  inclusao: Blocks,
  familia: Users,
};

/** Grade dos pilares do trabalho da AT, lida do conteúdo fixo do site. */
export function OQueFazUmaAt() {
  return (
    <section id={ancoras.at} className="scroll-mt-cabecalho py-14 duo:py-24">
      <Container>
        <SectionHeading eyebrow={secaoAt.eyebrow} titulo={secaoAt.titulo}>
          <p className="max-w-nota text-sm text-ink-soft">{secaoAt.chamada}</p>
        </SectionHeading>

        <div className="grid gap-px border border-line bg-line cartao:grid-cols-2 grade:grid-cols-3">
          {secaoAt.pilares.map((pilar) => {
            const Icone = ICONES[pilar.icone];
            return (
              <article
                key={pilar.titulo}
                className="flex min-h-48 flex-col gap-2.5 bg-surface px-6 py-7 transition-colors hover:bg-surface-2"
              >
                <Icone aria-hidden className="size-9 text-brass" strokeWidth={1.2} />
                <h3 className="font-display text-lg text-ink">{pilar.titulo}</h3>
                <p className="text-sm text-ink-soft">{pilar.descricao}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
