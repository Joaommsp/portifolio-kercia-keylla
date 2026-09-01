import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import Home, { metadata } from "@/app/(site)/page";
import { listarFormacoes } from "@/features/formacoes/queries";
import { listarPublicadas } from "@/features/publicacoes/queries";
import { metadadosDaHome, pessoaDaAutora } from "@/features/site/seo";

vi.mock("@/features/publicacoes/queries", () => ({
  listarPublicadas: vi.fn(),
}));

vi.mock("@/features/formacoes/queries", () => ({
  listarFormacoes: vi.fn(),
}));

const listarPublicadasFalso = listarPublicadas as unknown as Mock;
const listarFormacoesFalso = listarFormacoes as unknown as Mock;

/** Renderiza a home resolvida, como o servidor a entrega. */
async function renderizarHome() {
  return render(await Home());
}

beforeEach(() => {
  vi.clearAllMocks();
  listarPublicadasFalso.mockResolvedValue({ dados: [] });
  listarFormacoesFalso.mockResolvedValue({ dados: [] });
});

describe("home", () => {
  it("declara os metadados sociais da autora (SEO-02)", () => {
    expect(metadata).toBe(metadadosDaHome);
  });

  it("imprime os dados estruturados Person no HTML (SEO-02)", async () => {
    const { container } = await renderizarHome();

    const bloco = container.querySelector(
      'script[type="application/ld+json"]',
    );

    expect(bloco).not.toBeNull();
    expect(JSON.parse(bloco?.textContent ?? "null")).toEqual(pessoaDaAutora);
  });
});
