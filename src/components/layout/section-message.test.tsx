import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionMessage } from "./section-message";

/**
 * A mensagem de erro é fiel ao Firebase (PUB-05, FOR-03) e o Firebase manda
 * URL longa sem espaço — o link de criar índice composto. Sem quebra de
 * palavra o texto estoura a caixa, como aconteceu no UAT de 2026-09-02.
 */
const URL_LONGA_DO_FIREBASE =
  "The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/exemplo/firestore/indexes?create_composite=Cldwcm9qZWN0cy9tZXUtcG9ydGZvbGlvLTM3N2FhL2RhdGFiYXNlcy8oZGVmYXVsdCk";

describe("SectionMessage", () => {
  it("quebra palavra longa para o texto não estourar a caixa", () => {
    render(<SectionMessage tom="erro">{URL_LONGA_DO_FIREBASE}</SectionMessage>);

    expect(screen.getByRole("alert")).toHaveClass("break-words");
  });

  it("anuncia o erro como alerta e mantém o vazio silencioso", () => {
    const { rerender } = render(
      <SectionMessage tom="erro">Falhou</SectionMessage>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Falhou");

    rerender(<SectionMessage>Nada por aqui</SectionMessage>);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Nada por aqui")).toBeInTheDocument();
  });
});
