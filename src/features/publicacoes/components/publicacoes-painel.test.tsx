import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { toast } from "sonner";

import { painel } from "@/content/site";
import { PublicacoesPainel } from "@/features/publicacoes/components/publicacoes-painel";
// Os avisos de ação viram toast; o `Toaster` mora no layout do painel, então o
// teste observa a chamada em vez de procurar a mensagem no componente.
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const toastDeErro = toast.error as unknown as Mock;

import {
  alternarPublicado,
  excluirPublicacao,
} from "@/features/publicacoes/mutations";
import { listarNoPainel } from "@/features/publicacoes/painel";
import type { Publicacao } from "@/features/publicacoes/schemas";
import type { Resultado } from "@/lib/resultado";

vi.mock("@/features/publicacoes/painel", () => ({
  listarNoPainel: vi.fn(),
}));

vi.mock("@/features/publicacoes/mutations", () => ({
  alternarPublicado: vi.fn(),
  excluirPublicacao: vi.fn(),
}));

const listar = listarNoPainel as unknown as Mock;
const alternar = alternarPublicado as unknown as Mock;
const excluir = excluirPublicacao as unknown as Mock;

const { listaDePublicacoes: textos } = painel;

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE = "Você não tem permissão para esta operação.";

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

const botao = (nome: string) => screen.getByRole("button", { name: nome });

beforeEach(() => {
  vi.clearAllMocks();
  listar.mockResolvedValue({ dados: [criarPublicacao()] });
  alternar.mockResolvedValue({ dados: false });
  excluir.mockResolvedValue({ dados: null });
});

describe("PublicacoesPainel", () => {
  it("avisa que está carregando enquanto a leitura não responde", async () => {
    listar.mockImplementation(
      () => new Promise<Resultado<Publicacao[]>>(() => {}),
    );

    render(<PublicacoesPainel />);

    expect(screen.getByRole("status")).toHaveTextContent(textos.carregando);
  });

  it("lista as publicações, no ar e em rascunho", async () => {
    listar.mockResolvedValue({
      dados: [
        criarPublicacao({ id: "p1", publicado: true }),
        criarPublicacao({
          id: "p2",
          titulo: "Rascunho novo",
          publicado: false,
        }),
      ],
    });

    render(<PublicacoesPainel />);

    expect(await screen.findByText("A AT não é babá")).toBeInTheDocument();
    expect(screen.getByText("Rascunho novo")).toBeInTheDocument();
    expect(screen.getByText(painel.estados.rascunho)).toBeInTheDocument();
  });

  it("mostra a mensagem do Firebase quando a leitura falha", async () => {
    listar.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    render(<PublicacoesPainel />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      ERRO_DO_FIREBASE,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("avisa quando ainda não há publicação, em vez de mostrar uma tabela vazia", async () => {
    listar.mockResolvedValue({ dados: [] });

    render(<PublicacoesPainel />);

    expect(await screen.findByText(textos.vazio)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("alterna o estado da publicação e recarrega a lista", async () => {
    const publicacao = criarPublicacao();
    listar.mockResolvedValue({ dados: [publicacao] });

    render(<PublicacoesPainel />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.acoes.despublicar,
      }),
    );

    await waitFor(() => expect(alternar).toHaveBeenCalledWith(publicacao));
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
  });

  it("exclui a publicação só depois da confirmação e recarrega a lista", async () => {
    render(<PublicacoesPainel />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.acoes.excluir,
      }),
    );
    expect(excluir).not.toHaveBeenCalled();

    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.exclusao.confirmar,
      }),
    );

    await waitFor(() => expect(excluir).toHaveBeenCalledWith("p1"));
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
  });

  it("mostra a mensagem do Firebase quando a ação falha, sem perder a lista", async () => {
    alternar.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    render(<PublicacoesPainel />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.acoes.despublicar,
      }),
    );

    await waitFor(() =>
      expect(toastDeErro).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ description: ERRO_DO_FIREBASE }),
      ),
    );
    expect(screen.getByText("A AT não é babá")).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it("desabilita as ações da linha enquanto a gravação corre", async () => {
    let concluir: (resultado: Resultado<boolean>) => void = () => {};
    alternar.mockImplementation(
      () =>
        new Promise<Resultado<boolean>>((resolver) => {
          concluir = resolver;
        }),
    );

    render(<PublicacoesPainel />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: textos.acoes.despublicar,
      }),
    );

    await waitFor(() => expect(botao(textos.acoes.emAndamento)).toBeDisabled());
    expect(botao(textos.acoes.excluir)).toBeDisabled();

    concluir({ dados: false });
  });
});
