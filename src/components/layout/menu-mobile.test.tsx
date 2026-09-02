import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { cabecalho, navegacao } from "@/content/site";

import { MenuMobile } from "./menu-mobile";

async function abrir() {
  const usuario = userEvent.setup();
  render(<MenuMobile />);
  await usuario.click(screen.getByRole("button", { name: cabecalho.menu.abrir }));
  return usuario;
}

describe("MenuMobile", () => {
  it("nasce fechado, sem a folha no documento", () => {
    render(<MenuMobile />);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("button", { name: cabecalho.menu.abrir }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("abre com as seis seções do site", async () => {
    await abrir();

    const folha = screen.getByRole("dialog");
    for (const item of navegacao) {
      expect(within(folha).getByRole("link", { name: item.rotulo })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  it("fecha ao escolher uma seção, senão o destino ficaria coberto", async () => {
    const usuario = await abrir();

    await usuario.click(
      within(screen.getByRole("dialog")).getByRole("link", {
        name: navegacao[0].rotulo,
      }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("fecha no Esc", async () => {
    const usuario = await abrir();

    await usuario.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("devolve o foco ao botão ao fechar, para o teclado não se perder", async () => {
    const usuario = await abrir();

    await usuario.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: cabecalho.menu.abrir })).toHaveFocus();
  });

  it("trava a rolagem do fundo enquanto está aberta", async () => {
    const usuario = await abrir();
    expect(document.body.style.overflow).toBe("hidden");

    await usuario.keyboard("{Escape}");
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("anuncia a folha como camada modal", async () => {
    await abrir();

    const folha = screen.getByRole("dialog");
    expect(folha).toHaveAttribute("aria-modal", "true");
    expect(folha).toHaveAccessibleName(cabecalho.menu.titulo);
  });
});
