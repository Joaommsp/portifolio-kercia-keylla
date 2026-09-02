import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";

import { Container } from "@/components/layout/container";
import { type IconeDePerfil, rodape } from "@/content/site";
import { propsLinkExterno } from "@/lib/link";

/**
 * Marca é ícone de terceiro: o lucide da casa removeu os glifos de marca na
 * v1, então estes três vêm do Font Awesome — a mesma família, para o traço não
 * variar entre eles.
 */
const ICONES: Record<IconeDePerfil, IconType> = {
  linkedin: FaLinkedinIn,
  github: FaGithub,
  instagram: FaInstagram,
};

/** Rodapé com o direito autoral da Keylla e a assinatura de quem desenvolveu. */
export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-6 text-xs text-ink-soft">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <span>{rodape.copyright(ano)}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {rodape.assinatura}
          {rodape.desenvolvedor.map((perfil) => {
            const Icone = ICONES[perfil.icone];

            return (
              <a
                key={perfil.rotulo}
                href={perfil.href}
                aria-label={perfil.rotulo}
                {...propsLinkExterno(true)}
                className="grid size-11 place-items-center rounded-full text-base transition-colors hover:text-olive"
              >
                <Icone aria-hidden />
              </a>
            );
          })}
        </span>
      </Container>
    </footer>
  );
}
