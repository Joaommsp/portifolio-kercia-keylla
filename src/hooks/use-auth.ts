"use client";

/**
 * Sessão da autora no painel.
 *
 * O estado nasce em `carregando` e nunca em "deslogado": o Firebase resolve a
 * sessão de forma assíncrona, e assumir ausência de sessão antes disso faria a
 * tela de login piscar para quem já está autenticado (ADM-01).
 *
 * A falha nunca lança: configuração ausente ou erro do listener viram `erro`
 * com a mensagem traduzida, do mesmo jeito que a leitura pública degrada a
 * seção em vez de derrubar a página (AD-011).
 */

import { onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { sair } from "@/features/admin/auth";
import { obterAuth } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";

export type Sessao = {
  /** Usuária autenticada, ou `null` quando não há sessão. */
  readonly usuario: User | null;
  /** `true` enquanto o Firebase ainda não disse se existe sessão. */
  readonly carregando: boolean;
  /** Mensagem do Firebase quando nem foi possível consultar a sessão. */
  readonly erro: string | null;
  /** Encerra a sessão. Não lança: devolve `{ erro }` quando falha. */
  readonly sair: typeof sair;
};

type Inicio =
  | { readonly auth: Auth; readonly erro: null }
  | { readonly auth: null; readonly erro: string };

/**
 * Resolve o Auth uma única vez, no primeiro render. Sem instância não há o que
 * escutar: a sessão já nasce resolvida, em erro — esperar por um listener que
 * nunca será registrado deixaria o painel preso em "carregando".
 */
function iniciar(): Inicio {
  try {
    return { auth: obterAuth(), erro: null };
  } catch (falha) {
    return { auth: null, erro: traduzirErroFirebase(falha) };
  }
}

export function useAuth(): Sessao {
  const [inicio] = useState(iniciar);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(inicio.erro === null);
  const [erro, setErro] = useState<string | null>(inicio.erro);

  useEffect(() => {
    if (inicio.auth === null) {
      return;
    }

    return onAuthStateChanged(
      inicio.auth,
      (autenticada) => {
        setUsuario(autenticada);
        setErro(null);
        setCarregando(false);
      },
      (falha) => {
        setErro(traduzirErroFirebase(falha));
        setCarregando(false);
      },
    );
  }, [inicio.auth]);

  // `sair` vem de `features/admin/auth`, junto com o `entrar`: escrita de
  // sessão é serviço, não estado do hook.
  return { usuario, carregando, erro, sair };
}
