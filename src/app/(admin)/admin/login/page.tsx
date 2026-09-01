/**
 * Entrada do painel. A rota só monta a moldura — quem autentica é o
 * `LoginForm` (ADM-02).
 */

import { Container } from "@/components/layout/container";
import { painel } from "@/content/site";
import { LoginForm } from "@/features/admin/components/login-form";

export const metadata = {
  title: painel.login.titulo,
  robots: { index: false, follow: false },
};

export default function PaginaDeLogin() {
  return (
    <Container className="flex flex-1 items-center justify-center py-20">
      <div className="w-full max-w-sm rounded-xs border border-line bg-surface px-7 py-8 shadow-cartao">
        <h1 className="font-display text-2xl text-olive">
          {painel.login.titulo}
        </h1>
        <p className="mt-2 mb-7 text-sm text-ink-soft">
          {painel.login.chamada}
        </p>

        <LoginForm />
      </div>
    </Container>
  );
}
