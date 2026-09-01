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
