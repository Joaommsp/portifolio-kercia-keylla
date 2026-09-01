"use client";

/**
 * Tela de escrita de uma publicação — a mesma para criar e para editar.
 *
 * Três desfechos são coisas diferentes e aparecem diferentes: leitura em curso,
 * falha do Firebase (mensagem fiel) e publicação inexistente (aviso com o
 * caminho de volta, nunca tela em branco).
 *
 * A data de publicação já gravada viaja daqui para a atualização: editar o
 * texto não muda a data em que ele foi publicado (ADM-05).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SectionMessage } from "@/components/layout/section-message";
import { painel } from "@/content/site";
import { PublicacaoForm } from "@/features/publicacoes/components/publicacao-form";
import { paraFormularioDePublicacao } from "@/features/publicacoes/converter";
import {
  atualizarPublicacao,
  criarPublicacao,
} from "@/features/publicacoes/mutations";
import { obterNoPainel } from "@/features/publicacoes/painel";
import type {
  Publicacao,
  PublicacaoFormulario,
} from "@/features/publicacoes/schemas";
import type { Resultado } from "@/lib/resultado";
import { CAMINHO_PAINEL, ID_NOVA_PUBLICACAO } from "@/lib/rotas";

const { publicacao: textos } = painel;

/** Publicação nova não tem o que ler: já nasce resolvida, sem documento. */
const NOVA: Resultado<Publicacao | null> = { dados: null };

export function PublicacaoEditor({ id }: { id: string }) {
  const router = useRouter();
  const ehNova = id === ID_NOVA_PUBLICACAO;

  const [resultado, setResultado] = useState<Resultado<
    Publicacao | null
  > | null>(ehNova ? NOVA : null);

  useEffect(() => {
    if (ehNova) {
      return;
    }

    // A guarda evita gravar estado de uma leitura que voltou depois da tela
    // sair — o que deixaria o carregamento pendurado no lugar errado.
    let ativo = true;

    void (async () => {
      const lido = await obterNoPainel(id);

      if (ativo) {
        setResultado(lido);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [id, ehNova]);

  const publicacao =
    resultado !== null && "dados" in resultado ? resultado.dados : null;

  async function salvar(
    formulario: PublicacaoFormulario,
  ): Promise<Resultado<string>> {
    const gravacao = ehNova
      ? await criarPublicacao(formulario)
      : await atualizarPublicacao(
          id,
          formulario,
          publicacao?.publicadoEm ?? null,
        );

    if ("dados" in gravacao) {
      router.push(CAMINHO_PAINEL);
    }

    return gravacao;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={CAMINHO_PAINEL}
          className="text-xs uppercase tracking-rotulo text-ink-soft transition-colors hover:text-olive"
        >
          {textos.acoes.voltar}
        </Link>

        <h1 className="font-display text-3xl text-olive">
          {ehNova ? textos.novo : textos.edicao}
        </h1>
      </div>

      {resultado === null ? (
        <div role="status">
          <SectionMessage>{textos.carregando}</SectionMessage>
        </div>
      ) : "erro" in resultado ? (
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      ) : ehNova ? (
        <PublicacaoForm aoSalvar={salvar} />
      ) : publicacao === null ? (
        <SectionMessage>{textos.naoEncontrada}</SectionMessage>
      ) : (
        <PublicacaoForm
          valoresIniciais={paraFormularioDePublicacao(publicacao)}
          aoSalvar={salvar}
        />
      )}
    </div>
  );
}
