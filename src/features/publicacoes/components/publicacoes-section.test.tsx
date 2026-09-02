import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { secaoPublicacoes } from "@/content/site";
import { PublicacoesSection } from "@/features/publicacoes/components/publicacoes-section";
import { type Publicacao } from "@/features/publicacoes/schemas";
import { TETO_DE_PUBLICACOES_NA_HOME } from "@/test/valores-da-spec";

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE = "Você não tem permissão para esta operação.";

/**
 * Frase que a spec escreve por extenso para o estado vazio (PUB-03). É literal
 * de propósito: comparar com `secaoPublicacoes.vazio` moveria os dois lados
 * junto e trocar o texto do site não reprovaria nada.
 */
const MENSAGEM_DE_VAZIO_DA_SPEC = "Nenhuma publicação por aqui ainda.";

function criarPublicacao(indice: number, ajustes: Partial<Publicacao> = {}): Publicacao {
  return {
    id: `p${indice}`,
    titulo: `Publicação ${indice}`,
    slug: `publicacao-${indice}`,
    resumo: `Resumo ${indice}`,
    corpo: "Corpo",
    imagemUrl: "https://images.unsplash.com/foto.jpg",
    tag: null,
    publicado: true,
    publicadoEm: new Date("2026-08-22T03:00:00.000Z"),
    atualizadoEm: null,
    ...ajustes,
  };
}

const criarLista = (quantidade: number) =>
  Array.from({ length: quantidade }, (_, indice) => criarPublicacao(indice + 1));

describe("PublicacoesSection", () => {
  it("lista as publicações recebidas", () => {
    render(<PublicacoesSection resultado={{ dados: criarLista(3) }} />);

    expect(
      screen.getByRole("heading", { name: "Publicação 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Publicação 3" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(MENSAGEM_DE_VAZIO_DA_SPEC)).not.toBeInTheDocument();
  });

  it("mostra no máximo seis cards, mesmo recebendo mais", () => {
    render(<PublicacoesSection resultado={{ dados: criarLista(8) }} />);

    expect(screen.getAllByRole("article")).toHaveLength(
      TETO_DE_PUBLICACOES_NA_HOME,
    );
    expect(
      screen.queryByRole("heading", { name: "Publicação 7" }),
    ).not.toBeInTheDocument();
  });

  it("mostra o aviso de vazio, e não a lista, quando não há publicação", () => {
    render(<PublicacoesSection resultado={{ dados: [] }} />);

    expect(screen.getByText(MENSAGEM_DE_VAZIO_DA_SPEC)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("escreve o aviso de vazio com a frase da spec", () => {
    expect(secaoPublicacoes.vazio).toBe(MENSAGEM_DE_VAZIO_DA_SPEC);
  });

  it("mostra a mensagem devolvida pelo Firebase quando a leitura falha", () => {
    render(<PublicacoesSection resultado={{ erro: ERRO_DO_FIREBASE }} />);

    expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE);
    expect(screen.queryByText(MENSAGEM_DE_VAZIO_DA_SPEC)).not.toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("mantém o título da seção nos três estados, para a âncora do menu existir", () => {
    const titulo = { name: secaoPublicacoes.titulo };

    const { unmount } = render(
      <PublicacoesSection resultado={{ dados: criarLista(1) }} />,
    );
    expect(screen.getByRole("heading", titulo)).toBeInTheDocument();
    unmount();

    const vazio = render(<PublicacoesSection resultado={{ dados: [] }} />);
    expect(screen.getByRole("heading", titulo)).toBeInTheDocument();
    vazio.unmount();

    render(<PublicacoesSection resultado={{ erro: ERRO_DO_FIREBASE }} />);
    expect(screen.getByRole("heading", titulo)).toBeInTheDocument();
  });

  it("renderiza a publicação sem imagem junto das demais, sem quebrar a grade", () => {
    render(
      <PublicacoesSection
        resultado={{
          dados: [criarPublicacao(1, { imagemUrl: null }), criarPublicacao(2)],
        }}
      />,
    );

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
