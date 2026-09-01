import { describe, expect, it, vi } from "vitest";

import {
  contato,
  linksContato,
  metadadosDoSite,
  perfil,
} from "@/content/site";
// O layout raiz carrega as fontes por `next/font`, que só existe no build do
// Next; o dublê deixa o módulo importável para conferir os metadados dele.
vi.mock("next/font/google", () => {
  const fonte = () => ({ variable: "--fonte" });
  return { Fraunces: fonte, Karla: fonte, Parisienne: fonte };
});

import { metadata } from "@/app/layout";
import {
  jsonLdDaAutora,
  metadadosDaHome,
  pessoaDaAutora,
} from "@/features/site/seo";
import { siteUrl } from "@/lib/url";

describe("metadados sociais da home (SEO-02)", () => {
  it("declara Open Graph com nome, papel e apresentação da autora", () => {
    expect(metadadosDaHome.openGraph).toMatchObject({
      type: "website",
      locale: "pt_BR",
      siteName: perfil.nome,
      title: `${perfil.nome} · ${perfil.papel}`,
      description: metadadosDoSite.descricao,
      url: "/",
    });
  });

  it("declara o cartão do Twitter com o mesmo título e a mesma descrição", () => {
    expect(metadadosDaHome.twitter).toMatchObject({
      card: "summary",
      title: `${perfil.nome} · ${perfil.papel}`,
      description: metadadosDoSite.descricao,
    });
  });

  it("serve ao buscador e à rede social o mesmo título e a mesma descrição", () => {
    expect(metadata.title).toEqual({
      default: metadadosDoSite.titulo,
      template: metadadosDoSite.gabaritoDeTitulo,
    });
    expect(metadata.description).toBe(metadadosDoSite.descricao);
    expect(metadadosDaHome.openGraph?.description).toBe(metadata.description);
  });

  it("aponta o canonical da home para a raiz do site", () => {
    expect(metadadosDaHome.alternates?.canonical).toBe("/");
  });
});

describe("dados estruturados Person (SEO-02)", () => {
  it("descreve a autora com nome, papel e área de atendimento", () => {
    expect(pessoaDaAutora["@context"]).toBe("https://schema.org");
    expect(pessoaDaAutora["@type"]).toBe("Person");
    expect(pessoaDaAutora.name).toBe(perfil.nome);
    expect(pessoaDaAutora.jobTitle).toBe(perfil.papel);
    expect(pessoaDaAutora.description).toBe(metadadosDoSite.descricao);
    expect(pessoaDaAutora.areaServed).toBe(contato.regiao);
  });

  it("usa a URL absoluta do site, que JSON-LD não resolve sozinho", () => {
    expect(pessoaDaAutora.url).toBe(`${siteUrl}/`);
  });

  it("lista o Instagram da autora em sameAs", () => {
    expect(pessoaDaAutora.sameAs).toEqual([linksContato.instagram]);
    expect(linksContato.instagram).toContain("instagram.com");
  });

  it("escapa `<` para nenhum texto fechar a tag script", () => {
    expect(jsonLdDaAutora).not.toContain("<");
    expect(JSON.parse(jsonLdDaAutora)).toEqual(pessoaDaAutora);
  });

  it("serializa o Person em JSON válido, campo a campo", () => {
    expect(JSON.parse(jsonLdDaAutora)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: perfil.nome,
      jobTitle: perfil.papel,
      description: metadadosDoSite.descricao,
      url: `${siteUrl}/`,
      sameAs: [linksContato.instagram],
      areaServed: contato.regiao,
    });
  });
});
