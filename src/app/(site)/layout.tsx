import { AtalhosFlutuantes } from "@/components/layout/atalhos-flutuantes";
import { Revelador } from "@/components/layout/revelador";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Moldura das páginas públicas: cabeçalho fixo, conteúdo e rodapé. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AtalhosFlutuantes />
      <Revelador />
    </>
  );
}
