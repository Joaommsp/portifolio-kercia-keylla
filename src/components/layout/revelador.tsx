"use client";

import { useEffect } from "react";

/**
 * Revela os blocos marcados com `data-revelar` quando eles entram na tela.
 *
 * Substitui `animation-timeline: view()`, que só existe no Chrome — no Safari e
 * no Firefox a regra era ignorada e o site não animava nada. Aqui é
 * `IntersectionObserver`, suportado em todo navegador que interessa.
 *
 * O CSS só esconde o que está marcado DEPOIS que este componente monta e põe
 * `data-revelacao="ativa"` no documento: sem JS, ou se este código falhar, todo
 * o conteúdo aparece normalmente — o texto nunca fica preso invisível.
 */
export function Revelador() {
  useEffect(() => {
    const raiz = document.documentElement;
    const querMenosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (querMenosMovimento) return;

    raiz.dataset.revelacao = "ativa";

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;

          entrada.target.setAttribute("data-revelado", "");
          observador.unobserve(entrada.target);
        }
      },
      // Começa um pouco antes de o bloco encostar na borda: a entrada acontece
      // enquanto ele sobe, não depois de já estar parado no meio da tela.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    for (const alvo of document.querySelectorAll("[data-revelar]")) {
      observador.observe(alvo);
    }

    return () => {
      observador.disconnect();
      delete raiz.dataset.revelacao;
    };
  }, []);

  return null;
}
