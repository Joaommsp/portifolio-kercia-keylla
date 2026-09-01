import { collection, getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { ORDEM_NO_FIM } from "@/features/formacoes/converter";
import { listarFormacoes } from "@/features/formacoes/queries";
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
const collectionFalso = collection as unknown as Mock;
const obterDbFalso = obterDb as unknown as Mock;

/** Mensagem que a configuração do Firebase lança quando falta uma variável. */
const ERRO_DE_CONFIGURACAO =
  "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_API_KEY.";

const documento = (
  id: string,
  dados: Record<string, unknown>,
): { id: string; dados: Record<string, unknown> } => ({
  id,
  dados: {
    titulo: `Formação ${id}`,
    instituicao: "Instituição",
    status: "concluido",
    ...dados,
  },
});

const idsDe = (resultado: Awaited<ReturnType<typeof listarFormacoes>>) => {
  if ("erro" in resultado) {
    throw new Error(`esperava dados, veio erro: ${resultado.erro}`);
  }
  return resultado.dados.map((formacao) => formacao.id);
};

beforeEach(() => {
  vi.clearAllMocks();
  obterDbFalso.mockReturnValue({});
});

describe("listarFormacoes", () => {
  it("lê a coleção de formações", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    await listarFormacoes();

    expect(collectionFalso.mock.calls[0][1]).toBe("formacoes");
  });

  it("ordena por ordem crescente", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("terceira", { ordem: 3, ano: 2020 }),
        documento("primeira", { ordem: 1, ano: 2015 }),
        documento("segunda", { ordem: 2, ano: 2018 }),
      ]),
    );

    expect(idsDe(await listarFormacoes())).toEqual([
      "primeira",
      "segunda",
      "terceira",
    ]);
  });

  it("desempata a mesma ordem pelo ano decrescente", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("antiga", { ordem: 1, ano: 2012 }),
        documento("recente", { ordem: 1, ano: 2024 }),
        documento("intermediaria", { ordem: 1, ano: 2018 }),
      ]),
    );

    expect(idsDe(await listarFormacoes())).toEqual([
      "recente",
      "intermediaria",
      "antiga",
    ]);
  });

  it("põe no fim a formação sem ordem gravada, sem perdê-la", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("sem-ordem", { ano: 2024 }),
        documento("com-ordem", { ordem: 5, ano: 2010 }),
      ]),
    );

    const resultado = await listarFormacoes();

    expect(idsDe(resultado)).toEqual(["com-ordem", "sem-ordem"]);
    expect("dados" in resultado && resultado.dados[1].ordem).toBe(ORDEM_NO_FIM);
  });

  it("põe depois a formação sem ano quando a ordem empata", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("sem-ano", { ordem: 1 }),
        documento("com-ano", { ordem: 1, ano: 2001 }),
      ]),
    );

    expect(idsDe(await listarFormacoes())).toEqual(["com-ano", "sem-ano"]);
  });

  it("converte cada documento em formação de domínio", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("mestrado", {
          ordem: 0,
          ano: 2024,
          status: "em_andamento",
          descricao: "  ",
        }),
      ]),
    );

    const resultado = await listarFormacoes();

    expect("dados" in resultado && resultado.dados[0]).toEqual({
      id: "mestrado",
      titulo: "Formação mestrado",
      instituicao: "Instituição",
      descricao: null,
      ano: 2024,
      status: "em_andamento",
      ordem: 0,
    });
  });

  it("devolve lista vazia, e não erro, quando não há formação cadastrada", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    expect(await listarFormacoes()).toEqual({ dados: [] });
  });

  it("devolve a mensagem traduzida do Firebase quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso(
        "permission-denied",
        "Missing or insufficient permissions.",
      ),
    );

    expect(await listarFormacoes()).toEqual({
      erro: "Você não tem permissão para esta operação.",
    });
  });

  it("devolve erro, e não exceção, quando o Firebase não está configurado", async () => {
    obterDbFalso.mockImplementation(() => {
      throw new Error(ERRO_DE_CONFIGURACAO);
    });

    await expect(listarFormacoes()).resolves.toEqual({
      erro: ERRO_DE_CONFIGURACAO,
    });
  });

  it("não lança quando a leitura falha com código desconhecido", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso("firestore/desconhecido", "Deadline exceeded."),
    );

    await expect(listarFormacoes()).resolves.toEqual({
      erro: "Deadline exceeded.",
    });
  });
});
