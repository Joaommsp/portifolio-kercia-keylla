import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { propsLinkExterno } from "@/lib/link";
import { cn } from "@/lib/utils";

const actionLinkVariants = cva(
  [
    "inline-flex items-center gap-2.5 rounded-xs border px-6 py-3.5 text-xs font-semibold uppercase tracking-rotulo",
    "transition-[transform,background-color,border-color,color] duration-toque ease-toque",
    // No celular não há hover: sem isto o toque no CTA principal não devolve
    // nada, e o estado de hover ainda fica preso depois do tap.
    "active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-3",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-olive text-on-olive focus-visible:outline-brass pointer-fino:hover:-translate-y-0.5 pointer-fino:hover:bg-olive-deep",
        ghost:
          "border-line text-ink focus-visible:outline-brass pointer-fino:hover:border-olive pointer-fino:hover:text-olive",
        light:
          "border-transparent bg-on-olive text-olive-deep focus-visible:outline-on-olive pointer-fino:hover:-translate-y-0.5 pointer-fino:hover:bg-surface",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ActionLinkProps = VariantProps<typeof actionLinkVariants> & {
  href: string;
  children: ReactNode;
  /** Abre em nova aba com `rel` seguro. */
  external?: boolean;
  /** Acrescenta a seta decorativa à direita do rótulo. */
  withArrow?: boolean;
  className?: string;
};

/** Link com aparência de botão, nos três tons do layout aprovado. */
export function ActionLink({
  href,
  children,
  variant,
  external = false,
  withArrow = false,
  className,
}: ActionLinkProps) {
  return (
    <a
      href={href}
      className={cn(actionLinkVariants({ variant }), className)}
      {...propsLinkExterno(external)}
    >
      {children}
      {withArrow ? <ArrowRight aria-hidden className="size-4" /> : null}
    </a>
  );
}
