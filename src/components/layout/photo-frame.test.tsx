import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PhotoFrame } from "./photo-frame";

const FOTO = {
  src: "/keylla-melo.jpg",
  alt: "Keylla Melo, Assistente Terapêutica",
  largura: 1199,
  altura: 1500,
};

describe("PhotoFrame", () => {
  it("exibe a foto com o texto alternativo quando ela existe", () => {
    render(<PhotoFrame legenda="Foto de apresentação" foto={FOTO} />);

    const imagem = screen.getByRole("img", { name: FOTO.alt });
    expect(imagem).toHaveAttribute("src", expect.stringContaining("keylla-melo"));
    expect(screen.queryByText("Foto de apresentação")).toBeNull();
  });

  it("cai na legenda do espaço reservado quando não há foto", () => {
    render(<PhotoFrame legenda="Foto em contexto" />);

    expect(screen.getByText("Foto em contexto")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("recorta a foto na moldura em vez de deformá-la", () => {
    render(<PhotoFrame legenda="Foto de apresentação" foto={FOTO} />);

    expect(screen.getByRole("img", { name: FOTO.alt })).toHaveClass("object-cover");
  });
});
