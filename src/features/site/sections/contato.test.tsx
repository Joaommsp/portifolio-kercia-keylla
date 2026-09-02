import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { contato, linksContato, secaoContato } from "@/content/site";

import { Contato } from "./contato";

/**
 * O site inteiro falava de acompanhamento terapêutico. Quem procurava uma
 * professora — ou apoio em Libras — não se reconhecia na página.
 */
const FRENTES_DA_SPEC = [
  "Docência em educação infantil",
  "Apoio à inclusão em sala",
  "Apoio pedagógico e acompanhamento",
  "Comunicação em Libras",
];

describe("Contato", () => {
  it("chama pelas quatro frentes, não só pela AT", () => {
    render(<Contato />);

    expect(secaoContato.frentes.map((frente) => frente.titulo)).toEqual(
      FRENTES_DA_SPEC,
    );

    for (const frente of secaoContato.frentes) {
      expect(screen.getByText(frente.titulo)).toBeInTheDocument();
      expect(screen.getByText(frente.descricao)).toBeInTheDocument();
    }
  });

  it("não anuncia interpretação de Libras, que a formação não cobre", () => {
    // Intérprete é função regulamentada e exige certificação própria. Uma
    // família com criança surda contrataria contando com isso.
    render(<Contato />);

    expect(screen.queryByText(/intérprete/i)).not.toBeInTheDocument();
  });

  it("leva ao WhatsApp com a mensagem já preenchida", () => {
    render(<Contato />);

    expect(
      screen.getByRole("link", { name: new RegExp(secaoContato.acao.rotulo) }),
    ).toHaveAttribute("href", linksContato.whatsapp);
  });

  it("mostra os canais e a região de atendimento", () => {
    render(<Contato />);

    expect(screen.getByText(contato.email)).toBeInTheDocument();
    expect(screen.getByText(contato.regiao)).toBeInTheDocument();
    expect(screen.getByText(`@${contato.instagram}`)).toBeInTheDocument();
  });

  it("fala com escola, e não só com família", () => {
    // A experiência de sala de aula é o ativo mais forte dela; sem isto, quem
    // contrata professora não se reconhece na página.
    render(<Contato />);

    expect(screen.getAllByText(/Escolas/)).not.toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: /Para famílias e para escolas/ }),
    ).toBeInTheDocument();
  });
});