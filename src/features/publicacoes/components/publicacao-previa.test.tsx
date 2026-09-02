import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { painel } from "@/content/site";
import { PublicacaoArtigo } from "@/features/publicacoes/components/publicacao-artigo";
import { PublicacaoPrevia } from "@/features/publicacoes/components/publicacao-previa";
import { paraPublicacaoDePrevia } from "@/features/publicacoes/converter";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";

const { publicacao: textos } = painel;

const FORMULARIO: PublicacaoFormulario = {
  titulo: "Quando a criança diz não",
  slug: "quando-a-crianca-diz-nao",
  resumo: "A recusa raramente é birra.",
  corpo: "Primeiro parágrafo.\n\n**Negrito** e uma lista:\n\n- um\n- dois",
  imagemUrl: "https://images.unsplash.com/foto.jpg",
  tag: "Rotina",
  publicado: true,
};

const PUBLICADO_EM = new Date("2026-08-22T12:00:00");

describe("PublicacaoPrevia", () => {
  it("renderiza exatamente o mesmo HTML da página pública", () => {
    // É a razão de a prévia existir: se ela divergir do artigo, deixa de provar
    // o que promete no rodapé.
    const { container: naPrevia } = render(
      <PublicacaoPrevia formulario={FORMULARIO} publicadoEm={PUBLICADO_EM} />,
    );
    const artigoDaPrevia = naPrevia.querySelector("header")?.parentElement;

    const { container: noSite } = render(
      <PublicacaoArtigo
        publicacao={paraPublicacaoDePrevia(FORMULARIO, PUBLICADO_EM)}
      />,
    );

    expect(artigoDaPrevia?.innerHTML).toContain(
      noSite.querySelector("header")?.outerHTML,
    );
  });

  it("junta data e tag numa linha só, como o site faz", () => {
    render(
      <PublicacaoPrevia formulario={FORMULARIO} publicadoEm={PUBLICADO_EM} />,
    );

    expect(
      screen.getByText("22 de agosto de 2026 · Rotina"),
    ).toBeInTheDocument();
  });

  it("omite a data do rascunho em vez de mostrar o dia de hoje", () => {
    render(<PublicacaoPrevia formulario={{ ...FORMULARIO, tag: "" }} />);

    expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument();
  });

  it("mostra a imagem de topo que o site mostraria", () => {
    render(<PublicacaoPrevia formulario={FORMULARIO} />);

    expect(
      screen.getByRole("img", { name: FORMULARIO.titulo }),
    ).toBeInTheDocument();
  });

  it("avisa o que falta em vez de mostrar bloco vazio", () => {
    render(
      <PublicacaoPrevia
        formulario={{ ...FORMULARIO, titulo: "  ", corpo: "  " }}
      />,
    );

    expect(screen.getByText(textos.previa.semTitulo)).toBeInTheDocument();
    expect(screen.getByText(textos.previa.semTexto)).toBeInTheDocument();
  });
});
