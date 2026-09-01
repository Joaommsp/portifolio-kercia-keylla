import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import Home, { metadata } from "@/app/(site)/page";
import { SiteHeader } from "@/components/layout/site-header";
import { ancoras } from "@/content/site";
import type { Formacao } from "@/features/formacoes/schemas";
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

/** Formação cadastrada, para a seção aparecer (FOR-04). */
const formacao = (): Formacao => ({
  id: "pedagogia",
  titulo: "Pedagogia",
  instituicao: "Universidade",
  descricao: null,
  ano: 2018,
  status: "concluido",
  ordem: 1,
});

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

describe("seções da home (SIT-01, SIT-03)", () => {
  it("apresenta as seções na ordem da spec", async () => {
    // A seção de formação some quando não há nada cadastrado (FOR-04); a de
    // publicações fica de pé nos três estados (AD-018). Então basta uma
    // formação para a home mostrar as seis seções.
    listarFormacoesFalso.mockResolvedValue({ dados: [formacao()] });

    const { container } = await renderizarHome();

    expect(
      Array.from(container.querySelectorAll("section[id]")).map(
        (secao) => secao.id,
      ),
    ).toEqual([
      ancoras.topo,
      ancoras.at,
      ancoras.sobre,
      ancoras.formacao,
      ancoras.publicacoes,
      ancoras.contato,
    ]);
  });

  it("cada âncora do menu aponta para uma seção que existe na home", async () => {
    listarFormacoesFalso.mockResolvedValue({ dados: [formacao()] });

    const cabecalho = render(<SiteHeader />);
    const ancorasDoMenu = Array.from(
      cabecalho.container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
    ).map((link) => link.getAttribute("href") ?? "");

    expect(ancorasDoMenu.length).toBeGreaterThan(0);

    const { container } = await renderizarHome();

    for (const ancora of ancorasDoMenu) {
      expect(container.querySelector(ancora)).not.toBeNull();
    }
  });
});
