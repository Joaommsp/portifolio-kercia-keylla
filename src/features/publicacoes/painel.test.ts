import { getDocs } from "firebase/firestore";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  listarNoPainel,
  LIMITE_PUBLICACOES_PAINEL,
} from "@/features/publicacoes/painel";
import { LIMITE_PUBLICACOES_HOME } from "@/features/publicacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import {
  type ConsultaFalsa,
  criarSnapshot,
  ErroFirestoreFalso,
} from "@/test/firestore";

vi.mock("@/lib/firebase/client", () => ({
  obterDb: vi.fn(() => ({})),
  obterAuth: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", async () => {
  const { criarModuloFirestoreFalso } = await import("@/test/firestore");
  return criarModuloFirestoreFalso();
});

const getDocsFalso = getDocs as unknown as Mock;
const obterDbFalso = obterDb as unknown as Mock;

const consultaExecutada = (): ConsultaFalsa =>
  getDocsFalso.mock.calls[0][0] as ConsultaFalsa;

const documento = (
  id: string,
  dados: Record<string, unknown> = {},
): { id: string; dados: Record<string, unknown> } => ({
  id,
  dados: { titulo: `Texto ${id}`, slug: id, ...dados },
});

const emisso = (iso: string) => ({ toDate: () => new Date(iso) });

beforeEach(() => {
  vi.clearAllMocks();
  obterDbFalso.mockReturnValue({});
});

describe("listarNoPainel", () => {
  it("traz também os rascunhos, sem filtrar por publicado", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("no-ar", {
          publicado: true,
          publicadoEm: emisso("2026-08-22T03:00:00.000Z"),
        }),
        documento("rascunho", {
          publicado: false,
          publicadoEm: emisso("2026-08-20T03:00:00.000Z"),
        }),
      ]),
    );

    const resultado = await listarNoPainel();

    expect(resultado).toEqual({
      dados: [
        expect.objectContaining({ id: "no-ar", publicado: true }),
        expect.objectContaining({ id: "rascunho", publicado: false }),
      ],
    });
    expect(consultaExecutada().restricoes).not.toContainEqual(
      expect.objectContaining({ tipo: "where" }),
    );
  });

  it("ordena da mais recente para a mais antiga e deixa a sem data no fim", async () => {
    getDocsFalso.mockResolvedValue(
      criarSnapshot([
        documento("sem-data"),
        documento("antiga", { publicadoEm: emisso("2026-01-10T03:00:00.000Z") }),
        documento("recente", { publicadoEm: emisso("2026-08-22T03:00:00.000Z") }),
      ]),
    );

    const resultado = await listarNoPainel();

    expect("dados" in resultado && resultado.dados.map((p) => p.id)).toEqual([
      "recente",
      "antiga",
      "sem-data",
    ]);
  });

  it("usa o teto do painel, e não o limite da home", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    await listarNoPainel();

    expect(consultaExecutada().restricoes).toContainEqual({
      tipo: "limit",
      quantidade: LIMITE_PUBLICACOES_PAINEL,
    });
    expect(LIMITE_PUBLICACOES_PAINEL).toBeGreaterThan(LIMITE_PUBLICACOES_HOME);
  });

  it("devolve lista vazia, e não erro, quando não há publicação", async () => {
    getDocsFalso.mockResolvedValue(criarSnapshot([]));

    expect(await listarNoPainel()).toEqual({ dados: [] });
  });

  it("devolve a mensagem traduzida do Firebase quando a leitura falha", async () => {
    getDocsFalso.mockRejectedValue(
      new ErroFirestoreFalso(
        "permission-denied",
        "Missing or insufficient permissions.",
      ),
    );

    expect(await listarNoPainel()).toEqual({
      erro: "Você não tem permissão para esta operação.",
    });
  });
});
