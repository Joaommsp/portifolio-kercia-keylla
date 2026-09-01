import {
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  alternarPublicado,
  atualizarPublicacao,
  criarPublicacao,
  excluirPublicacao,
  MENSAGEM_SLUG_EM_USO,
} from "@/features/publicacoes/mutations";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import {
  criarSnapshot,
  ErroFirestoreFalso,
  ID_CRIADO,
  MARCA_DO_SERVIDOR,
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

const getDocsFalso = getDocs as unknown as Mock;
const addDocFalso = addDoc as unknown as Mock;
const updateDocFalso = updateDoc as unknown as Mock;
const deleteDocFalso = deleteDoc as unknown as Mock;
const obterDbFalso = obterDb as unknown as Mock;

const ERRO_DE_PERMISSAO = new ErroFirestoreFalso(
  "permission-denied",
  "Missing or insufficient permissions.",
);
const MENSAGEM_DE_PERMISSAO = "Você não tem permissão para esta operação.";

const formulario: PublicacaoFormulario = {
  titulo: "A AT não é babá",
  slug: "a-at-nao-e-baba",
  resumo: "O que a assistente terapêutica faz na escola.",
  corpo: "Corpo do texto em **markdown**.",
  imagemUrl: "",
  tag: "Escola",
  publicado: true,
};

/** Documento que o `addDoc` ou o `updateDoc` recebeu. */
const documentoGravado = (mock: Mock) =>
  mock.mock.calls[0][1] as Record<string, unknown>;

/** Referência de documento que a escrita endereçou. */
const referenciaGravada = (mock: Mock) =>
  mock.mock.calls[0][0] as ReferenciaFalsa;

beforeEach(() => {
  vi.clearAllMocks();
  obterDbFalso.mockReturnValue({});
  getDocsFalso.mockResolvedValue(criarSnapshot([]));
  addDocFalso.mockResolvedValue({ id: ID_CRIADO });
  updateDocFalso.mockResolvedValue(undefined);
  deleteDocFalso.mockResolvedValue(undefined);
});

describe("criarPublicacao", () => {
  it("grava os campos do formulário e devolve o id criado", async () => {
    const resultado = await criarPublicacao(formulario);

    expect(documentoGravado(addDocFalso)).toMatchObject({
      titulo: "A AT não é babá",
      slug: "a-at-nao-e-baba",
      resumo: "O que a assistente terapêutica faz na escola.",
      corpo: "Corpo do texto em **markdown**.",
      imagemUrl: null,
      tag: "Escola",
      publicado: true,
    });
    expect(resultado).toEqual({ dados: ID_CRIADO });
  });

  it("grava publicadoEm, sem o que a publicação não apareceria na home", async () => {
    await criarPublicacao(formulario);

    expect(documentoGravado(addDocFalso).publicadoEm).toBe(MARCA_DO_SERVIDOR);
  });

  it("grava a data de atualização", async () => {
    await criarPublicacao(formulario);

    expect(documentoGravado(addDocFalso).atualizadoEm).toBe(MARCA_DO_SERVIDOR);
  });

  it("grava publicadoEm também no rascunho, para ele aparecer quando for publicado", async () => {
    await criarPublicacao({ ...formulario, publicado: false });

    expect(documentoGravado(addDocFalso)).toMatchObject({
      publicado: false,
      publicadoEm: MARCA_DO_SERVIDOR,
    });
  });

  it("recusa o slug já usado por outra publicação, sem gravar", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([{ id: "outra", dados: { slug: "a-at-nao-e-baba" } }]),
    );

    expect(await criarPublicacao(formulario)).toEqual({
      erro: MENSAGEM_SLUG_EM_USO,
    });
    expect(addDocFalso).not.toHaveBeenCalled();
  });

  it("devolve a mensagem traduzida do Firebase quando a gravação falha", async () => {
    addDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await criarPublicacao(formulario)).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});

describe("atualizarPublicacao", () => {
  const publicadoEm = new Date("2026-03-14T03:00:00.000Z");

  it("grava os campos no documento pedido e devolve o id", async () => {
    const resultado = await atualizarPublicacao("p1", formulario, publicadoEm);

    expect(referenciaGravada(updateDocFalso)).toEqual({
      colecao: "publicacoes",
      id: "p1",
    });
    expect(documentoGravado(updateDocFalso)).toMatchObject({
      titulo: "A AT não é babá",
      slug: "a-at-nao-e-baba",
    });
    expect(resultado).toEqual({ dados: "p1" });
  });

  it("grava a data de atualização", async () => {
    await atualizarPublicacao("p1", formulario, publicadoEm);

    expect(documentoGravado(updateDocFalso).atualizadoEm).toBe(
      MARCA_DO_SERVIDOR,
    );
  });

  it("preserva a data de publicação já existente", async () => {
    await atualizarPublicacao("p1", formulario, publicadoEm);

    expect(documentoGravado(updateDocFalso).publicadoEm).toEqual(publicadoEm);
  });

  it("grava publicadoEm quando o documento veio sem data", async () => {
    await atualizarPublicacao("p1", formulario, null);

    expect(documentoGravado(updateDocFalso).publicadoEm).toBe(
      MARCA_DO_SERVIDOR,
    );
  });

  it("aceita o próprio slug da publicação editada", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([{ id: "p1", dados: { slug: "a-at-nao-e-baba" } }]),
    );

    expect(
      await atualizarPublicacao("p1", formulario, publicadoEm),
    ).toEqual({ dados: "p1" });
    expect(updateDocFalso).toHaveBeenCalledTimes(1);
  });

  it("recusa o slug de outra publicação, sem gravar", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([{ id: "outra", dados: { slug: "a-at-nao-e-baba" } }]),
    );

    expect(await atualizarPublicacao("p1", formulario, publicadoEm)).toEqual({
      erro: MENSAGEM_SLUG_EM_USO,
    });
    expect(updateDocFalso).not.toHaveBeenCalled();
  });

  it("devolve a mensagem traduzida do Firebase quando a gravação falha", async () => {
    updateDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await atualizarPublicacao("p1", formulario, publicadoEm)).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});

describe("excluirPublicacao", () => {
  it("remove o documento pedido", async () => {
    const resultado = await excluirPublicacao("p1");

    expect(referenciaGravada(deleteDocFalso)).toEqual({
      colecao: "publicacoes",
      id: "p1",
    });
    expect(resultado).toEqual({ dados: null });
  });

  it("devolve a mensagem traduzida do Firebase quando a exclusão falha", async () => {
    deleteDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(await excluirPublicacao("p1")).toEqual({
      erro: MENSAGEM_DE_PERMISSAO,
    });
  });
});

describe("alternarPublicado", () => {
  it("põe no ar o rascunho e devolve o novo estado", async () => {
    const resultado = await alternarPublicado({
      id: "p1",
      publicado: false,
      publicadoEm: new Date("2026-03-14T03:00:00.000Z"),
    });

    expect(documentoGravado(updateDocFalso).publicado).toBe(true);
    expect(resultado).toEqual({ dados: true });
  });

  it("volta para rascunho a publicação no ar", async () => {
    const resultado = await alternarPublicado({
      id: "p1",
      publicado: true,
      publicadoEm: new Date("2026-03-14T03:00:00.000Z"),
    });

    expect(documentoGravado(updateDocFalso).publicado).toBe(false);
    expect(resultado).toEqual({ dados: false });
  });

  it("grava publicadoEm quando a publicação ainda não tinha data", async () => {
    await alternarPublicado({ id: "p1", publicado: false, publicadoEm: null });

    expect(documentoGravado(updateDocFalso).publicadoEm).toBe(
      MARCA_DO_SERVIDOR,
    );
  });

  it("preserva a data de publicação já existente", async () => {
    const publicadoEm = new Date("2026-03-14T03:00:00.000Z");

    await alternarPublicado({ id: "p1", publicado: true, publicadoEm });

    expect(documentoGravado(updateDocFalso).publicadoEm).toEqual(publicadoEm);
  });

  it("devolve a mensagem traduzida do Firebase quando a gravação falha", async () => {
    updateDocFalso.mockRejectedValue(ERRO_DE_PERMISSAO);

    expect(
      await alternarPublicado({
        id: "p1",
        publicado: false,
        publicadoEm: null,
      }),
    ).toEqual({ erro: MENSAGEM_DE_PERMISSAO });
  });
});
