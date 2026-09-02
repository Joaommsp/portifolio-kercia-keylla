import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { rodape } from "@/content/site";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("assina o desenvolvimento", () => {
    render(<SiteFooter />);

    expect(screen.getByText(/Feito por Dev\. João M\./)).toBeInTheDocument();
  });

  it("dá nome acessível a cada perfil, que agora aparece só como ícone", () => {
    render(<SiteFooter />);

    for (const perfil of rodape.desenvolvedor) {
      expect(
        screen.getByRole("link", { name: perfil.rotulo }),
      ).toHaveAccessibleName(perfil.rotulo);
    }
  });

  it("leva aos perfis do desenvolvedor, em nova aba e sem passar referrer", () => {
    render(<SiteFooter />);

    for (const perfil of rodape.desenvolvedor) {
      const link = screen.getByRole("link", { name: perfil.rotulo });
      expect(link).toHaveAttribute("href", perfil.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("mantém o direito autoral no nome da Keylla, não no do desenvolvedor", () => {
    render(<SiteFooter />);

    expect(screen.getByText(/© \d{4} Keylla Melo/)).toBeInTheDocument();
  });
});
