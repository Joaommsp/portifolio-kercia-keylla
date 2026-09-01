"use client";

/**
 * Tabela de formações do painel — a irmã da tabela de publicações, na mesma
 * moldura e com a mesma divisão: a formação escolhida para exclusão fica
 * guardada aqui, e a tela só é chamada depois da confirmação (ADM-06, ADM-09).
 */

import { useState } from "react";

import { ConfirmarExclusao } from "@/components/layout/confirmar-exclusao";
import {
  AcoesDaTabela,
  CelulaDaTabela,
  LinhaDaTabela,
  TabelaPainel,
  type ColunaDaTabela,
} from "@/components/layout/tabela-painel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { painel } from "@/content/site";
import { ORDEM_NO_FIM } from "@/features/formacoes/converter";
import type {
  Formacao,
  StatusFormacao,
} from "@/features/formacoes/schemas";

const { formacoes: textos } = painel;

const COLUNAS: readonly ColunaDaTabela[] = [
  { rotulo: textos.colunas.formacao },
  { rotulo: textos.colunas.ano },
  { rotulo: textos.colunas.situacao },
  { rotulo: textos.colunas.ordem },
  { rotulo: textos.colunas.acoes, aoFim: true },
];

/**
 * Variante do selo por situação. O mapa é exaustivo de propósito: um status
 * novo no enum passa a quebrar em compilação, em vez de cair no silêncio de um
 * `else`.
 */
const VARIANTE_POR_STATUS: Record<StatusFormacao, "default" | "secondary"> = {
  concluido: "default",
  em_andamento: "secondary",
};

export function FormacoesTable({
  formacoes,
  idOcupado,
  aoEditar,
  aoExcluir,
}: {
  formacoes: readonly Formacao[];
  /** Formação com uma ação em andamento, se houver. */
  idOcupado: string | null;
  aoEditar: (formacao: Formacao) => void;
  aoExcluir: (formacao: Formacao) => void;
}) {
  const [aExcluir, setAExcluir] = useState<Formacao | null>(null);

  function confirmarExclusao() {
    if (aExcluir === null) {
      return;
    }

    const escolhida = aExcluir;
    setAExcluir(null);
    aoExcluir(escolhida);
  }

  return (
    <>
      <TabelaPainel colunas={COLUNAS}>
        {formacoes.map((formacao) => {
          const ocupada = idOcupado === formacao.id;

          return (
            <LinhaDaTabela key={formacao.id}>
              <CelulaDaTabela>
                <span className="block font-medium text-ink">
                  {formacao.titulo}
                </span>
                <span className="block text-xs text-ink-soft">
                  {formacao.instituicao}
                </span>
              </CelulaDaTabela>

              <CelulaDaTabela tom="fraco">
                {formacao.ano ?? textos.semAno}
              </CelulaDaTabela>

              <CelulaDaTabela>
                <Badge variant={VARIANTE_POR_STATUS[formacao.status]}>
                  {textos.situacoes[formacao.status]}
                </Badge>
              </CelulaDaTabela>

              <CelulaDaTabela tom="fraco">
                {formacao.ordem === ORDEM_NO_FIM
                  ? textos.semOrdem
                  : formacao.ordem}
              </CelulaDaTabela>

              <AcoesDaTabela>
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
                  onClick={() => setAExcluir(formacao)}
                >
                  {textos.acoes.excluir}
                </Button>
              </AcoesDaTabela>
            </LinhaDaTabela>
          );
        })}
      </TabelaPainel>

      <ConfirmarExclusao
        aberto={aExcluir !== null}
        titulo={textos.exclusao.titulo}
        descricao={textos.exclusao.mensagem(aExcluir?.titulo ?? "")}
        rotuloConfirmar={textos.exclusao.confirmar}
        rotuloCancelar={textos.exclusao.cancelar}
        aoConfirmar={confirmarExclusao}
        aoFechar={() => setAExcluir(null)}
      />
    </>
  );
}
