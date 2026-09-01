/**
 * Formulário de uma publicação. A rota só resolve o `id` — `nova` cria, e
 * qualquer outro id edita o documento correspondente (ADM-05).
 */

import { PublicacaoEditor } from "@/features/publicacoes/components/publicacao-editor";

export default async function PaginaDeEdicao({
  params,
}: PageProps<"/admin/publicacoes/[id]">) {
  const { id } = await params;

  return <PublicacaoEditor id={id} />;
}
