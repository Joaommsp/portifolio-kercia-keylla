import { ActionLink } from "@/components/layout/action-link";
import { Container } from "@/components/layout/container";
import { ancoras, cabecalho, navegacao, perfil } from "@/content/site";

/** Cabeçalho fixo: marca, menu âncora das seções e chamada para o contato. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ground/90 backdrop-blur-md">
      <Container className="flex h-cabecalho items-center justify-between gap-6">
        <a
          href={`#${ancoras.topo}`}
          aria-label={perfil.nome}
          className="-ml-2 grid size-11 place-items-center font-display text-2xl tracking-marca text-olive"
        >
          {cabecalho.marca}
        </a>

        <nav aria-label={cabecalho.rotuloNavegacao}>
          <ul className="hidden items-center gap-7 menu:flex">
            {navegacao.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block py-3 text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
                >
                  {item.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ActionLink href={cabecalho.acao.href} variant="ghost">
          {cabecalho.acao.rotulo}
        </ActionLink>
      </Container>
    </header>
  );
}
