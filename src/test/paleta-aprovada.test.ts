import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Metade positiva de SIT-05: não basta faltar cor literal em componente — os
 * tokens do tema precisam carregar a paleta que foi aprovada. A metade
 * negativa, a varredura que proíbe cor escrita à mão, mora em
 * `paleta-em-tokens.test.ts`.
 *
 * A tabela abaixo é transcrição de `.specs/features/site-portfolio/design.md`,
 * que registra os dez valores e de onde cada um vem: quatro estão escritos na
 * própria spec ("fundo `#EDF3E4`, superfície `#F7FBF1`, oliva `#4C5B34`,
 * dourado `#8E7A32`") e seis fecham a paleta aprovada com o layout. Antes deste
 * teste eles existiam só como comentário no CSS, isto é, sem trava nenhuma:
 * trocar `--olive` por vermelho passava a suíte inteira.
 *
 * A comparação é feita em OKLCH porque é assim que os tokens nascem no CSS. O
 * hex é convertido aqui, no teste, em vez de a expectativa ser a string do
 * arquivo — copiar a string travaria o texto, não a cor.
 */
const PALETA_APROVADA = {
  ground: "#EDF3E4",
  surface: "#F7FBF1",
  "surface-2": "#E1EAD3",
  ink: "#2B3322",
  "ink-soft": "#5B6749",
  olive: "#4C5B34",
  "olive-deep": "#3B4728",
  brass: "#8E7A32",
  line: "#D2DEC0",
  "on-olive": "#F3F8EA",
} as const;

/**
 * Folga da comparação. Os tokens do CSS guardam 4 casas em L e C e 2 no matiz,
 * então a folga só precisa cobrir esse arredondamento — medido, o desvio real
 * é de 5e-5 em L e C e de 0,005° no matiz. Mantê-la nessa ordem de grandeza é
 * o que faz o teste reprovar desvio de cor em vez de só desvio grosseiro.
 */
const FOLGA = { luminancia: 0.0005, croma: 0.0005, matiz: 0.05 } as const;

/** Folha onde os tokens do tema são declarados. */
const CAMINHO_DO_TEMA = join(process.cwd(), "src", "app", "globals.css");

type Oklch = { luminancia: number; croma: number; matiz: number };

/** sRGB de 0 a 255 para o espaço linear. */
function linearizar(canal: number): number {
  const v = canal / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Converte `#RRGGBB` para OKLCH (Björn Ottosson, sRGB → OKLab → OKLCH). */
function hexParaOklch(hex: string): Oklch {
  const inteiro = Number.parseInt(hex.slice(1), 16);
  const r = linearizar((inteiro >> 16) & 255);
  const g = linearizar((inteiro >> 8) & 255);
  const b = linearizar(inteiro & 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const luminancia = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const eixoA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const eixoB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const matiz = (Math.atan2(eixoB, eixoA) * 180) / Math.PI;
  return {
    luminancia,
    croma: Math.hypot(eixoA, eixoB),
    matiz: matiz < 0 ? matiz + 360 : matiz,
  };
}

/**
 * Valores declarados para o token na folha de tema. Devolve a lista inteira, e
 * não a primeira ocorrência: uma redefinição num bloco `.dark` passaria
 * despercebida se só a primeira fosse conferida.
 */
function declaracoesDoToken(folha: string, nome: string): string[] {
  return [...folha.matchAll(new RegExp(`--${nome}:\\s*([^;]+);`, "g"))].map(([, valor]) =>
    valor.trim(),
  );
}

/** Lê `oklch(L C H)` cru. Qualquer outra forma volta `null`, com o valor à vista. */
function lerOklch(valor: string): Oklch | null {
  const partes = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(valor);
  if (!partes) return null;

  return {
    luminancia: Number(partes[1]),
    croma: Number(partes[2]),
    matiz: Number(partes[3]),
  };
}

const FOLHA_DE_TEMA = readFileSync(CAMINHO_DO_TEMA, "utf8");

describe("paleta aprovada nos tokens (SIT-05)", () => {
  it.each(Object.entries(PALETA_APROVADA))(
    "declara --%s com a cor aprovada (%s)",
    (nome, hex) => {
      const declaracoes = declaracoesDoToken(FOLHA_DE_TEMA, nome);

      expect(declaracoes, `--${nome} deveria ser declarado uma única vez`).toHaveLength(1);

      const declarado = lerOklch(declaracoes[0]);
      expect(
        declarado,
        `--${nome} não está em oklch(L C H) cru: "${declaracoes[0]}"`,
      ).not.toBeNull();

      const aprovado = hexParaOklch(hex);
      expect(Math.abs(declarado!.luminancia - aprovado.luminancia)).toBeLessThanOrEqual(
        FOLGA.luminancia,
      );
      expect(Math.abs(declarado!.croma - aprovado.croma)).toBeLessThanOrEqual(FOLGA.croma);
      expect(Math.abs(declarado!.matiz - aprovado.matiz)).toBeLessThanOrEqual(FOLGA.matiz);
    },
  );

  it("converte hex para OKLCH em vez de copiar a string do tema", () => {
    // Branco e preto puros: pontas conhecidas do espaço, independentes do tema.
    expect(hexParaOklch("#FFFFFF").luminancia).toBeCloseTo(1, 3);
    expect(hexParaOklch("#FFFFFF").croma).toBeCloseTo(0, 3);
    expect(hexParaOklch("#000000").luminancia).toBeCloseTo(0, 3);
  });

  it("acha o token pelo nome exato, sem confundir prefixo com sufixo", () => {
    const folha = ":root { --olive: oklch(0.1 0.2 3); --olive-deep: oklch(0.4 0.5 6); }";

    expect(declaracoesDoToken(folha, "olive-deep")).toEqual(["oklch(0.4 0.5 6)"]);
    expect(declaracoesDoToken(folha, "brass")).toEqual([]);
  });
});
