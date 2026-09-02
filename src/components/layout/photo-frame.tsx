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

type PropsComuns = {
  /** Anel dourado interno, usado no retrato de abertura. */
  comAnel?: boolean;
  className?: string;
};

type PropsComFoto = PropsComuns & {
  /** Retrato já recortado em 4:5, a proporção da moldura. */
  foto: FotoDaMoldura;
  /** Carrega sem esperar o scroll — só para a imagem visível na abertura. */
  prioridade?: boolean;
  legenda?: never;
};

type PropsSemFoto = PropsComuns & {
  /** Legenda do espaço reservado, enquanto a foto real não chega. */
  legenda: string;
  foto?: never;
  prioridade?: never;
};

/**
 * Moldura em arco das fotos do site. São dois modos excludentes: com `foto`,
 * exibe a imagem; com `legenda`, o espaço reservado. O tipo separa os dois
 * para nenhum chamador precisar inventar um texto que nunca aparece.
 */
export function PhotoFrame(props: PropsComFoto | PropsSemFoto) {
  const { comAnel = false, className } = props;

  return (
    <div
      className={cn(
        "relative grid aspect-4/5 place-items-center overflow-hidden rounded-t-full rounded-b-md border border-line text-center",
        className,
      )}
    >
      {props.foto ? (
        <Image
          src={props.foto.src}
          alt={props.foto.alt}
          fill
          priority={props.prioridade}
          sizes={TAMANHOS_DO_RETRATO}
          className="object-cover"
        />
      ) : (
        <small className="px-8 text-xs uppercase tracking-sobretitulo text-ink-soft">
          {props.legenda}
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
