import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoPedagogia } from "@/content/site";

import { Pedagogia } from "./pedagogia";

/**
 * SIT-07 fixa quatro frentes, nesta ordem — a ordem é o argumento da seção.
 * Os valores são transcrição da spec, não leitura de `secaoPedagogia`: sem
 * isso, reordenar ou renomear o conteúdo mantém a suíte verde (AD-037/AD-040).
 */
const FRENTES_DA_SPEC = [
  "Pedagogia escolar",
  "Pedagogia hospitalar",
  "Educação e inclusão",
  "Acompanhamento terapêutico",
];
const NUMEROS_DA_SPEC = ["01", "02", "03", "04"];

function titulosNaOrdem() {
  return screen
    .getAllByRole("listitem")
    .map(
      (item) =>
        within(item).getByRole("heading", { level: 3 }).textContent ?? "",
    );
}

describe("Pedagogia", () => {
  it("mantém o conteúdo fixo alinhado às quatro frentes da spec", () => {
    expect(secaoPedagogia.frentes.map((frente) => frente.titulo)).toEqual(
      FRENTES_DA_SPEC,
    );
  });

  it("exibe as frentes na ordem em que sustentam a prática", () => {
    render(<Pedagogia />);

    expect(titulosNaOrdem()).toEqual(FRENTES_DA_SPEC);
  });

  it("numera cada frente pela posição que ela ocupa", () => {
    render(<Pedagogia />);

    const numeros = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent?.slice(0, 2) ?? "");

    expect(numeros).toEqual(NUMEROS_DA_SPEC);
  });

  it("traz a descrição de cada frente do conteúdo fixo", () => {
    render(<Pedagogia />);

    for (const frente of secaoPedagogia.frentes) {
      expect(screen.getByText(frente.descricao)).toBeInTheDocument();
    }
  });

  it("abre a seção com o título Pedagogia", () => {
    render(<Pedagogia />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Pedagogia" }),
    ).toBeInTheDocument();
  });
});
