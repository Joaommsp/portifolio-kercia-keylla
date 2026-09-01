"use client";

/**
 * Tela de formações do painel: lista, formulário e exclusão confirmada, com as
 * mesmas regras das publicações — validação pelo schema, estado de gravação,
 * erro fiel ao Firebase e confirmação em diálogo próprio (FOR-05).
 *
 * O formulário só aparece depois de a lista responder, e não antes: a ordem
 * sugerida para uma formação nova sai do que já está cadastrado, e um
 * formulário montado com a lista ainda vazia nasceria com a ordem errada.
 *
 * Trocar a formação em edição ou concluir uma gravação remonta o formulário
 * pela `key` — assim os valores iniciais são lidos uma vez só, sem efeito
 * sincronizando prop com estado de formulário.
 */

import { useState } from "react";

import { SectionMessage } from "@/components/layout/section-message";
import { painel } from "@/content/site";
import { FormacaoForm } from "@/features/formacoes/components/formacao-form";
import { FormacoesTable } from "@/features/formacoes/components/formacoes-table";
import {
  formacaoEmBranco,
  paraFormularioDeFormacao,
  proximaOrdem,
} from "@/features/formacoes/converter";
import {
  atualizarFormacao,
  criarFormacao,
  excluirFormacao,
} from "@/features/formacoes/mutations";
import { listarNoPainel } from "@/features/formacoes/painel";
import type {
  Formacao,
  FormacaoFormulario,
} from "@/features/formacoes/schemas";
import { useCarga } from "@/hooks/use-carga";
import type { Resultado } from "@/lib/resultado";

const { formacoes: textos } = painel;

export function FormacoesPainel() {
  const { resultado, recarregar } = useCarga(listarNoPainel);
  const [emEdicao, setEmEdicao] = useState<Formacao | null>(null);
  const [idOcupado, setIdOcupado] = useState<string | null>(null);
  const [erroDaAcao, setErroDaAcao] = useState<string | null>(null);
  const [gravacoes, setGravacoes] = useState(0);

  async function salvar(
    formulario: FormacaoFormulario,
  ): Promise<Resultado<string>> {
    const gravacao =
      emEdicao === null
        ? await criarFormacao(formulario)
        : await atualizarFormacao(emEdicao.id, formulario);

    if ("dados" in gravacao) {
      setEmEdicao(null);
      setGravacoes((total) => total + 1);
      await recarregar();
    }

    return gravacao;
  }

  async function excluir(formacao: Formacao) {
    setIdOcupado(formacao.id);
    setErroDaAcao(null);

    const efeito = await excluirFormacao(formacao.id);

    if ("erro" in efeito) {
      setErroDaAcao(efeito.erro);
    } else {
      if (emEdicao?.id === formacao.id) {
        setEmEdicao(null);
      }

      await recarregar();
    }

    setIdOcupado(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-olive">{textos.titulo}</h1>

      {erroDaAcao === null ? null : (
        <SectionMessage tom="erro">{erroDaAcao}</SectionMessage>
      )}

      {resultado === null ? (
        <div role="status">
          <SectionMessage>{textos.carregando}</SectionMessage>
        </div>
      ) : "erro" in resultado ? (
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      ) : (
        <Conteudo
          formacoes={resultado.dados}
          emEdicao={emEdicao}
          gravacoes={gravacoes}
          idOcupado={idOcupado}
          aoSalvar={salvar}
          aoEditar={setEmEdicao}
          aoCancelar={() => setEmEdicao(null)}
          aoExcluir={excluir}
        />
      )}
    </div>
  );
}

/** Formulário e lista, já com a lista carregada — só aqui a ordem é conhecida. */
function Conteudo({
  formacoes,
  emEdicao,
  gravacoes,
  idOcupado,
  aoSalvar,
  aoEditar,
  aoCancelar,
  aoExcluir,
}: {
  formacoes: readonly Formacao[];
  emEdicao: Formacao | null;
  /** Gravações concluídas, para o formulário voltar ao branco depois de salvar. */
  gravacoes: number;
  idOcupado: string | null;
  aoSalvar: (formulario: FormacaoFormulario) => Promise<Resultado<string>>;
  aoEditar: (formacao: Formacao) => void;
  aoCancelar: () => void;
  aoExcluir: (formacao: Formacao) => void;
}) {
  const ordemSugerida = proximaOrdem(formacoes);

  return (
    <>
      <FormacaoForm
        key={`${emEdicao?.id ?? "nova"}-${gravacoes}`}
        emEdicao={emEdicao !== null}
        valoresIniciais={
          emEdicao === null
            ? formacaoEmBranco(ordemSugerida)
            : paraFormularioDeFormacao(emEdicao, ordemSugerida)
        }
        aoSalvar={aoSalvar}
        aoCancelar={aoCancelar}
      />

      {formacoes.length === 0 ? (
        <SectionMessage>{textos.vazio}</SectionMessage>
      ) : (
        <FormacoesTable
          formacoes={formacoes}
          idOcupado={idOcupado}
          aoEditar={aoEditar}
          aoExcluir={aoExcluir}
        />
      )}
    </>
  );
}
