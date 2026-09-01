/**
 * Firestore falso para os testes de leitura e de escrita.
 *
 * Nada toca a rede: `collection` e `query` devolvem um objeto inspecionável,
 * para o teste conferir filtro, ordenação e limite; `getDocs`, `addDoc`,
 * `updateDoc` e `deleteDoc` são mocks que cada teste resolve ou rejeita como
 * precisar.
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

/** Referência de documento que o `doc` falso devolve. */
export type ReferenciaFalsa = { colecao: string; id: string };

/**
 * O que o `serverTimestamp()` devolve no lugar do sentinela do SDK — o teste
 * confere a identidade deste objeto para saber que a data ficou a cargo do
 * relógio do servidor.
 */
export const MARCA_DO_SERVIDOR = { sentinela: "serverTimestamp" } as const;

/** Id que o `addDoc` falso devolve para o documento criado. */
export const ID_CRIADO = "id-criado";

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
    getDoc: vi.fn(),
    doc: vi.fn((_db: unknown, colecao: string, id: string) => ({
      colecao,
      id,
    })),
    addDoc: vi.fn(async () => ({ id: ID_CRIADO })),
    updateDoc: vi.fn(async () => undefined),
    deleteDoc: vi.fn(async () => undefined),
    serverTimestamp: vi.fn(() => MARCA_DO_SERVIDOR),
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
