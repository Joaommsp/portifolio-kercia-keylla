/**
 * Atributos de link externo. Centraliza o `rel` seguro para nenhum destino de
 * terceiro depender de alguém lembrar de escrevê-lo.
 */
export function propsLinkExterno(externo: boolean) {
  return externo
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
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
