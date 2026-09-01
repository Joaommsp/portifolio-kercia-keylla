import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  LIMITE_PUBLICACOES_HOME,
  listarPublicadas,
  obterPorSlug,
} from "@/features/publicacoes/queries";
import {
  type ConsultaFalsa,
  criarSnapshot,
  ErroFirestoreFalso,
} from "@/test/firestore";

vi.mock("@/lib/firebase/client", () => ({ db: {}, auth: {} }));

vi.mock("firebase/firestore", async () => {
  const { criarModuloFirestoreFalso } = await import("@/test/firestore");
  return criarModuloFirestoreFalso();
});

const getDocsFalso = getDocs as unknown as Mock;

/** Consulta que a função montou e entregou ao `getDocs`. */
const consultaExecutada = (): ConsultaFalsa =>
  getDocsFalso.mock.calls[0][0] as ConsultaFalsa;

const documento = (id: string, publicadoEm: string) => ({
  id,
  dados: {
    titulo: `Texto ${id}`,
    slug: id,
    resumo: "Resumo",
    corpo: "Corpo",
    publicado: true,
    publicadoEm: { toDate: () => new Date(publicadoEm) },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listarPublicadas", () => {
  it("devolve as publicações convertidas, na ordem em que vieram", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("recente", "2026-08-22T03:00:00.000Z"),
        documento("antiga", "2026-01-10T03:00:00.000Z"),
      ]),
    );

    const resultado = await listarPublicadas();

    expect(resultado).toEqual({
      dados: [
        expect.objectContaining({
          id: "recente",
          titulo: "Texto recente",
          publicadoEm: new Date("2026-08-22T03:00:00.000Z"),
        }),
        expect.objectContaining({ id: "antiga", titulo: "Texto antiga" }),
      ],
    });
  });

  it("filtra publicado == true, ordena por publicadoEm desc e limita a 6", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    await listarPublicadas();

    expect(consultaExecutada().colecao).toBe("publicacoes");
    expect(consultaExecutada().restricoes).toEqual([
      { tipo: "where", campo: "publicado", operador: "==", valor: true },
      { tipo: "orderBy", campo: "publicadoEm", direcao: "desc" },
      { tipo: "limit", quantidade: LIMITE_PUBLICACOES_HOME },
    ]);
  });

  it("respeita um limite diferente do padrão", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    await listarPublicadas(2);

    expect(consultaExecutada().restricoes).toContainEqual({
      tipo: "limit",
      quantidade: 2,
    });
  });

  it("devolve lista vazia, e não erro, quando não há publicação no ar", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    expect(await listarPublicadas()).toEqual({ dados: [] });
  });

  it("devolve a mensagem traduzida do Firebase quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso(
        "permission-denied",
        "Missing or insufficient permissions.",
      ),
    );

    expect(await listarPublicadas()).toEqual({
      erro: "Você não tem permissão para esta operação.",
    });
  });

  it("não lança quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso("unavailable", "Backend unavailable."),
    );

    await expect(listarPublicadas()).resolves.toEqual({
      erro: "O banco de dados está indisponível no momento. Tente de novo em instantes.",
    });
  });
});

describe("obterPorSlug", () => {
  it("devolve a publicação convertida quando o slug existe", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([documento("at-nao-e-baba", "2026-08-22T03:00:00.000Z")]),
    );

    const resultado = await obterPorSlug("at-nao-e-baba");

    expect(resultado).toEqual({
      dados: expect.objectContaining({
        id: "at-nao-e-baba",
        slug: "at-nao-e-baba",
        publicado: true,
      }),
    });
  });

  it("busca pelo slug pedido e só entre as publicadas", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    await obterPorSlug("at-nao-e-baba");

    expect(consultaExecutada().restricoes).toEqual([
      { tipo: "where", campo: "slug", operador: "==", valor: "at-nao-e-baba" },
      { tipo: "where", campo: "publicado", operador: "==", valor: true },
      { tipo: "limit", quantidade: 1 },
    ]);
  });

  it("devolve dados null, e não erro, quando o slug não existe", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    expect(await obterPorSlug("inexistente")).toEqual({ dados: null });
  });

  it("devolve a mensagem traduzida do Firebase quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso("unavailable", "Backend unavailable."),
    );

    expect(await obterPorSlug("at-nao-e-baba")).toEqual({
      erro: "O banco de dados está indisponível no momento. Tente de novo em instantes.",
    });
  });
});
