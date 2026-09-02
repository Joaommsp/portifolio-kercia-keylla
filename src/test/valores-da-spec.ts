/**
 * Números que a spec de `site-portfolio` escreve por extenso **e** que existem
 * como constante de produção.
 *
 * É esse cruzamento que importa. Quando os dois lados existem, o teste tende a
 * comparar o comportamento com a mesma constante que o código usa para cortar,
 * e aí os dois andam juntos: baixar `LIMITE_PUBLICACOES_HOME` de 6 para 5
 * deixava a home perder uma publicação com a suíte inteira verde. Aqui o valor
 * é transcrição da spec, não da implementação, e nenhum arquivo de produção o
 * lê — `no-restricted-imports` no `eslint.config.mjs` reprova quem tentar.
 *
 * Número que a spec fixa e que não tem constante espelhada em produção —
 * os 6 pilares de SIT-02, por exemplo — fica no teste que o usa: sem o outro
 * lado, não há o que andar junto.
 *
 * Onde a spec não fixa o número — teto do painel, do sitemap, limites de
 * formação, tamanho de slug, tag e URL de imagem —, a constante do código é o
 * contrato, e o teste segue comparando com ela.
 *
 * Texto que a spec escreve por extenso também mora ao lado do teste que o usa:
 * são frases de uma tela só, sem o problema de duplicação que os números têm.
 */

/** PUB-01: "listar as publicações […] no máximo 6". */
export const TETO_DA_HOME_NA_SPEC = 6;

/** ADM-04: "título 120, resumo 220, corpo 20.000 caracteres". */
export const LIMITES_DE_PUBLICACAO_DA_SPEC = {
  titulo: 120,
  resumo: 220,
  corpo: 20000,
} as const;
