import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NaoEncontrada from "@/app/not-found";
import { paginaNaoEncontrada } from "@/content/site";
import { CAMINHO_HOME } from "@/lib/rotas";

describe("página não encontrada", () => {
  it("mostra o texto vindo do conteúdo do site", () => {
    render(<NaoEncontrada />);

    expect(
      screen.getByRole("heading", { name: paginaNaoEncontrada.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByText(paginaNaoEncontrada.mensagem)).toBeInTheDocument();
  });

  it("oferece o caminho de volta para a home", () => {
    render(<NaoEncontrada />);

    expect(
      screen.getByRole("link", { name: paginaNaoEncontrada.acao.rotulo }),
    ).toHaveAttribute("href", CAMINHO_HOME);
  });
});
