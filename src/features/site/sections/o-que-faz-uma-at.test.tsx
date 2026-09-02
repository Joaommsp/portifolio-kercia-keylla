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

/**
 * Localiza a descrição dentro do card: é o parágrafo, o único texto do cartão
 * que não é o título nem o rótulo do ícone. Buscar por papel evita amarrar o
 * teste à classe do elemento.
 */
const DESCRICAO_DE_PILAR = (_conteudo: string, elemento: Element | null) =>
  elemento?.tagName === "P";

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

    const cards = screen.getAllByRole("article").map((card) => ({
      titulo: within(card).getByRole("heading").textContent,
      descricao: within(card).getByText(DESCRICAO_DE_PILAR).textContent,
    }));

    expect(cards).toEqual(
      secaoAt.pilares.map((pilar) => ({
        titulo: pilar.titulo,
        descricao: pilar.descricao,
      })),
    );
  });
});
