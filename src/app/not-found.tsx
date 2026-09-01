/**
 * 404 do site, na identidade do resto das páginas (PUB-04).
 *
 * Fica na raiz de propósito: daqui ela atende tanto o endereço que não casa com
 * nenhuma rota quanto o `notFound()` da rota de publicação, que é o caso comum
 * — link antigo de um texto que saiu do ar. Sem cabeçalho e rodapé porque o
 * menu do site é âncora de seção da home, e âncora fora da home não leva a
 * lugar nenhum; o caminho de volta é o botão.
 */

import { ActionLink } from "@/components/layout/action-link";
import { Container } from "@/components/layout/container";
import { paginaNaoEncontrada } from "@/content/site";

export default function NaoEncontrada() {
  return (
    <main className="flex flex-1 items-center py-24">
      <Container className="max-w-nota text-center">
        <p
          aria-hidden
          className="font-display text-6xl tracking-titulo text-brass"
        >
          {paginaNaoEncontrada.codigo}
        </p>

        <h1 className="mt-5 font-display text-3xl tracking-titulo text-ink">
          {paginaNaoEncontrada.titulo}
        </h1>

        <p className="mt-3 text-sm text-ink-soft">
          {paginaNaoEncontrada.mensagem}
        </p>

        <ActionLink
          href={paginaNaoEncontrada.acao.href}
          className="mt-9"
          variant="ghost"
        >
          {paginaNaoEncontrada.acao.rotulo}
        </ActionLink>
      </Container>
    </main>
  );
}
