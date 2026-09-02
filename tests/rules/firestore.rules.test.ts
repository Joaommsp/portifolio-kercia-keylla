/**
 * Regras do Firestore sob teste (SEC-01).
 *
 * Roda contra o emulador, subido por `npm run test:rules` — não faz parte de
 * `npm test`, que não pode depender de Java nem de porta aberta.
 *
 * O uid da autora é lido do próprio `firestore.rules`: a allowlist é o que está
 * publicado, e o README manda trocar o placeholder pelo uid real. Ler o arquivo
 * mantém o teste válido depois dessa troca, e continua provando o essencial —
 * quem está na lista escreve, quem não está, não.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const CAMINHO_DAS_REGRAS = resolve(process.cwd(), "firestore.rules");
const REGRAS = readFileSync(CAMINHO_DAS_REGRAS, "utf8");

/** Primeiro uid da função `autoras()` das regras. */
const UID_DA_AUTORA =
  /function\s+autoras\(\)\s*\{[^}]*?'([^']+)'/.exec(REGRAS)?.[1] ?? "";

/** Qualquer uid autenticado que não esteja na allowlist. */
const UID_DE_FORA = "uid-de-quem-nao-e-a-autora";

const PUBLICADA = "no-ar";
const RASCUNHO = "rascunho";

const publicacao = (publicado: boolean) => ({
  titulo: "A AT não é babá",
  slug: publicado ? PUBLICADA : RASCUNHO,
  resumo: "Resumo",
  corpo: "Corpo",
  imagemUrl: null,
  tag: null,
  publicado,
  publicadoEm: new Date("2026-01-10T03:00:00.000Z"),
  atualizadoEm: null,
});

let ambiente: RulesTestEnvironment;

beforeAll(async () => {
  ambiente = await initializeTestEnvironment({
    // O `emulators:exec` exporta o `--project` do script; o literal é só a
    // saída para quem rodar a suíte com o emulador já de pé.
    projectId: process.env.GCLOUD_PROJECT ?? "demo-portfolio-keylla",
    firestore: { rules: REGRAS },
  });
});

afterAll(async () => {
  await ambiente?.cleanup();
});

beforeEach(async () => {
  await ambiente.clearFirestore();
  await ambiente.withSecurityRulesDisabled(async (contexto) => {
    const db = contexto.firestore();
    await setDoc(doc(db, "publicacoes", PUBLICADA), publicacao(true));
    await setDoc(doc(db, "publicacoes", RASCUNHO), publicacao(false));
  });
});

describe("allowlist das regras", () => {
  it("declara ao menos um uid autor", () => {
    expect(UID_DA_AUTORA).not.toBe("");
  });
});

describe("visitante anônimo", () => {
  it("lê uma publicação no ar", async () => {
    const db = ambiente.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(db, "publicacoes", PUBLICADA)));
  });

  it("não lê um rascunho", async () => {
    const db = ambiente.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "publicacoes", RASCUNHO)));
  });

  it("não lista a coleção sem filtrar pelo que está no ar", async () => {
    const db = ambiente.unauthenticatedContext().firestore();

    await assertFails(getDocs(query(collection(db, "publicacoes"))));
    await assertSucceeds(
      getDocs(
        query(collection(db, "publicacoes"), where("publicado", "==", true)),
      ),
    );
  });

  it("não cria, não edita e não apaga publicação", async () => {
    const db = ambiente.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(db, "publicacoes", "nova"), publicacao(true)));
    await assertFails(
      setDoc(doc(db, "publicacoes", PUBLICADA), publicacao(true)),
    );
    await assertFails(deleteDoc(doc(db, "publicacoes", PUBLICADA)));
  });

});

describe("autora da allowlist", () => {
  it("lê o rascunho que o visitante não alcança", async () => {
    const db = ambiente.authenticatedContext(UID_DA_AUTORA).firestore();

    await assertSucceeds(getDoc(doc(db, "publicacoes", RASCUNHO)));
  });

  it("cria, edita e apaga publicação", async () => {
    const db = ambiente.authenticatedContext(UID_DA_AUTORA).firestore();

    await assertSucceeds(
      setDoc(doc(db, "publicacoes", "nova"), publicacao(false)),
    );
    await assertSucceeds(
      setDoc(doc(db, "publicacoes", PUBLICADA), publicacao(true)),
    );
    await assertSucceeds(deleteDoc(doc(db, "publicacoes", RASCUNHO)));
  });
});

describe("uid fora da allowlist", () => {
  it("não escreve publicação", async () => {
    // Estar autenticado não basta: a allowlist é o que separa a autora de
    // qualquer conta do Firebase. Sem este caso, afrouxar `ehAutora()` para
    // `request.auth != null` passa com a suíte inteira verde.
    const db = ambiente.authenticatedContext(UID_DE_FORA).firestore();

    await assertFails(setDoc(doc(db, "publicacoes", "nova"), publicacao(true)));
    await assertFails(deleteDoc(doc(db, "publicacoes", PUBLICADA)));
  });

  it("não alcança coleção que as regras não declaram", async () => {
    // O `match /{document=**}` final nega tudo o que não foi liberado.
    const db = ambiente.authenticatedContext(UID_DE_FORA).firestore();

    await assertFails(getDoc(doc(db, "coisa-que-nao-existe", "x")));
  });

  it("não lê rascunho", async () => {
    const db = ambiente.authenticatedContext(UID_DE_FORA).firestore();

    await assertFails(getDoc(doc(db, "publicacoes", RASCUNHO)));
  });
});
