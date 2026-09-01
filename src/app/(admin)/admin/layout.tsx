/**
 * Moldura de todas as rotas sob `/admin`. A rota só delega: quem decide o que
 * pode aparecer é o `PainelGuard` (ADM-01).
 */

import { PainelGuard } from "@/features/admin/components/painel-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <PainelGuard>{children}</PainelGuard>;
}
