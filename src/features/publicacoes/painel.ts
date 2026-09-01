"use client";

/**
 * Leitura das publicações para o painel.
 *
 * Existe separada de `queries.ts` por dois motivos que se somam: o painel roda
 * no cliente e não pode importar a leitura do servidor (AD-002), e precisa ver
 * também o que está em rascunho — enquanto `listarPublicadas` filtra
 * `publicado == true` e serve à home. A sessão autenticada é o que permite ler
 * rascunho: quem autoriza é o `firestore.rules`.
 *
 * A ordenação acontece na aplicação, e não no Firestore, pelo mesmo motivo das
 * formações (AD-012): um `orderBy` omite o documento sem o campo, e uma
 * publicação sem `publicadoEm` sumiria justo da tela onde ela precisa ser
 * corrigida.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitarA,
  query,
} from "firebase/firestore";

import {
  ordenarPublicacoes,
  paraPublicacao,
} from "@/features/publicacoes/converter";
import {
  COLECAO_PUBLICACOES,
  type Publicacao,
} from "@/features/publicacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/**
 * Teto de documentos que o painel carrega de uma vez. É uma trava de tráfego,
 * não uma paginação: a base é de uma autora só. O limite da home é outro
 * (`LIMITE_PUBLICACOES_HOME`) e não vale aqui — o painel lista tudo.
 */
export const LIMITE_PUBLICACOES_PAINEL = 200;

/** Todas as publicações, no ar e em rascunho, da mais recente para a mais antiga. */
export async function listarNoPainel(
  limite: number = LIMITE_PUBLICACOES_PAINEL,
): Promise<Resultado<Publicacao[]>> {
  try {
    const consulta = query(
      collection(obterDb(), COLECAO_PUBLICACOES),
      limitarA(limite),
    );

    const resultado = await getDocs(consulta);

    return {
      dados: ordenarPublicacoes(
        resultado.docs.map((documento) =>
          paraPublicacao(documento.id, documento.data()),
        ),
      ),
    };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/**
 * Uma publicação pelo id do documento, para o formulário de edição. Id
 * inexistente devolve `{ dados: null }` — é ausência, não falha, e a tela
 * distingue as duas.
 */
export async function obterNoPainel(
  id: string,
): Promise<Resultado<Publicacao | null>> {
  try {
    const documento = await getDoc(doc(obterDb(), COLECAO_PUBLICACOES, id));

    return {
      dados: documento.exists()
        ? paraPublicacao(documento.id, documento.data())
        : null,
    };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}
