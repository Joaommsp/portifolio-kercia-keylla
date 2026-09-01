import { addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  atualizarFormacao,
  criarFormacao,
  excluirFormacao,
} from "@/features/formacoes/mutations";
import type { FormacaoFormulario } from "@/features/formacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import {
  ErroFirestoreFalso,
  ID_CRIADO,
  type ReferenciaFalsa,
} from "@/test/firestore";

vi.mock("@/lib/firebase/client", () => ({
  obterDb: vi.fn(() => ({})),
  obterAuth: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", async () => {
  const { criarModuloFirestoreFalso } = await import("@/test/firestore");
  return criarModuloFirestoreFalso();
});

const addDocFalso = addDoc as unknown as Mock;
const updateDocFalso = updateDoc as unknown as Mock;
const deleteDocFalso = deleteDoc as unknown as Mock;
const obterDbFalso = obterDb as unknown as Mock;

const ERRO_DE_PERMISSAO = new ErroFirestoreFalso(
  "permission-denied",
  "Missing or insufficient permissions.",
);
const MENSAGEM_DE_PERMISSAO = "Você não tem permissão para esta operação.";

const formulario: FormacaoFormulario = {
  titulo: "Pós em Neuropsicologia",
  instituicao: "Universidade Exemplo",
  descricao: "",
  ano: 2026,
  status: "em_andamento",
  ordem: 2,
};

const documentoGravado = (mock: Mock) =>
  mock.mock.calls[0][1] as Record<string, unknown>;

const referenciaGravada = (mock: Mock) =>
  mock.mock.calls[0][0] as ReferenciaFalsa;

beforeEach(() => {
  vi.clearAllMocks();
  obterDbFalso.mockReturnValue({});
  addDocFalso.mockResolvedValue({ id: ID_CRIADO });
  updateDocFalso.mockResolvedValue(undefined);
  deleteDocFalso.mockResolvedValue(undefined);
});

describe("criarFormacao", () => {
  it("grava os campos do formulário e devolve o id criado", async () => {
    const resultado = await criarFormacao(formulario);

    expect(documentoGravado(addDocFalso)).toEqual({
      titulo: "Pós em Neuropsicologia",
      instituicao: "Universidade Exemplo",
      descricao: null,
      ano: 2026,
      status: "em_andamento",
      ordem: 2,
    });
    expect(resultado).toEqual({ dados: ID_CRIADO });
  });

  it("devolve a mensagem traduzida do Firebase quando a gravação falha", async () => {
    addDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await criarFormacao(formulario)).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});

describe("atualizarFormacao", () => {
  it("grava no documento pedido e devolve o id", async () => {
    const resultado = await atualizarFormacao("f1", formulario);

    expect(referenciaGravada(updateDocFalso)).toEqual({
      colecao: "formacoes",
      id: "f1",
    });
    expect(documentoGravado(updateDocFalso)).toMatchObject({
      titulo: "Pós em Neuropsicologia",
      ordem: 2,
    });
    expect(resultado).toEqual({ dados: "f1" });
  });

  it("devolve a mensagem traduzida do Firebase quando a gravação falha", async () => {
    updateDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await atualizarFormacao("f1", formulario)).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});

describe("excluirFormacao", () => {
  it("remove o documento pedido", async () => {
    const resultado = await excluirFormacao("f1");

    expect(referenciaGravada(deleteDocFalso)).toEqual({
      colecao: "formacoes",
      id: "f1",
    });
    expect(resultado).toEqual({ dados: null });
  });

  it("devolve a mensagem traduzida do Firebase quando a exclusão falha", async () => {
    deleteDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await excluirFormacao("f1")).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});
