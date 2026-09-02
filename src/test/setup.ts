import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom não implementa `IntersectionObserver`, e o `Revelador` das páginas
 * públicas depende dele. O dublê nunca dispara: em teste o conteúdo já nasce
 * visível, que é o estado que interessa asserir.
 */
class ObservadorDeInterseccaoFalso implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  ObservadorDeInterseccaoFalso as unknown as typeof IntersectionObserver;

/**
 * jsdom também não implementa `matchMedia`. O dublê responde "não há
 * preferência": é o caminho que exercita o comportamento normal do site.
 */
if (typeof window !== "undefined" && window.matchMedia === undefined) {
  window.matchMedia = ((consulta: string) => ({
    matches: false,
    media: consulta,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
