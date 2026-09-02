import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicacaoArtigo } from "@/features/publicacoes/components/publicacao-artigo";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { formatDateBR } from "@/lib/format";

const PUBLICADO_EM = new Date("2026-08-22T03:00:00.000Z");

/** Host presente na allowlist de `@/content/imagens`. */
const IMAGEM_PERMITIDA = "https://images.unsplash.com/foto.jpg";

/** Host ausente da allowlist. */
const IMAGEM_DE_HOST_NAO_PERMITIDO =
  "https://cdn.exemplo-qualquer.com/foto.jpg";

function criarPublicacao(ajustes: Partial<Publicacao> = {}): Publicacao {
  return {
    id: "abc",
    titulo: "Quando a criança diz não",
    slug: "quando-a-crianca-diz-nao",
    resumo: "A recusa raramente é birra.",
    corpo: "## Rotina\n\nTexto do corpo.",
    imagemUrl: IMAGEM_PERMITIDA,
    tag: "Rotina",
    publicado: true,
    publicadoEm: PUBLICADO_EM,
    atualizadoEm: null,
    ...ajustes,
  };
}

describe("PublicacaoArtigo", () => {
  it("mostra título, resumo, a linha de meta e o corpo em markdown", () => {
    render(<PublicacaoArtigo publicacao={criarPublicacao()} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Quando a criança diz não",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("A recusa raramente é birra.")).toBeInTheDocument();
    expect(
      screen.getByText(`${formatDateBR(PUBLICADO_EM)} · Rotina`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Rotina" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Texto do corpo.")).toBeInTheDocument();
  });

  it("exibe a imagem de topo com o título como texto alternativo", () => {
    render(<PublicacaoArtigo publicacao={criarPublicacao()} />);

    expect(
      screen.getByRole("img", { name: "Quando a criança diz não" }),
    ).toBeInTheDocument();
  });

  it("omite a linha de meta quando não há data nem tag", () => {
    render(
      <PublicacaoArtigo
        publicacao={criarPublicacao({ publicadoEm: null, tag: null })}
      />,
    );

    expect(
      screen.queryByText(new RegExp(formatDateBR(PUBLICADO_EM))),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Quando a criança diz não",
      }),
    ).toBeInTheDocument();
  });

  it("mostra só a data quando a publicação não tem tag, sem separador solto", () => {
    render(<PublicacaoArtigo publicacao={criarPublicacao({ tag: null })} />);

    expect(screen.getByText(formatDateBR(PUBLICADO_EM))).toBeInTheDocument();
  });

  it("renderiza sem imagem quando a publicação não tem imagem", () => {
    render(
      <PublicacaoArtigo publicacao={criarPublicacao({ imagemUrl: null })} />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("ignora a imagem de host fora da allowlist", () => {
    render(
      <PublicacaoArtigo
        publicacao={criarPublicacao({
          imagemUrl: IMAGEM_DE_HOST_NAO_PERMITIDO,
        })}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Texto do corpo.")).toBeInTheDocument();
  });
});
