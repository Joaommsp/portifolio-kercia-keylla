import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { painel } from "@/content/site";
import { FormacoesPainel } from "@/features/formacoes/components/formacoes-painel";
import { ORDEM_NO_FIM, paraFormacao } from "@/features/formacoes/converter";
import {
  atualizarFormacao,
  criarFormacao,
  excluirFormacao,
} from "@/features/formacoes/mutations";
import { listarNoPainel } from "@/features/formacoes/painel";
import type { Formacao } from "@/features/formacoes/schemas";
import type { Resultado } from "@/lib/resultado";

vi.mock("@/features/formacoes/painel", () => ({ listarNoPainel: vi.fn() }));

vi.mock("@/features/formacoes/mutations", () => ({
  criarFormacao: vi.fn(),
  atualizarFormacao: vi.fn(),
  excluirFormacao: vi.fn(),
}));

const listar = listarNoPainel as unknown as Mock;
const criar = criarFormacao as unknown as Mock;
const atualizar = atualizarFormacao as unknown as Mock;
const excluir = excluirFormacao as unknown as Mock;

const { formacoes: textos } = painel;

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE = "Você não tem permissão para esta operação.";

const formacao = (
  id: string,
  dados: Record<string, unknown> = {},
): Formacao =>
  paraFormacao(id, {
    titulo: `Curso ${id}`,
    instituicao: "Universidade Federal",
    ano: 2018,
    status: "concluido",
    ordem: 0,
    ...dados,
  });

const campo = (rotulo: string) => screen.getByLabelText(rotulo);
const botao = (nome: string) => screen.getByRole("button", { name: nome });

beforeEach(() => {
  vi.clearAllMocks();
  listar.mockResolvedValue({ dados: [formacao("f1")] });
  criar.mockResolvedValue({ dados: "novo-id" });
  atualizar.mockResolvedValue({ dados: "f1" });
  excluir.mockResolvedValue({ dados: null });
});

describe("FormacoesPainel", () => {
  it("avisa que está carregando enquanto a leitura não responde", () => {
    listar.mockImplementation(() => new Promise<Resultado<Formacao[]>>(() => {}));

    render(<FormacoesPainel />);

    expect(screen.getByRole("status")).toHaveTextContent(textos.carregando);
  });

  it("mostra a mensagem do Firebase quando a leitura falha", async () => {
    listar.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    render(<FormacoesPainel />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      ERRO_DO_FIREBASE,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("avisa quando ainda não há formação, em vez de mostrar uma tabela vazia", async () => {
    listar.mockResolvedValue({ dados: [] });

    render(<FormacoesPainel />);

    expect(await screen.findByText(textos.vazio)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("cria a formação com o que foi preenchido e recarrega a lista", async () => {
    listar.mockResolvedValue({ dados: [] });

    render(<FormacoesPainel />);
    await screen.findByText(textos.vazio);

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Pós em Neuropsicologia" },
    });
    fireEvent.change(campo(textos.campos.instituicao), {
      target: { value: "Universidade Exemplo" },
    });
    await userEvent.click(botao(textos.acoes.salvar));

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    expect(criar.mock.calls[0][0]).toMatchObject({
      titulo: "Pós em Neuropsicologia",
      instituicao: "Universidade Exemplo",
      ordem: 0,
    });
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
  });

  it("sugere a próxima ordem livre da lista já carregada, e não zero", async () => {
    listar.mockResolvedValue({
      dados: [formacao("f1", { ordem: 0 }), formacao("f2", { ordem: 4 })],
    });

    render(<FormacoesPainel />);

    await waitFor(() =>
      expect(campo(textos.campos.ordem)).toHaveValue(5),
    );

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Pós em Neuropsicologia" },
    });
    fireEvent.change(campo(textos.campos.instituicao), {
      target: { value: "Universidade Exemplo" },
    });
    await userEvent.click(botao(textos.acoes.salvar));

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    expect(criar.mock.calls[0][0].ordem).toBe(5);
  });

  it("carrega a formação escolhida no formulário e atualiza pelo id dela", async () => {
    render(<FormacoesPainel />);

    await userEvent.click(await screen.findByRole("button", {
      name: textos.acoes.editar,
    }));

    expect(campo(textos.campos.titulo)).toHaveValue("Curso f1");

    await userEvent.click(botao(textos.acoes.salvar));

    await waitFor(() => expect(atualizar).toHaveBeenCalledTimes(1));
    expect(atualizar.mock.calls[0][0]).toBe("f1");
    expect(criar).not.toHaveBeenCalled();
  });

  it("nunca persiste o sentinela de ordem da formação gravada sem ordem", async () => {
    const semOrdem = formacao("f1", { ordem: null });
    listar.mockResolvedValue({ dados: [semOrdem] });

    render(<FormacoesPainel />);

    await userEvent.click(await screen.findByRole("button", {
      name: textos.acoes.editar,
    }));

    expect(campo(textos.campos.ordem)).toHaveValue(0);

    await userEvent.click(botao(textos.acoes.salvar));

    await waitFor(() => expect(atualizar).toHaveBeenCalledTimes(1));
    expect(atualizar.mock.calls[0][1].ordem).toBe(0);
    expect(atualizar.mock.calls[0][1].ordem).not.toBe(ORDEM_NO_FIM);
  });

  it("exclui a formação só depois da confirmação e recarrega a lista", async () => {
    render(<FormacoesPainel />);

    await userEvent.click(await screen.findByRole("button", {
      name: textos.acoes.excluir,
    }));
    expect(excluir).not.toHaveBeenCalled();

    await userEvent.click(await screen.findByRole("button", {
      name: textos.exclusao.confirmar,
    }));

    await waitFor(() => expect(excluir).toHaveBeenCalledWith("f1"));
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
  });

  it("não exclui quando a confirmação é cancelada", async () => {
    render(<FormacoesPainel />);

    await userEvent.click(await screen.findByRole("button", {
      name: textos.acoes.excluir,
    }));
    await userEvent.click(await screen.findByRole("button", {
      name: textos.exclusao.cancelar,
    }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(excluir).not.toHaveBeenCalled();
  });

  it("mostra a mensagem do Firebase quando a exclusão falha, sem perder a lista", async () => {
    excluir.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    render(<FormacoesPainel />);

    await userEvent.click(await screen.findByRole("button", {
      name: textos.acoes.excluir,
    }));
    await userEvent.click(await screen.findByRole("button", {
      name: textos.exclusao.confirmar,
    }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE),
    );
    expect(screen.getByText("Curso f1")).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(1);
  });
});
