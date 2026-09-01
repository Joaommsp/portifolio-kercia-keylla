"use client";

/**
 * Tela de publicações do painel: carrega a lista, resolve carregando, erro e
 * vazio, e liga as ações de alternar estado e excluir (ADM-06, ADM-08).
 *
 * A leitura é a do painel (`listarNoPainel`), que traz rascunho junto — a da
 * home só enxerga o que está no ar e roda no servidor.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
import type { Resultado } from "@/lib/resultado";
import { CAMINHO_NOVA_PUBLICACAO } from "@/lib/rotas";

const { listaDePublicacoes: textos } = painel;

export function PublicacoesPainel() {
  const [resultado, setResultado] = useState<Resultado<Publicacao[]> | null>(
    null,
  );
  const [idOcupado, setIdOcupado] = useState<string | null>(null);
  const [erroDaAcao, setErroDaAcao] = useState<string | null>(null);

  /** Relê a lista. Usada depois de cada ação que deu certo. */
  const carregar = useCallback(async () => {
    setResultado(await listarNoPainel());
  }, []);

  useEffect(() => {
    // A guarda evita gravar estado de uma leitura que voltou depois da tela
    // sair — o que deixaria o carregamento pendurado no lugar errado.
    let ativo = true;

    void (async () => {
      const lido = await listarNoPainel();

      if (ativo) {
        setResultado(lido);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  /** Roda a ação da linha e recarrega a lista quando ela dá certo. */
  async function executar(
    publicacao: Publicacao,
    acao: () => Promise<Resultado<unknown>>,
  ) {
    setIdOcupado(publicacao.id);
    setErroDaAcao(null);

    const efeito = await acao();

    if ("erro" in efeito) {
      setErroDaAcao(efeito.erro);
    } else {
      await carregar();
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

      {erroDaAcao === null ? null : (
        <SectionMessage tom="erro">{erroDaAcao}</SectionMessage>
      )}

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
            void executar(publicacao, () => alternarPublicado(publicacao))
          }
          aoExcluir={(publicacao) =>
            void executar(publicacao, () => excluirPublicacao(publicacao.id))
          }
        />
      )}
    </div>
  );
}
