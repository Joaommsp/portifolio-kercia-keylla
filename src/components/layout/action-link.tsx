import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { propsLinkExterno } from "@/lib/link";
import { cn } from "@/lib/utils";

const actionLinkVariants = cva(
  "inline-flex items-center gap-2.5 rounded-xs border px-6 py-3.5 text-xs font-semibold uppercase tracking-rotulo transition-all focus-visible:outline-2 focus-visible:outline-offset-3",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-olive text-on-olive hover:-translate-y-0.5 hover:bg-olive-deep focus-visible:outline-brass",
        ghost:
          "border-line text-ink hover:border-olive hover:text-olive focus-visible:outline-brass",
        light:
          "border-transparent bg-on-olive text-olive-deep hover:-translate-y-0.5 hover:bg-surface focus-visible:outline-on-olive",
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
