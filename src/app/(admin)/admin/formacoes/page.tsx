/**
 * Formações no painel. A rota só monta a tela — lista, formulário e exclusão
 * ficam no `FormacoesPainel` (FOR-05).
 */

import { FormacoesPainel } from "@/features/formacoes/components/formacoes-painel";

export default function PaginaDeFormacoes() {
  return <FormacoesPainel />;
}
