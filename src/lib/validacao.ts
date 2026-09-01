/**
 * Peças de validação compartilhadas pelos schemas de domínio.
 *
 * O limite de cada campo continua declarado no schema que o usa; aqui mora só
 * a forma da regra e o texto da mensagem, para publicações e formações
 * recusarem um campo longo com a mesma frase.
 */

import { z } from "zod/v4";

/** "o título" → "O título", para abrir a frase da mensagem. */
function comInicialMaiuscula(rotulo: string): string {
  if (rotulo === "") {
    return rotulo;
  }

  return `${rotulo[0].toUpperCase()}${rotulo.slice(1)}`;
}

function mensagemDeLimite(rotulo: string, limite: number): string {
  return `${comInicialMaiuscula(rotulo)} deve ter no máximo ${limite} caracteres.`;
}

/**
 * Texto obrigatório e limitado. O rótulo entra na mensagem com artigo —
 * `"o título"` vira "Informe o título." e "O título deve ter no máximo…".
 */
export function textoObrigatorio(rotulo: string, limite: number) {
  return z
    .string()
    .trim()
    .min(1, { message: `Informe ${rotulo}.` })
    .max(limite, { message: mensagemDeLimite(rotulo, limite) });
}

/** Texto opcional e limitado: em branco é ausência de valor, não erro. */
export function textoOpcional(rotulo: string, limite: number) {
  return z
    .string()
    .trim()
    .max(limite, { message: mensagemDeLimite(rotulo, limite) });
}
