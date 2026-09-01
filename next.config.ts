import type { NextConfig } from "next";

// Import relativo de propósito: o `next.config.ts` é avaliado fora do
// TypeScript da aplicação e não resolve o alias `@/`.
import { hostsDeImagemPermitidos } from "./src/content/imagens";

const nextConfig: NextConfig = {
  images: {
    // A allowlist do `next/image` é a mesma que o schema usa para validar a URL
    // gravada — sem isso o otimizador viraria proxy aberto de imagem.
    remotePatterns: hostsDeImagemPermitidos.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
