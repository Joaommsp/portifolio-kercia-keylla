import { describe, expect, it } from "vitest";

import {
  formacaoEmBranco,
  ORDEM_NO_FIM,
  paraDocumentoDeFormacao,
  paraFormacao,
  paraFormularioDeFormacao,
  proximaOrdem,
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

describe("proximaOrdem", () => {
  const comOrdem = (id: string, ordem: number) =>
    paraFormacao(id, { ...documentoCompleto, ordem });

  it("continua da maior ordem gravada", () => {
    expect(proximaOrdem([comOrdem("a", 0), comOrdem("b", 4)])).toBe(5);
  });

  it("começa em zero quando não há formação nenhuma", () => {
    expect(proximaOrdem([])).toBe(0);
  });

  it("ignora o sentinela de quem não tem ordem gravada", () => {
    const semOrdem = paraFormacao("sem", { ...documentoCompleto, ordem: null });

    expect(semOrdem.ordem).toBe(ORDEM_NO_FIM);
    expect(proximaOrdem([comOrdem("a", 1), semOrdem])).toBe(2);
  });
});

describe("paraFormularioDeFormacao", () => {
  const hoje = new Date("2026-09-01T12:00:00.000Z");

  it("leva os campos da formação para o formulário, com descrição em texto", () => {
    const formacao = paraFormacao("f1", { ...documentoCompleto, descricao: null });

    expect(paraFormularioDeFormacao(formacao, 7, hoje)).toEqual({
      titulo: "Pedagogia",
      instituicao: "Universidade Federal",
      descricao: "",
      ano: 2018,
      status: "concluido",
      ordem: 2,
    });
  });

  it("troca o sentinela de ordem pela próxima ordem livre, para não persisti-lo", () => {
    const semOrdem = paraFormacao("f1", { ...documentoCompleto, ordem: null });

    expect(semOrdem.ordem).toBe(ORDEM_NO_FIM);
    expect(paraFormularioDeFormacao(semOrdem, 7, hoje).ordem).toBe(7);
  });

  it("usa o ano corrente quando a formação está sem ano", () => {
    const semAno = paraFormacao("f1", { ...documentoCompleto, ano: null });

    expect(paraFormularioDeFormacao(semAno, 7, hoje).ano).toBe(2026);
  });
});

describe("formacaoEmBranco", () => {
  it("abre no ano corrente, concluída e na ordem sugerida", () => {
    expect(formacaoEmBranco(3, new Date("2026-09-01T12:00:00.000Z"))).toEqual({
      titulo: "",
      instituicao: "",
      descricao: "",
      ano: 2026,
      status: "concluido",
      ordem: 3,
    });
  });
});
