/**
 * Configuração do Firebase lida do ambiente.
 *
 * A leitura acontece aqui, em um único lugar, para que a ausência de uma
 * variável falhe com o nome exato dela — e não com um erro genérico do SDK,
 * lançado lá adiante e difícil de rastrear (SIT-06).
 */

/** Chaves de configuração do Firebase e a variável de ambiente de cada uma. */
export const VARIAVEIS_FIREBASE = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

export type ChaveFirebase = keyof typeof VARIAVEIS_FIREBASE;
export type VariavelFirebase = (typeof VARIAVEIS_FIREBASE)[ChaveFirebase];

export type ConfiguracaoFirebase = Record<ChaveFirebase, string>;

/** Ambiente lido: cada variável pode estar ausente ou vazia. */
export type AmbienteFirebase = Partial<Record<VariavelFirebase, string>>;

const CHAVES = Object.keys(VARIAVEIS_FIREBASE) as ChaveFirebase[];

/**
 * Lê o ambiente do processo. Cada variável é acessada por nome literal porque
 * o Next só substitui `process.env.NEXT_PUBLIC_*` quando o acesso é estático —
 * indexar dinamicamente devolveria `undefined` no bundle do cliente.
 */
export function ambienteDoProcesso(): AmbienteFirebase {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/** Monta a mensagem que nomeia as variáveis faltantes. */
function mensagemDeFalta(faltantes: readonly VariavelFirebase[]): string {
  const lista = faltantes.join(", ");
  const sufixo =
    faltantes.length === 1
      ? "Defina a variável de ambiente"
      : "Defina as variáveis de ambiente";

  return `Configuração do Firebase incompleta. ${sufixo}: ${lista}.`;
}

/**
 * Valida o ambiente e devolve a configuração tipada.
 *
 * Variável ausente e variável em branco são o mesmo caso: sem valor útil. Lança
 * `Error` nomeando cada variável que falta.
 */
export function lerConfiguracaoFirebase(
  ambiente: AmbienteFirebase = ambienteDoProcesso(),
): ConfiguracaoFirebase {
  const faltantes: VariavelFirebase[] = [];
  const configuracao = {} as ConfiguracaoFirebase;

  for (const chave of CHAVES) {
    const variavel = VARIAVEIS_FIREBASE[chave];
    const valor = ambiente[variavel]?.trim();

    if (!valor) {
      faltantes.push(variavel);
      continue;
    }

    configuracao[chave] = valor;
  }

  if (faltantes.length > 0) {
    throw new Error(mensagemDeFalta(faltantes));
  }

  return configuracao;
}
