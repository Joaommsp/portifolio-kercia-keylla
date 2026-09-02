import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // A infra de teste (`src/test/`) guarda, entre outras coisas, a transcrição
    // dos números que a spec fixa. Ela só vale como auditoria enquanto produção
    // não a lê: no dia em que um componente importasse o teto da home dali, o
    // teste voltaria a comparar o código com ele mesmo. A regra torna a
    // convenção verificável em vez de combinada.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/test/**", "src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/test/*", "**/test/*"],
              message:
                "Infra de teste não entra em código de produção — veja src/test/valores-da-spec.ts.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
