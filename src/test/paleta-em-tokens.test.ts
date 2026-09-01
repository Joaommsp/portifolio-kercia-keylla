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
