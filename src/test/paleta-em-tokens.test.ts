import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Trava de SIT-05: a paleta aprovada entra por token de tema, e nenhum arquivo
 * de código escreve cor à mão.
 *
 * A varredura lê o arquivo inteiro, não só o que está em `className` ou em
 * `style`: classe montada dentro de `cva(...)`, guardada em constante de módulo
 * ou citada em comentário conta igual — o valor aprovado tem um lugar só.
 *
 * Escopo: todo `.ts` e `.tsx` de `src/`, os componentes de `src/components/ui`
 * inclusive. Duas exceções, ambas deliberadas:
 *
 * 1. `globals.css` (e qualquer `.css`) fica de fora porque é lá que os tokens
 *    são definidos, e um token precisa nascer de um valor literal.
 * 2. Os próprios arquivos de teste ficam de fora porque cor literal é insumo
 *    legítimo deles — os casos do detector, logo abaixo, são a prova. Teste não
 *    pinta tela, que é o que SIT-05 protege.
 */
const RAIZ = join(process.cwd(), "src");

/** Cor escrita à mão: hexadecimal ou função de cor do CSS. */
const COR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab)\(/g;

/** Arquivo conhecido, para a varredura não passar por ter lido a pasta errada. */
const COMPONENTE_CONHECIDO = "app/layout.tsx";

/** Cores escritas à mão no arquivo. */
function coresLiteraisEm(fonte: string): string[] {
  return fonte.match(COR_LITERAL) ?? [];
}

/** Código de `src/`, sem os arquivos de teste. */
function arquivosDeCodigo(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) return arquivosDeCodigo(caminho);
    const ehCodigo = /\.tsx?$/.test(entrada.name);
    const ehTeste = /\.test\.tsx?$/.test(entrada.name);
    return ehCodigo && !ehTeste ? [caminho] : [];
  });
}

const arquivos = arquivosDeCodigo(RAIZ).map((caminho) =>
  relative(RAIZ, caminho).split(sep).join("/"),
);

describe("paleta em tokens (SIT-05)", () => {
  it("varre o código do site", () => {
    expect(arquivos.length).toBeGreaterThan(10);
    expect(arquivos).toContain(COMPONENTE_CONHECIDO);
  });

  it("não deixa cor literal em nenhum arquivo de código", () => {
    const infratores = arquivos
      .map((caminho) => ({
        caminho,
        cores: coresLiteraisEm(readFileSync(join(RAIZ, caminho), "utf8")),
      }))
      .filter(({ cores }) => cores.length > 0);

    expect(infratores).toEqual([]);
  });
});

describe("detector de cor literal", () => {
  it("acusa cor escrita à mão em className e em style inline", () => {
    expect(coresLiteraisEm('<p className="bg-[#EDF3E4]" />')).toHaveLength(1);
    expect(coresLiteraisEm('<p style={{ color: "#8E7A32" }} />')).toHaveLength(1);
    expect(coresLiteraisEm('<p className="text-[rgb(76,91,52)]" />')).toHaveLength(1);
    expect(coresLiteraisEm("<p style={{ background: `hsl(80 20% 30%)` }} />")).toHaveLength(1);
  });

  it("acusa cor escondida na classe montada fora do JSX", () => {
    expect(coresLiteraisEm('const variantes = cva("bg-[#EDF3E4] rounded-lg");')).toHaveLength(1);
    expect(coresLiteraisEm('const CLASSE = "border-[oklch(0.5_0.1_120)]";')).toHaveLength(1);
    expect(coresLiteraisEm("/* fundo aprovado: #EDF3E4 */")).toHaveLength(1);
  });

  it("não acusa âncora, token de tema nem classe utilitária", () => {
    expect(coresLiteraisEm('<a href="#contato" className="text-brass" />')).toEqual([]);
    expect(coresLiteraisEm("<a href={`#${ancoras.topo}`}>Topo</a>")).toEqual([]);
    expect(coresLiteraisEm('<p className="border-line bg-surface text-ink-soft" />')).toEqual([]);
    expect(coresLiteraisEm("<p style={{ animationDelay: `${i * 60}ms` }} />")).toEqual([]);
    expect(
      coresLiteraisEm('"hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]"'),
    ).toEqual([]);
  });
});

/**
 * Metade positiva de SIT-05: não basta faltar cor literal em componente — os
 * tokens precisam carregar a paleta que foi aprovada.
 *
 * Os quatro primeiros valores estão escritos na própria spec ("fundo `#EDF3E4`,
 * superfície `#F7FBF1`, oliva `#4C5B34`, dourado `#8E7A32`"). Os outros seis
 * completam a paleta aprovada junto com o layout e existiam só como comentário
 * em `globals.css`, isto é, sem trava nenhuma: trocar `--olive` por vermelho
 * passava a suíte inteira.
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
 * então a folga cobre o arredondamento com sobra e ainda reprova qualquer troca
 * de cor perceptível.
 */
const FOLGA = { luminancia: 0.005, croma: 0.005, matiz: 0.5 } as const;

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

const FOLHA_DE_TEMA = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** Valor OKLCH que o tema declara para o token, ou `null` se ele não existe. */
function tokenDoTema(nome: string): Oklch | null {
  const declaracao = new RegExp(
    `--${nome}:\\s*oklch\\(\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s*\\)`,
  ).exec(FOLHA_DE_TEMA);

  if (!declaracao) return null;

  return {
    luminancia: Number(declaracao[1]),
    croma: Number(declaracao[2]),
    matiz: Number(declaracao[3]),
  };
}

describe("paleta aprovada nos tokens (SIT-05)", () => {
  it.each(Object.entries(PALETA_APROVADA))(
    "declara --%s com a cor aprovada (%s)",
    (nome, hex) => {
      const declarado = tokenDoTema(nome);
      const aprovado = hexParaOklch(hex);

      expect(declarado, `token --${nome} não está declarado em globals.css`).not.toBeNull();
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
});
