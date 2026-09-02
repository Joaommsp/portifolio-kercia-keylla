import { render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import AdminLayout from "@/app/(admin)/admin/layout";
import { usePendencia } from "@/features/admin/pendencia";

// O guard decide sessão e não é o assunto aqui: o que se verifica é a fiação
// que o layout precisa montar em volta dele.
vi.mock("@/features/admin/components/painel-guard", () => ({
  PainelGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

/** Só existe para provar que o contexto do painel chegou até o filho. */
function ConsumidorDePendencia() {
  const pendencia = usePendencia();
  return <span>pendência: {String(pendencia.temPendencia)}</span>;
}

describe("layout do painel", () => {
  it("monta o provedor de pendência em volta das telas", () => {
    // Sem ele, toda tela que consulta a guarda de alterações lança — e o
    // painel inteiro quebra em produção com a suíte verde.
    render(
      <AdminLayout params={Promise.resolve({})}>
        <ConsumidorDePendencia />
      </AdminLayout>,
    );

    expect(screen.getByText("pendência: false")).toBeInTheDocument();
  });

  it("monta o Toaster, senão nenhum aviso do painel aparece", async () => {
    // Prova de ponta a ponta: o componente existia sem lugar na árvore antes de
    // `a14b1a4`, então os toasts eram chamados e não apareciam. Aqui o aviso é
    // disparado de verdade e precisa chegar à tela.
    render(
      <AdminLayout params={Promise.resolve({})}>
        <span>conteúdo</span>
      </AdminLayout>,
    );

    toast.success("Publicação no ar");

    expect(await screen.findByText("Publicação no ar")).toBeInTheDocument();
  });
});
