"use client";

/**
 * Moldura das telas do painel: marca, navegação entre publicações e formações,
 * e a saída da sessão.
 *
 * Sair é uma ação com estado — enquanto ela corre o botão fica desabilitado, e
 * a falha aparece com a mensagem que o Firebase devolveu, não com um texto
 * genérico (ADM-07).
 */

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionMessage } from "@/components/layout/section-message";
import { Button } from "@/components/ui/button";
import { painel } from "@/content/site";
import type { Resultado } from "@/lib/resultado";
import { CAMINHO_HOME } from "@/lib/rotas";

export function PainelShell({
  aoSair,
  children,
}: {
  aoSair: () => Promise<Resultado<null>>;
  children: ReactNode;
}) {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function sair() {
    setSaindo(true);
    setErro(null);

    const resultado = await aoSair();

    if ("erro" in resultado) {
      setErro(resultado.erro);
      setSaindo(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
          <span className="font-display text-lg text-olive">
            {painel.marca}
          </span>

          <nav
            aria-label={painel.rotuloNavegacao}
            className="flex items-center gap-5"
          >
            {painel.navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href={CAMINHO_HOME}
              className="text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
            >
              {painel.verSite}
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={sair}
              disabled={saindo}
            >
              {saindo ? painel.sair.emAndamento : painel.sair.rotulo}
            </Button>
          </div>
        </Container>
      </header>

      {erro === null ? null : (
        <Container className="pt-6">
          <SectionMessage tom="erro">{erro}</SectionMessage>
        </Container>
      )}

      <main className="flex-1 py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
