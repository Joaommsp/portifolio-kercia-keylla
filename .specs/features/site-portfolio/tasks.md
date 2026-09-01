# Site Portfólio — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**Design**: `.specs/features/site-portfolio/design.md`
**Status**: In Progress

---

## Test Coverage Matrix

> Projeto novo, sem testes prévios. Guidelines encontradas: nenhuma no repo; aplicado o padrão do usuário (Vitest + Testing Library) e os defaults fortes da skill.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domínio (schemas, converters, format, errors) | unit | Todos os ramos; 1:1 com ACs; todo edge case listado na spec | `src/**/*.test.ts` | `npm test` |
| Componentes com estado (seções dinâmicas, formulários, guard) | unit (Testing Library) | Estados vazio, erro, carregando e caminho feliz | `src/**/*.test.tsx` | `npm test` |
| Leitura de dados (`queries.ts`) | unit com Firestore mockado | Caminho feliz, lista vazia, falha de leitura | `src/**/*.test.ts` | `npm test` |
| Escrita (`mutations.ts`) | unit com Firestore mockado | Criar, editar, excluir, slug duplicado, falha de escrita | `src/**/*.test.ts` | `npm test` |
| Rotas / layouts / config / conteúdo estático | none | — (build gate) | — | build gate |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Task com testes unitários | `npm test -- --run` |
| Build | Task de config/rota/conteúdo e fim de fase | `npx tsc --noEmit && npm run lint && npm test -- --run && npm run build` |

---

## Execution Plan

Fases rodam em ordem; dentro da fase, as tasks seguem a numeração. As setas incluem dependências vindas de fases anteriores.

### Phase 1: Fundação

```
T1 → T2
T2 → T3
T1 → T4
T4 → T5
T1 → T6
```

### Phase 2: Home estática

```
T3 → T7
T6 → T8
T6 → T9
T6 → T10
T6 → T11
T6 → T12
T6 → T13
```

### Phase 3: Camada de dados

```
T3 → T14
T14 → T15
T3 → T16
T3 → T17
T17 → T18
T18 → T19
T3 → T20
T20 → T21
T21 → T22
```

### Phase 4: Seções dinâmicas públicas

```
T19 → T23
T7 → T23
T23 → T24
T22 → T25
T24 → T26
T25 → T26
T10 → T26
T11 → T26
T12 → T26
T13 → T26
T19 → T27
```

### Phase 5: Admin

```
T15 → T28
T28 → T29
T29 → T30
T16 → T30
T18 → T31
T31 → T32
T17 → T32
T31 → T33
T32 → T34
T21 → T35
T33 → T35
```

### Phase 6: Fechamento

```
T31 → T36
T36 → T37
T19 → T38
T38 → T39
```

---

## Task Breakdown

### T1: Scaffold Next 16 ✅

**What**: Criar o projeto com `create-next-app` (TS, Tailwind v4, ESLint, App Router, `src/`, alias `@/*`) e limpar o boilerplate da home.
**Where**: `package.json`
**Depends on**: None
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `npm run dev` não é executado; `npm run build` conclui
- [ ] `tsconfig.json` com `strict: true`
- [ ] Boilerplate de exemplo removido de `src/app/page.tsx`

**Tests**: none
**Gate**: build

---

### T2: Dependências do projeto ✅

**What**: Instalar firebase, react-hook-form, @hookform/resolvers, zod, react-markdown, remark-gfm, lucide-react, e as devDependencies de teste (vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event).
**Where**: `package.json`
**Depends on**: T1
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Versões fixadas (sem `^`)
- [ ] `npm run build` conclui

**Tests**: none
**Gate**: build

---

### T3: Vitest configurado ✅

**What**: Configurar Vitest com jsdom, plugin React, alias `@/*` e `src/test/setup.ts` com jest-dom; adicionar script `test`.
**Where**: `vitest.config.ts`
**Depends on**: T2
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `npm test -- --run` executa e reporta suíte vazia sem erro
- [ ] Alias `@/` resolve dentro do teste

**Tests**: none
**Gate**: build

---

### T4: Tokens da paleta aprovada ✅

**What**: Declarar em `@theme inline` os tokens de cor, fonte e raio da paleta aprovada (ground `#EDF3E4`, surface `#F7FBF1`, surface-2 `#E1EAD3`, ink, ink-soft, olive, olive-deep, brass, line) e aplicar no `body`.
**Where**: `src/app/globals.css`
**Depends on**: T1
**Requirement**: SIT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Nenhuma cor literal fora deste arquivo
- [ ] `prefers-reduced-motion` desliga transições globalmente

**Tests**: none
**Gate**: build

---

### T5: Layout raiz com as fontes ✅

**What**: Carregar Fraunces, Karla e Parisienne via `next/font/google`, expor como variáveis CSS e definir metadados base do site.
**Where**: `src/app/layout.tsx`
**Depends on**: T4
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `lang="pt-BR"` no `<html>`
- [ ] As três fontes aplicadas por variável, sem `<link>` manual

**Tests**: none
**Gate**: build

---

### T6: Conteúdo fixo do site ✅

**What**: Centralizar nome, papel, textos do hero e do sobre, os 6 pilares da AT e os canais de contato, com os campos ainda não fornecidos marcados como pendentes.
**Where**: `src/content/site.ts`
**Depends on**: T1
**Requirement**: SIT-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Tipado com `as const` e exportando o tipo dos pilares
- [ ] Contatos com `href` pronto (wa.me, mailto, instagram)
- [ ] Nenhum texto de conteúdo fora deste arquivo

**Tests**: none
**Gate**: build

---

### T7: Formatadores compartilhados ✅

**What**: Implementar `formatDateBR` (pt-BR, America/Sao_Paulo) e `slugify` (minúsculo, sem acento, `[a-z0-9-]`).
**Where**: `src/lib/format.ts`
**Depends on**: T3
**Requirement**: PUB-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `slugify` remove acento, pontuação e colapsa hífen
- [ ] `formatDateBR` não desloca o dia por fuso

**Tests**: unit
**Gate**: quick

---

### T8: Cabeçalho do site ✅

**What**: Header fixo com marca, menu âncora das seções e botão de contato.
**Where**: `src/components/layout/site-header.tsx`
**Depends on**: T6
**Requirement**: SIT-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Links âncora para `#at`, `#sobre`, `#formacao`, `#publicacoes`, `#contato`
- [ ] Menu recolhe abaixo de 820px sem quebrar o layout
- [ ] Foco visível no teclado

**Tests**: none
**Gate**: build

---

### T9: Rodapé do site ✅

**What**: Rodapé com nome, papel e ano corrente.
**Where**: `src/components/layout/site-footer.tsx`
**Depends on**: T6
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Textos vindos de `src/content/site.ts`

**Tests**: none
**Gate**: build

---

### T10: Seção hero ✅

**What**: Hero com saudação em script, nome em display, papel, texto de apresentação, dois CTAs e o espaço do retrato.
**Where**: `src/features/site/sections/hero.tsx`
**Depends on**: T6
**Requirement**: SIT-01, SIT-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Retrato usa placeholder até a foto real
- [ ] Sem rolagem horizontal em 360px

**Tests**: none
**Gate**: build

---

### T11: Seção "O que faz uma AT" ✅

**What**: Grade dos 6 pilares lida de `src/content/site.ts`, com ícone, título e descrição.
**Where**: `src/features/site/sections/o-que-faz-uma-at.tsx`
**Depends on**: T6
**Requirement**: SIT-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Nenhum texto de pilar escrito no componente
- [ ] 3 colunas ≥860px, 2 até 860px, 1 até 560px

**Tests**: none
**Gate**: build

---

### T12: Seção Sobre ✅

**What**: Bloco sobre a profissional, com assinatura e espaço de foto em contexto.
**Where**: `src/features/site/sections/sobre.tsx`
**Depends on**: T6
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Texto vindo de `src/content/site.ts`
- [ ] Empilha em coluna única abaixo de 820px

**Tests**: none
**Gate**: build

---

### T13: Seção de contato ✅

**What**: Faixa de contato com chamada e os links diretos (WhatsApp com mensagem pré-preenchida, e-mail, Instagram, região de atendimento).
**Where**: `src/features/site/sections/contato.tsx`
**Depends on**: T6
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Sem formulário
- [ ] Links externos com `rel="noopener noreferrer"`

**Tests**: none
**Gate**: build

---

### T14: Configuração validada do Firebase ✅

**What**: Ler as variáveis `NEXT_PUBLIC_FIREBASE_*` e falhar nomeando a variável ausente.
**Where**: `src/lib/firebase/config.ts`
**Depends on**: T3
**Requirement**: SIT-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Erro cita o nome exato da variável faltante
- [x] Objeto de config tipado, sem `any`

**Tests**: unit
**Gate**: quick

---

### T15: Cliente Firebase singleton ✅

**What**: Inicializar app, Firestore e Auth uma única vez (reuso via `getApps()`).
**Where**: `src/lib/firebase/client.ts`
**Depends on**: T14
**Requirement**: PUB-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Nenhuma reinicialização em hot reload
- [x] Exporta `db` e `auth`

**Tests**: none
**Gate**: build

---

### T16: Tradução de erros do Firebase ✅

**What**: Mapear códigos de Auth e Firestore para mensagens em pt-BR, com fallback para a mensagem original.
**Where**: `src/lib/firebase/errors.ts`
**Depends on**: T3
**Requirement**: ADM-03, PUB-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `auth/invalid-credential`, `auth/too-many-requests` e `permission-denied` cobertos
- [x] Mensagem de credencial não revela se o e-mail existe
- [x] Código desconhecido devolve a mensagem original, nunca texto genérico

**Tests**: unit
**Gate**: quick

---

### T17: Schema de publicação ✅

**What**: Schema Zod com os limites da spec e mensagens em pt-BR, mais o tipo derivado.
**Where**: `src/features/publicacoes/schemas.ts`
**Depends on**: T3
**Requirement**: ADM-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Título ≤120 inclusivo, resumo ≤220, corpo ≤20000
- [x] `imagemUrl` aceita vazio ou URL https de host permitido
- [x] Slug validado por `[a-z0-9-]`

**Tests**: unit
**Gate**: quick

---

### T18: Converter de publicação ✅

**What**: Converter documento do Firestore em objeto de domínio (timestamp → Date, campos ausentes → default) e o inverso.
**Where**: `src/features/publicacoes/converter.ts`
**Depends on**: T17
**Requirement**: PUB-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Documento sem `imagemUrl`, `tag` ou `atualizadoEm` não quebra a conversão
- [x] `publicadoEm` ausente não vira data inválida

**Tests**: unit
**Gate**: quick

---

### T19: Leitura de publicações ✅

**What**: `listarPublicadas(limite)` e `obterPorSlug(slug)` em Server Component, devolvendo `{ dados }` ou `{ erro }`.
**Where**: `src/features/publicacoes/queries.ts`
**Depends on**: T18
**Requirement**: PUB-01, PUB-04, PUB-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Filtra `publicado == true` e ordena por `publicadoEm` desc
- [x] Slug inexistente devolve `null`, não erro
- [x] Falha de leitura devolve a mensagem traduzida, sem lançar

**Tests**: unit
**Gate**: quick

---

### T20: Schema de formação ✅

**What**: Schema Zod de formação com limites, `status` como união e `ano` dentro do intervalo permitido.
**Where**: `src/features/formacoes/schemas.ts`
**Depends on**: T3
**Requirement**: FOR-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `status` restrito a `concluido` | `em_andamento`
- [x] `ano` entre 1970 e ano atual + 10

**Tests**: unit
**Gate**: quick

---

### T21: Converter de formação

**What**: Converter documento de formação em objeto de domínio e o inverso.
**Where**: `src/features/formacoes/converter.ts`
**Depends on**: T20
**Requirement**: FOR-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `descricao` ausente vira `null`
- [ ] `ordem` ausente assume o maior valor conhecido, sem quebrar a ordenação

**Tests**: unit
**Gate**: quick

---

### T22: Leitura de formações

**What**: `listarFormacoes()` ordenando por `ordem` asc e `ano` desc, devolvendo `{ dados }` ou `{ erro }`.
**Where**: `src/features/formacoes/queries.ts`
**Depends on**: T21
**Requirement**: FOR-01, FOR-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Empate de `ordem` desempata por `ano` decrescente
- [ ] Falha devolve mensagem traduzida, sem lançar

**Tests**: unit
**Gate**: quick

---

### T23: Card de publicação

**What**: Card com imagem opcional, título, resumo, data e tag, ligando para `/publicacoes/[slug]`.
**Where**: `src/features/publicacoes/components/publicacao-card.tsx`
**Depends on**: T19, T7
**Requirement**: PUB-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Sem `imagemUrl`, o card renderiza só texto, sem espaço vazio
- [ ] Data formatada por `formatDateBR`

**Tests**: unit
**Gate**: quick

---

### T24: Seção de publicações

**What**: Seção que recebe o resultado da query e resolve os três estados: lista, vazio e erro.
**Where**: `src/features/publicacoes/components/publicacoes-section.tsx`
**Depends on**: T23
**Requirement**: PUB-01, PUB-03, PUB-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Vazio exibe "Nenhuma publicação por aqui ainda."
- [ ] Erro exibe a mensagem recebida do Firebase, não texto genérico
- [ ] Máximo de 6 cards

**Tests**: unit
**Gate**: quick

---

### T25: Seção de formação

**What**: Seção de formação com rótulo de status e ocultação total quando não há registros.
**Where**: `src/features/formacoes/components/formacoes-section.tsx`
**Depends on**: T22
**Requirement**: FOR-01, FOR-02, FOR-03, FOR-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Lista vazia não renderiza nem o título da seção
- [ ] "Em andamento" e "Concluído" visualmente distintos
- [ ] Erro exibe a mensagem do Firebase

**Tests**: unit
**Gate**: quick

---

### T26: Home compondo as seções

**What**: `page.tsx` do grupo `(site)` buscando publicações e formações no servidor e compondo todas as seções na ordem da spec.
**Where**: `src/app/(site)/page.tsx`
**Depends on**: T24, T25, T10, T11, T12, T13
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `revalidate = 300`
- [ ] Falha de uma query não impede o restante da página de renderizar
- [ ] Ordem das seções conforme SIT-01

**Tests**: none
**Gate**: build

---

### T27: Página da publicação

**What**: Rota `/publicacoes/[slug]` com corpo em markdown, metadados Open Graph e 404 para slug inexistente ou rascunho.
**Where**: `src/app/(site)/publicacoes/[slug]/page.tsx`
**Depends on**: T19
**Requirement**: PUB-02, PUB-04, PUB-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `generateMetadata` usa título e resumo
- [ ] Markdown renderizado sem HTML bruto
- [ ] Rascunho responde 404

**Tests**: none
**Gate**: build

---

### T28: Hook de autenticação

**What**: `useAuth` expondo `usuario`, `carregando` e `sair`, escutando `onAuthStateChanged`.
**Where**: `src/hooks/use-auth.ts`
**Depends on**: T15
**Requirement**: ADM-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Estado inicial é `carregando`, nunca "deslogado"
- [ ] Listener é removido no unmount

**Tests**: unit
**Gate**: quick

---

### T29: Guarda do painel

**What**: Layout do grupo `(admin)` que bloqueia a renderização enquanto carrega e redireciona para `/admin/login` sem sessão.
**Where**: `src/app/(admin)/admin/layout.tsx`
**Depends on**: T28
**Requirement**: ADM-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Nenhum conteúdo do painel aparece antes de a sessão resolver
- [ ] `/admin/login` não entra em laço de redirecionamento

**Tests**: unit
**Gate**: quick

---

### T30: Tela de login

**What**: Formulário de e-mail e senha com estado de carregamento e erro traduzido.
**Where**: `src/app/(admin)/admin/login/page.tsx`
**Depends on**: T29, T16
**Requirement**: ADM-02, ADM-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Sem `maxLength` em e-mail ou senha
- [ ] Erro exibido é o traduzido, sem revelar existência do e-mail
- [ ] Sucesso redireciona para `/admin`

**Tests**: unit
**Gate**: quick

---

### T31: Escrita de publicações

**What**: `criar`, `atualizar`, `excluir` e `alternarPublicado`, com verificação de slug único.
**Where**: `src/features/publicacoes/mutations.ts`
**Depends on**: T18
**Requirement**: ADM-05, ADM-07, ADM-08

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Slug repetido é rejeitado com mensagem de slug em uso
- [ ] Falha devolve a mensagem traduzida do Firebase
- [ ] `atualizar` grava `atualizadoEm`

**Tests**: unit
**Gate**: quick

---

### T32: Formulário de publicação

**What**: Formulário com react-hook-form + Zod, contador de caracteres, slug sugerido pelo título e ações publicar/salvar rascunho.
**Where**: `src/features/publicacoes/components/publicacao-form.tsx`
**Depends on**: T31, T17
**Requirement**: ADM-04, ADM-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Campo inválido bloqueia o envio e é apontado
- [ ] Durante o salvamento todos os controles ficam desabilitados
- [ ] Falha mantém os dados preenchidos

**Tests**: unit
**Gate**: quick

---

### T33: Listagem do painel

**What**: Tabela de publicações do painel com estado (no ar/rascunho), editar, alternar publicação e excluir com `AlertDialog`.
**Where**: `src/app/(admin)/admin/page.tsx`
**Depends on**: T31
**Requirement**: ADM-06, ADM-08, ADM-09

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Excluir só persiste após confirmação no dialog
- [ ] Nenhuma chamada a `window.confirm`
- [ ] Ações sempre visíveis, nunca só no hover

**Tests**: unit
**Gate**: quick

---

### T34: Rota de edição de publicação

**What**: `/admin/publicacoes/[id]`, criando quando o id é `nova` e editando quando existe.
**Where**: `src/app/(admin)/admin/publicacoes/[id]/page.tsx`
**Depends on**: T32
**Requirement**: ADM-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Id inexistente mostra estado de erro, não tela em branco
- [ ] Após salvar, volta para `/admin`

**Tests**: none
**Gate**: build

---

### T35: Escrita e tela de formações

**What**: Mutations de formação e a tela `/admin/formacoes` com formulário, listagem e exclusão confirmada.
**Where**: `src/features/formacoes/mutations.ts`
**Depends on**: T21, T33
**Requirement**: FOR-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Mesmas regras de validação, confirmação e erro das publicações
- [ ] Falha devolve a mensagem traduzida

**Tests**: unit
**Gate**: quick

---

### T36: Regras do Firestore

**What**: Regras com leitura pública apenas de publicações publicadas, formações públicas e escrita restrita à allowlist de uid.
**Where**: `firestore.rules`
**Depends on**: T31
**Requirement**: SEC-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Escrita negada para usuário fora da allowlist
- [ ] Rascunho não é legível sem sessão
- [ ] Allowlist só nas rules, nunca em campo de documento

**Tests**: none
**Gate**: build

---

### T37: Índice composto do Firestore

**What**: Declarar o índice `publicacoes(publicado ASC, publicadoEm DESC)`.
**Where**: `firestore.indexes.json`
**Depends on**: T36
**Requirement**: PUB-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Índice cobre a consulta de `listarPublicadas`

**Tests**: none
**Gate**: build

---

### T38: Sitemap e robots

**What**: `sitemap.ts` com a home e cada publicação publicada, e `robots.ts` liberando o site e bloqueando `/admin`.
**Where**: `src/app/sitemap.ts`
**Depends on**: T19
**Requirement**: SEO-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `/admin` fora do sitemap e bloqueado no robots
- [ ] Publicação em rascunho não aparece

**Tests**: none
**Gate**: build

---

### T39: README e variáveis de ambiente

**What**: Documentar setup, variáveis do Firebase, scripts, estrutura de pastas e o passo de criar a usuária no console; incluir `.env.example`.
**Where**: `README.md`
**Depends on**: T38
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.env.example` lista todas as variáveis usadas em `config.ts`
- [ ] Nenhuma credencial real versionada

**Tests**: none
**Gate**: build
