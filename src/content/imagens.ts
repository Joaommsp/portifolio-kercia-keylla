/**
 * Hosts permitidos para a imagem externa das publicações.
 *
 * Vive num módulo sem nenhuma importação de propósito: além do schema e dos
 * componentes, quem lê esta lista é o `next.config.ts`, que é avaliado fora do
 * TypeScript da aplicação e não resolve o alias `@/`. A lista é reexportada por
 * `@/content/site`, que continua sendo a porta de entrada do conteúdo do site.
 */
export const hostsDeImagemPermitidos = [
  "images.unsplash.com",
  "res.cloudinary.com",
  "firebasestorage.googleapis.com",
  "lh3.googleusercontent.com",
] as const;
