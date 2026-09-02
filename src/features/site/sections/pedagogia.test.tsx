import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoPedagogia } from "@/content/site";

import { Pedagogia } from "./pedagogia";

/** SIT-07 fixa quatro frentes — o número é da spec, não da constante. */
const FRENTES_DA_SPEC = 4;

describe("Pedagogia", () => {
  it("exibe as quatro frentes da spec", () => {
    render(<Pedagogia />);

    expect(screen.getAllByRole("listitem")).toHaveLength(FRENTES_DA_SPEC);
  });

  it("numera as frentes na ordem em que sustentam a prática", () => {
    render(<Pedagogia />);

    const itens = screen.getAllByRole("listitem");
    itens.forEach((item, indice) => {
      const esperado = String(indice + 1).padStart(2, "0");
      expect(within(item).getByText(esperado)).toBeInTheDocument();
    });
  });

  it("traz título e descrição de cada frente do conteúdo fixo", () => {
    render(<Pedagogia />);

    for (const frente of secaoPedagogia.frentes) {
      // Nível 3 desambigua da própria seção: a primeira frente se chama
      // "Pedagogia", igual ao h2 que a contém.
      expect(
        screen.getByRole("heading", { level: 3, name: frente.titulo }),
      ).toBeInTheDocument();
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
