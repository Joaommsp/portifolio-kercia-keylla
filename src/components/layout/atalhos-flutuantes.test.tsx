import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AtalhosFlutuantes } from "@/components/layout/atalhos-flutuantes";
import { atalhosFlutuantes, linksContato } from "@/content/site";

describe("AtalhosFlutuantes", () => {
  it("leva ao WhatsApp e ao Instagram, em aba nova e com rel seguro", () => {
    render(<AtalhosFlutuantes />);

    const destinos = {
      "Falar no WhatsApp": linksContato.whatsapp,
      "Ver o Instagram": linksContato.instagram,
    };

    for (const [rotulo, href] of Object.entries(destinos)) {
      const atalho = screen.getByRole("link", { name: rotulo });
      expect(atalho).toHaveAttribute("href", href);
      expect(atalho).toHaveAttribute("target", "_blank");
      expect(atalho).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("dá nome acessível a cada atalho, que só mostra ícone", () => {
    render(<AtalhosFlutuantes />);

    for (const atalho of atalhosFlutuantes.itens) {
      expect(
        screen.getByRole("link", { name: atalho.rotulo }),
      ).toHaveAccessibleName(atalho.rotulo);
    }
  });

  it("agrupa os atalhos numa navegação nomeada", () => {
    render(<AtalhosFlutuantes />);

    expect(
      screen.getByRole("navigation", { name: atalhosFlutuantes.rotulo }),
    ).toBeInTheDocument();
  });
});
