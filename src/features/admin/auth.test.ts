import { signInWithEmailAndPassword } from "firebase/auth";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { entrar } from "@/features/admin/auth";
import { obterAuth } from "@/lib/firebase/client";
import { criarUsuarioFalso } from "@/test/auth";

vi.mock("@/lib/firebase/client", () => ({
  obterDb: vi.fn(() => ({})),
  obterAuth: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", async () => {
  const { criarModuloAuthFalso } = await import("@/test/auth");
  return criarModuloAuthFalso();
});

const entrarNoFirebase = signInWithEmailAndPassword as unknown as Mock;
const obterAuthFalso = obterAuth as unknown as Mock;

const CREDENCIAL_RECUSADA = "E-mail ou senha incorretos.";

/** Erro no formato do SDK: `Error` com `code`. */
const erroDoFirebase = (code: string, message: string) =>
  Object.assign(new Error(message), { code });

beforeEach(() => {
  vi.clearAllMocks();
  obterAuthFalso.mockReturnValue({});
  entrarNoFirebase.mockResolvedValue({ user: criarUsuarioFalso() });
});

describe("entrar", () => {
  it("autentica com o e-mail e a senha informados", async () => {
    const resultado = await entrar("keylla@exemplo.com.br", "senha-secreta");

    expect(entrarNoFirebase).toHaveBeenCalledWith(
      expect.anything(),
      "keylla@exemplo.com.br",
      "senha-secreta",
    );
    expect(resultado).toEqual({ dados: null });
  });

  it("devolve a mesma mensagem para credencial inválida e para e-mail inexistente", async () => {
    entrarNoFirebase.mockRejectedValue(
      erroDoFirebase("auth/invalid-credential", "Firebase: Error."),
    );
    const credencialInvalida = await entrar("keylla@exemplo.com.br", "errada");

    entrarNoFirebase.mockRejectedValue(
      erroDoFirebase("auth/user-not-found", "Firebase: Error."),
    );
    const emailInexistente = await entrar("ninguem@exemplo.com.br", "errada");

    expect(credencialInvalida).toEqual({ erro: CREDENCIAL_RECUSADA });
    expect(emailInexistente).toEqual({ erro: CREDENCIAL_RECUSADA });
  });

  it("traduz o bloqueio por excesso de tentativas", async () => {
    entrarNoFirebase.mockRejectedValue(
      erroDoFirebase("auth/too-many-requests", "Too many attempts."),
    );

    expect(await entrar("keylla@exemplo.com.br", "errada")).toEqual({
      erro: "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.",
    });
  });

  it("devolve erro, e não exceção, quando o Firebase não está configurado", async () => {
    const mensagem =
      "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_API_KEY.";
    obterAuthFalso.mockImplementation(() => {
      throw new Error(mensagem);
    });

    await expect(entrar("keylla@exemplo.com.br", "senha")).resolves.toEqual({
      erro: mensagem,
    });
  });
});
