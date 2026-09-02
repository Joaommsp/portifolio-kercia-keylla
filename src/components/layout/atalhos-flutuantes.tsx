import type { IconType } from "react-icons";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

import { atalhosFlutuantes, type IconeDeAtalho } from "@/content/site";
import { PROPS_NOVA_ABA } from "@/lib/link";

const ICONES: Record<IconeDeAtalho, IconType> = {
  whatsapp: FaWhatsapp,
  instagram: FaInstagram,
};

/**
 * Atalhos de contato que acompanham a rolagem.
 *
 * Ficam na paleta da página em vez das cores das marcas: verde do WhatsApp e
 * gradiente do Instagram brigariam com o oliva e chamariam mais atenção que o
 * conteúdo. O pulso é um anel discreto, e some para quem pede menos movimento.
 *
 * Claros de propósito: eles atravessam a página inteira, e sobre a faixa oliva
 * do contato um botão oliva praticamente desaparecia.
 *
 * `bottom` e não meio da tela: no celular o polegar alcança embaixo, e ali os
 * botões não cobrem texto.
 */
export function AtalhosFlutuantes() {
  return (
    <nav
      aria-label={atalhosFlutuantes.rotulo}
      className="fixed right-4 bottom-5 z-30 flex flex-col gap-3 duo:right-6 duo:bottom-7"
    >
      {atalhosFlutuantes.itens.map((atalho) => {
        const Icone = ICONES[atalho.icone];

        return (
          <a
            key={atalho.icone}
            href={atalho.href}
            aria-label={atalho.rotulo}
            {...PROPS_NOVA_ABA}
            className="group relative grid size-12 place-items-center rounded-full border border-line bg-surface text-olive shadow-cartao transition-[transform,background-color,color] duration-toque ease-toque active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass pointer-fino:hover:bg-olive pointer-fino:hover:text-on-olive"
          >
            <span
              aria-hidden
              className="pulso-do-atalho pointer-events-none absolute inset-0 rounded-full border border-brass"
            />
            <Icone aria-hidden className="relative size-5.5" />
          </a>
        );
      })}
    </nav>
  );
}
