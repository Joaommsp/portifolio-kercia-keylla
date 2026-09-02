"use client";

/**
 * Tela de publicações do painel: carrega a lista, resolve carregando, erro e
 * vazio, e liga as ações de alternar estado e excluir (ADM-06, ADM-08).
 *
 * A leitura é a do painel (`listarNoPainel`), que traz rascunho junto — a da
 * home só enxerga o que está no ar e roda no servidor.
 */

import Link from "next/link";
import { useState } from "react";

import { toast } from "sonner";

import { SectionMessage } from "@/components/layout/section-message";
import { buttonVariants } from "@/components/ui/button";
import { painel } from "@/content/site";
import { PublicacoesTable } from "@/features/publicacoes/components/publicacoes-table";
import {
  alternarPublicado,
  excluirPublicacao,
} from "@/features/publicacoes/mutations";
import { listarNoPainel } from "@/features/publicacoes/painel";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { useCarga } from "@/hooks/use-carga";
import type { Resultado } from "@/lib/resultado";
import { CAMINHO_NOVA_PUBLICACAO } from "@/lib/rotas";

const { listaDePublicacoes: textos } = painel;

export function PublicacoesPainel() {
  const { resultado, recarregar } = useCarga(listarNoPainel);
  const [idOcupado, setIdOcupado] = useState<string | null>(null);

  /**
   * Roda a ação da linha e recarrega a lista quando ela dá certo. Cada desfecho
   * avisa: sem retorno, alternar o estado de uma publicação é uma ação que não
   * dá sinal nenhum de ter acontecido.
   */
  async function executar(
    publicacao: Publicacao,
    acao: () => Promise<Resultado<unknown>>,
    aviso: { titulo: string; sucesso: string },
  ) {
    setIdOcupado(publicacao.id);

    const efeito = await acao();

    if ("erro" in efeito) {
      toast.error(aviso.titulo, { description: efeito.erro });
    } else {
      toast.success(aviso.sucesso, { description: publicacao.titulo });
      await recarregar();
    }

    setIdOcupado(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-olive">{textos.titulo}</h1>

        <Link
          href={CAMINHO_NOVA_PUBLICACAO}
          className={buttonVariants({ size: "lg" })}
        >
          {textos.acoes.criar}
        </Link>
      </div>

      {resultado === null ? (
        <div role="status">
          <SectionMessage>{textos.carregando}</SectionMessage>
        </div>
      ) : "erro" in resultado ? (
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      ) : resultado.dados.length === 0 ? (
        <SectionMessage>{textos.vazio}</SectionMessage>
      ) : (
        <PublicacoesTable
          publicacoes={resultado.dados}
          idOcupado={idOcupado}
          aoAlternar={(publicacao) =>
            void executar(
              publicacao,
              () => alternarPublicado(publicacao),
              {
                titulo: painel.avisos.naoAlternou,
                sucesso: publicacao.publicado
                  ? painel.avisos.tiradaDoAr
                  : painel.avisos.publicada,
              },
            )
          }
          aoExcluir={(publicacao) =>
            void executar(
              publicacao,
              () => excluirPublicacao(publicacao.id),
              {
                titulo: painel.avisos.naoExcluiu,
                sucesso: painel.avisos.excluida,
              },
            )
          }
        />
      )}
    </div>
  );
}
