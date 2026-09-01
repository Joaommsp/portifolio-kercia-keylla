/**
 * Atributos de link externo. Centraliza o `rel` seguro para nenhum destino de
 * terceiro depender de alguém lembrar de escrevê-lo.
 */
export function propsLinkExterno(externo: boolean) {
  return externo
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
}
