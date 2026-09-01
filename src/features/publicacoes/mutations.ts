"use client";

/**
 * Escrita de publicações. Roda no cliente autenticado — nunca importar daqui em
 * Server Component (AD-002). Quem autoriza é o `firestore.rules`, não este
 * módulo.
 *
 * Duas garantias atravessam todas as funções:
 *
 * 1. `publicadoEm` sempre existe no documento. A listagem pública ordena por
 *    esse campo, e um `orderBy` omite do resultado o documento que não o tem —
 *    gravar sem a data faria a publicação sumir da home (PUB-01).
 * 2. Nenhuma falha lança: erro do Firebase vira `{ erro }` com a mensagem
 *    traduzida, para o formulário mostrá-la sem perder o que foi digitado
 *    (ADM-07).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as limitarA,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { paraDocumentoDePublicacao } from "@/features/publicacoes/converter";
import {
  COLECAO_PUBLICACOES,
  type Publicacao,
  type PublicacaoFormulario,
} from "@/features/publicacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/** Recusa de gravação por slug já usado por outra publicação (ADM-05). */
export const MENSAGEM_SLUG_EM_USO =
  "Já existe uma publicação com este slug. Escolha outro endereço para o texto.";

/**
 * Basta um documento além do próprio para o slug estar em uso — daí o limite
 * de dois: um pode ser a publicação que está sendo editada.
 */
const DOCUMENTOS_PARA_CONFERIR_SLUG = 2;

/**
 * Diz se o slug já pertence a outra publicação. `idAtual` é o documento que
 * está sendo editado, que naturalmente casa com o próprio slug.
 */
async function slugEmUso(slug: string, idAtual: string | null) {
  const consulta = query(
    collection(obterDb(), COLECAO_PUBLICACOES),
    where("slug", "==", slug),
    limitarA(DOCUMENTOS_PARA_CONFERIR_SLUG),
  );

  const encontrados = await getDocs(consulta);

  return encontrados.docs.some((documento) => documento.id !== idAtual);
}

/** Cria a publicação e devolve o id do documento criado. */
export async function criarPublicacao(
  formulario: PublicacaoFormulario,
): Promise<Resultado<string>> {
  try {
    const documento = paraDocumentoDePublicacao(formulario);

    if (await slugEmUso(documento.slug, null)) {
      return { erro: MENSAGEM_SLUG_EM_USO };
    }

    const referencia = await addDoc(
      collection(obterDb(), COLECAO_PUBLICACOES),
      {
        ...documento,
        publicadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      },
    );

    return { dados: referencia.id };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/**
 * Atualiza a publicação e devolve o id gravado.
 *
 * `publicadoEm` é a data que a publicação já tem — passada pela tela, que
 * acabou de lê-la. Editar um texto não muda a data em que ele foi publicado;
 * mas um documento que chegou sem data ganha uma agora, senão continuaria
 * invisível na home.
 */
export async function atualizarPublicacao(
  id: string,
  formulario: PublicacaoFormulario,
  publicadoEm: Date | null,
): Promise<Resultado<string>> {
  try {
    const documento = paraDocumentoDePublicacao(formulario);

    if (await slugEmUso(documento.slug, id)) {
      return { erro: MENSAGEM_SLUG_EM_USO };
    }

    await updateDoc(doc(obterDb(), COLECAO_PUBLICACOES, id), {
      ...documento,
      publicadoEm: publicadoEm ?? serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return { dados: id };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/** Remove a publicação em definitivo (ADM-06). */
export async function excluirPublicacao(
  id: string,
): Promise<Resultado<null>> {
  try {
    await deleteDoc(doc(obterDb(), COLECAO_PUBLICACOES, id));
    return { dados: null };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/**
 * Inverte rascunho ↔ no ar e devolve o novo estado (ADM-08). Publicação que
 * nunca teve data de publicação ganha uma aqui, no momento em que passa a ser
 * listada.
 */
export async function alternarPublicado(
  publicacao: Pick<Publicacao, "id" | "publicado" | "publicadoEm">,
): Promise<Resultado<boolean>> {
  const publicado = !publicacao.publicado;

  try {
    await updateDoc(doc(obterDb(), COLECAO_PUBLICACOES, publicacao.id), {
      publicado,
      publicadoEm: publicacao.publicadoEm ?? serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return { dados: publicado };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}
