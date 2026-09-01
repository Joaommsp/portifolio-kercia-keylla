import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  titulo: string;
  /** Nota ou ação alinhada à direita do título (só no layout em linha). */
  children?: ReactNode;
  /** Empilha sobretítulo e título, em vez de opor título e nota. */
  stacked?: boolean;
  /** Inverte as cores para uso sobre a faixa oliva. */
  onOlive?: boolean;
  className?: string;
};

/** Cabeçalho de seção: sobretítulo dourado e título display. */
export function SectionHeading({
  eyebrow,
  titulo,
  children,
  stacked = false,
  onOlive = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        stacked
          ? "mb-5"
          : "mb-9 flex flex-wrap items-end justify-between gap-6",
        className,
      )}
    >
      <div>
        <span
          className={cn(
            "block text-xs font-semibold uppercase tracking-sobretitulo",
            onOlive ? "text-on-olive/70" : "text-brass",
          )}
        >
          {eyebrow}
        </span>
        <h2
          className={cn(
            "mt-2.5 font-display text-3xl tracking-titulo sm:text-4xl lg:text-5xl",
            onOlive ? "text-on-olive" : "text-olive",
          )}
        >
          {titulo}
        </h2>
      </div>
      {children}
    </div>
  );
}
