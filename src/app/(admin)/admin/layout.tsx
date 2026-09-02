/**
 * Moldura de todas as rotas sob `/admin`. A rota só delega: quem decide o que
 * pode aparecer é o `PainelGuard` (ADM-01).
 *
 * O `Toaster` mora aqui, e não no layout raiz, porque só o painel dá retorno de
 * ação — a página pública não tem nada a avisar.
 */

import { Toaster } from "@/components/ui/sonner";
import { PainelGuard } from "@/features/admin/components/painel-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <PainelGuard>{children}</PainelGuard>
      <Toaster position="bottom-right" />
    </>
  );
}
