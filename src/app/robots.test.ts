import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import { CAMINHO_HOME, CAMINHO_PAINEL, CAMINHO_SITEMAP } from "@/lib/rotas";
import { siteUrl } from "@/lib/url";

/** O campo aceita uma regra ou uma lista; aqui é sempre uma. */
const regraUnica = () => {
  const { rules } = robots();
  return Array.isArray(rules) ? rules[0] : rules;
};

describe("robots", () => {
  it("libera o site para qualquer robô", () => {
    expect(regraUnica().userAgent).toBe("*");
    expect(regraUnica().allow).toBe(CAMINHO_HOME);
  });

  it("bloqueia o painel", () => {
    expect(regraUnica().disallow).toBe(CAMINHO_PAINEL);
  });

  it("aponta o sitemap em URL absoluta", () => {
    expect(robots().sitemap).toBe(`${siteUrl}${CAMINHO_SITEMAP}`);
  });
});
