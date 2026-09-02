import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoAtendimento, secaoCompetencias } from "@/content/site";

import { Atendimento } from "./atendimento";

/** SIT-09: as 10 especialidades ao lado dos 4 contextos de atendimento. */
const ESPECIALIDADES_DA_SPEC = 10;
const CONTEXTOS_DA_SPEC = 5;

describe("Atendimento", () => {
  it("repete as especialidades da seção de competências, sem lista própria", () => {
    render(<Atendimento />);

    const titulos = secaoCompetencias.grupos.flatMap((grupo) =>
      grupo.competencias.map((competencia) => competencia.titulo),
    );

    expect(titulos).toHaveLength(ESPECIALIDADES_DA_SPEC);
    for (const titulo of titulos) {
      expect(screen.getByText(titulo)).toBeInTheDocument();
    }
  });

  it("mostra os contextos em que o acompanhamento acontece", () => {
    render(<Atendimento />);

    expect(secaoAtendimento.contextos).toHaveLength(CONTEXTOS_DA_SPEC);
    for (const contexto of secaoAtendimento.contextos) {
      expect(screen.getByText(contexto)).toBeInTheDocument();
    }
  });

  it("nomeia a região de atendimento", () => {
    render(<Atendimento />);

    expect(screen.getByText("Paulo Afonso e região")).toBeInTheDocument();
  });
});
