/**
 * Leitura defensiva de campo vindo do Firestore.
 *
 * O documento é dado externo — pode ter sido gravado por uma versão anterior
 * do painel e vir sem um campo, ou com o tipo trocado. Estes leitores nunca
 * lançam: devolvem o default do tipo, e ausência de valor vira `null` em vez
 * de zero, string vazia ou data inválida.
 */

/** Objeto que expõe `toDate()` — é assim que o Timestamp do Firestore chega. */
type ComToDate = { toDate: () => Date };

function temToDate(valor: unknown): valor is ComToDate {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "toDate" in valor &&
    typeof (valor as ComToDate).toDate === "function"
  );
}

/** Texto aparado; qualquer outro tipo vira string vazia. */
export function campoTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Texto opcional: ausente e em branco são a mesma coisa — `null`. */
export function campoTextoOuNulo(valor: unknown): string | null {
  const limpo = campoTexto(valor);
  return limpo === "" ? null : limpo;
}

/** Só o booleano `true` conta como verdadeiro; ausência é `false`. */
export function campoBooleano(valor: unknown): boolean {
  return valor === true;
}

/** Número finito; ausência vira `null`, nunca zero. */
export function campoNumeroOuNulo(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

/**
 * Data a partir de Timestamp do Firestore ou de `Date`. Qualquer outra coisa —
 * inclusive uma data inválida — vira `null`, para ausência de data nunca ser
 * confundida com uma data real.
 */
export function campoData(valor: unknown): Date | null {
  const data = temToDate(valor)
    ? valor.toDate()
    : valor instanceof Date
      ? valor
      : null;

  if (data === null || Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}
