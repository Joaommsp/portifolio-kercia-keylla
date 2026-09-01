import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Trava de SIT-05: a paleta aprovada entra por token de tema, e nenhum
 * componente escreve cor à mão.
 *
 * A varredura cobre TODO `.tsx` de `src/`, os componentes de `src/components/ui`
 * inclusive — eles vieram do shadcn mas foram reescritos nas variáveis do tema,
 * então não há exceção a justificar. Fora do escopo fica só `globals.css`: é lá
 * que os tokens são definidos, e um token precisa nascer de um valor literal em
 * algum lugar. Arquivo `.css` também não é varrido por não ser `.tsx`.
 */
const RAIZ = join(process.cwd(), "src");

/** Cor escrita à mão: hexadecimal ou função de cor do CSS. */
const COR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab)\(/;

/** Arquivo conhecido, para a varredura não passar por ter lido a pasta errada. */
const COMPONENTE_CONHECIDO = "features/site/sections/o-que-faz-uma-at.tsx";

/** Valor do atributo que começa em `inicio`: string entre aspas ou bloco `{}`. */
function valorDoAtributo(fonte: string, inicio: number): string {
  let i = fonte.indexOf("=", inicio);
  if (i === -1) return "";

  i += 1;
  while (i < fonte.length && /\s/.test(fonte[i])) i += 1;

  const abertura = fonte[i];

  if (abertura === '"' || abertura === "'") {
    const fim = fonte.indexOf(abertura, i + 1);
    return fim === -1 ? fonte.slice(i) : fonte.slice(i + 1, fim);
  }

  if (abertura === "{") {
    let nivel = 0;
    for (let j = i; j < fonte.length; j += 1) {
      if (fonte[j] === "{") nivel += 1;
      else if (fonte[j] === "}") {
        nivel -= 1;
        if (nivel === 0) return fonte.slice(i + 1, j);
      }
    }
  }

  return "";
}

/** Só os dois lugares onde uma cor literal pintaria a tela: `className` e `style`. */
function trechosDeEstilo(fonte: string): string[] {
  return Array.from(fonte.matchAll(/\b(?:className|style)\s*=/g)).map((achado) =>
    valorDoAtributo(fonte, achado.index),
  );
}

/** Trechos de estilo do arquivo que trazem cor escrita à mão. */
function coresLiteraisEm(fonte: string): string[] {
  return trechosDeEstilo(fonte).filter((trecho) => COR_LITERAL.test(trecho));
}

function arquivosTsx(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) return arquivosTsx(caminho);
    return entrada.name.endsWith(".tsx") ? [caminho] : [];
  });
}

const arquivos = arquivosTsx(RAIZ).map((caminho) =>
  relative(RAIZ, caminho).split(sep).join("/"),
);

describe("paleta em tokens (SIT-05)", () => {
  it("varre os componentes do site", () => {
    expect(arquivos.length).toBeGreaterThan(10);
    expect(arquivos).toContain(COMPONENTE_CONHECIDO);
  });

  it("não deixa cor literal em className nem em style inline", () => {
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
    expect(coresLiteraisEm('<p className={cn(base, "border-[oklch(0.5_0.1_120)]")} />')).toHaveLength(1);
  });

  it("não acusa âncora, token de tema nem classe utilitária", () => {
    expect(coresLiteraisEm('<a href="#contato" className="text-brass" />')).toEqual([]);
    expect(coresLiteraisEm("<a href={`#${ancoras.topo}`}>Topo</a>")).toEqual([]);
    expect(coresLiteraisEm('<p className="border-line bg-surface text-ink-soft" />')).toEqual([]);
    expect(coresLiteraisEm("<p style={{ animationDelay: `${i * 60}ms` }} />")).toEqual([]);
  });
});
