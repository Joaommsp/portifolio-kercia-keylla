"use client";

/**
 * Tela de formações do painel: lista, formulário e exclusão confirmada, com as
 * mesmas regras das publicações — validação pelo schema, estado de gravação,
 * erro fiel ao Firebase e confirmação em diálogo próprio (FOR-05).
 *
 * O formulário é remontado pela `key` a cada troca de formação em edição e a
 * cada gravação concluída: assim os valores iniciais são lidos uma vez só, sem
 * efeito sincronizando prop com estado de formulário.
 */

import { useCallback, useEffect, useState } from "react";

import { ConfirmarExclusao } from "@/components/layout/confirmar-exclusao";
import { SectionMessage } from "@/components/layout/section-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { painel } from "@/content/site";
import { FormacaoForm } from "@/features/formacoes/components/formacao-form";
import {
  formacaoEmBranco,
  ORDEM_NO_FIM,
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
import type { Resultado } from "@/lib/resultado";

const { formacoes: textos } = painel;

/** Lista estável para os estados em que ainda não há dados. */
const SEM_FORMACOES: readonly Formacao[] = [];

export function FormacoesPainel() {
  const [resultado, setResultado] = useState<Resultado<Formacao[]> | null>(
    null,
  );
  const [emEdicao, setEmEdicao] = useState<Formacao | null>(null);
  const [aExcluir, setAExcluir] = useState<Formacao | null>(null);
  const [idOcupado, setIdOcupado] = useState<string | null>(null);
  const [erroDaAcao, setErroDaAcao] = useState<string | null>(null);
  const [gravacoes, setGravacoes] = useState(0);

  /** Relê a lista. Usada depois de cada gravação ou exclusão bem-sucedida. */
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

  const formacoes =
    resultado !== null && "dados" in resultado ? resultado.dados : SEM_FORMACOES;
  const ordemSugerida = proximaOrdem(formacoes);

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
      await carregar();
    }

    return gravacao;
  }

  async function excluirConfirmada() {
    if (aExcluir === null) {
      return;
    }

    const escolhida = aExcluir;
    setAExcluir(null);
    setIdOcupado(escolhida.id);
    setErroDaAcao(null);

    const efeito = await excluirFormacao(escolhida.id);

    if ("erro" in efeito) {
      setErroDaAcao(efeito.erro);
    } else {
      if (emEdicao?.id === escolhida.id) {
        setEmEdicao(null);
      }

      await carregar();
    }

    setIdOcupado(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-olive">{textos.titulo}</h1>

      <FormacaoForm
        key={`${emEdicao?.id ?? "nova"}-${gravacoes}`}
        emEdicao={emEdicao !== null}
        valoresIniciais={
          emEdicao === null
            ? formacaoEmBranco(ordemSugerida)
            : paraFormularioDeFormacao(emEdicao, ordemSugerida)
        }
        aoSalvar={salvar}
        aoCancelar={() => setEmEdicao(null)}
      />

      {erroDaAcao === null ? null : (
        <SectionMessage tom="erro">{erroDaAcao}</SectionMessage>
      )}

      {resultado === null ? (
        <div role="status">
          <SectionMessage>{textos.carregando}</SectionMessage>
        </div>
      ) : "erro" in resultado ? (
        <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
      ) : formacoes.length === 0 ? (
        <SectionMessage>{textos.vazio}</SectionMessage>
      ) : (
        <Tabela
          formacoes={formacoes}
          idOcupado={idOcupado}
          aoEditar={setEmEdicao}
          aoExcluir={setAExcluir}
        />
      )}

      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo={textos.exclusao.titulo}
        descricao={textos.exclusao.mensagem(aExcluir?.titulo ?? "")}
        rotuloConfirmar={textos.exclusao.confirmar}
        rotuloCancelar={textos.exclusao.cancelar}
        aoConfirmar={excluirConfirmada}
        aoFechar={() => setAExcluir(null)}
      />
    </div>
  );
}

function Tabela({
  formacoes,
  idOcupado,
  aoEditar,
  aoExcluir,
}: {
  formacoes: readonly Formacao[];
  idOcupado: string | null;
  aoEditar: (formacao: Formacao) => void;
  aoExcluir: (formacao: Formacao) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xs border border-line bg-surface">
      <table className="w-full min-w-3xl border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-rotulo text-ink-soft">
            <th scope="col" className="px-5 py-3 font-semibold">
              {textos.colunas.formacao}
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              {textos.colunas.ano}
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              {textos.colunas.situacao}
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              {textos.colunas.ordem}
            </th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">
              {textos.colunas.acoes}
            </th>
          </tr>
        </thead>

        <tbody>
          {formacoes.map((formacao) => {
            const ocupada = idOcupado === formacao.id;

            return (
              <tr
                key={formacao.id}
                className="border-b border-line last:border-b-0"
              >
                <td className="px-5 py-4">
                  <span className="block font-medium text-ink">
                    {formacao.titulo}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {formacao.instituicao}
                  </span>
                </td>

                <td className="px-5 py-4 text-ink-soft">
                  {formacao.ano ?? textos.semAno}
                </td>

                <td className="px-5 py-4">
                  <Badge
                    variant={
                      formacao.status === "em_andamento"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {textos.situacoes[formacao.status]}
                  </Badge>
                </td>

                <td className="px-5 py-4 text-ink-soft">
                  {formacao.ordem === ORDEM_NO_FIM
                    ? textos.semOrdem
                    : formacao.ordem}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={ocupada}
                      onClick={() => aoEditar(formacao)}
                    >
                      {textos.acoes.editar}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={ocupada}
                      onClick={() => aoExcluir(formacao)}
                    >
                      {textos.acoes.excluir}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
