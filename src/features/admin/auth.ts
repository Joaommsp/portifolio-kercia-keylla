"use client";

/**
 * Entrada e saída da sessão da autora.
 *
 * As duas escritas de sessão moram no mesmo lugar, e a tradução do erro
 * acontece aqui, não na tela: a mensagem exibida é sempre a que corresponde ao
 * código do Firebase, e credencial recusada nunca diz se o e-mail existe
 * (ADM-03).
 */

import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { obterAuth } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/** Autentica a autora. Não lança: devolve `{ erro }` com a mensagem traduzida. */
export async function entrar(
  email: string,
  senha: string,
): Promise<Resultado<null>> {
  try {
    await signInWithEmailAndPassword(obterAuth(), email, senha);
    return { dados: null };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/** Encerra a sessão. Não lança: devolve `{ erro }` com a mensagem traduzida. */
export async function sair(): Promise<Resultado<null>> {
  try {
    await signOut(obterAuth());
    return { dados: null };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}
