/**
 * Corpo da publicação, escrito em markdown pela autora.
 *
 * `remark-gfm` liga tabela, lista de tarefas e link automático. `rehype-raw`
 * fica de fora de propósito: sem ele o HTML bruto que aparecer no texto é
 * exibido como texto e nunca executado, que é o que a spec pede.
 */

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { imagemExibivel } from "@/features/publicacoes/schemas";
import { ehDestinoExterno, propsLinkExterno } from "@/lib/link";

/**
 * O título da página já é o `h1`, então o `#` do markdown desce um nível e
 * divide a aparência com o `##`.
 */
function Titulo2({ children }: { children?: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl text-olive">{children}</h2>;
}

const COMPONENTES: Components = {
  h1: Titulo2,
  h2: Titulo2,
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-xl text-ink">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 text-ink-soft">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-olive underline underline-offset-4 hover:text-brass"
      {...propsLinkExterno(ehDestinoExterno(href))}
    >
      {children}
    </a>
  ),
  // A imagem do markdown passa pela mesma allowlist do card e do topo do
  // detalhe: fora dela, some, em vez de virar um destino de terceiro no meio
  // do texto.
  img: ({ src, alt }) => {
    const permitida = imagemExibivel(typeof src === "string" ? src : null);

    if (permitida === null) {
      return null;
    }

    // O markdown não traz as dimensões que o `next/image` exige, então aqui a
    // imagem é uma tag comum.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={permitida}
        alt={alt ?? ""}
        loading="lazy"
        className="mt-6 w-full rounded-xs border border-line"
      />
    );
  },
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-soft">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-brass pl-4 text-ink-soft italic">
      {children}
    </blockquote>
  ),
  // O mesmo `code` chega solto no meio da frase e dentro do `pre`. Só o solto
  // vira chip; dentro do bloco a moldura já é do `pre`.
  code: ({ className, children }) =>
    className === undefined ? (
      <code className="rounded-xs bg-surface-2 px-1.5 py-0.5 text-sm">
        {children}
      </code>
    ) : (
      <code className={className}>{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-xs border border-line bg-surface-2 p-4 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-line" />,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-line px-3 py-2 font-semibold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line px-3 py-2 text-ink-soft">{children}</td>
  ),
};

export function CorpoMarkdown({ corpo }: { corpo: string }) {
  return (
    <div className="max-w-leitura">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTES}>
        {corpo}
      </ReactMarkdown>
    </div>
  );
}
