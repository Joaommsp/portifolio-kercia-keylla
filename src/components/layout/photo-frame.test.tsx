import { existsSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoHero } from "@/content/site";

import { PhotoFrame } from "./photo-frame";

const FOTO = {
  src: "/keylla-melo.jpg",
  alt: "Keylla Melo, Assistente Terapêutica",
};

describe("PhotoFrame", () => {
  it("exibe a foto com o texto alternativo quando ela existe", () => {
    render(<PhotoFrame foto={FOTO} />);

    const imagem = screen.getByRole("img", { name: FOTO.alt });
    expect(imagem).toHaveAttribute("src", expect.stringContaining("keylla-melo"));
  });

  it("cai na legenda do espaço reservado quando não há foto", () => {
    render(<PhotoFrame legenda="Foto em contexto" />);

    expect(screen.getByText("Foto em contexto")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("recorta a foto na moldura em vez de deformá-la", () => {
    // Proxy possível em jsdom, que não faz layout: a classe é o que decide o
    // recorte, e sem ela o retrato 4:5 esticaria dentro do arco.
    render(<PhotoFrame foto={FOTO} />);

    expect(screen.getByRole("img", { name: FOTO.alt })).toHaveClass("object-cover");
  });

  it("aponta para um arquivo que existe em public/", () => {
    // Sem isto, renomear ou apagar o arquivo mantém a suíte verde e quebra a
    // home: o teste de render usa fixture, não o arquivo real.
    expect(existsSync(join(process.cwd(), "public", secaoHero.foto.src))).toBe(true);
  });
});
