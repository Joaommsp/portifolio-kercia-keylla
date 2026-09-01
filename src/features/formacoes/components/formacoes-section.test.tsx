import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoFormacao } from "@/content/site";
import { FormacoesSection } from "@/features/formacoes/components/formacoes-section";
import type { Formacao } from "@/features/formacoes/schemas";

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE =
  "O banco de dados está indisponível no momento. Tente de novo em instantes.";

function criarFormacao(ajustes: Partial<Formacao> = {}): Formacao {
  return {
    id: "f1",
    titulo: "Licenciatura em Pedagogia",
    instituicao: "Universidade Federal",
    descricao: "graduação",
    ano: 2012,
    status: "concluido",
    ordem: 1,
    ...ajustes,
  };
}

const emAndamento = criarFormacao({
  id: "f0",
  titulo: "Pós-graduação em Análise do Comportamento Aplicada",
  descricao: "previsão de conclusão em dezembro",
  ano: 2026,
  status: "em_andamento",
  ordem: 0,
});

describe("FormacoesSection", () => {
  it("lista as formações com título, instituição, descrição e ano", () => {
    render(<FormacoesSection resultado={{ dados: [criarFormacao()] }} />);

    expect(
      screen.getByRole("heading", { name: "Licenciatura em Pedagogia" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Universidade Federal · graduação"),
    ).toBeInTheDocument();
    expect(screen.getByText("2012")).toBeInTheDocument();
  });

  it("mostra o rótulo de cada status com aparência distinta", () => {
    render(
      <FormacoesSection resultado={{ dados: [emAndamento, criarFormacao()] }} />,
    );

    const emCurso = screen.getByText("Em andamento");
    const concluido = screen.getByText("Concluído");

    expect(emCurso).toBeInTheDocument();
    expect(concluido).toBeInTheDocument();
    expect(emCurso.className).not.toBe(concluido.className);
  });

  it("marca o ano da formação em curso com o traço de continuidade", () => {
    render(<FormacoesSection resultado={{ dados: [emAndamento] }} />);

    expect(screen.getByText("2026 —")).toBeInTheDocument();
  });

  it("preserva a ordem em que as formações chegam", () => {
    render(
      <FormacoesSection resultado={{ dados: [emAndamento, criarFormacao()] }} />,
    );

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((item) => item.textContent),
    ).toEqual([
      "Pós-graduação em Análise do Comportamento Aplicada",
      "Licenciatura em Pedagogia",
    ]);
  });

  it("some por inteiro, inclusive o título, quando não há formação cadastrada", () => {
    const { container } = render(<FormacoesSection resultado={{ dados: [] }} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: secaoFormacao.titulo }),
    ).not.toBeInTheDocument();
  });

  it("mostra a mensagem devolvida pelo Firebase quando a leitura falha", () => {
    render(<FormacoesSection resultado={{ erro: ERRO_DO_FIREBASE }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE);
    expect(
      screen.getByRole("heading", { name: secaoFormacao.titulo }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("omite o separador quando a formação não tem descrição", () => {
    render(
      <FormacoesSection
        resultado={{ dados: [criarFormacao({ descricao: null })] }}
      />,
    );

    expect(screen.getByText("Universidade Federal")).toBeInTheDocument();
    expect(
      screen.queryByText(/Universidade Federal ·/),
    ).not.toBeInTheDocument();
  });
});
