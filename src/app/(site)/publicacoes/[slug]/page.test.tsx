import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import PaginaDaPublicacao, {
  generateMetadata,
} from "@/app/(site)/publicacoes/[slug]/page";
import { secaoPublicacoes } from "@/content/site";
import { obterPorSlug } from "@/features/publicacoes/queries";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { CAMINHO_HOME } from "@/lib/rotas";

vi.mock("@/features/publicacoes/queries", () => ({
  obterPorSlug: vi.fn(),
}));

/**
 * `notFound()` interrompe a renderização lançando — o dublê preserva isso, para
 * o teste distinguir "respondeu 404" de "seguiu adiante sem publicação".
 */
const RESPOSTA_404 = new Error("NEXT_NOT_FOUND");

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw RESPOSTA_404;
  }),
}));

const obterPorSlugFalso = obterPorSlug as unknown as Mock;
const notFoundFalso = notFound as unknown as Mock;

const SLUG = "at-nao-e-baba";

const publicacao = (campos: Partial<Publicacao> = {}): Publicacao => ({
  id: "p1",
  titulo: "A AT não é babá",
  slug: SLUG,
  resumo: "O que separa acompanhamento terapêutico de cuidado.",
  corpo: "# Título\n\nTexto do corpo.",
  imagemUrl: null,
  tag: "Rotina",
  publicado: true,
  publicadoEm: new Date("2026-01-10T03:00:00.000Z"),
  atualizadoEm: null,
  ...campos,
});

/** `params` como o Next entrega para a rota: assíncrono. */
const rota = (slug: string) =>
  ({ params: Promise.resolve({ slug }) }) as Parameters<
    typeof generateMetadata
  >[0];

beforeEach(() => {
  vi.clearAllMocks();
  obterPorSlugFalso.mockResolvedValue({ dados: null });
});

describe("metadados da publicação (PUB-07)", () => {
  it("tira título e descrição do título e do resumo da publicação", async () => {
    const texto = publicacao();
    obterPorSlugFalso.mockResolvedValue({ dados: texto });

    const metadados = await generateMetadata(rota(SLUG));

    expect(metadados.title).toBe("A AT não é babá");
    expect(metadados.description).toBe(
      "O que separa acompanhamento terapêutico de cuidado.",
    );
    expect(metadados.alternates?.canonical).toBe(`/publicacoes/${SLUG}`);
  });

  it("preenche o Open Graph do texto com título, resumo, endereço e data", async () => {
    obterPorSlugFalso.mockResolvedValue({ dados: publicacao() });

    const metadados = await generateMetadata(rota(SLUG));

    expect(metadados.openGraph).toMatchObject({
      type: "article",
      title: "A AT não é babá",
      description: "O que separa acompanhamento terapêutico de cuidado.",
      url: `/publicacoes/${SLUG}`,
      publishedTime: "2026-01-10T03:00:00.000Z",
    });
  });

  it("slug inexistente não vaza `undefined` no título nem no Open Graph", async () => {
    obterPorSlugFalso.mockResolvedValue({ dados: null });

    const metadados = await generateMetadata(rota("nao-existe"));

    expect(metadados.title).toBeUndefined();
    expect(metadados.description).toBeUndefined();
    expect(metadados.openGraph).toBeUndefined();
    expect(JSON.stringify(metadados)).not.toContain("undefined");
  });
});

describe("404 da publicação (PUB-04)", () => {
  it("responde 404 quando o slug não existe", async () => {
    obterPorSlugFalso.mockResolvedValue({ dados: null });

    await expect(PaginaDaPublicacao(rota("nao-existe"))).rejects.toBe(
      RESPOSTA_404,
    );
    expect(notFoundFalso).toHaveBeenCalledTimes(1);
  });

  it("responde 404 quando a publicação está em rascunho", async () => {
    // Quem decide a visibilidade é a leitura pública, que só traz
    // `publicado == true` (queries.test.ts): o rascunho chega aqui como
    // ausência, e a rota não tem uma segunda regra própria.
    obterPorSlugFalso.mockResolvedValue({ dados: null });

    await expect(PaginaDaPublicacao(rota("rascunho-da-autora"))).rejects.toBe(
      RESPOSTA_404,
    );
    expect(obterPorSlugFalso).toHaveBeenCalledWith("rascunho-da-autora");
    expect(notFoundFalso).toHaveBeenCalledTimes(1);
  });

  it("publicação no ar é renderizada, sem 404", async () => {
    obterPorSlugFalso.mockResolvedValue({ dados: publicacao() });

    render(await PaginaDaPublicacao(rota(SLUG)));

    expect(
      screen.getByRole("heading", { name: "A AT não é babá" }),
    ).toBeInTheDocument();
    expect(notFoundFalso).not.toHaveBeenCalled();
  });
});

describe("caminho de volta do texto (PUB-02)", () => {
  it("leva de volta para a home, com o rótulo do conteúdo do site", async () => {
    obterPorSlugFalso.mockResolvedValue({ dados: publicacao() });

    render(await PaginaDaPublicacao(rota(SLUG)));

    expect(
      screen.getByRole("link", { name: secaoPublicacoes.voltar }),
    ).toHaveAttribute("href", CAMINHO_HOME);
  });
});
