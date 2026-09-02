import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bloco que ocupa o lugar da lista quando não há o que listar — seção vazia ou
 * leitura que falhou. O texto vem sempre de fora: conteúdo fixo no caso do
 * vazio, mensagem do Firebase no caso do erro (PUB-03, PUB-05, FOR-03).
 */
export function SectionMessage({
  tom = "neutro",
  children,
}: {
  tom?: "neutro" | "erro";
  children: ReactNode;
}) {
  return (
    <p
      role={tom === "erro" ? "alert" : undefined}
      className={cn(
        // `break-words` porque a mensagem do Firebase pode trazer URL longa
        // sem espaço (o link de criar índice), que estouraria a caixa.
        "rounded-xs border px-6 py-10 text-center text-sm break-words",
        tom === "erro"
          ? "border-destructive/40 bg-surface text-destructive"
          : "border-line bg-surface text-ink-soft",
      )}
    >
      {children}
    </p>
  );
}
