import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { listarPublicadas } from "@/features/publicacoes/queries";
import {
  LIMITE_PUBLICACOES_SITEMAP,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { CAMINHO_PAINEL } from "@/lib/rotas";
import { siteUrl } from "@/lib/url";

vi.mock("@/features/publicacoes/queries", () => ({
  listarPublicadas: vi.fn(),
}));

const listarPublicadasFalso = listarPublicadas as unknown as Mock;

const publicacao = (
  slug: string,
  datas: Partial<Pick<Publicacao, "publicadoEm" | "atualizadoEm">> = {},
): Publicacao => ({
  id: slug,
  titulo: `Texto ${slug}`,
  slug,
  resumo: "Resumo",
  corpo: "Corpo",
  imagemUrl: null,
  tag: null,
  publicado: true,
  publicadoEm: datas.publicadoEm ?? new Date("2026-01-10T03:00:00.000Z"),
  atualizadoEm: datas.atualizadoEm ?? null,
});

beforeEach(() => {
  vi.clearAllMocks();
  listarPublicadasFalso.mockResolvedValue({ dados: [] });
});

describe("sitemap", () => {
  it("lista a home e cada publicação no ar, em URL absoluta", async () => {
    listarPublicadasFalso.mockResolvedValue({
      dados: [publicacao("at-nao-e-baba"), publicacao("rotina-na-escola")],
    });

    const entradas = await sitemap();

    expect(entradas.map((entrada) => entrada.url)).toEqual([
      `${siteUrl}/`,
      `${siteUrl}/publicacoes/at-nao-e-baba`,
      `${siteUrl}/publicacoes/rotina-na-escola`,
    ]);
  });

  it("pede a leitura que só traz publicado, com o teto do sitemap", async () => {
    await sitemap();

    expect(listarPublicadasFalso).toHaveBeenCalledWith(
      LIMITE_PUBLICACOES_SITEMAP,
    );
  });

  it("data de modificação é a da última edição, ou a da publicação", async () => {
    listarPublicadasFalso.mockResolvedValue({
      dados: [
        publicacao("editada", {
          atualizadoEm: new Date("2026-08-22T03:00:00.000Z"),
        }),
        publicacao("nunca-editada", { atualizadoEm: null }),
      ],
    });

    const entradas = await sitemap();

    expect(entradas[1].lastModified).toEqual(
      new Date("2026-08-22T03:00:00.000Z"),
    );
    expect(entradas[2].lastModified).toEqual(
      new Date("2026-01-10T03:00:00.000Z"),
    );
  });

  it("sai só com a home quando a leitura do Firestore falha", async () => {
    listarPublicadasFalso.mockResolvedValue({
      erro: "O banco de dados está indisponível no momento.",
    });

    await expect(sitemap()).resolves.toEqual([{ url: `${siteUrl}/` }]);
  });

  it("não expõe o painel", async () => {
    listarPublicadasFalso.mockResolvedValue({
      dados: [publicacao("at-nao-e-baba")],
    });

    const entradas = await sitemap();

    expect(
      entradas.some((entrada) => entrada.url.includes(CAMINHO_PAINEL)),
    ).toBe(false);
  });
});
