/**
 * Firebase Auth falso para os testes do painel.
 *
 * Nenhum teste toca a rede: o módulo devolvido substitui `firebase/auth` dentro
 * de um `vi.mock`, e cada teste decide quando a sessão resolve, com qual
 * usuária, e quando a chamada falha.
 */

import type { User } from "firebase/auth";
import { vi } from "vitest";

/** Usuária autenticada como o SDK a entrega, com o mínimo que o painel usa. */
export function criarUsuarioFalso(
  email = "keylla@exemplo.com.br",
): User {
  return { uid: "uid-da-autora", email } as User;
}

/** Módulo `firebase/auth` falso, para usar dentro de `vi.mock`. */
export function criarModuloAuthFalso() {
  return {
    onAuthStateChanged: vi.fn(() => vi.fn()),
    signOut: vi.fn(async () => undefined),
    signInWithEmailAndPassword: vi.fn(async () => ({
      user: criarUsuarioFalso(),
    })),
  };
}
