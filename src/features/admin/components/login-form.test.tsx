import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { painel } from "@/content/site";
import { entrar } from "@/features/admin/auth";
import { LoginForm } from "@/features/admin/components/login-form";
import type { Resultado } from "@/lib/resultado";
import { CAMINHO_PAINEL } from "@/lib/rotas";

vi.mock("@/features/admin/auth", () => ({ entrar: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

const entrarFalso = entrar as unknown as Mock;
const useRouterFalso = useRouter as unknown as Mock;
const substituir = vi.fn();

const { login } = painel;

/** Mensagem que o Firebase devolve para credencial recusada, já traduzida. */
const CREDENCIAL_RECUSADA = "E-mail ou senha incorretos.";

const campoEmail = () => screen.getByLabelText(login.email.rotulo);
const campoSenha = () => screen.getByLabelText(login.senha.rotulo);
const botaoEntrar = () =>
  screen.getByRole("button", { name: login.acao.rotulo });

async function preencherEEnviar() {
  await userEvent.type(campoEmail(), "keylla@exemplo.com.br");
  await userEvent.type(campoSenha(), "senha-secreta");
  await userEvent.click(botaoEntrar());
}

beforeEach(() => {
  vi.clearAllMocks();
  useRouterFalso.mockReturnValue({ replace: substituir, push: vi.fn() });
  entrarFalso.mockResolvedValue({ dados: null });
});

describe("LoginForm", () => {
  it("não limita o tamanho do e-mail nem o da senha", () => {
    render(<LoginForm />);

    expect(campoEmail()).not.toHaveAttribute("maxLength");
    expect(campoSenha()).not.toHaveAttribute("maxLength");
  });

  it("leva para o painel quando o Firebase aceita as credenciais", async () => {
    render(<LoginForm />);

    await preencherEEnviar();

    expect(entrarFalso).toHaveBeenCalledWith(
      "keylla@exemplo.com.br",
      "senha-secreta",
    );
    await waitFor(() =>
      expect(substituir).toHaveBeenCalledWith(CAMINHO_PAINEL),
    );
  });

  it("mostra a mensagem traduzida quando o Firebase recusa a credencial", async () => {
    entrarFalso.mockResolvedValue({ erro: CREDENCIAL_RECUSADA });

    render(<LoginForm />);
    await preencherEEnviar();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(CREDENCIAL_RECUSADA),
    );
    expect(substituir).not.toHaveBeenCalled();
  });

  it("mantém o que foi digitado quando a entrada falha", async () => {
    entrarFalso.mockResolvedValue({ erro: CREDENCIAL_RECUSADA });

    render(<LoginForm />);
    await preencherEEnviar();

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(campoEmail()).toHaveValue("keylla@exemplo.com.br");
    expect(campoSenha()).toHaveValue("senha-secreta");
  });

  it("desabilita os controles enquanto a entrada está em andamento", async () => {
    let concluir: (resultado: Resultado<null>) => void = () => {};
    entrarFalso.mockImplementation(
      () =>
        new Promise<Resultado<null>>((resolver) => {
          concluir = resolver;
        }),
    );

    render(<LoginForm />);
    await preencherEEnviar();

    await waitFor(() => expect(campoEmail()).toBeDisabled());
    expect(campoSenha()).toBeDisabled();
    expect(
      screen.getByRole("button", { name: login.acao.emAndamento }),
    ).toBeDisabled();

    concluir({ dados: null });
  });

  it("bloqueia o envio e aponta o campo quando falta e-mail ou senha", async () => {
    render(<LoginForm />);

    await userEvent.click(botaoEntrar());

    expect(await screen.findByText(login.email.obrigatorio)).toBeInTheDocument();
    expect(screen.getByText(login.senha.obrigatorio)).toBeInTheDocument();
    expect(entrarFalso).not.toHaveBeenCalled();
    expect(campoEmail()).toHaveAttribute("aria-invalid", "true");
  });
});
