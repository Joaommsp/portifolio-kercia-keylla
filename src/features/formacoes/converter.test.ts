import { describe, expect, it } from "vitest";

import {
  ORDEM_NO_FIM,
  paraDocumentoDeFormacao,
  paraFormacao,
} from "@/features/formacoes/converter";
import type { FormacaoFormulario } from "@/features/formacoes/schemas";

const documentoCompleto = {
  titulo: "Pedagogia",
  instituicao: "Universidade Federal",
  descricao: "Licenciatura plena.",
  ano: 2018,
  status: "concluido",
  ordem: 2,
};

describe("paraFormacao", () => {
  it("converte um documento completo", () => {
    expect(paraFormacao("abc123", documentoCompleto)).toEqual({
      id: "abc123",
      titulo: "Pedagogia",
      instituicao: "Universidade Federal",
      descricao: "Licenciatura plena.",
      ano: 2018,
      status: "concluido",
      ordem: 2,
    });
  });

  it("converte descrição ausente em null", () => {
    const { descricao, ...semDescricao } = documentoCompleto;
    void descricao;

    expect(paraFormacao("abc123", semDescricao).descricao).toBeNull();
  });

  it("converte descrição em branco em null", () => {
    expect(
      paraFormacao("abc123", { ...documentoCompleto, descricao: "   " })
        .descricao,
    ).toBeNull();
  });

  it("manda para o fim da lista a formação sem ordem gravada", () => {
    const { ordem, ...semOrdem } = documentoCompleto;
    void ordem;

    expect(paraFormacao("abc123", semOrdem).ordem).toBe(ORDEM_NO_FIM);
  });

  it("preserva ordem zero, que é a primeira posição e não ausência", () => {
    expect(
      paraFormacao("abc123", { ...documentoCompleto, ordem: 0 }).ordem,
    ).toBe(0);
  });

  it("preserva o status em andamento", () => {
    expect(
      paraFormacao("abc123", { ...documentoCompleto, status: "em_andamento" })
        .status,
    ).toBe("em_andamento");
  });

  it("cai no status concluído quando o gravado está ausente ou fora da união", () => {
    const { status, ...semStatus } = documentoCompleto;
    void status;

    expect(paraFormacao("abc123", semStatus).status).toBe("concluido");
    expect(
      paraFormacao("abc123", { ...documentoCompleto, status: "trancado" })
        .status,
    ).toBe("concluido");
  });

  it("converte ano ausente em null, e não em zero", () => {
    const { ano, ...semAno } = documentoCompleto;
    void ano;

    expect(paraFormacao("abc123", semAno).ano).toBeNull();
  });

  it("converte documento vazio sem lançar", () => {
    expect(paraFormacao("abc123", {})).toEqual({
      id: "abc123",
      titulo: "",
      instituicao: "",
      descricao: null,
      ano: null,
      status: "concluido",
      ordem: ORDEM_NO_FIM,
    });
  });
});

describe("paraDocumentoDeFormacao", () => {
  const formulario: FormacaoFormulario = {
    titulo: "  Pedagogia  ",
    instituicao: "  Universidade Federal  ",
    descricao: "  ",
    ano: 2018,
    status: "em_andamento",
    ordem: 1,
  };

  it("grava os campos aparados e a descrição em branco como null", () => {
    expect(paraDocumentoDeFormacao(formulario)).toEqual({
      titulo: "Pedagogia",
      instituicao: "Universidade Federal",
      descricao: null,
      ano: 2018,
      status: "em_andamento",
      ordem: 1,
    });
  });
});
