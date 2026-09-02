import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ancoras, type ItemDeFormacao, secaoFormacao } from "@/content/site";
import { juntarMeta } from "@/lib/format";

/**
 * Formação da Keylla, lida do conteúdo fixo. Sem Firestore: a lista muda de
 * tempos em tempos e não justifica um CRUD.
 *
 * Item sem ano ocupa a mesma grade dos demais, só com a coluna do ano vazia —
 * o currículo não registra a data de vários cursos, e inventar uma seria pior
 * do que não mostrar nenhuma.
 */
function Item({ item }: { item: ItemDeFormacao }) {
  const detalhe = juntarMeta(item.instituicao, item.detalhe);

  return (
    <li className="grid gap-1.5 border-b border-line px-1 py-5 sm:grid-cols-[6rem_1fr] sm:items-baseline sm:gap-5">
      <span className="font-display text-sm tabular-nums tracking-marca text-brass">
        {item.ano}
      </span>

      <div>
        <h4 className="font-display text-lg text-ink">{item.titulo}</h4>
        {detalhe === "" ? null : (
          <p className="mt-0.5 max-w-leitura text-sm text-ink-soft">
            {detalhe}
          </p>
        )}
      </div>
    </li>
  );
}

export function Formacao() {
  return (
    <section
      id={ancoras.formacao}
      className="scroll-mt-cabecalho py-14 duo:py-24"
    >
      <Container>
        <SectionHeading
          stacked
          eyebrow={secaoFormacao.eyebrow}
          titulo={secaoFormacao.titulo}
        />

        <div className="mt-8 grid gap-10 duo:grid-cols-2 duo:gap-14">
          {secaoFormacao.grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <h3 className="border-b border-line pb-2.5 text-xs font-semibold uppercase tracking-rotulo text-brass">
                {grupo.titulo}
              </h3>
              <ul>
                {grupo.itens.map((item) => (
                  <Item key={item.titulo} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
