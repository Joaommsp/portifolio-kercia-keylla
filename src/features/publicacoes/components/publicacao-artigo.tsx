/**
 * Corpo visual de uma publicação: cabeçalho, imagem opcional e texto.
 *
 * Mora na feature, e não na rota, porque é apresentação da entidade — a
 * `page.tsx` resolve `params`, leitura e 404, e nada mais (design.md).
 */

import Image from "next/image";

import { CorpoMarkdown } from "@/features/publicacoes/components/corpo-markdown";
import {
  imagemExibivel,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { formatDateBROuNulo, juntarMeta } from "@/lib/format";

/**
 * Largura que a imagem de topo ocupa. Espelha `--breakpoint-duo` (51.25rem),
 * onde a coluna de leitura deixa de ocupar a tela inteira; `sizes` não aceita
 * `var()`, então o valor do token vem escrito.
 */
const TAMANHOS_DA_IMAGEM = "(max-width: 51.25rem) 100vw, 48rem";

export function PublicacaoArtigo({ publicacao }: { publicacao: Publicacao }) {
  const imagem = imagemExibivel(publicacao.imagemUrl);
  const meta = juntarMeta(
    formatDateBROuNulo(publicacao.publicadoEm),
    publicacao.tag,
  );

  return (
    <>
      <header className="mt-8">
        {meta === "" ? null : (
          <p className="text-xs uppercase tracking-rotulo text-brass">{meta}</p>
        )}

        <h1 className="mt-3 font-display text-4xl leading-tight tracking-titulo text-olive sm:text-5xl">
          {publicacao.titulo}
        </h1>

        <p className="mt-4 max-w-leitura text-lg text-ink-soft">
          {publicacao.resumo}
        </p>
      </header>

      {imagem === null ? null : (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-xs border border-line bg-surface-2">
          <Image
            src={imagem}
            alt={publicacao.titulo}
            fill
            sizes={TAMANHOS_DA_IMAGEM}
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-8">
        <CorpoMarkdown corpo={publicacao.corpo} />
      </div>
    </>
  );
}
