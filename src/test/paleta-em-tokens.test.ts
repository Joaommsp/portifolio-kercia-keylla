import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Trava de SIT-05, metade negativa: a cor de um componente vem de token de
 * tema, não escrita à mão. Três formas de escrever à mão são cobertas:
 *
 * 1. **Cor literal** — hexadecimal ou função de cor (`rgb()`, `hsl()`,
 *    `oklch()`…), em qualquer posição do arquivo. A varredura lê o texto
 *    inteiro, não só `className` e `style`: classe montada dentro de
 *    `cva(...)`, guardada em constante de módulo ou citada em comentário conta
 *    igual — o valor aprovado tem um lugar só.
 * 2. **Classe utilitária da paleta padrão do Tailwind** (`bg-emerald-200`,
 *    `text-white`): não é literal, mas pinta fora dos tokens do mesmo jeito.
 * 3. **Cor em `style` inline** — qualquer valor de propriedade de cor que não
 *    seja `var(--token)` ou palavra-chave neutra, o que pega tanto `"#8E7A32"`
 *    quanto cor nomeada do CSS (`"white"`, `"darkolivegreen"`).
 *
 * O que a trava **não** cobre, e é bom dizer: ela lê texto de arquivo, não
 * folha de estilo computada. Classe montada por concatenação em tempo de
 * execução (`` `bg-${cor}-200` ``) escapa das regras 2 e 3, e nenhum `.css`
 * além de `globals.css` é auditado.
 *
 * Escopo: todo `.ts` e `.tsx` de `src/`, os componentes de `src/components/ui`
 * inclusive. Três exceções, todas deliberadas:
 *
 * 1. `globals.css` (e qualquer `.css`) fica de fora da regra 1 porque é lá que
 *    os tokens são definidos, e um token precisa nascer de um valor literal. O
 *    bloco abaixo confere o outro lado: que esses valores são os aprovados.
 * 2. Os próprios arquivos de teste ficam de fora porque cor literal é insumo
 *    legítimo deles — os casos do detector, logo abaixo, são a prova. Teste não
 *    pinta tela, que é o que SIT-05 protege.
 * 3. Duas classes de terceiro, nomeadas uma a uma em
 *    `CLASSES_DE_TERCEIRO_TOLERADAS`, com o motivo ao lado.
 */
const RAIZ = join(process.cwd(), "src");

/** Cor escrita à mão: hexadecimal ou função de cor do CSS. */
const COR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab)\(/g;

/** Utilitários do Tailwind que recebem cor. */
const UTILITARIOS_DE_COR =
  "bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|placeholder";

/** Famílias da paleta padrão do Tailwind — nenhuma delas é token deste tema. */
const PALETA_PADRAO_DO_TAILWIND =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

/**
 * Classe utilitária que pinta com a paleta padrão do Tailwind em vez dos
 * tokens do tema. `bg-emerald-200` e `text-white` não são cor literal, mas
 * furam SIT-05 igual.
 */
const CLASSE_FORA_DA_PALETA = new RegExp(
  `\\b(?:${UTILITARIOS_DE_COR})-(?:(?:${PALETA_PADRAO_DO_TAILWIND})-(?:50|[1-9]00|950)|black|white)\\b`,
  "g",
);

/** Bloco `style={{ … }}` escrito no JSX. */
const STYLE_INLINE = /style=\{\{([\s\S]*?)\}\}/g;

/** Propriedade de `style` que recebe cor, com o valor em string literal. */
const COR_EM_STYLE = new RegExp(
  "\\b(?:color|background|backgroundColor|backgroundImage|borderColor|border(?:Top|Right|Bottom|Left)Color|" +
    "outlineColor|fill|stroke|boxShadow|textShadow|textDecorationColor|caretColor|accentColor|columnRuleColor)" +
    "\\s*:\\s*[\"'`]([^\"'`]*)[\"'`]",
  "g",
);

/** Valor de cor que não pinta nada por conta própria. */
const VALOR_NEUTRO = /^(?:transparent|currentColor|inherit|initial|revert|unset|none)$/;

/**
 * Classes de terceiro toleradas, arquivo a arquivo.
 *
 * `dialog.tsx` e `alert-dialog.tsx` vêm do shadcn e são mantidos próximos do
 * upstream: o véu dos dois já chega com `bg-black/10` de fábrica, e reescrevê-lo
 * em token nosso criaria divergência a cada atualização do componente. A
 * tolerância vale **só** para esta classe nestes dois arquivos — cor literal
 * segue reprovando em `src/components/ui/` como em qualquer outro lugar, e
 * classe de cor nova nesses mesmos arquivos também reprova.
 */
const CLASSES_DE_TERCEIRO_TOLERADAS: Record<string, readonly string[]> = {
  "components/ui/dialog.tsx": ["bg-black"],
  "components/ui/alert-dialog.tsx": ["bg-black"],
};

/** Arquivo conhecido, para a varredura não passar por ter lido a pasta errada. */
const COMPONENTE_CONHECIDO = "app/layout.tsx";

/** Cores escritas à mão no arquivo. */
function coresLiteraisEm(fonte: string): string[] {
  return fonte.match(COR_LITERAL) ?? [];
}

/** Classes de cor da paleta padrão do Tailwind escritas no arquivo. */
function classesForaDaPaletaEm(fonte: string): string[] {
  return fonte.match(CLASSE_FORA_DA_PALETA) ?? [];
}

/** Cores escritas direto num `style` inline, fora dos tokens do tema. */
function coresEmStyleInlineEm(fonte: string): string[] {
  return [...fonte.matchAll(STYLE_INLINE)].flatMap(([, corpo]) =>
    [...corpo.matchAll(COR_EM_STYLE)]
      .map(([, valor]) => valor.trim())
      .filter((valor) => valor !== "" && !valor.includes("var(--") && !VALOR_NEUTRO.test(valor)),
  );
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

  it("não deixa classe da paleta padrão do Tailwind fora das exceções nomeadas", () => {
    const infratores = arquivos
      .map((caminho) => ({
        caminho,
        classes: classesForaDaPaletaEm(readFileSync(join(RAIZ, caminho), "utf8")).filter(
          (classe) => !(CLASSES_DE_TERCEIRO_TOLERADAS[caminho] ?? []).includes(classe),
        ),
      }))
      .filter(({ classes }) => classes.length > 0);

    expect(infratores).toEqual([]);
  });

  it("não deixa cor escrita direto em style inline", () => {
    const infratores = arquivos
      .map((caminho) => ({
        caminho,
        cores: coresEmStyleInlineEm(readFileSync(join(RAIZ, caminho), "utf8")),
      }))
      .filter(({ cores }) => cores.length > 0);

    expect(infratores).toEqual([]);
  });

  it("mantém as exceções de terceiro apontando para código que existe", () => {
    for (const [caminho, classes] of Object.entries(CLASSES_DE_TERCEIRO_TOLERADAS)) {
      expect(arquivos, `exceção aponta para arquivo inexistente: ${caminho}`).toContain(caminho);

      const fonte = readFileSync(join(RAIZ, caminho), "utf8");
      for (const classe of classes) {
        expect(
          classesForaDaPaletaEm(fonte),
          `exceção "${classe}" sobrando em ${caminho}`,
        ).toContain(classe);
      }
    }
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

  it("acusa classe da paleta padrão do Tailwind", () => {
    expect(classesForaDaPaletaEm('<p className="bg-emerald-200 text-rose-600" />')).toEqual([
      "bg-emerald-200",
      "text-rose-600",
    ]);
    expect(classesForaDaPaletaEm('const v = cva("border-slate-300 hover:bg-white");')).toEqual([
      "border-slate-300",
      "bg-white",
    ]);
  });

  it("não confunde token do tema com família do Tailwind", () => {
    expect(
      classesForaDaPaletaEm(
        '<p className="bg-surface-2 text-ink-soft border-line ring-brass from-olive-deep" />',
      ),
    ).toEqual([]);
    // `auto-` e `into-` terminam com os mesmos dois caracteres de `to-`.
    expect(classesForaDaPaletaEm('<p className="auto-white grid-into-black" />')).toEqual([]);
  });

  it("acusa cor nomeada e hexadecimal em style inline", () => {
    expect(
      coresEmStyleInlineEm('<p style={{ color: "white", background: "darkolivegreen" }} />'),
    ).toEqual(["white", "darkolivegreen"]);
    expect(coresEmStyleInlineEm('<p style={{ backgroundColor: "#8E7A32" }} />')).toEqual([
      "#8E7A32",
    ]);
  });

  it("não acusa token, valor neutro nem propriedade sem cor em style inline", () => {
    expect(coresEmStyleInlineEm('<p style={{ color: "var(--ink)" }} />')).toEqual([]);
    expect(
      coresEmStyleInlineEm('<p style={{ background: "linear-gradient(var(--olive), transparent)" }} />'),
    ).toEqual([]);
    expect(coresEmStyleInlineEm('<p style={{ borderColor: "transparent" }} />')).toEqual([]);
    expect(coresEmStyleInlineEm("<p style={{ animationDelay: `${i * 60}ms` }} />")).toEqual([]);
    // Fora de `style` inline, "color:" é texto qualquer e não é auditado aqui.
    expect(coresEmStyleInlineEm('const css = `color: white;`;')).toEqual([]);
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
