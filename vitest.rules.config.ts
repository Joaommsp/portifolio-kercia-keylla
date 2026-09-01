import { defineConfig } from "vitest/config";

/**
 * Suíte das regras do Firestore (SEC-01). Fica fora da configuração principal
 * de propósito: estes testes exigem o emulador de pé, e `npm test` precisa
 * continuar rodando sem nenhuma dependência externa.
 *
 * Rode por `npm run test:rules`, que sobe o emulador em volta da suíte.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    // Cada asserção conversa com o emulador: o teto padrão de 5s é curto.
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
