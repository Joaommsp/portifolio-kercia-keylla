/**
 * Resultado de uma leitura de dados.
 *
 * Leitura nunca lança: ou traz `dados`, ou traz `erro` com a mensagem fiel ao
 * que a origem respondeu. Assim uma falha do Firestore degrada a seção em vez
 * de derrubar a página inteira (PUB-05, FOR-03).
 */
export type Resultado<T> = { readonly dados: T } | { readonly erro: string };
