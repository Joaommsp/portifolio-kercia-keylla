import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Faixa central de largura máxima e recuo lateral usada por todas as seções. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-14", className)}>
      {children}
    </div>
  );
}
