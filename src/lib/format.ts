/** Fuso usado em toda exibição de data do site. */
const FUSO_HORARIO = "America/Sao_Paulo";
const LOCALE = "pt-BR";

const formatadorDataLonga = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO_HORARIO,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Formata um instante como data por extenso em pt-BR, sempre no fuso de
 * São Paulo — o resultado não depende do fuso da máquina que renderiza.
 */
export function formatDateBR(data: Date): string {
  return formatadorDataLonga.format(data);
}

/** Pontuação que une dois dados na mesma linha ("Instituição · 180 horas"). */
export const SEPARADOR_DE_META = " · ";

/**
 * Junta as partes não vazias de uma linha de metadados. Parte ausente some sem
 * deixar separador solto — a regra do vazio é decidida aqui, e não em cada
 * componente que monta uma linha dessas.
 */
export function juntarMeta(
  ...partes: ReadonlyArray<string | null | undefined>
): string {
  return partes
    .filter((parte): parte is string => typeof parte === "string" && parte !== "")
    .join(SEPARADOR_DE_META);
}

/** `formatDateBR` tolerante a ausência de data: sem data, nada a exibir. */
export function formatDateBROuNulo(data: Date | null): string | null {
  return data === null ? null : formatDateBR(data);
}

/**
 * Converte um texto livre em slug de URL: minúsculo, sem acento e restrito a
 * `[a-z0-9-]`, com hífens colapsados e sem hífen nas pontas.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Formata um número no padrão E.164 brasileiro como telefone legível —
 * `5511987654321` vira `(11) 98765-4321`. Números fora do padrão voltam
 * como vieram, para nunca exibir um telefone truncado.
 */
export function formatarTelefoneBR(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  const nacional = digitos.startsWith("55") ? digitos.slice(2) : digitos;
  const correspondencia = /^(\d{2})(\d{4,5})(\d{4})$/.exec(nacional);

  if (!correspondencia) {
    return numero;
  }

  const [, ddd, prefixo, sufixo] = correspondencia;
  return `(${ddd}) ${prefixo}-${sufixo}`;
}
