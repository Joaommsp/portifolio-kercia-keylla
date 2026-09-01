import { cn } from "@/lib/utils";

/**
 * Moldura em arco das fotos do site. Enquanto as imagens reais não chegam,
 * renderiza só a legenda do espaço reservado.
 */
export function PhotoFrame({
  legenda,
  comAnel = false,
  className,
}: {
  legenda: string;
  /** Anel dourado interno, usado no retrato de abertura. */
  comAnel?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid aspect-4/5 place-items-center overflow-hidden rounded-t-full rounded-b-md border border-line text-center",
        className,
      )}
    >
      {comAnel ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3.5 rounded-t-full rounded-b-md border border-brass/45"
        />
      ) : null}
      <small className="px-8 text-xs uppercase tracking-sobretitulo text-ink-soft">
        {legenda}
      </small>
    </div>
  );
}
