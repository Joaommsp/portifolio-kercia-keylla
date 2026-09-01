/**
 * Firestore falso para os testes de leitura.
 *
 * As queries não tocam a rede: `collection` e `query` devolvem um objeto
 * inspecionável, para o teste conferir filtro, ordenação e limite; `getDocs` é
 * um mock que cada teste resolve ou rejeita como precisar.
 */

import { vi } from "vitest";

export type RestricaoFalsa =
  | { tipo: "where"; campo: string; operador: string; valor: unknown }
  | { tipo: "orderBy"; campo: string; direcao: string }
  | { tipo: "limit"; quantidade: number };

export type ConsultaFalsa = {
  colecao: string;
  restricoes: readonly RestricaoFalsa[];
};

/** Módulo `firebase/firestore` falso, para usar dentro de `vi.mock`. */
export function criarModuloFirestoreFalso() {
  return {
    collection: vi.fn((_db: unknown, colecao: string) => ({
      colecao,
      restricoes: [] as RestricaoFalsa[],
    })),
    query: vi.fn(
      (base: ConsultaFalsa, ...restricoes: RestricaoFalsa[]): ConsultaFalsa => ({
        colecao: base.colecao,
        restricoes,
      }),
    ),
    where: vi.fn(
      (campo: string, operador: string, valor: unknown): RestricaoFalsa => ({
        tipo: "where",
        campo,
        operador,
        valor,
      }),
    ),
    orderBy: vi.fn(
      (campo: string, direcao = "asc"): RestricaoFalsa => ({
        tipo: "orderBy",
        campo,
        direcao,
      }),
    ),
    limit: vi.fn(
      (quantidade: number): RestricaoFalsa => ({ tipo: "limit", quantidade }),
    ),
    getDocs: vi.fn(),
  };
}

/** Snapshot com os documentos informados, no formato que o SDK devolve. */
export function criarSnapshot(
  documentos: ReadonlyArray<{ id: string; dados: Record<string, unknown> }>,
) {
  return {
    empty: documentos.length === 0,
    docs: documentos.map(({ id, dados }) => ({ id, data: () => dados })),
  };
}

/** Erro no formato do SDK: `Error` com `code`. */
export class ErroFirestoreFalso extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "FirebaseError";
  }
}
