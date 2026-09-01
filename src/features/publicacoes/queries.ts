/**
 * Leitura de publicações. Roda em Server Component — nunca importar daqui em
 * componente de cliente (AD-002).
 */

import {
  collection,
  getDocs,
  limit as limitarA,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { paraPublicacao } from "@/features/publicacoes/converter";
import {
  COLECAO_PUBLICACOES,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/** Quantas publicações a home exibe (PUB-01). */
export const LIMITE_PUBLICACOES_HOME = 6;

/**
 * Publicações no ar, da mais recente para a mais antiga. Falha de leitura vira
 * `{ erro }` com a mensagem do Firebase, sem lançar.
 */
export async function listarPublicadas(
  limite: number = LIMITE_PUBLICACOES_HOME,
): Promise<Resultado<Publicacao[]>> {
  try {
    const consulta = query(
      collection(obterDb(), COLECAO_PUBLICACOES),
      where("publicado", "==", true),
      orderBy("publicadoEm", "desc"),
      limitarA(limite),
    );

    const resultado = await getDocs(consulta);

    return {
      dados: resultado.docs.map((documento) =>
        paraPublicacao(documento.id, documento.data()),
      ),
    };
  } catch (erro) {
    return { erro: traduzirErroFirebase(erro) };
  }
}

/**
 * Publicação no ar com o slug pedido. Slug inexistente — ou apontando para
 * rascunho — devolve `{ dados: null }`, que a rota traduz em 404 (PUB-04).
 */
export async function obterPorSlug(
  slug: string,
): Promise<Resultado<Publicacao | null>> {
  try {
    const consulta = query(
      collection(obterDb(), COLECAO_PUBLICACOES),
      where("slug", "==", slug),
      where("publicado", "==", true),
      limitarA(1),
    );

    const resultado = await getDocs(consulta);
    const documento = resultado.docs[0];

    return {
      dados: documento ? paraPublicacao(documento.id, documento.data()) : null,
    };
  } catch (erro) {
    return { erro: traduzirErroFirebase(erro) };
  }
}
