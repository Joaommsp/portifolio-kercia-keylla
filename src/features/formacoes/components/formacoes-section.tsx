/**
 * Seção de formação e certificações da home.
 *
 * Sem nenhum registro a seção some inteira, inclusive o título — uma trajetória
 * vazia diz menos que trajetória nenhuma (FOR-04). Com erro de leitura ela
 * permanece, exibindo a mensagem que o Firebase devolveu (FOR-03).
 *
 * A ordem é a que chega por prop: quem ordena é `ordenarFormacoes`, na
 * conversão, para o painel exibir a mesma sequência da home (AD-012).
 */

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { SectionMessage } from "@/components/layout/section-message";
import { ancoras, secaoFormacao, separadorDeMeta } from "@/content/site";
import type { Formacao, StatusFormacao } from "@/features/formacoes/schemas";
import type { Resultado } from "@/lib/resultado";
import { cn } from "@/lib/utils";

const CLASSES_POR_STATUS: Record<StatusFormacao, string> = {
  concluido: "bg-olive/15 text-olive",
  em_andamento: "bg-brass/20 text-brass",
};

/** Ano da formação, com o traço de continuidade quando ela ainda está em curso. */
function anoExibido(formacao: Formacao): string | null {
  if (formacao.ano === null) {
    return null;
  }

  return formacao.status === "em_andamento"
    ? `${formacao.ano}${secaoFormacao.sufixoEmAndamento}`
    : String(formacao.ano);
}

function ItemDeFormacao({ formacao }: { formacao: Formacao }) {
  const ano = anoExibido(formacao);
  const detalhe = [formacao.instituicao, formacao.descricao]
    .filter((parte): parte is string => parte !== null && parte !== "")
    .join(separadorDeMeta);

  return (
    <li className="grid gap-1.5 border-b border-line px-1 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-5">
      <span className="font-display text-sm tabular-nums tracking-marca text-brass">
        {ano}
      </span>

      <div>
        <h3 className="font-display text-lg text-ink">{formacao.titulo}</h3>
        {detalhe === "" ? null : (
          <p className="mt-0.5 text-sm text-ink-soft">{detalhe}</p>
        )}
      </div>

      <span
        className={cn(
          "justify-self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-rotulo whitespace-nowrap",
          CLASSES_POR_STATUS[formacao.status],
        )}
      >
        {secaoFormacao.rotulos[formacao.status]}
      </span>
    </li>
  );
}

export function FormacoesSection({
  resultado,
}: {
  resultado: Resultado<Formacao[]>;
}) {
  if ("dados" in resultado && resultado.dados.length === 0) {
    return null;
  }

  return (
    <section
      id={ancoras.formacao}
      className="scroll-mt-cabecalho py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          eyebrow={secaoFormacao.eyebrow}
          titulo={secaoFormacao.titulo}
        />

        {"erro" in resultado ? (
          <SectionMessage tom="erro">{resultado.erro}</SectionMessage>
        ) : (
          <ul className="border-t border-line">
            {resultado.dados.map((formacao) => (
              <ItemDeFormacao key={formacao.id} formacao={formacao} />
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
