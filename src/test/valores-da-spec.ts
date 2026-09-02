/**
 * Números que a spec de `site-portfolio` escreve por extenso.
 *
 * Ficam aqui, longe da implementação, porque teste que compara o comportamento
 * com a mesma constante que o código usa para cortar move os dois lados junto:
 * baixar `LIMITE_PUBLICACOES_HOME` de 6 para 5 deixava a home perder uma
 * publicação com a suíte inteira verde. Estes valores são transcrição da spec,
 * e nenhum arquivo de produção os lê — mexer neles é reescrever a regra, que é
 * exatamente o gesto que precisa ser visível.
 *
 * Só entra aqui número que a spec fixa. Onde ela não fixa — teto do painel, do
 * sitemap, limites de formação, tamanho de slug, tag e URL de imagem —, a
 * constante do código é o contrato certo, e o teste segue comparando com ela.
 *
 * Texto que a spec escreve por extenso continua morando ao lado do teste que o
 * usa: são frases de uma tela só, sem o problema de duplicação que os números
 * têm.
 */

/** PUB-01: "listar as publicações […] no máximo 6". */
export const TETO_DE_PUBLICACOES_NA_HOME = 6;

/** ADM-04: "título 120, resumo 220, corpo 20.000 caracteres". */
export const LIMITES_DE_CAMPO_DA_SPEC = {
  titulo: 120,
  resumo: 220,
  corpo: 20000,
} as const;
