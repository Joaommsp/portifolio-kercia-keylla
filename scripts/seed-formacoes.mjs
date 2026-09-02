/**
 * Carga única das formações do currículo no Firestore.
 *
 * Roda como a autora: as regras exigem uid da allowlist para escrever, então o
 * script faz login com e-mail e senha antes de gravar. Nada de service account.
 *
 *   SEED_EMAIL=... SEED_SENHA=... npm run seed:formacoes
 *
 * É idempotente pelo título: rodar duas vezes atualiza o documento existente em
 * vez de duplicá-lo.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const COLECAO = "formacoes";

function exigir(nome) {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(
      `Variável ${nome} não definida. Rode: SEED_EMAIL=... SEED_SENHA=... npm run seed:formacoes`,
    );
  }
  return valor;
}

function lerEnvLocal() {
  const texto = readFileSync(join(RAIZ, ".env.local"), "utf8");
  for (const linha of texto.split("\n")) {
    const par = linha.match(/^([A-Z0-9_]+)=(.*)$/);
    if (par && !process.env[par[1]]) process.env[par[1]] = par[2].trim();
  }
}

function lerFormacoes() {
  const { formacoes } = JSON.parse(
    readFileSync(join(RAIZ, "scripts", "formacoes.json"), "utf8"),
  );

  const semAno = formacoes.filter((formacao) => formacao.ano === null);
  if (semAno.length > 0) {
    throw new Error(
      `Preencha o ano em scripts/formacoes.json antes da carga — ${semAno.length} sem ano:\n` +
        semAno.map((formacao) => `  · ${formacao.titulo}`).join("\n") +
        "\n\nO currículo não traz essas datas, e o script não inventa nenhuma.",
    );
  }

  return formacoes;
}

const formacoes = lerFormacoes();
lerEnvLocal();

const app = initializeApp({
  apiKey: exigir("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: exigir("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: exigir("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: exigir("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: exigir("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: exigir("NEXT_PUBLIC_FIREBASE_APP_ID"),
});

const credenciais = await signInWithEmailAndPassword(
  getAuth(app),
  exigir("SEED_EMAIL"),
  exigir("SEED_SENHA"),
);
console.log(`Autenticada como ${credenciais.user.email}`);

const db = getFirestore(app);
let criadas = 0;
let atualizadas = 0;

for (const formacao of formacoes) {
  const existentes = await getDocs(
    query(collection(db, COLECAO), where("titulo", "==", formacao.titulo)),
  );

  if (existentes.empty) {
    await addDoc(collection(db, COLECAO), formacao);
    criadas += 1;
    console.log(`+ ${formacao.titulo}`);
  } else {
    await updateDoc(existentes.docs[0].ref, formacao);
    atualizadas += 1;
    console.log(`~ ${formacao.titulo}`);
  }
}

console.log(`\n${criadas} criadas, ${atualizadas} atualizadas.`);
process.exit(0);
