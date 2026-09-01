"use client";

/**
 * Escrita de formações. Roda no cliente autenticado — nunca importar daqui em
 * Server Component (AD-002). Quem autoriza é o `firestore.rules`.
 *
 * As regras são as mesmas das publicações: nada lança, e a falha volta com a
 * mensagem traduzida do Firebase para a tela mostrá-la sem perder o
 * formulário (FOR-05, ADM-07).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { paraDocumentoDeFormacao } from "@/features/formacoes/converter";
import {
  COLECAO_FORMACOES,
  type FormacaoFormulario,
} from "@/features/formacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/** Cria a formação e devolve o id do documento criado. */
export async function criarFormacao(
  formulario: FormacaoFormulario,
): Promise<Resultado<string>> {
  try {
    const referencia = await addDoc(
      collection(obterDb(), COLECAO_FORMACOES),
      paraDocumentoDeFormacao(formulario),
    );

    return { dados: referencia.id };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/** Atualiza a formação e devolve o id gravado. */
export async function atualizarFormacao(
  id: string,
  formulario: FormacaoFormulario,
): Promise<Resultado<string>> {
  try {
    await updateDoc(
      doc(obterDb(), COLECAO_FORMACOES, id),
      paraDocumentoDeFormacao(formulario),
    );

    return { dados: id };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}

/** Remove a formação em definitivo, sob confirmação da tela (ADM-06). */
export async function excluirFormacao(id: string): Promise<Resultado<null>> {
  try {
    await deleteDoc(doc(obterDb(), COLECAO_FORMACOES, id));
    return { dados: null };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}
