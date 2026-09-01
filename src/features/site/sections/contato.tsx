import { AtSign, type LucideIcon, Mail, MapPin, Phone } from "lucide-react";

import { ActionLink } from "@/components/layout/action-link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import {
  ancoras,
  canaisContato,
  secaoContato,
  type IconeContato,
} from "@/content/site";
import { propsLinkExterno } from "@/lib/link";

const ICONES: Record<IconeContato, LucideIcon> = {
  email: Mail,
  telefone: Phone,
  instagram: AtSign,
  regiao: MapPin,
};

/** Faixa de contato: chamada, botão de WhatsApp e os canais diretos. */
export function Contato() {
  return (
    <section
      id={ancoras.contato}
      className="scroll-mt-cabecalho bg-olive py-12 text-on-olive duo:py-20"
    >
      <Container className="grid items-center gap-8 duo:grid-cols-2 duo:gap-16">
        <div>
          <SectionHeading
            stacked
            onOlive
            eyebrow={secaoContato.eyebrow}
            titulo={secaoContato.titulo}
          />

          <p className="max-w-chamada text-on-olive/85">{secaoContato.chamada}</p>

          <ActionLink
            external
            withArrow
            variant="light"
            href={secaoContato.acao.href}
            className="mt-6"
          >
            {secaoContato.acao.rotulo}
          </ActionLink>
        </div>

        {/* Sobre a faixa oliva o foco dourado padrão perde contraste. */}
        <ul className="grid gap-3.5 text-sm [&_a:focus-visible]:outline-on-olive">
          {canaisContato.map((canal) => {
            const Icone = ICONES[canal.icone];
            const conteudo = (
              <>
                <Icone aria-hidden className="size-4.5 shrink-0 opacity-80" />
                <span>{canal.rotulo}</span>
              </>
            );

            return (
              <li
                key={canal.icone}
                className="border-b border-on-olive/20 pb-3.5 last:border-b-0"
              >
                {canal.href ? (
                  <a
                    href={canal.href}
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    {...propsLinkExterno(canal.externo)}
                  >
                    {conteudo}
                  </a>
                ) : (
                  <span className="flex items-center gap-3">{conteudo}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
