"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cabecalho, navegacao } from "@/content/site";

/**
 * Navegação do celular: abaixo de `menu` os seis rótulos não cabem em uma linha
 * no cabeçalho, e sem isto a página de nove seções só teria a rolagem — são
 * quase 18 telas em 320px.
 *
 * A folha sobe de baixo, onde o polegar já está. Por ser uma camada modal, ela
 * carrega o que uma camada modal exige: fecha no Esc e no toque fora, prende o
 * foco enquanto está aberta, devolve o foco ao botão ao fechar e trava a
 * rolagem do fundo.
 *
 * Vai ao `body` por portal, e não fica sob o cabeçalho: o `backdrop-blur` do
 * header cria um containing block, e ali dentro `position: fixed` passa a se
 * ancorar nele em vez da viewport — a folha subia para o topo da tela.
 */
export function MenuMobile() {
  const [aberto, setAberto] = useState(false);
  // O portal só existe no cliente; no HTML do servidor a folha não é impressa.
  const [montado, setMontado] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const folhaRef = useRef<HTMLDivElement>(null);
  const idDaFolha = useId();

  useEffect(() => {
    setMontado(true);
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    botaoRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return;

    // O fundo não rola enquanto a folha está aberta: rolar por baixo de uma
    // camada modal é o jeito mais rápido de perder o lugar na página.
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        fechar();
        return;
      }

      if (evento.key !== "Tab") return;

      const focaveis = folhaRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focaveis || focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    folhaRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowOriginal;
    };
  }, [aberto, fechar]);

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        aria-label={cabecalho.menu.abrir}
        aria-expanded={aberto}
        aria-controls={idDaFolha}
        onClick={() => setAberto(true)}
        className="-mr-2 grid size-11 place-items-center gap-1 menu:hidden"
      >
        {[0, 1, 2].map((traco) => (
          <span key={traco} aria-hidden className="block h-px w-4.5 bg-ink" />
        ))}
      </button>

      {aberto && montado
        ? createPortal(
            <>
              <button
                type="button"
                aria-label={cabecalho.menu.fechar}
                onClick={fechar}
                className="fixed inset-0 z-40 bg-ink/35 menu:hidden motion-safe:animate-in motion-safe:fade-in"
              />

              <div
                ref={folhaRef}
                id={idDaFolha}
                role="dialog"
                aria-modal="true"
                aria-label={cabecalho.menu.titulo}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-line bg-surface pb-6 shadow-cartao menu:hidden motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-200"
              >
                <span
                  aria-hidden
                  className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-line"
                />

                <div className="flex justify-end px-3 pt-1">
                  <button
                    type="button"
                    onClick={fechar}
                    className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:text-olive"
                    aria-label={cabecalho.menu.fechar}
                  >
                    <X aria-hidden className="size-5" />
                  </button>
                </div>

                <ul>
                  {navegacao.map((item) => (
                    <li
                      key={item.href}
                      className="border-t border-line/60 first:border-t-0"
                    >
                      <a
                        href={item.href}
                        onClick={fechar}
                        className="flex min-h-13 items-center px-6 text-base text-ink transition-colors active:bg-surface-2"
                      >
                        {item.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
