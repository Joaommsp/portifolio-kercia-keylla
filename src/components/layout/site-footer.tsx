import { Container } from "@/components/layout/container";
import { rodape } from "@/content/site";
import { propsLinkExterno } from "@/lib/link";

/** Rodapé com o direito autoral da Keylla e a assinatura de quem desenvolveu. */
export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-6 text-xs text-ink-soft">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <span>{rodape.copyright(ano)}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {rodape.assinatura}
          {rodape.desenvolvedor.map((perfil) => (
            <a
              key={perfil.rotulo}
              href={perfil.href}
              {...propsLinkExterno(true)}
              className="underline-offset-4 hover:text-olive hover:underline"
            >
              {perfil.rotulo}
            </a>
          ))}
        </span>
      </Container>
    </footer>
  );
}
