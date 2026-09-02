import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { painel } from "@/content/site";
import { PublicacaoPrevia } from "@/features/publicacoes/components/publicacao-previa";
import type { PublicacaoFormulario } from "@/features/publicacoes/schemas";

const { publicacao: textos } = painel;

const FORMULARIO: PublicacaoFormulario = {
  titulo: "Quando a criança diz não",
  slug: "quando-a-crianca-diz-nao",
  resumo: "A recusa raramente é birra.",
  corpo: "Primeiro parágrafo.\n\n**Negrito** e uma lista:\n\n- um\n- dois",
  imagemUrl: "",
  tag: "Rotina",
  publicado: false,
};

describe("PublicacaoPrevia", () => {
  it("mostra o texto como ele vai sair no site", () => {
    render(<PublicacaoPrevia formulario={FORMULARIO} />);

    expect(
      screen.getByRole("heading", { name: FORMULARIO.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByText(FORMULARIO.resumo)).toBeInTheDocument();
    expect(screen.getByText("Negrito").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("usa a data já gravada, para não inventar a data de publicação", () => {
    render(
      <PublicacaoPrevia
        formulario={FORMULARIO}
        publicadoEm={new Date("2026-08-22T12:00:00")}
      />,
    );

    expect(screen.getByText("22 de agosto de 2026")).toBeInTheDocument();
  });

  it("avisa o que falta em vez de mostrar bloco vazio", () => {
    render(
      <PublicacaoPrevia
        formulario={{ ...FORMULARIO, titulo: "  ", corpo: "  ", tag: "" }}
      />,
    );

    expect(screen.getByText(textos.previa.semTitulo)).toBeInTheDocument();
    expect(screen.getByText(textos.previa.semTexto)).toBeInTheDocument();
  });
});
