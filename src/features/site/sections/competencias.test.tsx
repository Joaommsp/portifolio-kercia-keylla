import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoCompetencias } from "@/content/site";

import { Competencias } from "./competencias";

/**
 * SIT-08 fixa 4 famílias e 10 competências, cada uma com a descrição do que
 * resolve. Os valores são transcrição da spec, não leitura do conteúdo.
 */
const FAMILIAS_DA_SPEC = [
  "Inclusão",
  "Comunicação",
  "Aprendizagem",
  "Contextos",
];
const COMPETENCIAS_DA_SPEC = 10;

describe("Competências", () => {
  it("mantém o conteúdo alinhado às 4 famílias da spec", () => {
    expect(secaoCompetencias.grupos.map((grupo) => grupo.familia)).toEqual(
      FAMILIAS_DA_SPEC,
    );
  });

  it("exibe as dez competências da spec", () => {
    render(<Competencias />);

    expect(screen.getAllByRole("listitem")).toHaveLength(COMPETENCIAS_DA_SPEC);
  });

  it("agrupa cada competência sob a sua família", () => {
    render(<Competencias />);

    for (const grupo of secaoCompetencias.grupos) {
      const familia = screen.getByRole("heading", { name: grupo.familia });
      const lista = familia.nextElementSibling as HTMLElement;

      for (const competencia of grupo.competencias) {
        expect(within(lista).getByText(competencia.titulo)).toBeInTheDocument();
      }
    }
  });

  it("explica o que cada competência resolve", () => {
    render(<Competencias />);

    for (const grupo of secaoCompetencias.grupos) {
      for (const competencia of grupo.competencias) {
        expect(screen.getByText(competencia.descricao)).toBeInTheDocument();
      }
    }
  });
});
