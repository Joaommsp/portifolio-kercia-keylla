import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { painel } from "@/content/site";
import { FormacaoForm } from "@/features/formacoes/components/formacao-form";
import { ORDEM_NO_FIM } from "@/features/formacoes/converter";
import {
  ANO_MINIMO_FORMACAO,
  LIMITES_FORMACAO,
  ORDEM_MAXIMA_FORMACAO,
  type FormacaoFormulario,
} from "@/features/formacoes/schemas";
import type { Resultado } from "@/lib/resultado";

const { formacoes: textos } = painel;

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE = "Você não tem permissão para esta operação.";

const aoSalvar = vi.fn<
  (formulario: FormacaoFormulario) => Promise<Resultado<string>>
>();

const valoresIniciais: FormacaoFormulario = {
  titulo: "Pedagogia",
  instituicao: "Universidade Federal",
  descricao: "",
  ano: 2018,
  status: "concluido",
  ordem: 0,
};

const campo = (rotulo: string) => screen.getByLabelText(rotulo);
const salvar = () =>
  screen.getByRole("button", { name: textos.acoes.salvar });

function renderizar(ajustes: Partial<FormacaoFormulario> = {}) {
  return render(
    <FormacaoForm
      emEdicao={false}
      valoresIniciais={{ ...valoresIniciais, ...ajustes }}
      aoSalvar={aoSalvar}
      aoCancelar={vi.fn()}
    />,
  );
}

const formacaoGravada = () => aoSalvar.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  aoSalvar.mockResolvedValue({ dados: "f1" });
});

describe("FormacaoForm", () => {
  it("bloqueia o envio e aponta o campo quando o título passa do limite", async () => {
    renderizar();

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "t".repeat(LIMITES_FORMACAO.titulo + 1) },
    });
    await userEvent.click(salvar());

    expect(
      await screen.findByText(
        `O título deve ter no máximo ${LIMITES_FORMACAO.titulo} caracteres.`,
      ),
    ).toBeInTheDocument();
    expect(aoSalvar).not.toHaveBeenCalled();
    expect(campo(textos.campos.titulo)).toHaveAttribute("aria-invalid", "true");
  });

  it("bloqueia o envio quando o ano está fora do intervalo aceito", async () => {
    renderizar();

    fireEvent.change(campo(textos.campos.ano), {
      target: { value: String(ANO_MINIMO_FORMACAO - 1) },
    });
    await userEvent.click(salvar());

    await waitFor(() =>
      expect(campo(textos.campos.ano)).toHaveAttribute("aria-invalid", "true"),
    );
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("recusa a ordem acima do teto, o que impede gravar o sentinela de ordem", async () => {
    renderizar();

    fireEvent.change(campo(textos.campos.ordem), {
      target: { value: String(ORDEM_NO_FIM) },
    });
    await userEvent.click(salvar());

    expect(
      await screen.findByText(
        `A ordem deve ser no máximo ${ORDEM_MAXIMA_FORMACAO}.`,
      ),
    ).toBeInTheDocument();
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("grava a situação escolhida", async () => {
    renderizar();

    await userEvent.click(
      screen.getByRole("radio", { name: textos.situacoes.em_andamento }),
    );
    await userEvent.click(salvar());

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledTimes(1));
    expect(formacaoGravada().status).toBe("em_andamento");
  });

  it("desabilita todos os controles enquanto salva", async () => {
    let concluir: (resultado: Resultado<string>) => void = () => {};
    aoSalvar.mockImplementation(
      () =>
        new Promise<Resultado<string>>((resolver) => {
          concluir = resolver;
        }),
    );

    renderizar();
    await userEvent.click(salvar());

    await waitFor(() => expect(campo(textos.campos.titulo)).toBeDisabled());
    expect(campo(textos.campos.instituicao)).toBeDisabled();
    expect(campo(textos.campos.descricao)).toBeDisabled();
    expect(campo(textos.campos.ano)).toBeDisabled();
    expect(campo(textos.campos.ordem)).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: textos.situacoes.concluido }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: textos.acoes.emAndamento }),
    ).toBeDisabled();

    concluir({ dados: "f1" });
  });

  it("mantém o preenchido e mostra a mensagem do Firebase quando a gravação falha", async () => {
    aoSalvar.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    renderizar();
    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Pós em Neuropsicologia" },
    });
    await userEvent.click(salvar());

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE),
    );
    expect(campo(textos.campos.titulo)).toHaveValue("Pós em Neuropsicologia");
    expect(campo(textos.campos.titulo)).toBeEnabled();
  });
});
