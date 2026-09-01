/**
 * Leitura de formações. Roda em Server Component — nunca importar daqui em
 * componente de cliente (AD-002).
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

/**
 * Todas as formações, na ordem de exibição. Falha de leitura vira `{ erro }`
 * com a mensagem do Firebase, sem lançar (FOR-03).
 *
 * A ordenação é feita aqui, e não no Firestore, por dois motivos: um `orderBy`
 * omite do resultado o documento que não tem o campo — uma formação gravada
 * sem `ordem` sumiria da página — e a ordem composta (`ordem` asc, `ano` desc)
 * exigiria um índice para uma coleção de poucos registros.
 */
export async function listarFormacoes(): Promise<Resultado<Formacao[]>> {
  try {
    const resultado = await getDocs(collection(obterDb(), COLECAO_FORMACOES));

    const formacoes = resultado.docs.map((documento) =>
      paraFormacao(documento.id, documento.data()),
    );

    return { dados: ordenarFormacoes(formacoes) };
  } catch (erro) {
    return { erro: traduzirErroFirebase(erro) };
  }
}
