import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

/**
 * Um campo do painel: rótulo, controle, ajuda, erro e — onde há limite — o
 * contador de caracteres.
 *
 * O contador vive aqui para não ser reescrito em cada formulário, e mostra
 * sempre o mesmo par `usados/limite`, com o limite vindo do schema (ADM-04).
 * O rótulo não leva ícone: ícone é da opção, não do nome do campo.
 */
export function Campo({
  id,
  rotulo,
  erro,
  ajuda,
  limite,
  valor,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: string;
  /** Limite de caracteres do campo, quando o schema define um. */
  limite?: number;
  /** Conteúdo atual do campo, para o contador. */
  valor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{rotulo}</Label>
        {limite === undefined ? null : (
          <span className="text-xs tabular-nums text-ink-soft">
            {`${(valor ?? "").length}/${limite}`}
          </span>
        )}
      </div>

      {children}

      {ajuda === undefined ? null : (
        <p className="text-xs text-ink-soft">{ajuda}</p>
      )}

      {erro === undefined ? null : (
        <p className="text-sm text-destructive">{erro}</p>
      )}
    </div>
  );
}
