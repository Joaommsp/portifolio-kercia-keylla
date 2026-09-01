/**
 * Instâncias do Firebase, criadas sob demanda.
 *
 * A inicialização é preguiçosa de propósito: `lerConfiguracaoFirebase()` lança
 * quando falta variável de ambiente, e inicializar no topo do módulo faria esse
 * erro estourar na avaliação do import — fora do `try` das queries, derrubando
 * a página inteira. Chamado de dentro da leitura, o mesmo erro vira `{ erro }`
 * na seção, com a mensagem que nomeia a variável faltante (SIT-06, PUB-05).
 *
 * `getApps()` evita reinicializar o app a cada hot reload do Next.
 */

import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

import { lerConfiguracaoFirebase } from "@/lib/firebase/config";

let app: FirebaseApp | null = null;

function obterApp(): FirebaseApp {
  if (app === null) {
    app =
      getApps().length > 0 ? getApp() : initializeApp(lerConfiguracaoFirebase());
  }

  return app;
}

/** Firestore do app. O SDK devolve sempre a mesma instância por app. */
export function obterDb(): Firestore {
  return getFirestore(obterApp());
}

/** Auth do app. O SDK devolve sempre a mesma instância por app. */
export function obterAuth(): Auth {
  return getAuth(obterApp());
}
