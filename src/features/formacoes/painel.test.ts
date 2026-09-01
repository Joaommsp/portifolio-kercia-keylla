import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { listarNoPainel } from "@/features/formacoes/painel";
import { obterDb } from "@/lib/firebase/client";
import { criarSnapshot, ErroFirestoreFalso } from "@/test/firestore";

vi.mock("@/lib/firebase/client", () => ({
  obterDb: vi.fn(() => ({})),
  obterAuth: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", async () => {
  const { criarModuloFirestoreFalso } = await import("@/test/firestore");
  return criarModuloFirestoreFalso();
});

const getDocsFalso = getDocs as unknown as Mock;
const obterDbFalso = obterDb as unknown as Mock;

const documento = (id: string, dados: Record<string, unknown>) => ({
  id,
  dados: { titulo: `Curso ${id}`, instituicao: "Universidade", ...dados },
});

beforeEach(() => {
  vi.clearAllMocks();
  obterDbFalso.mockReturnValue({});
});

describe("listarNoPainel (formações)", () => {
  it("ordena por ordem crescente e, no empate, por ano decrescente", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("segunda", { ordem: 1, ano: 2020 }),
        documento("terceira", { ordem: 1, ano: 2018 }),
        documento("primeira", { ordem: 0, ano: 2015 }),
      ]),
    );

    const resultado = await listarNoPainel();

    expect("dados" in resultado && resultado.dados.map((f) => f.id)).toEqual([
      "primeira",
      "segunda",
      "terceira",
    ]);
  });

  it("mantém a formação gravada sem ordem, no fim da lista", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("sem-ordem", { ano: 2024 }),
        documento("com-ordem", { ordem: 0, ano: 2015 }),
      ]),
    );

    const resultado = await listarNoPainel();

    expect("dados" in resultado && resultado.dados.map((f) => f.id)).toEqual([
      "com-ordem",
      "sem-ordem",
    ]);
  });

  it("devolve lista vazia, e não erro, quando não há formação", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    expect(await listarNoPainel()).toEqual({ dados: [] });
  });

  it("devolve a mensagem traduzida do Firebase quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso(
        "permission-denied",
        "Missing or insufficient permissions.",
      ),
    );

    expect(await listarNoPainel()).toEqual({
      erro: "Você não tem permissão para esta operação.",
    });
  });
});
