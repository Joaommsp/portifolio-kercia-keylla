/**
 * Entrada do painel. A rota só monta a moldura — quem autentica é o
 * `LoginForm` (ADM-02).
 */

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { painel } from "@/content/site";
import { LoginForm } from "@/features/admin/components/login-form";
import { CAMINHO_HOME } from "@/lib/rotas";

export const metadata = {
  title: painel.login.titulo,
  robots: { index: false, follow: false },
};

export default function PaginaDeLogin() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-5 py-20">
      <div className="w-full max-w-sm rounded-xs border border-line bg-surface px-7 py-8 shadow-cartao">
        <h1 className="font-display text-2xl text-olive">
          {painel.login.titulo}
        </h1>
        <p className="mt-2 mb-7 text-sm text-ink-soft">
          {painel.login.chamada}
        </p>

        <LoginForm />
      </div>

      {/* Sem isto a página era um beco: três elementos focáveis e nenhuma
          saída para quem chegou aqui sem querer. */}
      <Link
        href={CAMINHO_HOME}
        className="grid min-h-11 place-items-center text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
      >
        {painel.login.voltar}
      </Link>
    </Container>
  );
}
