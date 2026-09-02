import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, type Mock, vi } from "vitest";

// A falha de saída virou toast; o `Toaster` mora no layout do painel.
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { painel } from "@/content/site";
import { PainelShell } from "@/features/admin/components/painel-shell";
import type { Resultado } from "@/lib/resultado";

const CONTEUDO = "Lista de publicações";

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE =
  "Não foi possível falar com o Firebase. Verifique sua conexão e tente de novo.";

const botaoSair = () =>
  screen.getByRole("button", { name: painel.sair.rotulo });

const toastDeErro = toast.error as unknown as Mock;

/**
 * Sair passa por confirmação: o clique no botão abre o diálogo, e a sessão só
 * termina depois do "Sair" de dentro dele.
 */
async function acionarSaida(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(botaoSair());
  await usuario.click(
    screen.getByRole("button", { name: painel.saida.confirmar }),
  );
}

describe("PainelShell", () => {
  it("mostra o conteúdo e mantém o botão de sair visível", () => {
    render(
      <PainelShell aoSair={vi.fn(async () => ({ dados: null }))}>
        {CONTEUDO}
      </PainelShell>,
    );

    expect(screen.getByText(CONTEUDO)).toBeInTheDocument();

    const sair = botaoSair();
    expect(sair).toBeVisible();
    expect(sair.className).not.toMatch(/opacity-0|group-hover/);
  });

  it("pergunta antes de encerrar a sessão", async () => {
    const aoSair = vi.fn(async () => ({ dados: null }) as Resultado<null>);
    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await userEvent.click(botaoSair());

    // O clique abre a pergunta; a sessão continua de pé até a confirmação.
    expect(
      screen.getByRole("alertdialog", { name: painel.saida.titulo }),
    ).toBeInTheDocument();
    expect(aoSair).not.toHaveBeenCalled();
  });

  it("encerra a sessão só depois da confirmação", async () => {
    const aoSair = vi.fn(async () => ({ dados: null }) as Resultado<null>);
    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await acionarSaida(userEvent.setup());

    expect(aoSair).toHaveBeenCalledTimes(1);
  });

  it("desiste da saída ao cancelar", async () => {
    const aoSair = vi.fn(async () => ({ dados: null }) as Resultado<null>);
    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    const usuario = userEvent.setup();
    await usuario.click(botaoSair());
    await usuario.click(
      screen.getByRole("button", { name: painel.saida.cancelar }),
    );

    expect(aoSair).not.toHaveBeenCalled();
  });

  it("desabilita o botão enquanto a saída está em andamento", async () => {
    let concluir: (resultado: Resultado<null>) => void = () => {};
    const aoSair = vi.fn(
      () =>
        new Promise<Resultado<null>>((resolver) => {
          concluir = resolver;
        }),
    );

    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await acionarSaida(userEvent.setup());

    const emAndamento = screen.getByRole("button", {
      name: painel.sair.emAndamento,
    });
    expect(emAndamento).toBeDisabled();

    concluir({ dados: null });
  });

  it("avisa com a mensagem do Firebase quando a saída falha e devolve o botão", async () => {
    const aoSair = vi.fn(
      async () => ({ erro: ERRO_DO_FIREBASE }) as Resultado<null>,
    );

    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await acionarSaida(userEvent.setup());

    await waitFor(() =>
      expect(toastDeErro).toHaveBeenCalledWith(
        painel.saida.titulo,
        expect.objectContaining({ description: ERRO_DO_FIREBASE }),
      ),
    );
    expect(botaoSair()).toBeEnabled();
  });
});
