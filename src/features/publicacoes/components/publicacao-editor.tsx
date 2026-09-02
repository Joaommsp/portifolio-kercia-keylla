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
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { SectionMessage } from "@/components/layout/section-message";
import { Badge } from "@/components/ui/badge";
import { painel } from "@/content/site";
import { usePendencia } from "@/features/admin/pendencia";
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
import { OPCOES_NOVA_ABA, PROPS_NOVA_ABA } from "@/lib/link";
import {
  CAMINHO_PAINEL,
  ID_NOVA_PUBLICACAO,
  caminhoDaPublicacao,
} from "@/lib/rotas";
import { urlDoSite } from "@/lib/url";

const { publicacao: textos } = painel;

/** Publicação nova não tem o que ler: já nasce resolvida, sem documento. */
const NOVA: Resultado<Publicacao | null> = { dados: null };

export function PublicacaoEditor({ id }: { id: string }) {
  const router = useRouter();
  const ehNova = id === ID_NOVA_PUBLICACAO;
  // A pendência mora no contexto do painel: o cabeçalho também precisa dela
  // para não navegar por cima de texto não salvo.
  const pendencia = usePendencia();

  useEffect(() => {
    if (!pendencia.temPendencia) return;

    // O diálogo cobre a saída pela interface; este aviso cobre fechar a aba e
    // voltar pelo navegador, que o React não intercepta.
    const aoSair = (evento: BeforeUnloadEvent) => {
      evento.preventDefault();
      // Navegador antigo ainda exige o valor de retorno para exibir o aviso.
      evento.returnValue = "";
    };

    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [pendencia.temPendencia]);

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
      pendencia.marcar(false);

      if (formulario.publicado) {
        toast.success(painel.avisos.publicada, {
          description: painel.avisos.publicadaDetalhe,
          action: {
            label: painel.avisos.verNoSite,
            onClick: () => {
              window.open(
                caminhoDaPublicacao(formulario.slug),
                "_blank",
                OPCOES_NOVA_ABA,
              );
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
        {/* Continua um link — ctrl/meio-clique seguem funcionando —, mas a
            navegação normal passa pela guarda de alterações. */}
        <Link
          href={CAMINHO_PAINEL}
          onClick={(evento) => {
            evento.preventDefault();
            pendencia.tentarSair(() => router.push(CAMINHO_PAINEL));
          }}
          className="self-start text-xs uppercase tracking-rotulo text-ink-soft transition-colors pointer-fino:hover:text-olive"
        >
          {textos.acoes.voltar}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-olive">
            {ehNova ? textos.novo : textos.edicao}
          </h1>

          {publicacao === null ? null : (
            <Badge variant={publicacao.publicado ? "default" : "outline"}>
              {publicacao.publicado
                ? painel.estados.publicado
                : painel.estados.rascunho}
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
              {...PROPS_NOVA_ABA}
              className="font-semibold text-olive underline-offset-4 pointer-fino:hover:underline"
            >
              {urlDoSite(caminhoDaPublicacao(publicacao.slug))}
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
        <PublicacaoForm aoSalvar={salvar} aoMudarPendencia={pendencia.marcar} />
      ) : publicacao === null ? (
        <SectionMessage>{textos.naoEncontrada}</SectionMessage>
      ) : (
        <PublicacaoForm
          valoresIniciais={paraFormularioDePublicacao(publicacao)}
          publicadoEm={publicacao.publicadoEm}
          aoSalvar={salvar}
          aoMudarPendencia={pendencia.marcar}
        />
      )}
    </div>
  );
}
