import Image from "next/image";

import { cn } from "@/lib/utils";

export type FotoDaMoldura = {
  readonly src: string;
  readonly alt: string;
  readonly largura: number;
  readonly altura: number;
};

/**
 * Moldura em arco das fotos do site. Com `foto`, exibe a imagem; sem ela,
 * renderiza a legenda do espaço reservado — é assim que as seções sem foto
 * real continuam de pé.
 */
export function PhotoFrame({
  legenda,
  foto,
  comAnel = false,
  prioridade = false,
  className,
}: {
  legenda: string;
  /** Retrato já recortado em 4:5, a proporção da moldura. */
  foto?: FotoDaMoldura;
  /** Anel dourado interno, usado no retrato de abertura. */
  comAnel?: boolean;
  /** Carrega sem esperar o scroll — só para a imagem visível na abertura. */
  prioridade?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid aspect-4/5 place-items-center overflow-hidden rounded-t-full rounded-b-md border border-line text-center",
        className,
      )}
    >
      {foto ? (
        <Image
          src={foto.src}
          alt={foto.alt}
          width={foto.largura}
          height={foto.altura}
          priority={prioridade}
          sizes="(max-width: 820px) 90vw, 45vw"
          className="size-full object-cover"
        />
      ) : (
        <small className="px-8 text-xs uppercase tracking-sobretitulo text-ink-soft">
          {legenda}
        </small>
      )}

      {comAnel ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3.5 rounded-t-full rounded-b-md border border-brass/45"
        />
      ) : null}
    </div>
  );
}
