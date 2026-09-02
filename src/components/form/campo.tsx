import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** A partir de quanto do limite o contador começa a avisar. */
const FRACAO_DE_ALERTA = 0.9;

/**
 * Um campo do painel: rótulo, controle, ajuda, erro e — onde há limite — o
 * contador de caracteres.
 *
 * O contador vive aqui para não ser reescrito em cada formulário, e mostra
 * sempre o mesmo par `usados/limite`, com o limite vindo do schema (ADM-04).
 * Ele muda de cor nos últimos 10% e fica vermelho ao estourar — o aviso chega
 * antes de o texto ser recusado, não depois.
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
  const usados = (valor ?? "").length;
  const estourou = limite !== undefined && usados > limite;
  const perto = limite !== undefined && usados >= limite * FRACAO_DE_ALERTA;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{rotulo}</Label>
        {limite === undefined ? null : (
          <span
            className={cn(
              "text-xs tabular-nums",
              estourou && "font-semibold text-destructive",
              perto && !estourou && "font-semibold text-brass",
              !perto && "text-ink-soft",
            )}
          >
            {`${usados}/${limite}`}
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
