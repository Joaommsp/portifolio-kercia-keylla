"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Guarda de alterações não salvas, compartilhada pelo painel.
 *
 * O editor publica aqui que há texto pendente; o cabeçalho consulta antes de
 * navegar. Sem isto a rede tinha buraco justamente onde a autora clica por
 * engano: o botão "Voltar" perguntava, mas os links "Publicações" e "Ver o
 * site" saíam calados, porque navegação client-side não dispara `beforeunload`.
 */
type Pendencia = {
  /** Marca que há alteração não salva. */
  marcar: (pendente: boolean) => void;
  /**
   * Roda `sair` se não houver pendência; senão guarda a intenção e devolve
   * `false`, para quem chamou abrir a pergunta.
   */
  tentarSair: (sair: () => void) => boolean;
  /** Executa a saída que ficou guardada, depois da confirmação. */
  confirmarSaida: () => void;
  /** Descarta a intenção guardada. */
  cancelarSaida: () => void;
  temPendencia: boolean;
  perguntando: boolean;
};

const ContextoDePendencia = createContext<Pendencia | null>(null);

export function ProvedorDePendencia({ children }: { children: ReactNode }) {
  const [temPendencia, setTemPendencia] = useState(false);
  const [perguntando, setPerguntando] = useState(false);
  const saidaGuardada = useRef<(() => void) | null>(null);

  const marcar = useCallback((pendente: boolean) => {
    setTemPendencia(pendente);
  }, []);

  const tentarSair = useCallback(
    (sair: () => void) => {
      if (!temPendencia) {
        sair();
        return true;
      }

      saidaGuardada.current = sair;
      setPerguntando(true);
      return false;
    },
    [temPendencia],
  );

  const confirmarSaida = useCallback(() => {
    setPerguntando(false);
    setTemPendencia(false);
    saidaGuardada.current?.();
    saidaGuardada.current = null;
  }, []);

  const cancelarSaida = useCallback(() => {
    setPerguntando(false);
    saidaGuardada.current = null;
  }, []);

  const valor = useMemo(
    () => ({
      marcar,
      tentarSair,
      confirmarSaida,
      cancelarSaida,
      temPendencia,
      perguntando,
    }),
    [
      marcar,
      tentarSair,
      confirmarSaida,
      cancelarSaida,
      temPendencia,
      perguntando,
    ],
  );

  return (
    <ContextoDePendencia.Provider value={valor}>
      {children}
    </ContextoDePendencia.Provider>
  );
}

export function usePendencia(): Pendencia {
  const contexto = useContext(ContextoDePendencia);

  if (contexto === null) {
    throw new Error(
      "usePendencia precisa do ProvedorDePendencia, montado no layout do painel.",
    );
  }

  return contexto;
}
