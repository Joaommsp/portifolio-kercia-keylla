import { describe, expect, it } from "vitest";

import {
  MENSAGEM_SEM_DETALHE,
  traduzirErroFirebase,
} from "@/lib/firebase/errors";

/** Reproduz o formato de erro do SDK: classe de Error com `code`. */
class ErroFirebaseFalso extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "FirebaseError";
  }
}

describe("traduzirErroFirebase", () => {
  it("traduz credencial inválida do Auth", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso(
          "auth/invalid-credential",
          "Firebase: Error (auth/invalid-credential).",
        ),
      ),
    ).toBe("E-mail ou senha incorretos.");
  });

  it("traduz excesso de tentativas do Auth", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso(
          "auth/too-many-requests",
          "Firebase: Error (auth/too-many-requests).",
        ),
      ),
    ).toBe(
      "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.",
    );
  });

  it("traduz permissão negada do Firestore", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso(
          "permission-denied",
          "Missing or insufficient permissions.",
        ),
      ),
    ).toBe("Você não tem permissão para esta operação.");
  });

  it("traduz indisponibilidade do Firestore", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso("unavailable", "Failed to get document."),
      ),
    ).toBe(
      "O banco de dados está indisponível no momento. Tente de novo em instantes.",
    );
  });

  it("traduz falha de rede do Auth", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso(
          "auth/network-request-failed",
          "Firebase: Error (auth/network-request-failed).",
        ),
      ),
    ).toBe(
      "Não foi possível falar com o Firebase. Verifique sua conexão e tente de novo.",
    );
  });

  it("usa a mesma mensagem para e-mail inexistente e senha errada, sem revelar qual foi", () => {
    const usuarioInexistente = traduzirErroFirebase(
      new ErroFirebaseFalso("auth/user-not-found", "Firebase: Error."),
    );
    const senhaErrada = traduzirErroFirebase(
      new ErroFirebaseFalso("auth/wrong-password", "Firebase: Error."),
    );
    const credencialInvalida = traduzirErroFirebase(
      new ErroFirebaseFalso("auth/invalid-credential", "Firebase: Error."),
    );

    expect(usuarioInexistente).toBe(credencialInvalida);
    expect(senhaErrada).toBe(credencialInvalida);
    // A mensagem não pode afirmar que a conta não existe nem que a senha
    // está errada — é isso que permitiria enumerar contas.
    expect(usuarioInexistente).not.toMatch(
      /não (existe|foi encontrad|está cadastrad)|inexistente|senha (errada|incorreta|inválida)/i,
    );
  });

  it("devolve a mensagem original quando o código é desconhecido", () => {
    expect(
      traduzirErroFirebase(
        new ErroFirebaseFalso(
          "firestore/quota-exceeded",
          "Quota exceeded for project portfolio-keylla.",
        ),
      ),
    ).toBe("Quota exceeded for project portfolio-keylla.");
  });

  it("devolve a mensagem de um Error comum, sem código", () => {
    expect(traduzirErroFirebase(new Error("fetch failed"))).toBe("fetch failed");
  });

  it("devolve o texto quando o valor lançado é uma string", () => {
    expect(traduzirErroFirebase("conexão recusada")).toBe("conexão recusada");
  });

  it("cai no último recurso quando não há código nem mensagem", () => {
    expect(traduzirErroFirebase(undefined)).toBe(MENSAGEM_SEM_DETALHE);
  });
});
