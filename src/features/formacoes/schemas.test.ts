import { describe, expect, it } from "vitest";

import {
  ANO_MINIMO_FORMACAO,
  anoMaximoFormacao,
  type FormacaoFormulario,
  formacaoSchema,
  LIMITES_FORMACAO,
} from "@/features/formacoes/schemas";

const valida: FormacaoFormulario = {
  titulo: "Pedagogia",
  instituicao: "Universidade Federal",
  descricao: "Licenciatura plena.",
  ano: 2018,
  status: "concluido",
  ordem: 0,
};

const com = (campos: Partial<FormacaoFormulario>) => ({ ...valida, ...campos });

const primeiroErroDe = (campo: keyof FormacaoFormulario, dados: unknown) => {
  const resultado = formacaoSchema.safeParse(dados);
  if (resultado.success) {
    return null;
  }
  return (
    resultado.error.issues.find((issue) => issue.path[0] === campo)?.message ??
    null
  );
};

describe("formacaoSchema", () => {
  it("aceita uma formação completa e válida", () => {
    expect(formacaoSchema.safeParse(valida).success).toBe(true);
  });

  it("aceita descrição vazia", () => {
    expect(formacaoSchema.safeParse(com({ descricao: "" })).success).toBe(true);
  });

  it("rejeita título vazio e instituição vazia", () => {
    expect(primeiroErroDe("titulo", com({ titulo: "  " }))).toBe(
      "Informe o título.",
    );
    expect(primeiroErroDe("instituicao", com({ instituicao: "" }))).toBe(
      "Informe a instituição.",
    );
  });

  it("aplica os limites de tamanho de título, instituição e descrição", () => {
    expect(
      primeiroErroDe(
        "titulo",
        com({ titulo: "a".repeat(LIMITES_FORMACAO.titulo + 1) }),
      ),
    ).toBe("O título deve ter no máximo 120 caracteres.");
    expect(
      primeiroErroDe(
        "descricao",
        com({ descricao: "a".repeat(LIMITES_FORMACAO.descricao + 1) }),
      ),
    ).toBe("A descrição deve ter no máximo 220 caracteres.");
    expect(
      formacaoSchema.safeParse(
        com({ instituicao: "a".repeat(LIMITES_FORMACAO.instituicao) }),
      ).success,
    ).toBe(true);
  });

  it.each(["concluido", "em_andamento"] as const)(
    "aceita o status %s",
    (status) => {
      expect(formacaoSchema.safeParse(com({ status })).success).toBe(true);
    },
  );

  it("rejeita status fora da união", () => {
    expect(primeiroErroDe("status", { ...valida, status: "trancado" })).toBe(
      "Escolha se a formação está concluída ou em andamento.",
    );
  });

  it("aceita o ano mínimo e o ano máximo, que são inclusivos", () => {
    expect(
      formacaoSchema.safeParse(com({ ano: ANO_MINIMO_FORMACAO })).success,
    ).toBe(true);
    expect(
      formacaoSchema.safeParse(com({ ano: anoMaximoFormacao() })).success,
    ).toBe(true);
  });

  it("rejeita ano anterior ao mínimo", () => {
    expect(primeiroErroDe("ano", com({ ano: ANO_MINIMO_FORMACAO - 1 }))).toBe(
      `O ano deve estar entre ${ANO_MINIMO_FORMACAO} e ${anoMaximoFormacao()}.`,
    );
  });

  it("rejeita ano além da margem futura", () => {
    expect(primeiroErroDe("ano", com({ ano: anoMaximoFormacao() + 1 }))).toBe(
      `O ano deve estar entre ${ANO_MINIMO_FORMACAO} e ${anoMaximoFormacao()}.`,
    );
  });

  it("rejeita ano fracionado", () => {
    expect(primeiroErroDe("ano", com({ ano: 2018.5 }))).toBe(
      "O ano deve ser um número inteiro.",
    );
  });

  it("rejeita ordem negativa", () => {
    expect(primeiroErroDe("ordem", com({ ordem: -1 }))).toBe(
      "A ordem não pode ser negativa.",
    );
  });
});

describe("anoMaximoFormacao", () => {
  it("é o ano corrente mais dez", () => {
    expect(anoMaximoFormacao(new Date("2026-09-01T12:00:00.000Z"))).toBe(2036);
  });
});
