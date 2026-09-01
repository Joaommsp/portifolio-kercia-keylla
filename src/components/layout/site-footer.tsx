import { Container } from "@/components/layout/container";
import { rodape } from "@/content/site";

/** Rodapé com a marca, o papel e o ano corrente. */
export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-6 text-xs text-ink-soft">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <span>
          © {ano} {rodape.descricao}
        </span>
        <span>{rodape.assinatura}</span>
      </Container>
    </footer>
  );
}
