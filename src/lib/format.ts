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
