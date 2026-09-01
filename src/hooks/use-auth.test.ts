import { act, renderHook, waitFor } from "@testing-library/react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { useAuth } from "@/hooks/use-auth";
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

const onAuthStateChangedFalso = onAuthStateChanged as unknown as Mock;
const signOutFalso = signOut as unknown as Mock;
const obterAuthFalso = obterAuth as unknown as Mock;

/** Mensagem que a configuração do Firebase lança quando falta uma variável. */
const ERRO_DE_CONFIGURACAO =
  "Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_API_KEY.";

/** Callbacks que o hook registrou, para o teste resolver a sessão quando quiser. */
let avisarSessao: (usuario: User | null) => void;
let avisarFalha: (erro: unknown) => void;
const cancelarEscuta = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  obterAuthFalso.mockReturnValue({});
  signOutFalso.mockResolvedValue(undefined);
  onAuthStateChangedFalso.mockImplementation(
    (
      _auth: unknown,
      proximo: (usuario: User | null) => void,
      falha: (erro: unknown) => void,
    ) => {
      avisarSessao = proximo;
      avisarFalha = falha;
      return cancelarEscuta;
    },
  );
});

describe("useAuth", () => {
  it("começa carregando, e não deslogado, enquanto o Firebase não responde", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.carregando).toBe(true);
    expect(result.current.usuario).toBeNull();
    expect(result.current.erro).toBeNull();
  });

  it("expõe a usuária quando existe sessão", async () => {
    const autora = criarUsuarioFalso();
    const { result } = renderHook(() => useAuth());

    act(() => avisarSessao(autora));

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.usuario).toBe(autora);
  });

  it("sai de carregando com usuário nulo quando não há sessão", async () => {
    const { result } = renderHook(() => useAuth());

    act(() => avisarSessao(null));

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.usuario).toBeNull();
  });

  it("remove o listener no unmount", () => {
    const { unmount } = renderHook(() => useAuth());

    expect(cancelarEscuta).not.toHaveBeenCalled();

    unmount();

    expect(cancelarEscuta).toHaveBeenCalledTimes(1);
  });

  it("devolve a mensagem que nomeia a variável faltante quando o Firebase não está configurado", async () => {
    obterAuthFalso.mockImplementation(() => {
      throw new Error(ERRO_DE_CONFIGURACAO);
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBe(ERRO_DE_CONFIGURACAO);
    expect(result.current.usuario).toBeNull();
  });

  it("traduz a falha do listener e não fica preso em carregando", async () => {
    const { result } = renderHook(() => useAuth());

    act(() =>
      avisarFalha(
        Object.assign(new Error("Missing or insufficient permissions."), {
          code: "permission-denied",
        }),
      ),
    );

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBe(
      "Você não tem permissão para esta operação.",
    );
  });

  it("encerra a sessão pelo signOut do Firebase", async () => {
    const { result } = renderHook(() => useAuth());

    const resultado = await act(() => result.current.sair());

    expect(signOutFalso).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({ dados: null });
  });

  it("devolve a mensagem do Firebase quando o signOut falha", async () => {
    signOutFalso.mockRejectedValue(
      Object.assign(new Error("A rede falhou."), {
        code: "auth/network-request-failed",
      }),
    );

    const { result } = renderHook(() => useAuth());

    const resultado = await act(() => result.current.sair());

    expect(resultado).toEqual({
      erro: "Não foi possível falar com o Firebase. Verifique sua conexão e tente de novo.",
    });
  });
});
