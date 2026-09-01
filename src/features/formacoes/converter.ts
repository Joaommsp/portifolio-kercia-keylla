/**
 * Conversão entre o documento do Firestore e a formação de domínio.
 *
 * A leitura de cada campo é defensiva (ver `@/lib/documento`): a conversão
 * nunca lança e campo ausente vira o default declarado aqui (FOR-01).
 */

import type {
  Formacao,
  FormacaoFormulario,
  StatusFormacao,
} from "@/features/formacoes/schemas";
import { STATUS_FORMACAO } from "@/features/formacoes/schemas";
import {
  campoNumeroOuNulo,
  campoTexto,
  campoTextoOuNulo,
} from "@/lib/documento";

/**
 * Ordem de quem não tem `ordem` gravada: o maior valor possível, para a
 * formação ir para o fim da lista sem quebrar a ordenação crescente.
 */
export const ORDEM_NO_FIM = Number.MAX_SAFE_INTEGER;

/** Formação sem `status` gravado conta como concluída. */
export const STATUS_PADRAO: StatusFormacao = "concluido";

/** Documento como ele é gravado no Firestore. */
export type DocumentoFormacao = {
  readonly titulo: string;
  readonly instituicao: string;
  readonly descricao: string | null;
  readonly ano: number;
  readonly status: StatusFormacao;
  readonly ordem: number;
};

function campoStatus(valor: unknown): StatusFormacao {
  const conhecido = STATUS_FORMACAO.find((status) => status === valor);
  return conhecido ?? STATUS_PADRAO;
}

/** Converte o documento lido do Firestore na formação de domínio. */
export function paraFormacao(
  id: string,
  dados: Record<string, unknown> | undefined,
): Formacao {
  const documento = dados ?? {};

  return {
    id,
    titulo: campoTexto(documento.titulo),
    instituicao: campoTexto(documento.instituicao),
    descricao: campoTextoOuNulo(documento.descricao),
    ano: campoNumeroOuNulo(documento.ano),
    status: campoStatus(documento.status),
    ordem: campoNumeroOuNulo(documento.ordem) ?? ORDEM_NO_FIM,
  };
}

/** Converte o formulário do painel no documento a gravar. */
export function paraDocumentoDeFormacao(
  formulario: FormacaoFormulario,
): DocumentoFormacao {
  return {
    titulo: campoTexto(formulario.titulo),
    instituicao: campoTexto(formulario.instituicao),
    descricao: campoTextoOuNulo(formulario.descricao),
    ano: formulario.ano,
    status: formulario.status,
    ordem: formulario.ordem,
  };
}

/**
 * Ordena as formações como a home as exibe: `ordem` crescente e, no empate,
 * `ano` decrescente. Formação sem ano fica depois das que têm ano (FOR-01).
 *
 * A regra é pura e mora aqui, e não na leitura, porque o painel precisa da
 * mesma ordem e não pode importar de `queries.ts` (AD-002).
 */
export function ordenarFormacoes(formacoes: readonly Formacao[]): Formacao[] {
  return [...formacoes].sort((a, b) => {
    if (a.ordem !== b.ordem) {
      return a.ordem - b.ordem;
    }

    if (a.ano === b.ano) {
      return 0;
    }

    if (a.ano === null) {
      return 1;
    }

    if (b.ano === null) {
      return -1;
    }

    return b.ano - a.ano;
  });
}

/**
 * Primeira ordem livre da lista: a maior ordem realmente gravada mais um.
 * Documento sem `ordem` não conta — ele carrega o sentinela `ORDEM_NO_FIM`,
 * que é posição de exibição, não valor gravado.
 */
export function proximaOrdem(formacoes: readonly Formacao[]): number {
  const gravadas = formacoes
    .map((formacao) => formacao.ordem)
    .filter((ordem) => ordem !== ORDEM_NO_FIM);

  return gravadas.length === 0 ? 0 : Math.max(...gravadas) + 1;
}

/** Formação em branco, como o formulário do painel começa uma nova. */
export function formacaoEmBranco(
  ordemSugerida: number,
  hoje: Date = new Date(),
): FormacaoFormulario {
  return {
    titulo: "",
    instituicao: "",
    descricao: "",
    ano: hoje.getFullYear(),
    status: STATUS_PADRAO,
    ordem: ordemSugerida,
  };
}

/**
 * Converte a formação lida do Firestore nos valores do formulário.
 *
 * O sentinela `ORDEM_NO_FIM` nunca chega ao formulário: ele significa "este
 * documento não tem ordem gravada", e persisti-lo transformaria uma ausência
 * em um número absurdo dentro do banco. No lugar dele entra a próxima ordem
 * livre da lista (FOR-05).
 */
export function paraFormularioDeFormacao(
  formacao: Formacao,
  ordemSugerida: number,
  hoje: Date = new Date(),
): FormacaoFormulario {
  return {
    titulo: formacao.titulo,
    instituicao: formacao.instituicao,
    descricao: formacao.descricao ?? "",
    ano: formacao.ano ?? hoje.getFullYear(),
    status: formacao.status,
    ordem: formacao.ordem === ORDEM_NO_FIM ? ordemSugerida : formacao.ordem,
  };
}
