import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Revelador } from "@/components/layout/revelador";

type Retorno = { alvos: Element[]; disparar: (alvo: Element) => void };

/**
 * Dublê que devolve o controle do observador ao teste: nada aparece sozinho,
 * então dá para asserir tanto o estado antes quanto depois da entrada.
 */
function instalarObservador(): Retorno {
  const controle: Retorno = { alvos: [], disparar: () => {} };

  globalThis.IntersectionObserver = class {
    private readonly aoEntrar: IntersectionObserverCallback;

    constructor(aoEntrar: IntersectionObserverCallback) {
      this.aoEntrar = aoEntrar;
      controle.disparar = (alvo) => {
        this.aoEntrar(
          [{ isIntersecting: true, target: alvo } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };
    }

    observe(alvo: Element) {
      controle.alvos.push(alvo);
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;

  return controle;
}

function comPreferenciaDeMovimento(reduzir: boolean) {
  window.matchMedia = ((consulta: string) => ({
    matches: reduzir,
    media: consulta,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  comPreferenciaDeMovimento(false);
});

afterEach(() => {
  delete document.documentElement.dataset.revelacao;
});

describe("Revelador", () => {
  it("marca o documento e revela o bloco quando ele entra na tela", () => {
    const observador = instalarObservador();
    render(
      <>
        <article data-revelar>bloco</article>
        <Revelador />
      </>,
    );

    expect(document.documentElement.dataset.revelacao).toBe("ativa");

    const bloco = observador.alvos[0];
    expect(bloco.hasAttribute("data-revelado")).toBe(false);

    observador.disparar(bloco);
    expect(bloco.hasAttribute("data-revelado")).toBe(true);
  });

  it("não esconde nada de quem pede menos movimento (SIT-06)", () => {
    // O bloco só fica invisível se o documento estiver marcado; sem a marca, o
    // CSS não esconde e a entrada simplesmente não acontece.
    comPreferenciaDeMovimento(true);
    instalarObservador();

    render(
      <>
        <article data-revelar>bloco</article>
        <Revelador />
      </>,
    );

    expect(document.documentElement.dataset.revelacao).toBeUndefined();
  });

  it("desmarca o documento ao sair, para o conteúdo não ficar preso invisível", () => {
    instalarObservador();
    const { unmount } = render(
      <>
        <article data-revelar>bloco</article>
        <Revelador />
      </>,
    );

    unmount();

    expect(document.documentElement.dataset.revelacao).toBeUndefined();
  });
});
