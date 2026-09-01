import { describe, expect, it } from "vitest";

import { contato, linksContato, perfil } from "@/content/site";
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
      description: perfil.apresentacao,
      url: "/",
    });
  });

  it("declara o cartão do Twitter com o mesmo título e a mesma descrição", () => {
    expect(metadadosDaHome.twitter).toMatchObject({
      card: "summary_large_image",
      title: `${perfil.nome} · ${perfil.papel}`,
      description: perfil.apresentacao,
    });
  });

  it("aponta o canonical da home para a raiz do site", () => {
    expect(metadadosDaHome.alternates?.canonical).toBe("/");
  });
});

describe("dados estruturados Person (SEO-02)", () => {
  it("descreve a autora com nome, papel e área de atendimento", () => {
    expect(pessoaDaAutora["@context"]).toBe("https://schema.org");
    expect(pessoaDaAutora["@type"]).toBe("Person");
    expect(pessoaDaAutora.name).toBe("Keylla Melo");
    expect(pessoaDaAutora.jobTitle).toBe("Assistente Terapêutica");
    expect(pessoaDaAutora.description).toBe(perfil.apresentacao);
    expect(pessoaDaAutora.areaServed).toBe(contato.regiao);
  });

  it("usa a URL absoluta do site, que JSON-LD não resolve sozinho", () => {
    expect(pessoaDaAutora.url).toBe(`${siteUrl}/`);
  });

  it("lista o Instagram da autora em sameAs", () => {
    expect(pessoaDaAutora.sameAs).toEqual([linksContato.instagram]);
    expect(linksContato.instagram).toContain("instagram.com");
  });

  it("serializa o Person em JSON válido, campo a campo", () => {
    expect(JSON.parse(jsonLdDaAutora)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: perfil.nome,
      jobTitle: perfil.papel,
      description: perfil.apresentacao,
      url: `${siteUrl}/`,
      sameAs: [linksContato.instagram],
      areaServed: contato.regiao,
    });
  });
});
