import { afterEach, describe, expect, it, vi } from "vitest";

/** Recarrega o módulo, que lê o ambiente na avaliação. */
async function carregarUrl() {
  vi.resetModules();
  return import("@/lib/url");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("usa o endereço informado pelo ambiente", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://keylla.exemplo.br");

    const { siteUrl } = await carregarUrl();

    expect(siteUrl).toBe("https://keylla.exemplo.br");
  });

  it("cai no padrão quando a variável não existe", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);

    const { siteUrl, URL_PADRAO_DO_SITE } = await carregarUrl();

    expect(siteUrl).toBe(URL_PADRAO_DO_SITE);
  });

  it("cai no padrão quando a variável vem em branco", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "   ");

    const { siteUrl, URL_PADRAO_DO_SITE } = await carregarUrl();

    expect(siteUrl).toBe(URL_PADRAO_DO_SITE);
  });
});

describe("urlDoSite", () => {
  it("monta a URL absoluta de um caminho do site", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://keylla.exemplo.br");

    const { urlDoSite } = await carregarUrl();

    expect(urlDoSite("/publicacoes/at-nao-e-baba")).toBe(
      "https://keylla.exemplo.br/publicacoes/at-nao-e-baba",
    );
  });

  it("continua montando URL válida com a variável em branco", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    const { urlDoSite, URL_PADRAO_DO_SITE } = await carregarUrl();

    expect(urlDoSite("/")).toBe(`${URL_PADRAO_DO_SITE}/`);
  });
});
