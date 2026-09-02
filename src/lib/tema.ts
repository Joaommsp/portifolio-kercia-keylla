/**
 * Cores em hex literal, para os dois lugares que rodam fora do CSS da página e
 * por isso não enxergam os tokens do tema:
 *
 * - a meta `theme-color`, que pinta a interface do navegador;
 * - o `opengraph-image`, gerado no servidor pelo Satori.
 *
 * É a única porta autorizada a repetir a paleta em hex.
 * `src/test/paleta-aprovada.test.ts` trava cada valor contra o token
 * correspondente — mudar um sem o outro reprova.
 */
export const CORES_EM_HEX = {
  ground: "#EDF3E4",
  surface: "#F7FBF1",
  olive: "#4C5B34",
  brass: "#786418",
  ink: "#2B3322",
  "ink-soft": "#5B6749",
  line: "#D2DEC0",
} as const;

/** Cor da interface do navegador: acompanha o fundo da página. */
export const COR_DA_INTERFACE = CORES_EM_HEX.ground;
