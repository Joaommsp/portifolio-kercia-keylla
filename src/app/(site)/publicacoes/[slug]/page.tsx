/**
 * Rota de uma publicação. Aqui só se resolve `params`, leitura e desfecho.
 *
 * Slug inexistente e rascunho respondem 404: a leitura já filtra
 * `publicado == true`, então quem não está no ar simplesmente não é encontrado
 * (PUB-04). Falha de leitura é outra coisa — aí a página fica de pé e mostra a
 * mensagem do Firebase, porque um Firestore fora do ar não significa que o
 * texto não existe (PUB-05).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cache, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionMessage } from "@/components/layout/section-message";
import { secaoPublicacoes } from "@/content/site";
import { PublicacaoArtigo } from "@/features/publicacoes/components/publicacao-artigo";
import { obterPorSlug } from "@/features/publicacoes/queries";
import { imagemExibivel } from "@/features/publicacoes/schemas";
import { CAMINHO_HOME, caminhoDaPublicacao } from "@/lib/rotas";

/** Segundos entre revalidações do conteúdo vindo do Firestore. */
export const revalidate = 300;

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

  // Página servida em estado de erro não deve ser indexada no lugar do texto.
  if ("erro" in resultado) {
    return { robots: { index: false } };
  }

  if (resultado.dados === null) {
    return {};
  }

  const publicacao = resultado.dados;
  const caminho = caminhoDaPublicacao(publicacao.slug);
  const imagem = imagemExibivel(publicacao.imagemUrl);

  // Caminhos relativos: o `metadataBase` do layout raiz resolve a origem.
  return {
    title: publicacao.titulo,
    description: publicacao.resumo,
    alternates: { canonical: caminho },
    openGraph: {
      type: "article",
      title: publicacao.titulo,
      description: publicacao.resumo,
      url: caminho,
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
      <PublicacaoArtigo publicacao={resultado.dados} />
    </Moldura>
  );
}

/** Moldura comum ao texto e ao estado de erro, com o caminho de volta. */
function Moldura({ children }: { children: ReactNode }) {
  return (
    <article className="py-12 duo:py-20">
      <Container className="max-w-3xl">
        <Link
          href={CAMINHO_HOME}
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
