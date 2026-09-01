/**
 * Corpo da publicação, escrito em markdown pela autora.
 *
 * `remark-gfm` liga tabela, lista de tarefas e link automático. `rehype-raw`
 * fica de fora de propósito: sem ele o HTML bruto que aparecer no texto é
 * exibido como texto e nunca executado, que é o que a spec pede.
 */

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { propsLinkExterno } from "@/lib/link";

const COMPONENTES: Components = {
  h1: ({ children }) => (
    <h2 className="mt-10 font-display text-2xl text-olive">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-2xl text-olive">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-xl text-ink">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 text-ink-soft">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-olive underline underline-offset-4 hover:text-brass"
      {...propsLinkExterno(true)}
    >
      {children}
    </a>
  ),
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
  code: ({ children }) => (
    <code className="rounded-xs bg-surface-2 px-1.5 py-0.5 text-sm">
      {children}
    </code>
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
