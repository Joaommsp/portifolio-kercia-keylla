import { CorpoMarkdown } from "@/features/publicacoes/components/corpo-markdown";
import { painel } from "@/content/site";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";
import { formatDateBR } from "@/lib/format";

const { publicacao: textos } = painel;

/**
 * Como a publicação vai aparecer no site, dentro do painel.
 *
 * Reusa o `CorpoMarkdown` da página pública em vez de renderizar markdown por
 * conta própria: uma segunda renderização divergiria da real no primeiro
 * ajuste, e a prévia deixaria de servir para conferir negrito, lista e link.
 */
export function PublicacaoPrevia({
  formulario,
  publicadoEm,
}: {
  formulario: PublicacaoFormulario;
  /** Data já gravada. Sem ela, a prévia mostra hoje — é o que valeria. */
  publicadoEm?: Date | null;
}) {
  const titulo = formulario.titulo.trim();
  const corpo = formulario.corpo.trim();

  return (
    <div className="rounded-xs border border-dashed border-line bg-ground px-6 py-7">
      <p className="text-xs uppercase tracking-rotulo text-brass">
        {formatDateBR(publicadoEm ?? new Date())}
      </p>

      <h2 className="mt-2 font-display text-3xl tracking-titulo text-olive">
        {titulo === "" ? textos.previa.semTitulo : titulo}
      </h2>

      {formulario.resumo.trim() === "" ? null : (
        <p className="mt-3 max-w-leitura text-ink-soft">{formulario.resumo}</p>
      )}

      {corpo === "" ? (
        <p className="mt-6 text-sm text-ink-soft">{textos.previa.semTexto}</p>
      ) : (
        <div className="mt-6">
          <CorpoMarkdown corpo={corpo} />
        </div>
      )}

      {formulario.tag.trim() === "" ? null : (
        <p className="mt-6 text-xs uppercase tracking-rotulo text-brass">
          {formulario.tag}
        </p>
      )}

      <p className="mt-8 border-t border-line pt-4 text-xs text-ink-soft">
        {textos.previa.rodape}
      </p>
    </div>
  );
}
