/**
 * Raiz do painel. A rota só monta a tela — a lista, os estados e as ações
 * ficam no `PublicacoesPainel` (ADM-06).
 */

import { PublicacoesPainel } from "@/features/publicacoes/components/publicacoes-painel";

export default function PaginaDoPainel() {
  return <PublicacoesPainel />;
}
