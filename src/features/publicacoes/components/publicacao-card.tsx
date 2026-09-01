/**
 * Card de uma publicação na home.
 *
 * A imagem é opcional em dois sentidos: a publicação pode não ter `imagemUrl`
 * e a URL gravada pode apontar para um host fora da allowlist — em ambos os
 * casos o card renderiza só o texto, sem deixar o espaço da miniatura vazio
 * (PUB-06 e o caso de borda do host não permitido).
 */

import Image from "next/image";
import Link from "next/link";

import { imagemExibivel } from "@/features/publicacoes/schemas";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { formatDateBR } from "@/lib/format";
import { caminhoDaPublicacao } from "@/lib/rotas";

/** Larguras que a miniatura ocupa em cada faixa da grade de publicações. */
const TAMANHOS_DA_MINIATURA = "(max-width: 880px) 100vw, 33vw";

export function PublicacaoCard({ publicacao }: { publicacao: Publicacao }) {
  const imagem = imagemExibivel(publicacao.imagemUrl);

  const data =
    publicacao.publicadoEm === null ? null : formatDateBR(publicacao.publicadoEm);

  return (
    <article className="flex overflow-hidden rounded-xs border border-line bg-surface shadow-cartao transition-transform hover:-translate-y-0.5">
      <Link
        href={caminhoDaPublicacao(publicacao.slug)}
        className="flex flex-1 flex-col"
      >
        {imagem === null ? null : (
          <div className="relative aspect-16/10 border-b border-line bg-surface-2">
            <Image
              src={imagem}
              alt={publicacao.titulo}
              fill
              sizes={TAMANHOS_DA_MINIATURA}
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2.5 px-5.5 py-5">
          <h3 className="font-display text-xl text-ink">{publicacao.titulo}</h3>
          <p className="text-sm text-ink-soft">{publicacao.resumo}</p>

          {data === null && publicacao.tag === null ? null : (
            <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-line pt-3.5 text-xs uppercase tracking-rotulo text-brass">
              {data === null ? null : <span>{data}</span>}
              {publicacao.tag === null ? null : <span>{publicacao.tag}</span>}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
