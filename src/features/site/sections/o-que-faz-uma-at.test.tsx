import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoAt } from "@/content/site";
import { OQueFazUmaAt } from "@/features/site/sections/o-que-faz-uma-at";

/**
 * Quantidade de pilares escrita na spec (SIT-02: "exibir os 6 pilares do
 * trabalho da AT"). É literal de propósito: comparar com `pilares.length`
 * deixaria o teste seguir o conteúdo em vez de auditá-lo.
 */
const PILARES_DA_SPEC = 6;

describe("OQueFazUmaAt (SIT-02)", () => {
  it("mantém no conteúdo os seis pilares que a spec fixa", () => {
    expect(secaoAt.pilares).toHaveLength(PILARES_DA_SPEC);
  });

  it("renderiza um card por pilar, sem cortar nenhum", () => {
    render(<OQueFazUmaAt />);

    expect(screen.getAllByRole("article")).toHaveLength(PILARES_DA_SPEC);
  });

  it("tira título e descrição dos cards do conteúdo do site, na ordem", () => {
    render(<OQueFazUmaAt />);

    const cards = screen.getAllByRole("article");

    expect(cards.map((card) => within(card).getByRole("heading").textContent)).toEqual(
      secaoAt.pilares.map((pilar) => pilar.titulo),
    );
    // A descrição é buscada pelo texto do conteúdo dentro do próprio card:
    // fixar qualquer uma delas no componente deixa de encontrar o par.
    secaoAt.pilares.forEach((pilar, indice) => {
      expect(within(cards[indice]).getByText(pilar.descricao)).toBeInTheDocument();
    });
  });
});
