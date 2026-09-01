"use client";

/**
 * Tabela de publicações do painel.
 *
 * Exclusão passa por `AlertDialog` — nunca por `window.confirm`, que não
 * combina com o resto da interface e não pode ser estilizado (ADM-09). O
 * diálogo é um só, controlado pela publicação escolhida, e só depois da
 * confirmação a exclusão é pedida (ADM-06).
 *
 * As ações ficam sempre visíveis: esconder botão atrás de `hover` deixa a
 * função invisível para quem usa toque ou teclado.
 */

import Link from "next/link";
import { useState } from "react";

import { ConfirmarExclusao } from "@/components/layout/confirmar-exclusao";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { painel } from "@/content/site";
import type { Publicacao } from "@/features/publicacoes/schemas";
import { formatDateBROuNulo } from "@/lib/format";
import { caminhoDaEdicao } from "@/lib/rotas";

const { listaDePublicacoes: textos } = painel;

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
      <div className="overflow-x-auto rounded-xs border border-line bg-surface">
        <table className="w-full min-w-3xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-rotulo text-ink-soft">
              <th scope="col" className="px-5 py-3 font-semibold">
                {textos.colunas.titulo}
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                {textos.colunas.estado}
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                {textos.colunas.data}
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                {textos.colunas.acoes}
              </th>
            </tr>
          </thead>

          <tbody>
            {publicacoes.map((publicacao) => {
              const ocupada = idOcupado === publicacao.id;
              const data = formatDateBROuNulo(publicacao.publicadoEm);

              return (
                <tr
                  key={publicacao.id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <span className="block font-medium text-ink">
                      {publicacao.titulo}
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {publicacao.slug}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={publicacao.publicado ? "default" : "secondary"}
                    >
                      {publicacao.publicado
                        ? textos.estados.publicado
                        : textos.estados.rascunho}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-ink-soft">
                    {data ?? textos.semData}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
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

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={ocupada}
                        onClick={() => setAExcluir(publicacao)}
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
