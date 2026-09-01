/**
 * Página de uma publicação.
 *
 * Slug inexistente e rascunho respondem 404: a leitura já filtra
 * `publicado == true`, então quem não está no ar simplesmente não é encontrado
 * (PUB-04). Falha de leitura é outra coisa — aí a página fica de pé e mostra a
 * mensagem do Firebase, porque um Firestore fora do ar não significa que o
 * texto não existe (PUB-05).
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cache, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionMessage } from "@/components/layout/section-message";
import { secaoPublicacoes, separadorDeMeta, siteUrl } from "@/content/site";
import { CorpoMarkdown } from "@/features/publicacoes/components/corpo-markdown";
import { obterPorSlug } from "@/features/publicacoes/queries";
import {
  imagemExibivel,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { formatDateBR } from "@/lib/format";
import { caminhoDaPublicacao } from "@/lib/rotas";

/** Segundos entre revalidações do conteúdo vindo do Firestore. */
export const revalidate = 300;

/** Largura que a imagem de topo ocupa em cada faixa de tela. */
const TAMANHOS_DA_IMAGEM = "(max-width: 51.25rem) 100vw, 48rem";

/**
 * A rota lê a publicação duas vezes — nos metadados e no corpo. O `cache` do
 * React resolve as duas com uma consulta só.
 */
const lerPublicacao = cache(obterPorSlug);

export async function generateMetadata({
  params,
}: PageProps<"/publicacoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await lerPublicacao(slug);

  if ("erro" in resultado || resultado.dados === null) {
    return {};
  }

  const publicacao = resultado.dados;
  const caminho = caminhoDaPublicacao(publicacao.slug);
  const imagem = imagemExibivel(publicacao.imagemUrl);

  return {
    title: publicacao.titulo,
    description: publicacao.resumo,
    alternates: { canonical: caminho },
    openGraph: {
      type: "article",
      title: publicacao.titulo,
      description: publicacao.resumo,
      url: `${siteUrl}${caminho}`,
      publishedTime: publicacao.publicadoEm?.toISOString(),
      images: imagem === null ? undefined : [imagem],
    },
  };
}

export default async function PaginaDaPublicacao({
  params,
}: PageProps<"/publicacoes/[slug]">) {
  const { slug } = await params;
  const resultado = await lerPublicacao(slug);

  if ("erro" in resultado) {
    return (
      <Moldura>
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      </Moldura>
    );
  }

  if (resultado.dados === null) {
    notFound();
  }

  return (
    <Moldura>
      <Conteudo publicacao={resultado.dados} />
    </Moldura>
  );
}

/** Moldura comum ao texto e ao estado de erro, com o caminho de volta. */
function Moldura({ children }: { children: ReactNode }) {
  return (
    <article className="py-12 duo:py-20">
      <Container className="max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {secaoPublicacoes.voltar}
        </Link>

        {children}
      </Container>
    </article>
  );
}

function Conteudo({ publicacao }: { publicacao: Publicacao }) {
  const imagem = imagemExibivel(publicacao.imagemUrl);

  return (
    <>
      <header className="mt-8">
        <p className="text-xs uppercase tracking-rotulo text-brass">
          {[
            publicacao.publicadoEm === null
              ? null
              : formatDateBR(publicacao.publicadoEm),
            publicacao.tag,
          ]
            .filter((parte): parte is string => parte !== null)
            .join(separadorDeMeta)}
        </p>

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
