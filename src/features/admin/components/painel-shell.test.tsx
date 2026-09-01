import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { painel } from "@/content/site";
import { PainelShell } from "@/features/admin/components/painel-shell";
import type { Resultado } from "@/lib/resultado";

const CONTEUDO = "Lista de publicações";

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE =
  "Não foi possível falar com o Firebase. Verifique sua conexão e tente de novo.";

const botaoSair = () =>
  screen.getByRole("button", { name: painel.sair.rotulo });

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

  it("encerra a sessão ao acionar sair", async () => {
    const aoSair = vi.fn(async () => ({ dados: null }) as Resultado<null>);
    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await userEvent.click(botaoSair());

    expect(aoSair).toHaveBeenCalledTimes(1);
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

    await userEvent.click(botaoSair());

    const emAndamento = screen.getByRole("button", {
      name: painel.sair.emAndamento,
    });
    expect(emAndamento).toBeDisabled();

    concluir({ dados: null });
  });

  it("mostra a mensagem do Firebase quando a saída falha e devolve o botão", async () => {
    const aoSair = vi.fn(
      async () => ({ erro: ERRO_DO_FIREBASE }) as Resultado<null>,
    );

    render(<PainelShell aoSair={aoSair}>{CONTEUDO}</PainelShell>);

    await userEvent.click(botaoSair());

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE),
    );
    expect(botaoSair()).toBeEnabled();
  });
});
