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
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmarAcao } from "@/components/layout/confirmar-acao";
import { SectionMessage } from "@/components/layout/section-message";
import { Badge } from "@/components/ui/badge";
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
import { useCarga } from "@/hooks/use-carga";
import type { Resultado } from "@/lib/resultado";
import {
  CAMINHO_PAINEL,
  ID_NOVA_PUBLICACAO,
  caminhoDaPublicacao,
} from "@/lib/rotas";

const { publicacao: textos } = painel;

/** Publicação nova não tem o que ler: já nasce resolvida, sem documento. */
const NOVA: Resultado<Publicacao | null> = { dados: null };

export function PublicacaoEditor({ id }: { id: string }) {
  const router = useRouter();
  const ehNova = id === ID_NOVA_PUBLICACAO;
  const [pendente, setPendente] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  useEffect(() => {
    if (!pendente) return;

    // O diálogo cobre a saída pela interface; este aviso cobre fechar a aba e
    // voltar pelo navegador, que o React não intercepta.
    const aoSair = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [pendente]);

  function voltar() {
    if (pendente) {
      setConfirmandoSaida(true);
      return;
    }

    router.push(CAMINHO_PAINEL);
  }

  const ler = useCallback(() => obterNoPainel(id), [id]);
  const { resultado: lido } = useCarga(ehNova ? null : ler);

  const resultado = ehNova ? NOVA : lido;
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
      // A pendência morre com o salvamento: sem isto o diálogo de "sair sem
      // salvar" apareceria logo depois de gravar.
      setPendente(false);

      if (formulario.publicado) {
        toast.success(painel.avisos.publicada, {
          description: painel.avisos.publicadaDetalhe,
          action: {
            label: painel.avisos.verNoSite,
            onClick: () => {
              window.open(caminhoDaPublicacao(formulario.slug), "_blank");
            },
          },
        });
      } else {
        toast.success(painel.avisos.rascunhoSalvo, {
          description: painel.avisos.rascunhoDetalhe,
        });
      }

      router.push(CAMINHO_PAINEL);
    }

    return gravacao;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        {/* Botão, não link: com alterações pendentes a saída passa pela
            pergunta antes de acontecer. */}
        <button
          type="button"
          onClick={voltar}
          className="self-start text-xs uppercase tracking-rotulo text-ink-soft transition-colors pointer-fino:hover:text-olive"
        >
          {textos.acoes.voltar}
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-olive">
            {ehNova ? textos.novo : textos.edicao}
          </h1>

          {publicacao === null ? null : (
            <Badge variant={publicacao.publicado ? "default" : "outline"}>
              {publicacao.publicado
                ? textos.estado.noAr
                : textos.estado.rascunho}
            </Badge>
          )}
        </div>

        {/* O endereço final não é óbvio a partir do campo "endereço do texto":
            aqui ela vê onde o texto vai dar antes de publicar. */}
        {publicacao === null ? null : (
          <p className="text-xs text-ink-soft">
            {publicacao.publicado
              ? textos.endereco.noAr
              : textos.endereco.ficara}{" "}
            <Link
              href={caminhoDaPublicacao(publicacao.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-olive underline-offset-4 pointer-fino:hover:underline"
            >
              {caminhoDaPublicacao(publicacao.slug)}
            </Link>
          </p>
        )}
      </div>

      {resultado === null ? (
        <div role="status">
          <SectionMessage>{textos.carregando}</SectionMessage>
        </div>
      ) : "erro" in resultado ? (
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      ) : ehNova ? (
        <PublicacaoForm aoSalvar={salvar} aoMudarPendencia={setPendente} />
      ) : publicacao === null ? (
        <SectionMessage>{textos.naoEncontrada}</SectionMessage>
      ) : (
        <PublicacaoForm
          valoresIniciais={paraFormularioDePublicacao(publicacao)}
          publicadoEm={publicacao.publicadoEm}
          aoSalvar={salvar}
          aoMudarPendencia={setPendente}
        />
      )}

      <ConfirmarAcao
        aberto={confirmandoSaida}
        titulo={painel.semSalvar.titulo}
        descricao={painel.semSalvar.descricao}
        rotuloConfirmar={painel.semSalvar.confirmar}
        rotuloCancelar={painel.semSalvar.cancelar}
        aoConfirmar={() => router.push(CAMINHO_PAINEL)}
        aoFechar={() => setConfirmandoSaida(false)}
      />
    </div>
  );
}
