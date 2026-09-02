import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { toast } from "sonner";

import { painel } from "@/content/site";
import { PublicacaoEditor } from "@/features/publicacoes/components/publicacao-editor";

// A falha de gravação virou toast; a falha de LEITURA continua na tela, porque
// ali não há o que a autora possa corrigir sem a mensagem à vista.
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const toastDeErro = toast.error as unknown as Mock;
import {
  atualizarPublicacao,
  criarPublicacao,
} from "@/features/publicacoes/mutations";
import { obterNoPainel } from "@/features/publicacoes/painel";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { CAMINHO_PAINEL, ID_NOVA_PUBLICACAO } from "@/lib/rotas";

vi.mock("@/features/publicacoes/painel", () => ({ obterNoPainel: vi.fn() }));

vi.mock("@/features/publicacoes/mutations", () => ({
  criarPublicacao: vi.fn(),
  atualizarPublicacao: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const obter = obterNoPainel as unknown as Mock;
const criar = criarPublicacao as unknown as Mock;
const atualizar = atualizarPublicacao as unknown as Mock;
const useRouterFalso = useRouter as unknown as Mock;
const empurrar = vi.fn();

const { publicacao: textos } = painel;

const publicadoEm = new Date("2026-08-22T03:00:00.000Z");

const publicacao: Publicacao = {
  id: "p1",
  titulo: "A AT não é babá",
  slug: "a-at-nao-e-baba",
  resumo: "Resumo",
  corpo: "Corpo",
  imagemUrl: null,
  tag: null,
  publicado: true,
  publicadoEm,
  atualizadoEm: null,
};

const campo = (rotulo: string) => screen.getByLabelText(rotulo);

beforeEach(() => {
  vi.clearAllMocks();
  useRouterFalso.mockReturnValue({ push: empurrar, replace: vi.fn() });
  obter.mockResolvedValue({ dados: publicacao });
  criar.mockResolvedValue({ dados: "novo-id" });
  atualizar.mockResolvedValue({ dados: "p1" });
});

describe("PublicacaoEditor", () => {
  it("abre o formulário em branco quando o id é o de publicação nova", () => {
    render(<PublicacaoEditor id={ID_NOVA_PUBLICACAO} />);

    expect(campo(textos.campos.titulo)).toHaveValue("");
    expect(obter).not.toHaveBeenCalled();
  });

  it("carrega a publicação existente no formulário", async () => {
    render(<PublicacaoEditor id="p1" />);

    await waitFor(() =>
      expect(campo(textos.campos.titulo)).toHaveValue("A AT não é babá"),
    );
    expect(obter).toHaveBeenCalledWith("p1");
  });

  it("avisa que a publicação não existe, em vez de mostrar tela em branco", async () => {
    obter.mockResolvedValue({ dados: null });

    render(<PublicacaoEditor id="sumida" />);

    expect(await screen.findByText(textos.naoEncontrada)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(textos.campos.titulo),
    ).not.toBeInTheDocument();
  });

  it("mostra a mensagem do Firebase quando a leitura falha", async () => {
    obter.mockResolvedValue({
      erro: "Você não tem permissão para esta operação.",
    });

    render(<PublicacaoEditor id="p1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não tem permissão para esta operação.",
    );
  });

  it("cria a publicação e volta para a lista", async () => {
    render(<PublicacaoEditor id={ID_NOVA_PUBLICACAO} />);

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Texto novo" },
    });
    fireEvent.change(campo(textos.campos.resumo), {
      target: { value: "Resumo do texto." },
    });
    fireEvent.change(campo(textos.campos.corpo), {
      target: { value: "Corpo do texto." },
    });

    await userEvent.click(
      screen.getByRole("button", { name: textos.acoes.publicar }),
    );

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    expect(empurrar).toHaveBeenCalledWith(CAMINHO_PAINEL);
  });

  it("atualiza preservando a data de publicação já gravada", async () => {
    render(<PublicacaoEditor id="p1" />);

    await waitFor(() =>
      expect(campo(textos.campos.titulo)).toHaveValue("A AT não é babá"),
    );

    await userEvent.click(
      screen.getByRole("button", { name: textos.acoes.publicar }),
    );

    await waitFor(() =>
      expect(atualizar).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ slug: "a-at-nao-e-baba" }),
        publicadoEm,
      ),
    );
    expect(empurrar).toHaveBeenCalledWith(CAMINHO_PAINEL);
  });

  it("não sai da tela quando a gravação falha", async () => {
    criar.mockResolvedValue({
      erro: "Você não tem permissão para esta operação.",
    });

    render(<PublicacaoEditor id={ID_NOVA_PUBLICACAO} />);

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Texto novo" },
    });
    fireEvent.change(campo(textos.campos.resumo), {
      target: { value: "Resumo do texto." },
    });
    fireEvent.change(campo(textos.campos.corpo), {
      target: { value: "Corpo do texto." },
    });

    await userEvent.click(
      screen.getByRole("button", { name: textos.acoes.publicar }),
    );

    await waitFor(() =>
      expect(toastDeErro).toHaveBeenCalledWith(
        painel.avisos.naoSalvou,
        expect.objectContaining({
          description: "Você não tem permissão para esta operação.",
        }),
      ),
    );
    expect(empurrar).not.toHaveBeenCalled();
    expect(campo(textos.campos.titulo)).toHaveValue("Texto novo");
  });

  it("pergunta antes de sair com alteração pendente", async () => {
    obter.mockResolvedValue({ dados: publicacao });
    render(<PublicacaoEditor id="p1" />);
    await screen.findByLabelText(textos.campos.titulo);

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Título mudado" },
    });

    await userEvent.click(
      screen.getByRole("button", { name: textos.acoes.voltar }),
    );

    expect(
      screen.getByRole("alertdialog", { name: painel.semSalvar.titulo }),
    ).toBeInTheDocument();
    expect(empurrar).not.toHaveBeenCalled();
  });

  it("volta direto quando não há nada pendente", async () => {
    obter.mockResolvedValue({ dados: publicacao });
    render(<PublicacaoEditor id="p1" />);
    await screen.findByLabelText(textos.campos.titulo);

    await userEvent.click(
      screen.getByRole("button", { name: textos.acoes.voltar }),
    );

    expect(empurrar).toHaveBeenCalledWith(CAMINHO_PAINEL);
  });
});
