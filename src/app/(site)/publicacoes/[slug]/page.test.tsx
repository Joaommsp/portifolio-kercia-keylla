import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { generateMetadata } from "@/app/(site)/publicacoes/[slug]/page";
import { obterPorSlug } from "@/features/publicacoes/queries";
import type { Publicacao } from "@/features/publicacoes/schemas";

vi.mock("@/features/publicacoes/queries", () => ({
  obterPorSlug: vi.fn(),
}));

const obterPorSlugFalso = obterPorSlug as unknown as Mock;

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
