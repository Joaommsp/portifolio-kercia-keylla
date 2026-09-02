import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { painel } from "@/content/site";
import { PublicacoesTable } from "@/features/publicacoes/components/publicacoes-table";
import type { Publicacao } from "@/features/publicacoes/schemas";

const { listaDePublicacoes: textos } = painel;

const aoAlternar = vi.fn();
const aoExcluir = vi.fn();

function criarPublicacao(ajustes: Partial<Publicacao> = {}): Publicacao {
  return {
    id: "p1",
    titulo: "A AT não é babá",
    slug: "a-at-nao-e-baba",
    resumo: "Resumo",
    corpo: "Corpo",
    imagemUrl: null,
    tag: null,
    publicado: true,
    publicadoEm: new Date("2026-08-22T03:00:00.000Z"),
    atualizadoEm: null,
    ...ajustes,
  };
}

function renderizar(
  publicacoes: readonly Publicacao[] = [criarPublicacao()],
  idOcupado: string | null = null,
) {
  return render(
    <PublicacoesTable
      publicacoes={publicacoes}
      idOcupado={idOcupado}
      aoAlternar={aoAlternar}
      aoExcluir={aoExcluir}
    />,
  );
}

const botao = (nome: string) => screen.getByRole("button", { name: nome });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PublicacoesTable", () => {
  it("distingue a publicação no ar do rascunho", () => {
    renderizar([
      criarPublicacao({ id: "p1", publicado: true }),
      criarPublicacao({ id: "p2", titulo: "Outra", publicado: false }),
    ]);

    expect(screen.getByText(painel.estados.publicado)).toBeInTheDocument();
    expect(screen.getByText(painel.estados.rascunho)).toBeInTheDocument();
  });

  it("mostra a data de publicação e avisa quando não há", () => {
    renderizar([criarPublicacao({ id: "p1", publicadoEm: null })]);

    expect(screen.getByText(textos.semData)).toBeInTheDocument();
  });

  it("não exclui ao acionar o botão: só abre a confirmação", async () => {
    renderizar();

    await userEvent.click(botao(textos.acoes.excluir));

    expect(aoExcluir).not.toHaveBeenCalled();
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(
      textos.exclusao.titulo,
    );
  });

  it("exclui somente depois da confirmação no diálogo", async () => {
    const publicacao = criarPublicacao();
    renderizar([publicacao]);

    await userEvent.click(botao(textos.acoes.excluir));
    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.exclusao.confirmar,
      }),
    );

    await waitFor(() => expect(aoExcluir).toHaveBeenCalledTimes(1));
    expect(aoExcluir).toHaveBeenCalledWith(publicacao);
  });

  it("não exclui quando a confirmação é cancelada", async () => {
    renderizar();

    await userEvent.click(botao(textos.acoes.excluir));
    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.exclusao.cancelar,
      }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(aoExcluir).not.toHaveBeenCalled();
  });

  it("nunca chama a confirmação nativa do navegador", async () => {
    const confirmNativo = vi.spyOn(window, "confirm");
    renderizar();

    await userEvent.click(botao(textos.acoes.excluir));
    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.exclusao.confirmar,
      }),
    );

    expect(confirmNativo).not.toHaveBeenCalled();
    confirmNativo.mockRestore();
  });

  it("mantém as ações visíveis, sem depender do ponteiro sobre a linha", () => {
    renderizar();

    const excluir = botao(textos.acoes.excluir);
    const alternar = botao(textos.acoes.despublicar);

    expect(excluir).toBeVisible();
    expect(alternar).toBeVisible();
    expect(excluir.className).not.toMatch(/opacity-0|group-hover/);
    expect(alternar.className).not.toMatch(/opacity-0|group-hover/);
  });

  it("oferece publicar para o rascunho e tirar do ar para o que está no ar", async () => {
    const rascunho = criarPublicacao({ publicado: false });
    renderizar([rascunho]);

    await userEvent.click(botao(textos.acoes.publicar));

    expect(aoAlternar).toHaveBeenCalledWith(rascunho);
  });

  it("desabilita as ações da linha ocupada e mostra o andamento", () => {
    renderizar([criarPublicacao({ id: "p1" })], "p1");

    expect(botao(textos.acoes.emAndamento)).toBeDisabled();
    expect(botao(textos.acoes.excluir)).toBeDisabled();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
