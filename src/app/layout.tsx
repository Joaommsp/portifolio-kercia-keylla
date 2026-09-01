import type { Metadata } from "next";
import { Fraunces, Karla, Parisienne } from "next/font/google";

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
    default: "Keylla Melo · Assistente Terapêutica",
    template: "%s · Keylla Melo",
  },
  description:
    "Assistente Terapêutica: acompanhamento de crianças e adolescentes na escola e na rotina, com vínculo, mediação e incentivo à autonomia.",
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
