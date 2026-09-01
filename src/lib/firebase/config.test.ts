import { describe, expect, it } from "vitest";

import {
  type AmbienteFirebase,
  lerConfiguracaoFirebase,
} from "@/lib/firebase/config";

const ambienteCompleto: AmbienteFirebase = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "chave-api",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "projeto.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "projeto",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "projeto.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:abc",
};

const semAsVariaveis = (
  ...variaveis: Array<keyof AmbienteFirebase>
): AmbienteFirebase => {
  const ambiente: AmbienteFirebase = { ...ambienteCompleto };
  for (const variavel of variaveis) {
    delete ambiente[variavel];
  }
  return ambiente;
};

describe("lerConfiguracaoFirebase", () => {
  it("devolve a configuração tipada quando todas as variáveis existem", () => {
    expect(lerConfiguracaoFirebase(ambienteCompleto)).toEqual({
      apiKey: "chave-api",
      authDomain: "projeto.firebaseapp.com",
      projectId: "projeto",
      storageBucket: "projeto.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abc",
    });
  });

  it("nomeia a variável faltante na mensagem de erro", () => {
    expect(() =>
      lerConfiguracaoFirebase(semAsVariaveis("NEXT_PUBLIC_FIREBASE_PROJECT_ID")),
    ).toThrow(
      "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
    );
  });

  it("nomeia todas as variáveis faltantes, não apenas a primeira", () => {
    expect(() =>
      lerConfiguracaoFirebase(
        semAsVariaveis(
          "NEXT_PUBLIC_FIREBASE_API_KEY",
          "NEXT_PUBLIC_FIREBASE_APP_ID",
        ),
      ),
    ).toThrow(
      "Configuração do Firebase incompleta. Defina as variáveis de ambiente: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_APP_ID.",
    );
  });

  it("trata variável em branco como ausente e a nomeia", () => {
    expect(() =>
      lerConfiguracaoFirebase({
        ...ambienteCompleto,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "   ",
      }),
    ).toThrow(
      "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.",
    );
  });
});
