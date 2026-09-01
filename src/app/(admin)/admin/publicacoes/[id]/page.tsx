"use client";

/**
 * Formulário de uma publicação. A rota só resolve o `id` — `nova` cria, e
 * qualquer outro id edita o documento correspondente (ADM-05).
 */

import { use } from "react";

import { PublicacaoEditor } from "@/features/publicacoes/components/publicacao-editor";

export default function PaginaDeEdicao({
  params,
}: PageProps<"/admin/publicacoes/[id]">) {
  const { id } = use(params);

  return <PublicacaoEditor id={id} />;
}
