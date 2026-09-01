import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Uma coluna da tabela: o rótulo do cabeçalho e o alinhamento da célula. */
export type ColunaDaTabela = {
  readonly rotulo: string;
  /** Alinha a coluna à direita — usada pela coluna de ações. */
  readonly aoFim?: boolean;
};

/**
 * Moldura das tabelas do painel: caixa com rolagem horizontal, cabeçalho e o
 * espaçamento das células.
 *
 * Publicações e formações listam coisas diferentes, mas na mesma casca — que
 * mora aqui para o ajuste de uma valer para as duas.
 */
export function TabelaPainel({
  colunas,
  children,
}: {
  colunas: readonly ColunaDaTabela[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xs border border-line bg-surface">
      <table className="w-full min-w-3xl border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-rotulo text-ink-soft">
            {colunas.map((coluna) => (
              <th
                key={coluna.rotulo}
                scope="col"
                className={cn(
                  "px-5 py-3 font-semibold",
                  coluna.aoFim && "text-right",
                )}
              >
                {coluna.rotulo}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Linha da tabela, com o traço que separa uma da outra. */
export function LinhaDaTabela({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-line last:border-b-0">{children}</tr>
  );
}

/** Célula da tabela. `tom="fraco"` para o dado secundário. */
export function CelulaDaTabela({
  tom = "normal",
  children,
}: {
  tom?: "normal" | "fraco";
  children: ReactNode;
}) {
  return (
    <td
      className={cn("px-5 py-4", tom === "fraco" && "text-ink-soft")}
    >
      {children}
    </td>
  );
}

/** Célula de ações: botões alinhados à direita, sempre visíveis. */
export function AcoesDaTabela({ children }: { children: ReactNode }) {
  return (
    <td className="px-5 py-4">
      <div className="flex flex-wrap justify-end gap-2">{children}</div>
    </td>
  );
}
