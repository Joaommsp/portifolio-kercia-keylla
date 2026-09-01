import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CorpoMarkdown } from "@/features/publicacoes/components/corpo-markdown";

describe("CorpoMarkdown", () => {
  it("formata o markdown que a autora escreve", () => {
    render(
      <CorpoMarkdown corpo={"## Rotina\n\nTexto com **ênfase**.\n\n- um\n- dois"} />,
    );

    expect(
      screen.getByRole("heading", { name: "Rotina" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ênfase")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("monta a tabela do GFM", () => {
    render(
      <CorpoMarkdown
        corpo={"| Dia | Foco |\n| --- | --- |\n| Segunda | Escola |"}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Escola" })).toBeInTheDocument();
  });

  it("não executa HTML bruto escrito no corpo", () => {
    const { container } = render(
      <CorpoMarkdown
        corpo={'Antes\n\n<button onclick="alert(1)">Clique</button>\n\nDepois'}
      />,
    );

    expect(container.querySelector("button")).toBeNull();
    expect(
      screen.getByText('<button onclick="alert(1)">Clique</button>'),
    ).toBeInTheDocument();
    expect(screen.getByText("Antes")).toBeInTheDocument();
    expect(screen.getByText("Depois")).toBeInTheDocument();
  });

  it("abre em aba nova só o link que sai do site", () => {
    render(
      <CorpoMarkdown
        corpo={"[fora](https://exemplo.com) e [dentro](/publicacoes/outro)"}
      />,
    );

    expect(screen.getByRole("link", { name: "fora" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "fora" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(
      screen.getByRole("link", { name: "dentro" }),
    ).not.toHaveAttribute("target");
  });

  it("só exibe imagem do markdown que esteja na allowlist de hosts", () => {
    render(
      <CorpoMarkdown
        corpo={
          "![permitida](https://images.unsplash.com/a.jpg)\n\n![barrada](https://cdn.exemplo-qualquer.com/b.jpg)"
        }
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "permitida" })).toBeInTheDocument();
  });
});
