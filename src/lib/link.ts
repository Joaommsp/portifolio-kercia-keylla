/**
 * Atributos de quem abre em aba nova. Centraliza o `rel` seguro para nenhum
 * destino depender de alguém lembrar de escrevê-lo.
 *
 * Vale também para destino interno aberto em aba nova — o painel faz isso para
 * a autora conferir o texto no site sem perder o que está editando.
 */
export const PROPS_NOVA_ABA = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/** Opções do `window.open` com a mesma proteção de `PROPS_NOVA_ABA`. */
export const OPCOES_NOVA_ABA = "noopener,noreferrer";

/** Atributos de link externo. */
export function propsLinkExterno(externo: boolean) {
  return externo ? PROPS_NOVA_ABA : {};
}

/**
 * Um destino é externo quando sai do site. Caminho interno (`/publicacoes/x`),
 * âncora (`#contato`) e link relativo continuam na mesma aba — abrir aba nova
 * para navegação interna é ruído, não segurança.
 */
export function ehDestinoExterno(href: string | undefined): boolean {
  if (href === undefined) {
    return false;
  }

  return /^[a-z][a-z0-9+.-]*:\/\//i.test(href);
}
