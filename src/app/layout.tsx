import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, Parisienne } from "next/font/google";

import { metadadosDoSite, perfil } from "@/content/site";
import { COR_DA_INTERFACE } from "@/lib/tema";
import { siteUrl } from "@/lib/url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolve todo caminho relativo de metadata (canonical, Open Graph, sitemap)
  // contra a origem real do site — sem isto o Next cairia em localhost.
  metadataBase: new URL(siteUrl),
  title: {
    default: metadadosDoSite.titulo,
    template: metadadosDoSite.gabaritoDeTitulo,
  },
  description: metadadosDoSite.descricao,
  keywords: [...metadadosDoSite.palavrasChave],
  applicationName: perfil.nome,
  // `authors` é de quem assina o conteúdo; `creator` é de quem fez o site.
  authors: [{ name: perfil.nome }],
  creator: metadadosDoSite.desenvolvedor.nome,
  publisher: perfil.nome,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  // A barra do navegador acompanha o fundo da página, no lugar do branco padrão.
  themeColor: COR_DA_INTERFACE,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${karla.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ground text-ink">{children}</body>
    </html>
  );
}
