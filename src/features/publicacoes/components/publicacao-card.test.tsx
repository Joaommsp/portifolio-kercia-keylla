import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicacaoCard } from "@/features/publicacoes/components/publicacao-card";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { formatDateBR } from "@/lib/format";

const PUBLICADO_EM = new Date("2026-08-22T03:00:00.000Z");

/** Host presente na allowlist de `@/content/imagens`. */
const IMAGEM_PERMITIDA = "https://images.unsplash.com/foto.jpg";

/** Host ausente da allowlist — `next/image` não pode servir de proxy para ele. */
const IMAGEM_DE_HOST_NAO_PERMITIDO = "https://cdn.exemplo-qualquer.com/foto.jpg";

function criarPublicacao(ajustes: Partial<Publicacao> = {}): Publicacao {
  return {
    id: "abc",
    titulo: "Quando a criança diz não",
    slug: "quando-a-crianca-diz-nao",
    resumo: "A recusa raramente é birra.",
    corpo: "# Texto",
    imagemUrl: IMAGEM_PERMITIDA,
    tag: "Rotina",
    publicado: true,
    publicadoEm: PUBLICADO_EM,
    atualizadoEm: null,
    ...ajustes,
  };
}

describe("PublicacaoCard", () => {
  it("mostra título, resumo, tag e a data formatada, ligando para o detalhe", () => {
    render(<PublicacaoCard publicacao={criarPublicacao()} />);

    expect(
      screen.getByRole("heading", { name: "Quando a criança diz não" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A recusa raramente é birra.")).toBeInTheDocument();
    expect(screen.getByText("Rotina")).toBeInTheDocument();
    expect(screen.getByText(formatDateBR(PUBLICADO_EM))).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/publicacoes/quando-a-crianca-diz-nao",
    );
  });

  it("exibe a imagem com o título como texto alternativo", () => {
    render(<PublicacaoCard publicacao={criarPublicacao()} />);

    expect(
      screen.getByRole("img", { name: "Quando a criança diz não" }),
    ).toBeInTheDocument();
  });

  it("renderiza só texto quando a publicação não tem imagem", () => {
    render(
      <PublicacaoCard publicacao={criarPublicacao({ imagemUrl: null })} />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Quando a criança diz não" }),
    ).toBeInTheDocument();
  });

  it("ignora a imagem de host fora da allowlist, sem quebrar o card", () => {
    render(
      <PublicacaoCard
        publicacao={criarPublicacao({
          imagemUrl: IMAGEM_DE_HOST_NAO_PERMITIDO,
        })}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("A recusa raramente é birra.")).toBeInTheDocument();
  });

  it("omite a faixa de data e tag quando a publicação não tem nenhuma das duas", () => {
    render(
      <PublicacaoCard
        publicacao={criarPublicacao({ publicadoEm: null, tag: null })}
      />,
    );

    expect(screen.queryByText("Rotina")).not.toBeInTheDocument();
    expect(
      screen.queryByText(formatDateBR(PUBLICADO_EM)),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Quando a criança diz não" }),
    ).toBeInTheDocument();
  });
});
