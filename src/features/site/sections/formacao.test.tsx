import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoFormacao } from "@/content/site";

import { Formacao } from "./formacao";

/** FOR-01: os dois grupos da formação, transcritos do currículo. */
const GRUPOS_DA_SPEC = ["Formação acadêmica", "Aperfeiçoamento e capacitação"];

describe("Formação", () => {
  it("mantém o conteúdo alinhado aos grupos da spec", () => {
    expect(secaoFormacao.grupos.map((grupo) => grupo.titulo)).toEqual(
      GRUPOS_DA_SPEC,
    );
  });

  it("lista toda a formação do conteúdo fixo", () => {
    render(<Formacao />);

    for (const grupo of secaoFormacao.grupos) {
      for (const item of grupo.itens) {
        expect(
          screen.getByRole("heading", { level: 4, name: item.titulo }),
        ).toBeInTheDocument();
      }
    }
  });

  it("mostra o ano de quem tem e deixa a linha sem ano quando o currículo não registra", () => {
    render(<Formacao />);

    const comAno = screen.getByRole("heading", {
      name: "Licenciatura em Pedagogia",
    }).parentElement!.parentElement!;
    expect(within(comAno).getByText("2022")).toBeInTheDocument();

    const semAno = screen.getByRole("heading", {
      name: "Pós-graduação em Pedagogia Hospitalar",
    }).parentElement!.parentElement!;
    expect(semAno.textContent).not.toMatch(/\d{4}/);
  });

  it("junta instituição e detalhe numa linha só", () => {
    render(<Formacao />);

    expect(
      screen.getByText(
        "Faculdade Venda Nova do Imigrante — FAVENI · 720 horas",
      ),
    ).toBeInTheDocument();
  });
});
