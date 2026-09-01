"use client";

/**
 * Carga de uma leitura que devolve `Resultado`.
 *
 * Concentra a máquina de estado que as telas do painel repetiam: `null`
 * enquanto a leitura não voltou, `{ dados }` ou `{ erro }` depois. A guarda de
 * atividade vale para os dois caminhos — a carga inicial e as releituras
 * disparadas por uma ação —, porque gravar estado de uma leitura que voltou
 * depois da tela sair deixa o carregamento pendurado no lugar errado.
 *
 * `ler` precisa ser estável (função de módulo ou `useCallback`). Passe `null`
 * quando não há o que ler — o caso da publicação nova, que não tem documento.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type { Resultado } from "@/lib/resultado";

export function useCarga<T>(ler: (() => Promise<Resultado<T>>) | null): {
  /** `null` enquanto a leitura não respondeu. */
  readonly resultado: Resultado<T> | null;
  /** Relê. Usada depois de cada ação que deu certo. */
  readonly recarregar: () => Promise<void>;
} {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const ativo = useRef(true);

  const recarregar = useCallback(async () => {
    if (ler === null) {
      return;
    }

    const lido = await ler();

    if (ativo.current) {
      setResultado(lido);
    }
  }, [ler]);

  useEffect(() => {
    ativo.current = true;

    void (async () => {
      if (ler === null) {
        return;
      }

      const lido = await ler();

      if (ativo.current) {
        setResultado(lido);
      }
    })();

    return () => {
      ativo.current = false;
    };
  }, [ler]);

  return { resultado, recarregar };
}
