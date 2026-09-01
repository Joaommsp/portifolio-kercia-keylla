"use client";

/**
 * Porta do painel.
 *
 * Nada do painel é renderizado antes de a sessão resolver: enquanto o Firebase
 * não responde, a tela mostra apenas o aviso de verificação. Sem sessão, manda
 * para o login; com sessão na tela de login, manda para o painel — as duas
 * direções resolvidas aqui, para `/admin/login` não entrar em laço de
 * redirecionamento (ADM-01).
 *
 * Falha ao consultar a sessão não vira redirecionamento: sem saber se existe
 * sessão, empurrar para o login seria mentir sobre a causa. A mensagem do
 * Firebase aparece e a decisão fica com a autora (ADM-03).
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { SectionMessage } from "@/components/layout/section-message";
import { painel } from "@/content/site";
import { PainelShell } from "@/features/admin/components/painel-shell";
import { useAuth } from "@/hooks/use-auth";
import { CAMINHO_LOGIN, CAMINHO_PAINEL } from "@/lib/rotas";

function Aviso({
  tom = "neutro",
  children,
}: {
  tom?: "neutro" | "erro";
  children: ReactNode;
}) {
  return (
    <Container className="py-16">
      {tom === "erro" ? (
        <SectionMessage tom="erro">{children}</SectionMessage>
      ) : (
        <div role="status">
          <SectionMessage>{children}</SectionMessage>
        </div>
      )}
    </Container>
  );
}

export function PainelGuard({ children }: { children: ReactNode }) {
  const { usuario, carregando, erro, sair } = useAuth();
  const caminho = usePathname();
  const router = useRouter();

  const ehLogin = caminho === CAMINHO_LOGIN;
  const resolvida = !carregando && erro === null;

  useEffect(() => {
    if (!resolvida) {
      return;
    }

    if (usuario === null && !ehLogin) {
      router.replace(CAMINHO_LOGIN);
      return;
    }

    if (usuario !== null && ehLogin) {
      router.replace(CAMINHO_PAINEL);
    }
  }, [resolvida, usuario, ehLogin, router]);

  if (carregando) {
    return <Aviso>{painel.verificandoSessao}</Aviso>;
  }

  if (erro !== null) {
    return <Aviso tom="erro">{erro}</Aviso>;
  }

  if (ehLogin) {
    // Com sessão, o login já está a caminho do painel: mostrar o formulário
    // aqui seria pedir de novo o que ela acabou de fazer.
    return usuario === null ? (
      <>{children}</>
    ) : (
      <Aviso>{painel.redirecionando}</Aviso>
    );
  }

  if (usuario === null) {
    return <Aviso>{painel.redirecionando}</Aviso>;
  }

  return <PainelShell aoSair={sair}>{children}</PainelShell>;
}
