"use client";

/**
 * Leitura das formações para o painel.
 *
 * A consulta é a mesma da home — formação não tem rascunho —, mas a leitura
 * pública roda em Server Component e o painel não pode importá-la (AD-002). O
 * que importa não se duplica: conversão e ordenação continuam no `converter`,
 * e aqui fica só o acesso.
 */

import { collection, getDocs } from "firebase/firestore";

import {
  ordenarFormacoes,
  paraFormacao,
} from "@/features/formacoes/converter";
import { COLECAO_FORMACOES, type Formacao } from "@/features/formacoes/schemas";
import { obterDb } from "@/lib/firebase/client";
import { traduzirErroFirebase } from "@/lib/firebase/errors";
import type { Resultado } from "@/lib/resultado";

/** Todas as formações, na ordem de exibição da página. */
export async function listarNoPainel(): Promise<Resultado<Formacao[]>> {
  try {
    const resultado = await getDocs(collection(obterDb(), COLECAO_FORMACOES));

    return {
      dados: ordenarFormacoes(
        resultado.docs.map((documento) =>
          paraFormacao(documento.id, documento.data()),
        ),
      ),
    };
  } catch (falha) {
    return { erro: traduzirErroFirebase(falha) };
  }
}
