import Image from "next/image";

import { cn } from "@/lib/utils";

export type FotoDaMoldura = {
  readonly src: string;
  readonly alt: string;
};

/**
 * Largura que o retrato ocupa. Espelha `--breakpoint-duo` (51.25rem), onde o
 * hero passa de uma para duas colunas; `sizes` não aceita `var()`, então o
 * valor do token vem escrito.
 */
const TAMANHOS_DO_RETRATO = "(max-width: 51.25rem) 90vw, 45vw";

/**
 * Moldura em arco do retrato. A foto vem recortada em 4:5, a proporção da
 * moldura, então o arco corta só o entorno — nunca o rosto.
 */
export function PhotoFrame({
  foto,
  comAnel = false,
  prioridade = false,
  className,
}: {
  foto: FotoDaMoldura;
  /** Anel dourado interno, usado no retrato de abertura. */
  comAnel?: boolean;
  /** Carrega sem esperar o scroll — só para a imagem visível na abertura. */
  prioridade?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid aspect-4/5 place-items-center overflow-hidden rounded-t-full rounded-b-md border border-line",
        className,
      )}
    >
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        priority={prioridade}
        sizes={TAMANHOS_DO_RETRATO}
        className="object-cover"
      />

      {comAnel ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3.5 rounded-t-full rounded-b-md border border-brass/45"
        />
      ) : null}
    </div>
  );
}
