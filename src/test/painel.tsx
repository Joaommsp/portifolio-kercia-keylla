import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { ProvedorDePendencia } from "@/features/admin/pendencia";

/**
 * Renderiza uma tela do painel com o provedor que o layout monta em produção.
 *
 * Sem ele, todo componente que consulta a guarda de alterações lança — e o
 * teste passaria a medir a montagem do provedor, não a tela.
 */
export function renderizarNoPainel(elemento: ReactElement) {
  return render(<ProvedorDePendencia>{elemento}</ProvedorDePendencia>);
}
