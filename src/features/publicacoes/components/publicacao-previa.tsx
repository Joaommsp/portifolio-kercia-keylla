import { painel } from "@/content/site";
import { PublicacaoArtigo } from "@/features/publicacoes/components/publicacao-artigo";
import { paraPublicacaoDePrevia } from "@/features/publicacoes/converter";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";

const { publicacao: textos } = painel;

/**
 * Como a publicação vai aparecer no site, dentro do painel.
 *
 * Renderiza o `PublicacaoArtigo` — o MESMO componente da página pública —
 * dentro de uma moldura tracejada. A tentação era montar um cabeçalho próprio
 * aqui; ele já nasceria diferente do real (data, tamanho do título, imagem de
 * topo), e a prévia deixaria de provar o que promete.
 */
export function PublicacaoPrevia({
  formulario,
  publicadoEm = null,
}: {
  formulario: PublicacaoFormulario;
  /** Data já gravada. Rascunho ainda não tem, e o artigo sabe omitir. */
  publicadoEm?: Date | null;
}) {
  const publicacao = paraPublicacaoDePrevia(formulario, publicadoEm);
  const semTitulo = publicacao.titulo.trim() === "";
  const semTexto = publicacao.corpo.trim() === "";

  return (
    <div className="rounded-xs border border-dashed border-line bg-ground px-6 py-1 pb-7">
      <PublicacaoArtigo
        publicacao={{
          ...publicacao,
          titulo: semTitulo ? textos.previa.semTitulo : publicacao.titulo,
          corpo: semTexto ? textos.previa.semTexto : publicacao.corpo,
        }}
      />

      <p className="mt-8 border-t border-line pt-4 text-xs text-ink-soft">
        {textos.previa.rodape}
      </p>
    </div>
  );
}
