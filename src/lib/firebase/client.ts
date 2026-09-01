/**
 * Instâncias únicas do Firebase.
 *
 * `getApps()` evita reinicializar o app a cada hot reload do Next — inicializar
 * duas vezes com o mesmo nome derruba o SDK.
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { lerConfiguracaoFirebase } from "@/lib/firebase/config";

const app =
  getApps().length > 0 ? getApp() : initializeApp(lerConfiguracaoFirebase());

export const db = getFirestore(app);
export const auth = getAuth(app);
