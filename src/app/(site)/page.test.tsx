import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import SiteLayout from "@/app/(site)/layout";
import Home, { metadata } from "@/app/(site)/page";
import { SiteHeader } from "@/components/layout/site-header";
import { ancoras } from "@/content/site";
import { listarPublicadas } from "@/features/publicacoes/queries";
import { metadadosDaHome, pessoaDaAutora } from "@/features/site/seo";

vi.mock("@/features/publicacoes/queries", () => ({
  listarPublicadas: vi.fn(),
}));

const listarPublicadasFalso = listarPublicadas as unknown as Mock;

/**
 * Rótulo do décimo primeiro bloco de SIT-01. O rodapé não é uma `<section id>` — vem da
 * moldura das páginas públicas —, então entra na lista de ordem por este nome.
 */
const RODAPE = "rodapé";

/** Renderiza a home resolvida, como o servidor a entrega. */
async function renderizarHome() {
  return render(await Home());
}

/**
 * Renderiza a home dentro da moldura do site, que é como o visitante a recebe:
 * é ela que traz o cabeçalho e o rodapé (SIT-01).
 */
async function renderizarPaginaCompleta() {
  return render(
    SiteLayout({ children: await Home(), params: Promise.resolve({}) }),
  );
}

/** Blocos da home na ordem em que aparecem no HTML, o rodapé incluído. */
function blocosNaOrdem(container: HTMLElement) {
  return Array.from(container.querySelectorAll("section[id], footer")).map(
    (bloco) => (bloco.tagName === "FOOTER" ? RODAPE : bloco.id),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  listarPublicadasFalso.mockResolvedValue({ dados: [] });
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
  it("apresenta os onze blocos na ordem da spec", async () => {
    // Formação virou conteúdo fixo (AD-046): a seção está sempre lá. A de
    // publicações fica de pé nos três estados (AD-018).

    const { container } = await renderizarPaginaCompleta();

    expect(blocosNaOrdem(container)).toEqual([
      ancoras.topo,
      ancoras.at,
      ancoras.pedagogia,
      ancoras.competencias,
      ancoras.atendimento,
      ancoras.experiencia,
      ancoras.sobre,
      ancoras.formacao,
      ancoras.publicacoes,
      ancoras.contato,
      RODAPE,
    ]);
  });

  it("fecha a página com o rodapé, depois do conteúdo principal", async () => {

    const { container } = await renderizarPaginaCompleta();

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("main, footer")).map(
        (bloco) => bloco.tagName,
      ),
    ).toEqual(["MAIN", "FOOTER"]);
  });

  it("cada âncora do menu aponta para uma seção que existe na home", async () => {

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
