import { screen } from "@testing-library/react";
import { renderizarNoPainel } from "@/test/painel";
import { usePathname, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { painel } from "@/content/site";
import { PainelGuard } from "@/features/admin/components/painel-guard";
import { useAuth, type Sessao } from "@/hooks/use-auth";
import { CAMINHO_LOGIN, CAMINHO_PAINEL } from "@/lib/rotas";
import { criarUsuarioFalso } from "@/test/auth";

vi.mock("@/hooks/use-auth", () => ({ useAuth: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

const useAuthFalso = useAuth as unknown as Mock;
const usePathnameFalso = usePathname as unknown as Mock;
const useRouterFalso = useRouter as unknown as Mock;

const substituir = vi.fn();

/** Texto que só pode aparecer quando o painel está liberado. */
const CONTEUDO_DO_PAINEL = "Lista de publicações";

function definirSessao(sessao: Partial<Sessao>) {
  useAuthFalso.mockReturnValue({
    usuario: null,
    carregando: false,
    erro: null,
    sair: vi.fn(async () => ({ dados: null })),
    ...sessao,
  });
}

function renderizar(caminho: string = CAMINHO_PAINEL) {
  usePathnameFalso.mockReturnValue(caminho);
  return renderizarNoPainel(<PainelGuard>{CONTEUDO_DO_PAINEL}</PainelGuard>);
}

beforeEach(() => {
  vi.clearAllMocks();
  useRouterFalso.mockReturnValue({ replace: substituir, push: vi.fn() });
});

describe("PainelGuard", () => {
  it("não mostra nada do painel enquanto a sessão carrega", () => {
    definirSessao({ carregando: true });

    renderizar();

    expect(screen.queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      painel.verificandoSessao,
    );
    expect(substituir).not.toHaveBeenCalled();
  });

  it("manda para o login e esconde o conteúdo quando não há sessão", () => {
    definirSessao({ usuario: null });

    renderizar();

    expect(substituir).toHaveBeenCalledWith(CAMINHO_LOGIN);
    expect(screen.queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument();
  });

  it("libera o painel, com a moldura, quando existe sessão", () => {
    definirSessao({ usuario: criarUsuarioFalso() });

    renderizar();

    expect(screen.getByText(CONTEUDO_DO_PAINEL)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: painel.sair.rotulo }),
    ).toBeInTheDocument();
    expect(substituir).not.toHaveBeenCalled();
  });

  it("renderiza a tela de login sem redirecionar, para não entrar em laço", () => {
    definirSessao({ usuario: null });

    renderizar(CAMINHO_LOGIN);

    expect(screen.getByText(CONTEUDO_DO_PAINEL)).toBeInTheDocument();
    expect(substituir).not.toHaveBeenCalled();
  });

  it("tira do login quem já está autenticada", () => {
    definirSessao({ usuario: criarUsuarioFalso() });

    renderizar(CAMINHO_LOGIN);

    expect(substituir).toHaveBeenCalledWith(CAMINHO_PAINEL);
    expect(screen.queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument();
  });

  it("mostra a mensagem do Firebase, sem redirecionar, quando a sessão não pode ser consultada", () => {
    const mensagem =
      "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_API_KEY.";
    definirSessao({ erro: mensagem });

    renderizar();

    expect(screen.getByRole("alert")).toHaveTextContent(mensagem);
    expect(screen.queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument();
    expect(substituir).not.toHaveBeenCalled();
  });
});
