# Site Portfólio — Design

## Stack

| Camada | Escolha | Motivo |
| ------ | ------- | ------ |
| Framework | Next 16, App Router, React Server Components | SEO das publicações e render no servidor sem SDK no bundle público |
| Linguagem | TypeScript strict | Contrato entre Firestore e UI |
| Estilo | Tailwind v4 (`@theme inline`) + tokens OKLCH | Paleta aprovada vira token; zero cor literal em componente |
| Componentes | shadcn/ui (button, input, textarea, label, dialog, alert-dialog, card, badge, sonner) | Dialog de confirmação e formulário sem reinventar |
| Dados | Firebase 12 Web SDK — Firestore + Auth | Leitura pública por rules; escrita autenticada |
| Formulários | react-hook-form + Zod v4 | Limites de campo e mensagens no mesmo schema usado no serviço |
| Markdown | react-markdown + remark-gfm, sem `rehype-raw` | Corpo formatado sem executar HTML da autora |
| Testes | Vitest + Testing Library + jsdom | Escolha do usuário |

**Sem `firebase-admin`.** Leitura pública roda com o Web SDK dentro de Server Components; escrita roda no cliente autenticado. A autorização mora em `firestore.rules`, não em código de aplicação. Evita service account e segredo em runtime.

## Estrutura de pastas

Convenção: **`app/` só roteia; `features/` contém domínio; `components/` só tem peça reutilizável sem domínio.**

```
portfolio-keylla/
├── .specs/                          # spec-driven (não vai para produção)
├── public/
├── firestore.rules
├── firestore.indexes.json
├── src/
│   ├── app/
│   │   ├── layout.tsx               # html/body, fontes, providers globais
│   │   ├── globals.css              # @theme inline: tokens da paleta
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── (site)/
│   │   │   ├── layout.tsx           # header + footer públicos
│   │   │   ├── page.tsx             # home: compõe as seções
│   │   │   └── publicacoes/[slug]/page.tsx
│   │   └── (admin)/
│   │       └── admin/
│   │           ├── layout.tsx       # AuthGuard + shell do painel
│   │           ├── page.tsx         # lista de publicações
│   │           ├── login/page.tsx
│   │           ├── publicacoes/[id]/page.tsx   # id === "nova" cria
│   │           └── formacoes/page.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn gerado
│   │   └── layout/                  # SiteHeader, SiteFooter, SectionHeading
│   ├── features/
│   │   ├── publicacoes/
│   │   │   ├── components/          # PublicacaoCard, PublicacoesSection, PublicacaoForm, PublicacoesTable
│   │   │   ├── schemas.ts           # Zod: limites e mensagens
│   │   │   ├── types.ts
│   │   │   ├── converter.ts         # Firestore ↔ domínio (datas, defaults)
│   │   │   ├── queries.ts           # leitura (server)
│   │   │   └── mutations.ts         # escrita (client autenticado)
│   │   ├── formacoes/               # mesma anatomia
│   │   └── site/
│   │       └── sections/            # Hero, OQueFazUmaAt, Sobre, Contato
│   ├── content/
│   │   └── site.ts                  # nome, contatos, pilares, textos fixos
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts            # lê e valida env, falha nomeando a variável
│   │   │   ├── client.ts            # singleton app/db/auth
│   │   │   └── errors.ts            # código do Firebase → mensagem pt-BR
│   │   ├── format.ts                # formatDateBR, slugify
│   │   └── utils.ts                 # cn (shadcn)
│   ├── hooks/
│   │   └── use-auth.ts
│   └── test/
│       └── setup.ts
└── vitest.config.ts
```

**Regras de camada**
- Server Component nunca importa de `mutations.ts`; Client Component nunca importa de `queries.ts`.
- Componente de seção recebe dados por prop — quem busca é a `page.tsx`.
- Nenhuma string de conteúdo dentro de componente: tudo vem de `src/content/site.ts` ou do Firestore.
- Nenhum valor de cor/espaçamento literal: só token do tema.

## Modelo de dados

```
publicacoes/{id}
  titulo      string   ≤ 120
  slug        string   único, minúsculo, [a-z0-9-]
  resumo      string   ≤ 220
  corpo       string   ≤ 20000, markdown
  imagemUrl   string | null   https, host na allowlist
  tag         string | null
  publicado   boolean
  publicadoEm timestamp
  atualizadoEm timestamp

formacoes/{id}
  titulo      string   ≤ 120
  instituicao string   ≤ 120
  descricao   string | null ≤ 220
  ano         number   1970..(ano atual + 10)
  status      "concluido" | "em_andamento"
  ordem       number
```

Índice composto: `publicacoes(publicado ASC, publicadoEm DESC)`.

## Segurança (`firestore.rules`)

```
match /publicacoes/{id} {
  allow read: if resource.data.publicado == true || isAutora();
  allow write: if isAutora();
}
match /formacoes/{id} {
  allow read: if true;
  allow write: if isAutora();
}
function isAutora() { return request.auth != null && request.auth.uid in AUTORAS; }
```

A allowlist de uid fica nas rules — nunca em campo de documento, que a própria autora poderia editar.

## Fluxos

**Leitura pública:** `page.tsx` (server, `revalidate = 300`) → `queries.ts` → Firestore → converter → props da seção. Falha da query não derruba a página: a seção recebe `{ erro: string }` e renderiza o estado de erro com a mensagem do Firebase.

**Escrita:** `/admin/publicacoes/[id]` (client) → react-hook-form + Zod → `mutations.ts` → Firestore. Enquanto `salvando`, todos os controles ficam desabilitados. Exclusão passa por `AlertDialog`.

**Auth:** `useAuth` escuta `onAuthStateChanged`; o layout do grupo `(admin)` bloqueia a renderização enquanto o estado é `carregando` e redireciona para `/admin/login` quando não há sessão.

## Decisões registradas

- AD-001: sem `firebase-admin`; autorização vive nas rules.
- AD-002: `features/` por domínio com `queries`/`mutations` separados, para impedir SDK de escrita no bundle público.
- AD-003: `/publicacoes/[slug]` como rota real (SEO e compartilhamento), o resto do site permanece página única.
- AD-004: conteúdo fixo centralizado em `src/content/site.ts`, com placeholders marcados até a entrega dos dados reais.
