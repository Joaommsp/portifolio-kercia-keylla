/**
 * Contrato de uma formação: limites de campo, validação e tipos (FOR-05).
 */

import { z } from "zod/v4";

import { textoObrigatorio, textoOpcional } from "@/lib/validacao";

/** Nome da coleção no Firestore. */
export const COLECAO_FORMACOES = "formacoes";

/** Limites de tamanho de cada campo de texto, em caracteres. */
export const LIMITES_FORMACAO = {
  titulo: 120,
  instituicao: 120,
  descricao: 220,
} as const;

/** Estados possíveis de uma formação. */
export const STATUS_FORMACAO = ["concluido", "em_andamento"] as const;

export type StatusFormacao = (typeof STATUS_FORMACAO)[number];

/** Primeiro ano aceito — antes disso é digitação errada, não trajetória. */
export const ANO_MINIMO_FORMACAO = 1970;

/** Margem para curso que já tem previsão de conclusão futura. */
export const ANOS_DE_MARGEM_FUTURA = 10;

/** Maior ano aceito, calculado no momento da validação. */
export function anoMaximoFormacao(hoje: Date = new Date()): number {
  return hoje.getFullYear() + ANOS_DE_MARGEM_FUTURA;
}

const anoSchema = z
  .number({ message: "Informe o ano." })
  .int({ message: "O ano deve ser um número inteiro." })
  .superRefine((ano, ctx) => {
    const maximo = anoMaximoFormacao();

    if (ano < ANO_MINIMO_FORMACAO || ano > maximo) {
      ctx.addIssue({
        code: "custom",
        message: `O ano deve estar entre ${ANO_MINIMO_FORMACAO} e ${maximo}.`,
      });
    }
  });

export const formacaoSchema = z.object({
  titulo: textoObrigatorio("o título", LIMITES_FORMACAO.titulo),
  instituicao: textoObrigatorio("a instituição", LIMITES_FORMACAO.instituicao),
  descricao: textoOpcional("a descrição", LIMITES_FORMACAO.descricao),
  ano: anoSchema,
  status: z.enum(STATUS_FORMACAO, {
    message: "Escolha se a formação está concluída ou em andamento.",
  }),
  ordem: z
    .number({ message: "Informe a ordem." })
    .int({ message: "A ordem deve ser um número inteiro." })
    .min(0, { message: "A ordem não pode ser negativa." }),
});

/** Dados como o formulário do painel os manipula: texto vazio, nunca `null`. */
export type FormacaoFormulario = z.infer<typeof formacaoSchema>;

/** Formação já convertida do Firestore, como as telas públicas a consomem. */
export type Formacao = {
  readonly id: string;
  readonly titulo: string;
  readonly instituicao: string;
  readonly descricao: string | null;
  readonly ano: number | null;
  readonly status: StatusFormacao;
  readonly ordem: number;
};
