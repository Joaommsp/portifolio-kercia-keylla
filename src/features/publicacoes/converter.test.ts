import { describe, expect, it } from "vitest";

import {
  paraDocumentoDePublicacao,
  paraPublicacao,
} from "@/features/publicacoes/converter";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";

/** Imita o Timestamp do Firestore, que chega ao app expondo `toDate()`. */
const timestamp = (iso: string) => ({ toDate: () => new Date(iso) });

const documentoCompleto = {
  titulo: "AT não é babá",
  slug: "at-nao-e-baba",
  resumo: "O que separa acompanhamento terapêutico de cuidado.",
  corpo: "# Título\n\nTexto do corpo.",
  imagemUrl: "https://images.unsplash.com/foto.jpg",
  tag: "Rotina",
  publicado: true,
  publicadoEm: timestamp("2026-08-22T03:00:00.000Z"),
  atualizadoEm: timestamp("2026-08-23T03:00:00.000Z"),
};

describe("paraPublicacao", () => {
  it("converte um documento completo, com os timestamps virando Date", () => {
    expect(paraPublicacao("abc123", documentoCompleto)).toEqual({
      id: "abc123",
      titulo: "AT não é babá",
      slug: "at-nao-e-baba",
      resumo: "O que separa acompanhamento terapêutico de cuidado.",
      corpo: "# Título\n\nTexto do corpo.",
      imagemUrl: "https://images.unsplash.com/foto.jpg",
      tag: "Rotina",
      publicado: true,
      publicadoEm: new Date("2026-08-22T03:00:00.000Z"),
      atualizadoEm: new Date("2026-08-23T03:00:00.000Z"),
    });
  });

  it("converte documento sem imagemUrl, tag e atualizadoEm sem quebrar", () => {
    const { imagemUrl, tag, atualizadoEm, ...semOpcionais } = documentoCompleto;
    void imagemUrl;
    void tag;
    void atualizadoEm;

    const publicacao = paraPublicacao("abc123", semOpcionais);

    expect(publicacao.imagemUrl).toBeNull();
    expect(publicacao.tag).toBeNull();
    expect(publicacao.atualizadoEm).toBeNull();
    expect(publicacao.titulo).toBe("AT não é babá");
  });

  it("devolve null, e não data inválida, quando publicadoEm está ausente", () => {
    const { publicadoEm, ...semData } = documentoCompleto;
    void publicadoEm;

    expect(paraPublicacao("abc123", semData).publicadoEm).toBeNull();
  });

  it("devolve null quando publicadoEm é um valor que não é data", () => {
    expect(
      paraPublicacao("abc123", { ...documentoCompleto, publicadoEm: "ontem" })
        .publicadoEm,
    ).toBeNull();
  });

  it("devolve null quando o Timestamp produz uma data inválida", () => {
    expect(
      paraPublicacao("abc123", {
        ...documentoCompleto,
        publicadoEm: { toDate: () => new Date("nada") },
      }).publicadoEm,
    ).toBeNull();
  });

  it("aceita Date direto no lugar do Timestamp", () => {
    expect(
      paraPublicacao("abc123", {
        ...documentoCompleto,
        publicadoEm: new Date("2026-08-22T03:00:00.000Z"),
      }).publicadoEm,
    ).toEqual(new Date("2026-08-22T03:00:00.000Z"));
  });

  it("trata publicado ausente como rascunho, nunca como publicado", () => {
    const { publicado, ...semPublicado } = documentoCompleto;
    void publicado;

    expect(paraPublicacao("abc123", semPublicado).publicado).toBe(false);
  });

  it("converte documento vazio em publicação sem campos, sem lançar", () => {
    expect(paraPublicacao("abc123", {})).toEqual({
      id: "abc123",
      titulo: "",
      slug: "",
      resumo: "",
      corpo: "",
      imagemUrl: null,
      tag: null,
      publicado: false,
      publicadoEm: null,
      atualizadoEm: null,
    });
  });

  it("trata imagemUrl e tag em branco como ausentes", () => {
    const publicacao = paraPublicacao("abc123", {
      ...documentoCompleto,
      imagemUrl: "   ",
      tag: "",
    });

    expect(publicacao.imagemUrl).toBeNull();
    expect(publicacao.tag).toBeNull();
  });
});

describe("paraDocumentoDePublicacao", () => {
  const formulario: PublicacaoFormulario = {
    titulo: "  AT não é babá  ",
    slug: "at-nao-e-baba",
    resumo: "  O que separa acompanhamento de cuidado.  ",
    corpo: "# Título\n\nTexto do corpo.",
    imagemUrl: "https://images.unsplash.com/foto.jpg",
    tag: "Rotina",
    publicado: true,
  };

  it("grava os campos do formulário já aparados", () => {
    expect(paraDocumentoDePublicacao(formulario)).toEqual({
      titulo: "AT não é babá",
      slug: "at-nao-e-baba",
      resumo: "O que separa acompanhamento de cuidado.",
      corpo: "# Título\n\nTexto do corpo.",
      imagemUrl: "https://images.unsplash.com/foto.jpg",
      tag: "Rotina",
      publicado: true,
    });
  });

  it("grava null quando imagemUrl e tag ficaram em branco no formulário", () => {
    const documento = paraDocumentoDePublicacao({
      ...formulario,
      imagemUrl: "",
      tag: "  ",
    });

    expect(documento.imagemUrl).toBeNull();
    expect(documento.tag).toBeNull();
  });
});
