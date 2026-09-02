"use client";

/**
 * Tabela de publicações do painel.
 *
 * Exclusão passa pelo `ConfirmarAcao` — nunca por `window.confirm`, que
 * não combina com o resto da interface e não pode ser estilizado (ADM-09). A
 * publicação escolhida fica guardada aqui e só depois da confirmação a
 * exclusão é pedida a quem chamou (ADM-06).
 *
 * As ações ficam sempre visíveis: esconder botão atrás de `hover` deixa a
 * função invisível para quem usa toque ou teclado.
 */

import Link from "next/link";
import { useState } from "react";

import { ConfirmarAcao } from "@/components/layout/confirmar-acao";
import {
  AcoesDaTabela,
  CelulaDaTabela,
  LinhaDaTabela,
  TabelaPainel,
  type ColunaDaTabela,
} from "@/components/layout/tabela-painel";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { painel } from "@/content/site";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { formatDateBROuNulo } from "@/lib/format";
import { caminhoDaEdicao, caminhoDaPublicacao } from "@/lib/rotas";

const { listaDePublicacoes: textos } = painel;

const COLUNAS: readonly ColunaDaTabela[] = [
  { rotulo: textos.colunas.titulo },
  { rotulo: textos.colunas.estado },
  { rotulo: textos.colunas.data },
  { rotulo: textos.colunas.acoes, aoFim: true },
];

export function PublicacoesTable({
  publicacoes,
  idOcupado,
  aoAlternar,
  aoExcluir,
}: {
  publicacoes: readonly Publicacao[];
  /** Publicação com uma ação em andamento, se houver. */
  idOcupado: string | null;
  aoAlternar: (publicacao: Publicacao) => void;
  aoExcluir: (publicacao: Publicacao) => void;
}) {
  const [aExcluir, setAExcluir] = useState<Publicacao | null>(null);

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
        {publicacoes.map((publicacao) => {
          const ocupada = idOcupado === publicacao.id;
          const data = formatDateBROuNulo(publicacao.publicadoEm);

          return (
            <LinhaDaTabela key={publicacao.id}>
              <CelulaDaTabela>
                <span className="block font-medium text-ink">
                  {publicacao.titulo}
                </span>
                <span className="block text-xs text-ink-soft">
                  {publicacao.slug}
                </span>
              </CelulaDaTabela>

              <CelulaDaTabela>
                <Badge variant={publicacao.publicado ? "default" : "secondary"}>
                  {publicacao.publicado
                    ? textos.estados.publicado
                    : textos.estados.rascunho}
                </Badge>
              </CelulaDaTabela>

              <CelulaDaTabela tom="fraco">
                {data ?? textos.semData}
              </CelulaDaTabela>

              <AcoesDaTabela>
                <Link
                  href={caminhoDaEdicao(publicacao.id)}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  {textos.acoes.editar}
                </Link>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={ocupada}
                  onClick={() => aoAlternar(publicacao)}
                >
                  {ocupada
                    ? textos.acoes.emAndamento
                    : publicacao.publicado
                      ? textos.acoes.despublicar
                      : textos.acoes.publicar}
                </Button>

                {publicacao.publicado ? (
                  <Link
                    href={caminhoDaPublicacao(publicacao.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    {textos.acoes.verNoSite}
                  </Link>
                ) : null}

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={ocupada}
                  onClick={() => setAExcluir(publicacao)}
                >
                  {textos.acoes.excluir}
                </Button>
              </AcoesDaTabela>
            </LinhaDaTabela>
          );
        })}
      </TabelaPainel>

      <ConfirmarAcao
        destrutiva
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
