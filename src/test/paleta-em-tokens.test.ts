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
 * 1. `globals.css` (e qualquer `.css`) fica de fora porque é lá que os tokens
 *    são definidos, e um token precisa nascer de um valor literal. O outro lado
 *    — que esses valores são os aprovados — é conferido em
 *    `paleta-aprovada.test.ts`.
 * 2. `src/test/` inteira fica de fora, arquivos de teste e infra de teste: cor
 *    literal é insumo legítimo deles, e os casos do detector, logo abaixo, são
 *    a prova. Teste não pinta tela, que é o que SIT-05 protege.
 * 3. Duas classes de terceiro, nomeadas uma a uma em
 *    `CLASSES_DE_TERCEIRO_TOLERADAS`, com o motivo e a quantidade esperada.
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
 * tolerância vale **só** para esta classe nestes dois arquivos, e **na
 * quantidade registrada** — um `bg-black` a mais no mesmo arquivo reprova, do
 * mesmo jeito que qualquer outra classe de cor. Cor literal segue reprovando em
 * `src/components/ui/` como em qualquer outro lugar.
 */
const CLASSES_DE_TERCEIRO_TOLERADAS: Record<string, Readonly<Record<string, number>>> = {
  "components/ui/dialog.tsx": { "bg-black": 1 },
  "components/ui/alert-dialog.tsx": { "bg-black": 1 },
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

/** Pasta que guarda a infra de teste, fora da varredura junto com os testes. */
const PASTA_DE_TESTE = "test";

/** Código de `src/` que pinta tela: sem os testes e sem a infra de teste. */
function arquivosDeCodigo(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) {
      return pasta === RAIZ && entrada.name === PASTA_DE_TESTE ? [] : arquivosDeCodigo(caminho);
    }
    const ehCodigo = /\.tsx?$/.test(entrada.name);
    const ehTeste = /\.test\.tsx?$/.test(entrada.name);
    return ehCodigo && !ehTeste ? [caminho] : [];
  });
}

/** Cada arquivo auditado com a fonte já lida — o disco é percorrido uma vez. */
const arquivosLidos = arquivosDeCodigo(RAIZ).map((caminho) => ({
  caminho: relative(RAIZ, caminho).split(sep).join("/"),
  fonte: readFileSync(caminho, "utf8"),
}));

const arquivos = arquivosLidos.map(({ caminho }) => caminho);

/** Arquivos em que o detector achou algo, já sem o que a exceção tolera. */
function infratoresDe(
  detectar: (fonte: string) => string[],
  tolerar: (caminho: string, achados: string[]) => string[] = (_, achados) => achados,
): { caminho: string; achados: string[] }[] {
  return arquivosLidos
    .map(({ caminho, fonte }) => ({ caminho, achados: tolerar(caminho, detectar(fonte)) }))
    .filter(({ achados }) => achados.length > 0);
}

/** Tira da lista as classes de terceiro registradas, até a quantidade tolerada. */
function semAsClassesDeTerceiro(caminho: string, classes: string[]): string[] {
  const restante = { ...(CLASSES_DE_TERCEIRO_TOLERADAS[caminho] ?? {}) };

  return classes.filter((classe) => {
    if (!restante[classe]) return true;
    restante[classe] -= 1;
    return false;
  });
}

describe("paleta em tokens (SIT-05)", () => {
  it("varre o código do site", () => {
    expect(arquivos.length).toBeGreaterThan(10);
    expect(arquivos).toContain(COMPONENTE_CONHECIDO);
  });

  it("não deixa cor literal em nenhum arquivo de código", () => {
    expect(infratoresDe(coresLiteraisEm)).toEqual([]);
  });

  it("não deixa classe da paleta padrão do Tailwind fora das exceções nomeadas", () => {
    expect(infratoresDe(classesForaDaPaletaEm, semAsClassesDeTerceiro)).toEqual([]);
  });

  it("não deixa cor escrita direto em style inline", () => {
    expect(infratoresDe(coresEmStyleInlineEm)).toEqual([]);
  });

  it("mantém as exceções de terceiro apontando para código que existe", () => {
    for (const [caminho, classes] of Object.entries(CLASSES_DE_TERCEIRO_TOLERADAS)) {
      const arquivo = arquivosLidos.find((lido) => lido.caminho === caminho);
      expect(arquivo, `exceção aponta para arquivo inexistente: ${caminho}`).toBeDefined();

      const achadas = classesForaDaPaletaEm(arquivo!.fonte);
      for (const [classe, quantidade] of Object.entries(classes)) {
        expect(
          achadas.filter((achada) => achada === classe),
          `exceção "${classe}" registrada ${quantidade}× e não confere em ${caminho}`,
        ).toHaveLength(quantidade);
      }
    }
  });
});

describe("detectores da trava", () => {
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
