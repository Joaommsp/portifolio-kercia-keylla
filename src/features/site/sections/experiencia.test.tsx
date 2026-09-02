import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoExperiencia } from "@/content/site";

import { Experiencia } from "./experiencia";

/** SIT-10 fixa três frentes e o destaque dos anos de sala de aula. */
const FRENTES_DA_SPEC = [
  "Educação infantil",
  "Escolas e projetos comunitários",
  "Foco atual",
];

describe("Experiência", () => {
  it("mantém o conteúdo alinhado às frentes da spec", () => {
    expect(secaoExperiencia.frentes.map((frente) => frente.titulo)).toEqual(
      FRENTES_DA_SPEC,
    );
  });

  it("destaca os anos de sala de aula", () => {
    render(<Experiencia />);

    expect(screen.getByText("15+")).toBeInTheDocument();
    expect(
      screen.getByText("anos em educação infantil"),
    ).toBeInTheDocument();
  });

  it("descreve cada frente da trajetória", () => {
    render(<Experiencia />);

    for (const frente of secaoExperiencia.frentes) {
      expect(screen.getByText(frente.titulo)).toBeInTheDocument();
      expect(screen.getByText(frente.descricao)).toBeInTheDocument();
    }
  });

  it("nomeia onde a formação em Libras está em curso", () => {
    render(<Experiencia />);

    expect(screen.getByText(/Centro Inclusão/)).toBeInTheDocument();
  });
});
