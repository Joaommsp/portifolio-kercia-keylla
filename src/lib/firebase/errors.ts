/**
 * Tradução de erro do Firebase para mensagem exibível em pt-BR.
 *
 * A mensagem mostrada é sempre fiel ao que o Firebase respondeu: código
 * conhecido vira texto em português, código desconhecido devolve a mensagem
 * original do SDK — nunca um "algo deu errado" que esconde a causa
 * (ADM-03, PUB-05).
 */

/**
 * Credencial recusada nunca diz se o e-mail existe: os três códigos abaixo
 * compartilham a mesma mensagem para não permitir enumerar contas.
 */
const CREDENCIAL_INVALIDA = "E-mail ou senha incorretos.";

export const MENSAGENS_POR_CODIGO: Readonly<Record<string, string>> = {
  "auth/invalid-credential": CREDENCIAL_INVALIDA,
  "auth/user-not-found": CREDENCIAL_INVALIDA,
  "auth/wrong-password": CREDENCIAL_INVALIDA,
  "auth/too-many-requests":
    "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.",
  "auth/network-request-failed":
    "Não foi possível falar com o Firebase. Verifique sua conexão e tente de novo.",
  "permission-denied": "Você não tem permissão para esta operação.",
  unavailable:
    "O banco de dados está indisponível no momento. Tente de novo em instantes.",
};

/** Último recurso: só quando o erro não traz código nem mensagem alguma. */
export const MENSAGEM_SEM_DETALHE = "Erro desconhecido ao falar com o Firebase.";

function codigoDoErro(erro: unknown): string | null {
  if (typeof erro !== "object" || erro === null || !("code" in erro)) {
    return null;
  }

  const { code } = erro as { code: unknown };
  return typeof code === "string" && code.length > 0 ? code : null;
}

function mensagemOriginal(erro: unknown): string | null {
  if (typeof erro === "string") {
    return erro.trim() || null;
  }

  if (typeof erro !== "object" || erro === null || !("message" in erro)) {
    return null;
  }

  const { message } = erro as { message: unknown };
  return typeof message === "string" && message.trim() ? message : null;
}

/**
 * Devolve a mensagem a exibir para um erro vindo do Firebase Auth ou do
 * Firestore. Não lança: qualquer valor é aceito.
 */
export function traduzirErroFirebase(erro: unknown): string {
  const codigo = codigoDoErro(erro);

  if (codigo !== null && codigo in MENSAGENS_POR_CODIGO) {
    return MENSAGENS_POR_CODIGO[codigo];
  }

  return mensagemOriginal(erro) ?? MENSAGEM_SEM_DETALHE;
}
