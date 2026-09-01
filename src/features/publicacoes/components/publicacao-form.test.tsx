import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { painel } from "@/content/site";
import { PublicacaoForm } from "@/features/publicacoes/components/publicacao-form";
import {
  LIMITES_PUBLICACAO,
  type PublicacaoFormulario,
} from "@/features/publicacoes/schemas";
import type { Resultado } from "@/lib/resultado";

const { publicacao: textos } = painel;

/** Mensagem tal como o Firebase a devolve, já traduzida pela camada de erros. */
const ERRO_DO_FIREBASE = "Você não tem permissão para esta operação.";

const aoSalvar = vi.fn<
  (formulario: PublicacaoFormulario) => Promise<Resultado<string>>
>();

const campo = (rotulo: string) => screen.getByLabelText(rotulo);

const botao = (nome: string) => screen.getByRole("button", { name: nome });

/** Preenche os obrigatórios com valores válidos. */
function preencher({
  titulo = "A AT não é babá",
  corpo = "Corpo do texto.",
} = {}) {
  fireEvent.change(campo(textos.campos.titulo), { target: { value: titulo } });
  fireEvent.change(campo(textos.campos.resumo), {
    target: { value: "O que a AT faz na escola." },
  });
  fireEvent.change(campo(textos.campos.corpo), { target: { value: corpo } });
}

const publicacaoGravada = () => aoSalvar.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  aoSalvar.mockResolvedValue({ dados: "p1" });
});

describe("PublicacaoForm", () => {
  it("sugere o slug a partir do título", () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "A AT não é babá!" },
    });

    expect(campo(textos.campos.slug)).toHaveValue("a-at-nao-e-baba");
  });

  it("não sobrescreve o slug que a autora escreveu", () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    fireEvent.change(campo(textos.campos.slug), {
      target: { value: "endereco-escolhido" },
    });
    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Outro título qualquer" },
    });

    expect(campo(textos.campos.slug)).toHaveValue("endereco-escolhido");
  });

  it("preserva o slug já gravado ao editar o título de uma publicação existente", () => {
    render(
      <PublicacaoForm
        aoSalvar={aoSalvar}
        valoresIniciais={{
          titulo: "Título antigo",
          slug: "link-ja-divulgado",
          resumo: "Resumo",
          corpo: "Corpo",
          imagemUrl: "",
          tag: "",
          publicado: true,
        }}
      />,
    );

    fireEvent.change(campo(textos.campos.titulo), {
      target: { value: "Título corrigido" },
    });

    expect(campo(textos.campos.slug)).toHaveValue("link-ja-divulgado");
  });

  it("aceita o título no limite e mostra o contador em 120/120", async () => {
    const noLimite = "t".repeat(LIMITES_PUBLICACAO.titulo);
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher({ titulo: noLimite });
    // Slug curto de propósito: o contador do slug tem o mesmo limite do título.
    fireEvent.change(campo(textos.campos.slug), {
      target: { value: "titulo-no-limite" },
    });

    expect(
      screen.getByText(`${LIMITES_PUBLICACAO.titulo}/${LIMITES_PUBLICACAO.titulo}`),
    ).toBeInTheDocument();

    await userEvent.click(botao(textos.acoes.publicar));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledTimes(1));
    expect(publicacaoGravada().titulo).toBe(noLimite);
  });

  it("bloqueia o envio e aponta o campo quando o título passa do limite", async () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher({ titulo: "t".repeat(LIMITES_PUBLICACAO.titulo + 1) });
    await userEvent.click(botao(textos.acoes.publicar));

    expect(
      await screen.findByText(
        `O título deve ter no máximo ${LIMITES_PUBLICACAO.titulo} caracteres.`,
      ),
    ).toBeInTheDocument();
    expect(aoSalvar).not.toHaveBeenCalled();
    expect(campo(textos.campos.titulo)).toHaveAttribute("aria-invalid", "true");
  });

  it("bloqueia o envio quando o corpo passa do limite", async () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher({ corpo: "c".repeat(LIMITES_PUBLICACAO.corpo + 1) });
    await userEvent.click(botao(textos.acoes.publicar));

    expect(
      await screen.findByText(
        `O corpo do texto deve ter no máximo ${LIMITES_PUBLICACAO.corpo} caracteres.`,
      ),
    ).toBeInTheDocument();
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando a imagem não é uma URL https de host permitido", async () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher();
    fireEvent.change(campo(textos.campos.imagemUrl), {
      target: { value: "http://site-qualquer.com/foto.jpg" },
    });
    await userEvent.click(botao(textos.acoes.publicar));

    await waitFor(() =>
      expect(campo(textos.campos.imagemUrl)).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(aoSalvar).not.toHaveBeenCalled();
  });

  it("publica com publicado verdadeiro", async () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher();
    await userEvent.click(botao(textos.acoes.publicar));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledTimes(1));
    expect(publicacaoGravada().publicado).toBe(true);
  });

  it("salva rascunho com publicado falso", async () => {
    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher();
    await userEvent.click(botao(textos.acoes.rascunho));

    await waitFor(() => expect(aoSalvar).toHaveBeenCalledTimes(1));
    expect(publicacaoGravada().publicado).toBe(false);
  });

  it("desabilita todos os controles enquanto salva", async () => {
    let concluir: (resultado: Resultado<string>) => void = () => {};
    aoSalvar.mockImplementation(
      () =>
        new Promise<Resultado<string>>((resolver) => {
          concluir = resolver;
        }),
    );

    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher();
    await userEvent.click(botao(textos.acoes.publicar));

    await waitFor(() => expect(campo(textos.campos.titulo)).toBeDisabled());
    expect(campo(textos.campos.resumo)).toBeDisabled();
    expect(campo(textos.campos.corpo)).toBeDisabled();
    expect(campo(textos.campos.slug)).toBeDisabled();
    expect(campo(textos.campos.imagemUrl)).toBeDisabled();
    expect(campo(textos.campos.tag)).toBeDisabled();
    expect(botao(textos.acoes.emAndamento)).toBeDisabled();
    expect(botao(textos.acoes.rascunho)).toBeDisabled();

    concluir({ dados: "p1" });
  });

  it("mantém o que foi digitado e mostra a mensagem do Firebase quando a gravação falha", async () => {
    aoSalvar.mockResolvedValue({ erro: ERRO_DO_FIREBASE });

    render(<PublicacaoForm aoSalvar={aoSalvar} />);

    preencher();
    await userEvent.click(botao(textos.acoes.publicar));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE),
    );
    expect(campo(textos.campos.titulo)).toHaveValue("A AT não é babá");
    expect(campo(textos.campos.corpo)).toHaveValue("Corpo do texto.");
    expect(campo(textos.campos.titulo)).toBeEnabled();
  });
});
