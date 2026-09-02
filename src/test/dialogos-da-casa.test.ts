import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * ADM-09: nenhum diálogo nativo no projeto.
 *
 * `window.confirm`, `alert` e `prompt` não podem ser estilizados nem lidos pelo
 * teste, e somem no meio do navegador. O painel tem o `ConfirmarAcao` para isso.
 *
 * Esta varredura existe porque nenhum teste de componente pegaria a volta de um
 * nativo em arquivo que ninguém pensou em cobrir.
 */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

const NATIVOS = /\b(?:window\.)?(?:confirm|alert|prompt)\s*\(/g;

/**
 * A varredura cobre só código de produção. Teste não roda no navegador de
 * ninguém, e um deles cita `alert(1)` DENTRO de uma string justamente para
 * provar que HTML bruto não é executado (`corpo-markdown.test.tsx`).
 */
function arquivosDeProducao(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name);

    if (entrada.isDirectory()) return arquivosDeProducao(caminho);

    const ehCodigo = /\.tsx?$/.test(entrada.name);
    const ehTeste = /\.test\.tsx?$/.test(entrada.name);
    return ehCodigo && !ehTeste ? [caminho] : [];
  });
}

describe("diálogos da casa (ADM-09)", () => {
  it("não deixa diálogo nativo em nenhum arquivo", () => {
    const encontrados = arquivosDeProducao(RAIZ)
      .map((caminho) => ({
        caminho: relative(RAIZ, caminho).split(sep).join("/"),
        fonte: readFileSync(caminho, "utf8"),
      }))
      .map(({ caminho, fonte }) => ({
        caminho,
        achados: fonte.match(NATIVOS) ?? [],
      }))
      .filter(({ achados }) => achados.length > 0);

    expect(encontrados).toEqual([]);
  });
});
