import { describe, expect, it } from "vitest";

import {
  ehUrlDeImagemPermitida,
  LIMITES_PUBLICACAO,
  type PublicacaoFormulario,
  publicacaoSchema,
} from "@/features/publicacoes/schemas";
import { LIMITES_DE_CAMPO_DA_SPEC } from "@/test/valores-da-spec";

const valida: PublicacaoFormulario = {
  titulo: "AT não é babá",
  slug: "at-nao-e-baba",
  resumo: "O que separa acompanhamento terapêutico de cuidado.",
  corpo: "# Título\n\nTexto do corpo.",
  imagemUrl: "",
  tag: "Rotina",
  publicado: true,
};

const com = (campos: Partial<PublicacaoFormulario>) => ({ ...valida, ...campos });

const repetir = (quantidade: number) => "a".repeat(quantidade);

const primeiroErroDe = (campo: keyof PublicacaoFormulario, dados: unknown) => {
  const resultado = publicacaoSchema.safeParse(dados);
  if (resultado.success) {
    return null;
  }
  return (
    resultado.error.issues.find((issue) => issue.path[0] === campo)?.message ??
    null
  );
};

describe("publicacaoSchema", () => {
  it("aceita uma publicação completa e válida", () => {
    expect(publicacaoSchema.safeParse(valida).success).toBe(true);
  });

  it("aceita título com exatamente 120 caracteres", () => {
    expect(
      publicacaoSchema.safeParse(
        com({ titulo: repetir(LIMITES_DE_CAMPO_DA_SPEC.titulo) }),
      ).success,
    ).toBe(true);
  });

  it("rejeita título com 121 caracteres apontando o limite", () => {
    expect(
      primeiroErroDe(
        "titulo",
        com({ titulo: repetir(LIMITES_DE_CAMPO_DA_SPEC.titulo + 1) }),
      ),
    ).toBe("O título deve ter no máximo 120 caracteres.");
  });

  it("rejeita título vazio", () => {
    expect(primeiroErroDe("titulo", com({ titulo: "   " }))).toBe(
      "Informe o título.",
    );
  });

  it("aceita resumo com exatamente 220 caracteres e rejeita 221", () => {
    expect(
      publicacaoSchema.safeParse(
        com({ resumo: repetir(LIMITES_DE_CAMPO_DA_SPEC.resumo) }),
      ).success,
    ).toBe(true);
    expect(
      primeiroErroDe(
        "resumo",
        com({ resumo: repetir(LIMITES_DE_CAMPO_DA_SPEC.resumo + 1) }),
      ),
    ).toBe("O resumo deve ter no máximo 220 caracteres.");
  });

  it("aceita corpo com exatamente 20000 caracteres", () => {
    expect(
      publicacaoSchema.safeParse(
        com({ corpo: repetir(LIMITES_DE_CAMPO_DA_SPEC.corpo) }),
      ).success,
    ).toBe(true);
  });

  it("rejeita corpo com 20001 caracteres apontando o limite", () => {
    expect(
      primeiroErroDe(
        "corpo",
        com({ corpo: repetir(LIMITES_DE_CAMPO_DA_SPEC.corpo + 1) }),
      ),
    ).toBe("O corpo do texto deve ter no máximo 20000 caracteres.");
  });

  it.each([
    ["maiúsculas", "AT-Nao-E-Baba"],
    ["acento", "at-não-e-baba"],
    ["espaço", "at nao e baba"],
    ["hífen duplicado", "at--nao"],
    ["hífen na ponta", "-at-nao"],
    ["pontuação", "at_nao"],
  ])("rejeita slug com %s", (_caso, slug) => {
    expect(primeiroErroDe("slug", com({ slug }))).toBe(
      "O slug aceita apenas letras minúsculas sem acento, números e hífen.",
    );
  });

  it("aceita slug com números e hífens simples", () => {
    expect(publicacaoSchema.safeParse(com({ slug: "180-horas-de-at" })).success).toBe(
      true,
    );
  });

  it("aceita imagemUrl vazia", () => {
    expect(publicacaoSchema.safeParse(com({ imagemUrl: "" })).success).toBe(true);
  });

  it("aceita imagemUrl https de host da allowlist", () => {
    expect(
      publicacaoSchema.safeParse(
        com({ imagemUrl: "https://images.unsplash.com/foto.jpg" }),
      ).success,
    ).toBe(true);
  });

  it("rejeita imagemUrl de host fora da allowlist", () => {
    expect(
      primeiroErroDe("imagemUrl", com({ imagemUrl: "https://exemplo.com/foto.jpg" })),
    ).toMatch(/^A imagem precisa ser uma URL https de um destes domínios: /);
  });

  it("rejeita imagemUrl http, mesmo em host da allowlist", () => {
    expect(
      primeiroErroDe("imagemUrl", com({ imagemUrl: "http://images.unsplash.com/foto.jpg" })),
    ).not.toBeNull();
  });

  it("rejeita imagemUrl acima do limite de caracteres", () => {
    expect(
      primeiroErroDe(
        "imagemUrl",
        com({
          imagemUrl: `https://images.unsplash.com/${"a".repeat(LIMITES_PUBLICACAO.imagemUrl)}.jpg`,
        }),
      ),
    ).toBe("O endereço da imagem deve ter no máximo 2048 caracteres.");
  });

  it("rejeita imagemUrl que não é uma URL", () => {
    expect(primeiroErroDe("imagemUrl", com({ imagemUrl: "foto.jpg" }))).not.toBeNull();
  });
});

describe("ehUrlDeImagemPermitida", () => {
  it("aceita host da allowlist em https", () => {
    expect(
      ehUrlDeImagemPermitida("https://firebasestorage.googleapis.com/a/b.png"),
    ).toBe(true);
  });

  it("recusa host fora da allowlist", () => {
    expect(ehUrlDeImagemPermitida("https://cdn.malicioso.com/b.png")).toBe(false);
  });

  it("recusa subdomínio parecido com um host da allowlist", () => {
    expect(
      ehUrlDeImagemPermitida("https://images.unsplash.com.malicioso.com/b.png"),
    ).toBe(false);
  });

  it("recusa texto que não é URL", () => {
    expect(ehUrlDeImagemPermitida("")).toBe(false);
  });
});
