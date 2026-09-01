import { describe, expect, it } from "vitest";

import { formatarTelefoneBR, formatDateBR, slugify } from "@/lib/format";

describe("formatDateBR", () => {
  it("exibe a data por extenso em pt-BR", () => {
    // 22/08/2026 00:00 em America/Sao_Paulo (UTC-3).
    expect(formatDateBR(new Date("2026-08-22T03:00:00.000Z"))).toBe(
      "22 de agosto de 2026",
    );
  });

  it("usa o fuso de São Paulo, e não UTC, na virada do dia", () => {
    // Ainda 21/08 às 23:59 em São Paulo, embora já seja 22/08 em UTC.
    expect(formatDateBR(new Date("2026-08-22T02:59:00.000Z"))).toBe(
      "21 de agosto de 2026",
    );
  });

  it("não desloca o dia para o instante inicial do dia em São Paulo", () => {
    // 01/01/2026 00:00 em São Paulo continua sendo dia 1º de janeiro.
    expect(formatDateBR(new Date("2026-01-01T03:00:00.000Z"))).toBe(
      "1 de janeiro de 2026",
    );
  });
});

describe("slugify", () => {
  it("remove acentos e deixa tudo minúsculo", () => {
    expect(slugify("Educação Inclusiva")).toBe("educacao-inclusiva");
  });

  it("remove pontuação e aspas tipográficas", () => {
    expect(slugify('Quando a criança diz "não"')).toBe(
      "quando-a-crianca-diz-nao",
    );
  });

  it("colapsa hífens e separadores repetidos em um único hífen", () => {
    expect(slugify("AT  —  não  é  babá")).toBe("at-nao-e-baba");
  });

  it("não deixa hífen no início nem no fim", () => {
    expect(slugify("  ¡Olá!  ")).toBe("ola");
  });

  it("preserva um slug que já está no formato final", () => {
    expect(slugify("at-nao-e-baba")).toBe("at-nao-e-baba");
  });

  it("mantém números no slug", () => {
    expect(slugify("180 horas de capacitação")).toBe(
      "180-horas-de-capacitacao",
    );
  });

  it("devolve string vazia quando o texto não tem caractere aproveitável", () => {
    expect(slugify("—  ·  !")).toBe("");
  });
});

describe("formatarTelefoneBR", () => {
  it("formata um celular E.164 com o codigo do pais", () => {
    expect(formatarTelefoneBR("5511987654321")).toBe("(11) 98765-4321");
  });

  it("formata um telefone fixo de oito digitos", () => {
    expect(formatarTelefoneBR("551133334444")).toBe("(11) 3333-4444");
  });

  it("aceita numero ja pontuado, ignorando a pontuacao", () => {
    expect(formatarTelefoneBR("+55 (11) 98765-4321")).toBe("(11) 98765-4321");
  });

  it("devolve o valor original quando o numero nao bate com o padrao", () => {
    expect(formatarTelefoneBR("123")).toBe("123");
  });
});
