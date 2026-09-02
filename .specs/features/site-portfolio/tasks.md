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
| Rotas com decisão própria (`generateMetadata`, `notFound()`, ordem das seções) | unit (Testing Library) | Metadados por campo, 404 de slug ausente e de rascunho, ordem e âncoras da home | `src/app/**/*.test.{ts,tsx}` | `npm test` |
| Layouts / config / conteúdo estático | none | — (build gate) | — | build gate |
| Regras do Firestore (`firestore.rules`) | rules (emulador) | Leitura anônima do publicado, bloqueio do rascunho, escrita só da allowlist | `tests/rules/*.test.ts` | `npm run test:rules` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Task com testes unitários | `npm test -- --run` |
| Build | Task de config/rota/conteúdo e fim de fase | `npx tsc --noEmit && npm run lint && npm test -- --run && npm run build` |
| Rules | Task que toca `firestore.rules` | `npm run test:rules` (emulador; exige Java no `PATH`) |

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
T27 → T40
```

### Phase 7: Correções do Verifier

```
T5 → T41
T17 → T42
T32 → T43
T27 → T44
T27 → T45
T36 → T46
T27 → T47
```

### Phase 11: Currículo na página

```
T6 → T61
T61 → T62
T6 → T63
T30 → T64
T4 → T65
```

### Phase 10: Seção Pedagogia

```
T6 → T57
T57 → T58
T58 → T59
T26 → T59
T10 → T60
```

### Phase 8: Lacunas da re-verificação

```
T11 → T48
T24 → T49
T26 → T50
T4 → T51
T51 → T52
```

### Phase 9: Lacunas da verificação final

```
T19 → T53
T24 → T53
T52 → T54
T52 → T55
T48 → T56
```

---

## Task Breakdown

## Phase 1: Fundação

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

## Phase 2: Home estática

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

## Phase 3: Camada de dados

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

### T21: Converter de formação ✅

**What**: Converter documento de formação em objeto de domínio e o inverso.
**Where**: `src/features/formacoes/converter.ts`
**Depends on**: T20
**Requirement**: FOR-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `descricao` ausente vira `null`
- [x] `ordem` ausente assume o maior valor conhecido, sem quebrar a ordenação

**Tests**: unit
**Gate**: quick

---

### T22: Leitura de formações ✅

**What**: `listarFormacoes()` ordenando por `ordem` asc e `ano` desc, devolvendo `{ dados }` ou `{ erro }`.
**Where**: `src/features/formacoes/queries.ts`
**Depends on**: T21
**Requirement**: FOR-01, FOR-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Empate de `ordem` desempata por `ano` decrescente
- [x] Falha devolve mensagem traduzida, sem lançar

**Tests**: unit
**Gate**: quick

---

## Phase 4: Seções dinâmicas públicas

### T23: Card de publicação ✅

**What**: Card com imagem opcional, título, resumo, data e tag, ligando para `/publicacoes/[slug]`.
**Where**: `src/features/publicacoes/components/publicacao-card.tsx`
**Depends on**: T19, T7
**Requirement**: PUB-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `imagemUrl`, o card renderiza só texto, sem espaço vazio
- [x] Data formatada por `formatDateBR`

**Tests**: unit
**Gate**: quick

---

### T24: Seção de publicações ✅

**What**: Seção que recebe o resultado da query e resolve os três estados: lista, vazio e erro.
**Where**: `src/features/publicacoes/components/publicacoes-section.tsx`
**Depends on**: T23
**Requirement**: PUB-01, PUB-03, PUB-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Vazio exibe "Nenhuma publicação por aqui ainda."
- [x] Erro exibe a mensagem recebida do Firebase, não texto genérico
- [x] Máximo de 6 cards

**Tests**: unit
**Gate**: quick

---

### T25: Seção de formação ✅

**What**: Seção de formação com rótulo de status e ocultação total quando não há registros.
**Where**: `src/features/formacoes/components/formacoes-section.tsx`
**Depends on**: T22
**Requirement**: FOR-01, FOR-02, FOR-03, FOR-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Lista vazia não renderiza nem o título da seção
- [x] "Em andamento" e "Concluído" visualmente distintos
- [x] Erro exibe a mensagem do Firebase

**Tests**: unit
**Gate**: quick

---

### T26: Home compondo as seções ✅

**What**: `page.tsx` do grupo `(site)` buscando publicações e formações no servidor e compondo todas as seções na ordem da spec.
**Where**: `src/app/(site)/page.tsx`
**Depends on**: T24, T25, T10, T11, T12, T13
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `revalidate = 300`
- [x] Falha de uma query não impede o restante da página de renderizar
- [x] Ordem das seções conforme SIT-01

**Tests**: none
**Gate**: build

---

### T27: Página da publicação ✅

**What**: Rota `/publicacoes/[slug]` com corpo em markdown, metadados Open Graph e 404 para slug inexistente ou rascunho.
**Where**: `src/app/(site)/publicacoes/[slug]/page.tsx`
**Depends on**: T19
**Requirement**: PUB-02, PUB-04, PUB-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `generateMetadata` usa título e resumo
- [x] Markdown renderizado sem HTML bruto
- [x] Rascunho responde 404

**Tests**: none
**Gate**: build

---

## Phase 5: Admin

### T28: Hook de autenticação ✅

**What**: `useAuth` expondo `usuario`, `carregando` e `sair`, escutando `onAuthStateChanged`.
**Where**: `src/hooks/use-auth.ts`
**Depends on**: T15
**Requirement**: ADM-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Estado inicial é `carregando`, nunca "deslogado"
- [x] Listener é removido no unmount

**Tests**: unit
**Gate**: quick

---

### T29: Guarda do painel ✅

**What**: Layout do grupo `(admin)` que bloqueia a renderização enquanto carrega e redireciona para `/admin/login` sem sessão.
**Where**: `src/app/(admin)/admin/layout.tsx`
**Depends on**: T28
**Requirement**: ADM-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Nenhum conteúdo do painel aparece antes de a sessão resolver
- [x] `/admin/login` não entra em laço de redirecionamento

**Tests**: unit
**Gate**: quick

---

### T30: Tela de login ✅

**What**: Formulário de e-mail e senha com estado de carregamento e erro traduzido.
**Where**: `src/app/(admin)/admin/login/page.tsx`
**Depends on**: T29, T16
**Requirement**: ADM-02, ADM-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Sem `maxLength` em e-mail ou senha
- [x] Erro exibido é o traduzido, sem revelar existência do e-mail
- [x] Sucesso redireciona para `/admin`

**Tests**: unit
**Gate**: quick

---

### T31: Escrita de publicações ✅

**What**: `criar`, `atualizar`, `excluir` e `alternarPublicado`, com verificação de slug único.
**Where**: `src/features/publicacoes/mutations.ts`
**Depends on**: T18
**Requirement**: ADM-05, ADM-07, ADM-08

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Slug repetido é rejeitado com mensagem de slug em uso
- [x] Falha devolve a mensagem traduzida do Firebase
- [x] `atualizar` grava `atualizadoEm`

**Tests**: unit
**Gate**: quick

---

### T32: Formulário de publicação ✅

**What**: Formulário com react-hook-form + Zod, contador de caracteres, slug sugerido pelo título e ações publicar/salvar rascunho.
**Where**: `src/features/publicacoes/components/publicacao-form.tsx`
**Depends on**: T31, T17
**Requirement**: ADM-04, ADM-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Campo inválido bloqueia o envio e é apontado
- [x] Durante o salvamento todos os controles ficam desabilitados
- [x] Falha mantém os dados preenchidos

**Tests**: unit
**Gate**: quick

---

### T33: Listagem do painel ✅

**What**: Tabela de publicações do painel com estado (no ar/rascunho), editar, alternar publicação e excluir com `AlertDialog`.
**Where**: `src/app/(admin)/admin/page.tsx`
**Depends on**: T31
**Requirement**: ADM-06, ADM-08, ADM-09

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Excluir só persiste após confirmação no dialog
- [x] Nenhuma chamada a `window.confirm`
- [x] Ações sempre visíveis, nunca só no hover

**Tests**: unit
**Gate**: quick

---

### T34: Rota de edição de publicação ✅

**What**: `/admin/publicacoes/[id]`, criando quando o id é `nova` e editando quando existe.
**Where**: `src/app/(admin)/admin/publicacoes/[id]/page.tsx`
**Depends on**: T32
**Requirement**: ADM-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Id inexistente mostra estado de erro, não tela em branco
- [x] Após salvar, volta para `/admin`

**Tests**: none
**Gate**: build

---

### T35: Escrita e tela de formações ✅

**What**: Mutations de formação e a tela `/admin/formacoes` com formulário, listagem e exclusão confirmada.
**Where**: `src/features/formacoes/mutations.ts`
**Depends on**: T21, T33
**Requirement**: FOR-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Mesmas regras de validação, confirmação e erro das publicações
- [x] Falha devolve a mensagem traduzida

**Tests**: unit
**Gate**: quick

---

## Phase 6: Fechamento

### T36: Regras do Firestore ✅

**What**: Regras com leitura pública apenas de publicações publicadas, formações públicas e escrita restrita à allowlist de uid.
**Where**: `firestore.rules`
**Depends on**: T31
**Requirement**: SEC-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Escrita negada para usuário fora da allowlist
- [x] Rascunho não é legível sem sessão
- [x] Allowlist só nas rules, nunca em campo de documento

**Tests**: none
**Gate**: build

---

### T37: Índice composto do Firestore ✅

**What**: Declarar o índice `publicacoes(publicado ASC, publicadoEm DESC)`.
**Where**: `firestore.indexes.json`
**Depends on**: T36
**Requirement**: PUB-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Índice cobre a consulta de `listarPublicadas`

**Tests**: none
**Gate**: build

---

### T38: Sitemap e robots ✅

**What**: `sitemap.ts` com a home e cada publicação publicada, e `robots.ts` liberando o site e bloqueando `/admin`.
**Where**: `src/app/sitemap.ts`
**Depends on**: T19
**Requirement**: SEO-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `/admin` fora do sitemap e bloqueado no robots
- [x] Publicação em rascunho não aparece

**Tests**: unit
**Gate**: build

---

### T39: README e variáveis de ambiente ✅

**What**: Documentar setup, variáveis do Firebase, scripts, estrutura de pastas e o passo de criar a usuária no console; incluir `.env.example`.
**Where**: `README.md`
**Depends on**: T38
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `.env.example` lista todas as variáveis usadas em `config.ts`
- [x] Nenhuma credencial real versionada

**Tests**: none
**Gate**: build

---

### T40: Página 404 na paleta ✅

**What**: Página não encontrada usando a identidade do site, com link de volta para a home.
**Where**: `src/app/not-found.tsx`
**Depends on**: T27
**Requirement**: PUB-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `notFound()` da rota de publicação cai nesta página, não na padrão do Next
- [x] Usa os tokens do tema e o texto vem de `src/content/site.ts`

**Tests**: unit
**Gate**: build

---

## Phase 7: Correções do Verifier

> Sete tasks abertas pelo relatório em `validation.md` (FAIL de 2026-09-01): um requisito sem implementação, dois mutantes sobreviventes e quatro pontos sem asserção. Numeração continua de T40 para não renumerar nada já rastreado.

### T41: Open Graph e Person na home ✅

**What**: Metadados Open Graph/Twitter e o bloco JSON-LD `Person` da home, montados a partir de `src/content/site.ts` e do endereço de `src/lib/url.ts`, consumidos pela rota `/`.
**Where**: `src/features/site/seo.ts`
**Depends on**: T5
**Requirement**: SEO-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `openGraph` e `twitter` da home saem do conteúdo do site, com URL absoluta resolvida por `siteUrl`
- [x] JSON-LD `Person` com `name`, `jobTitle`, `url`, `sameAs` do Instagram e `areaServed`
- [x] A home exporta esses metadados e renderiza o `application/ld+json`
- [x] Teste asserta campo a campo, não a presença da tag

**Tests**: unit
**Gate**: build

---

### T42: Teto do corpo ancorado no literal da spec ✅

**What**: Ancorar o teto de 20.000 caracteres do corpo no valor escrito na spec, em vez de na própria constante do schema.
**Where**: `src/features/publicacoes/schemas.test.ts`
**Depends on**: T17
**Requirement**: ADM-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Corpo com 20.001 caracteres é recusado com a mensagem que cita 20000
- [x] Corpo com exatamente 20.000 caracteres é aceito
- [x] Mover `LIMITES_PUBLICACAO.corpo` quebra o teste (mutante M11 morre)

**Tests**: unit
**Gate**: quick

---

### T43: Contador que separa usado de limite ✅

**What**: Caso de contador em que os dois números diferem, para `usados/usados` deixar de passar.
**Where**: `src/features/publicacoes/components/publicacao-form.test.tsx`
**Depends on**: T32
**Requirement**: ADM-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Um caso com usado ≠ limite (6/120) e o caso de borda 120/120
- [x] Contador que renderize `usados/usados` reprova (mutante M30 morre)

**Tests**: unit
**Gate**: quick

---

### T44: Metadados da rota de publicação sob teste ✅

**What**: Teste de `generateMetadata` de `/publicacoes/[slug]`: título e description vindos do título e do resumo, Open Graph preenchido e slug inexistente sem `undefined` no título.
**Where**: `src/app/(site)/publicacoes/[slug]/page.test.tsx`
**Depends on**: T27
**Requirement**: PUB-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `title` e `description` conferem com o título e o resumo da publicação
- [x] `openGraph` traz título, description e URL do texto
- [x] Slug inexistente não vaza `undefined` no título

**Tests**: unit
**Gate**: quick

---

### T45: 404 da rota de publicação sob teste ✅

**What**: Asserção de que a página chama `notFound()` quando a leitura pública não encontra o texto — slug inexistente e publicação em rascunho.
**Where**: `src/app/(site)/publicacoes/[slug]/page.test.tsx`
**Depends on**: T27
**Requirement**: PUB-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Slug inexistente chama `notFound()` e não renderiza o texto
- [x] Publicação em rascunho chama `notFound()`
- [x] Publicação no ar não chama `notFound()`

**Tests**: unit
**Gate**: quick

---

### T46: Verificação das regras do Firestore ✅

**What**: Suíte das regras contra o emulador do Firestore, em runner próprio, mais o passo no README. `java -version` no `PATH` falha nesta máquina, mas há JDK instalado (OpenJDK 21 do Homebrew, *keg-only*) — o caminho do emulador era possível e foi o escolhido.
**Where**: `tests/rules/firestore.rules.test.ts`
**Depends on**: T36
**Requirement**: SEC-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Anônimo lê publicado, não lê rascunho, não lista sem filtro e não escreve
- [x] Uid da allowlist lê rascunho e escreve; uid de fora, não
- [x] Suíte fora de `npm test` (`npm run test:rules`), documentada no README
- [x] Afrouxar `firestore.rules` reprova a suíte

**Tests**: rules (`npm run test:rules`)
**Gate**: build

---

### T47: Link de volta do texto sob teste ✅

**What**: Asserção do caminho de volta da página do texto para a home.
**Where**: `src/app/(site)/publicacoes/[slug]/page.test.tsx`
**Depends on**: T27
**Requirement**: PUB-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Link com o texto de `secaoPublicacoes.voltar` e `href` da home
- [x] O texto do link vem de `src/content/site.ts`, não do teste

**Tests**: unit
**Gate**: quick

---

## Phase 8: Lacunas da re-verificação

> Quatro tasks abertas pela re-verificação independente (iteração 2, `validation.md` de 2026-09-01): as sete correções da Fase 7 fecharam, mas quatro mutantes novos sobreviveram — todos de teste que não discrimina o valor que a spec fixa. Numeração continua de T47.

### T48: Contagem dos seis pilares sob teste ✅

**What**: Teste da seção "O que faz uma AT" asserindo os 6 pilares que a spec fixa — a contagem como literal da spec, não como `pilares.length` — e que cada título na tela vem do conteúdo.
**Where**: `src/features/site/sections/o-que-faz-uma-at.test.tsx`
**Depends on**: T11
**Requirement**: SIT-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `secaoAt.pilares` tem exatamente 6 itens, comparados com o literal 6 da spec
- [x] A seção renderiza 6 cards, comparados com o mesmo literal
- [x] Os títulos renderizados são exatamente os títulos do conteúdo, na ordem
- [x] Remover um pilar do conteúdo (M52) e `pilares.slice(0, 3)` no componente (M53) reprovam

**Tests**: unit
**Gate**: quick

---

### T49: Mensagem de vazio ancorada no literal da spec ✅

**What**: Ancorar o estado vazio das publicações na frase que a spec escreve, em vez de na constante que o componente renderiza, e varrer os outros estados vazio/erro atrás da mesma armadilha.
**Where**: `src/features/publicacoes/components/publicacoes-section.test.tsx`
**Depends on**: T24
**Requirement**: PUB-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] O estado vazio é asserido contra "Nenhuma publicação por aqui ainda."
- [x] `secaoPublicacoes.vazio` é conferido contra esse mesmo literal
- [x] Trocar o texto em `content/site.ts` (M54) reprova
- [x] Os demais estados vazio/erro são varridos e o resultado da varredura fica registrado

**Varredura**: dos textos que a spec escreve por extenso, só dois chegam à tela — a frase de vazio de PUB-03 (corrigida aqui) e os rótulos "Em andamento"/"Concluído" de FOR-02, já asseridos como literal em `formacoes-section.test.tsx:52-53`. Os demais estados vazio/erro (`textos.vazio` dos painéis, `painel.verificandoSessao`, `paginaNaoEncontrada.mensagem`) são texto que a spec não fixa, então comparar com a constante do conteúdo é o contrato certo. As mensagens do Firebase já são literais em todos os testes.

**Tests**: unit
**Gate**: quick

---

### T50: Rodapé dentro da ordem dos sete blocos ✅

**What**: Estender a asserção de ordem de SIT-01 para os 7 blocos da spec, renderizando a home dentro da moldura que traz o rodapé.
**Where**: `src/app/(site)/page.test.tsx`
**Depends on**: T26
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] A ordem asserida cobre hero, AT, Sobre, Formação, Publicações, contato e rodapé
- [x] O rodapé é localizado por papel (`contentinfo`), depois do conteúdo principal
- [x] Tirar o rodapé do layout (M55) reprova

**Tests**: unit
**Gate**: quick

---

### T51: Trava contra cor literal em componente ✅

**What**: Teste de varredura sobre `src/**/*.tsx` que reprova cor literal (hex, `rgb(`, `hsl(`) em `className` ou em style inline, com o detector conferido contra casos positivos e negativos.
**Where**: `src/test/paleta-em-tokens.test.ts`
**Depends on**: T4
**Requirement**: SIT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Nenhum `.tsx` de `src/` tem cor literal em `className` ou em `style` inline
- [x] A varredura conta os arquivos lidos, para não passar vazia
- [x] O detector acusa `bg-[#EDF3E4]`, `style={{ color: "#8E7A32" }}` e `rgb(`/`hsl(`, e não acusa `href="#contato"` nem `text-brass`
- [x] Introduzir uma cor literal em um componente reprova

**Tests**: unit
**Gate**: build

---

### T52: Trava da paleta que enxerga a classe montada ✅

**What**: Endurecer a varredura de SIT-05 para o arquivo inteiro, para cor literal dentro de `cva(...)`, de constante de módulo ou de comentário também reprovar, e alinhar o docblock ao que a trava realmente cobre.
**Where**: `src/test/paleta-em-tokens.test.ts`
**Depends on**: T51
**Requirement**: SIT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] A varredura lê `.ts` e `.tsx` de `src/`, menos os próprios arquivos de teste, e a exceção está justificada no arquivo
- [x] Cor literal no `cva(...)` de `src/components/ui` reprova
- [x] Cor literal em constante de módulo reprova
- [x] Âncora (`#contato`), token de tema e `color-mix(in_oklch, var(--x), …)` seguem sem acusar

**Tests**: unit
**Gate**: build

---

## Phase 9: Lacunas da verificação final

> Quatro tasks abertas pela verificação independente (iteração 3, `validation.md` de 2026-09-01), que reprovou com dois sobreviventes materiais e dois menores. Todas são de teste que não discrimina — nenhum defeito de produção. Numeração continua de T52.

### T53: Teto de seis publicações ancorado no literal da spec ✅

**What**: Ancorar o teto de PUB-01 no literal `6` que a spec escreve, em vez de na constante que o próprio código usa para cortar, e varrer a classe inteira: todo teste cujo valor asserido a spec fixa por extenso.
**Where**: `src/features/publicacoes/queries.test.ts`, `src/features/publicacoes/components/publicacoes-section.test.tsx`, `src/features/publicacoes/schemas.test.ts`, `src/features/publicacoes/components/publicacao-form.test.tsx`
**Depends on**: T19, T24
**Requirement**: PUB-01, ADM-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `LIMITE_PUBLICACOES_HOME` é conferido contra um literal `6` derivado da spec
- [x] O corte da seção da home é asserido contra esse mesmo literal, não contra a constante
- [x] Os tetos de título (120) e resumo (220), que a spec escreve por extenso, deixam de ser lidos da constante
- [x] A varredura da classe fica registrada aqui, dizendo quais asserções ficam ancoradas na constante e por quê
- [x] `LIMITE_PUBLICACOES_HOME` 6 → 5 (C1) reprova

**Varredura da classe** (L-011 — todo teste cujo valor asserido a spec fixa): os literais passam a viver em `src/test/valores-da-spec.ts`, arquivo que nenhum código de produção lê.

- **Corrigidos aqui**: PUB-01, teto de 6 (`queries.test.ts`, `publicacoes-section.test.tsx`); ADM-04, título 120 e resumo 220 (`schemas.test.ts`, `publicacao-form.test.tsx`). O corpo de 20.000 já era literal e mudou só de endereço.
- **Já ancorados antes desta task**: SIT-02, 6 pilares (`PILARES_DA_SPEC`); PUB-03, frase do vazio; FOR-02, rótulos "Em andamento"/"Concluído"; o contador `6/120` e `120/120` do edge case do título.
- **Seguem lendo a constante do código, de propósito** — a spec não fixa esses números, então a constante *é* o contrato: `LIMITE_PUBLICACOES_PAINEL` (200) e `LIMITE_PUBLICACOES_SITEMAP` (1000), que são trava de tráfego; `LIMITES_PUBLICACAO.slug`, `.tag` e `.imagemUrl`; e todo `LIMITES_FORMACAO` mais `ORDEM_MAXIMA_FORMACAO` (999), já que FOR-05 diz "as mesmas regras da P1" sem escrever número nenhum.

**Tests**: unit
**Gate**: quick

---

### T54: Paleta aprovada com asserção positiva ✅

**What**: Fechar a metade positiva de SIT-05 — os tokens de tema precisam carregar o valor da paleta aprovada, não só evitar cor literal em componente.
**Where**: `src/test/paleta-em-tokens.test.ts`
**Depends on**: T52
**Requirement**: SIT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Cada token da paleta aprovada é lido de `globals.css` e comparado com o hex de origem
- [x] A comparação hex→OKLCH é feita no próprio teste, com tolerância declarada
- [x] Os quatro hex que a spec nomeia por extenso aparecem como literais da spec no teste
- [x] Token ausente ou renomeado reprova, em vez de passar vazio (`--brass` renomeado reprova com "token --brass não está declarado")
- [x] Trocar `--olive` para vermelho (B6) reprova

**Tests**: unit
**Gate**: quick

---

### T55: Escopo da trava de SIT-05 alinhado ao que ela cobre ✅

**What**: Fechar a distância entre o que o docblock promete e o que o detector entrega — classe utilitária de cor fora da paleta e cor nomeada em `style` inline.
**Where**: `src/test/paleta-em-tokens.test.ts`
**Depends on**: T52
**Requirement**: SIT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] O detector acusa classe utilitária de cor da paleta padrão do Tailwind
- [x] O detector acusa cor nomeada do CSS em `style` inline — a regra é por valor, então pega qualquer cor que não seja `var(--token)` nem palavra-chave neutra
- [x] `src/components/ui/` tem exceção justificada no próprio arquivo, com os arquivos e o motivo: a tolerância é `bg-black` em `dialog.tsx` e `alert-dialog.tsx`, nomeada uma a uma, e um teste confere que ela ainda aponta para código existente
- [x] O docblock descreve o escopo real, sem promessa maior que a entrega — inclusive o que a trava não vê (classe montada em tempo de execução, `.css` fora do `globals.css`)
- [x] `bg-emerald-200` (B4) e `style={{ color: "white" }}` (B5) reprovam
- [x] A exceção não abre a porta: `bg-[#8E7A32]` no `cva` de `dialog.tsx` (B2) e `bg-emerald-500` no mesmo arquivo seguem reprovando

**Tests**: unit
**Gate**: build

---

### T56: Descrições dos pilares sob teste ✅

**What**: Estender a asserção de SIT-02 às descrições dos pilares, fechando a metade "sem texto duplicado em componente".
**Where**: `src/features/site/sections/o-que-faz-uma-at.test.tsx`
**Depends on**: T48
**Requirement**: SIT-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] As descrições renderizadas são comparadas com as do conteúdo, na ordem
- [x] Fixar a descrição de um pilar no componente (C6) reprova

**Tests**: unit
**Gate**: quick

---

### Revisão da Phase 9 (revisor-reuso-padroes + revisor-arquitetura)

Os dois revisores rodaram sobre `b48c45d..16e1546`: **0 bloqueantes**. Aplicado o que fortalece a discriminação ou fecha promessa de docblock:

- `FOLGA` da paleta era ~100× o erro real de arredondamento (`--surface` podia perder 1/3 do croma com a suíte verde) → apertada para `{0.0005, 0.0005, 0.05}`, e o mutante de croma passou a reprovar.
- A exceção de terceiro tolerava a classe pelo nome, então um `bg-black` novo entrava de graça no arquivo — o docblock dizia o contrário. Passou a registrar a **quantidade** esperada.
- A varredura auditava `src/test/*.ts` (infra de teste) como se fosse código de tela, contra o próprio docblock → `src/test/` inteira fora do escopo, e o texto diz isso.
- A metade positiva de SIT-05 saiu para `src/test/paleta-aprovada.test.ts`: o `readFileSync` do CSS no topo do módulo derrubava junto a varredura de cor literal, que não tem relação com o tema.
- `tokenDoTema` lia só a primeira declaração e chamava de "token ausente" qualquer formato diferente → agora reprova declaração repetida (um bloco `.dark` não passa despercebido) e mostra o valor lido.
- Os dez hex viraram tabela em `design.md`: o teste os **transcreve**, em vez de ser a fonte canônica da paleta.
- `no-restricted-imports` no `eslint.config.mjs` impede produção de importar `src/test/` — sem isso, "produção não lê a transcrição da spec" era só combinado.
- Renomeados `TETO_DA_HOME_NA_SPEC` e `LIMITES_DE_PUBLICACAO_DA_SPEC`; docblock de `valores-da-spec.ts` passou a descrever a fronteira real (número da spec **que tem constante espelhada em produção**); removida a asserção constante-contra-constante de `queries.test.ts`, redundante com o `limit`; `"Publicação 7"` derivado do teto; descrição do pilar localizada pelo texto do conteúdo, não por `tagName`.

Ficou de fora, por ser observação sem efeito na discriminação: mover `PILARES_DA_SPEC` para o módulo compartilhado (não há constante de produção espelhando o 6 dos pilares — o critério do módulo é justamente esse).

---

## Phase 10: Seção Pedagogia

Pedida pelo usuário depois do UAT: o site apresentava a Keylla só como AT, e a
formação em pedagogia — que é o que sustenta o trabalho — não aparecia na
abertura. Mockup aprovado antes da implementação (trilha numerada de quatro
frentes).

### T57: Conteúdo das frentes de formação ✅

**What**: Declarar `secaoPedagogia` com as quatro frentes, a âncora e o item de menu.
**Where**: `src/content/site.ts`
**Depends on**: T6
**Requirement**: SIT-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Quatro frentes na ordem em que sustentam a prática
- [x] Nenhum texto da seção escrito em componente
- [x] `secaoFormacao` renomeada para "Certificações" (AD-044), sem competir no menu

**Tests**: none
**Gate**: build

---

### T58: Trilha das frentes ✅

**What**: Seção que numera as frentes pela posição e liga os números no layout em colunas.
**Where**: `src/features/site/sections/pedagogia.tsx`
**Depends on**: T57
**Requirement**: SIT-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Ordem e títulos asserido por literal da spec, não pela constante do conteúdo
- [x] Traço sai de cada item, então a `ol` só tem `li` e a linha para no último número
- [x] Some abaixo de `grade`, onde os blocos deixam de ficar lado a lado

**Tests**: unit
**Gate**: quick

---

### T59: Seção composta na home ✅

**What**: Encaixar a seção entre os pilares e o Sobre, com o teste de ordem cobrindo os oito blocos.
**Where**: `src/app/(site)/page.tsx`
**Depends on**: T58, T26
**Requirement**: SIT-01, SIT-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Ordem da home conforme SIT-01, com a seção nova em terceiro
- [x] Teste de ordem reprova se a seção sair do lugar

**Tests**: unit
**Gate**: build

---

### T60: Placa no lugar do selo circular ✅

**What**: Trocar o selo circular do hero por uma placa ancorada à esquerda do retrato.
**Where**: `src/features/site/sections/hero.tsx`
**Depends on**: T10
**Requirement**: SIT-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Fora do rosto no desktop, dentro do gutter no mobile, sem overflow em 360/414/768
- [x] `perfil.selo` vira frase única — a quebra é do navegador, não escrita à mão
- [x] `--tracking-selo`, criado só para o círculo, removido junto

**Tests**: none (posição depende de layout, que jsdom não avalia — verificação por medição no navegador)
**Gate**: build

---

## Phase 11: Currículo na página

Entrou depois de o currículo da Keylla chegar: o site apresentava só a AT, sem
as competências que a família procura (Libras, CAA, autismo) e sem a formação.

### T61: Seção de competências ✅

**What**: Dez competências em quatro famílias, cada uma com o que resolve.
**Where**: `src/features/site/sections/competencias.tsx`
**Depends on**: T6
**Requirement**: SIT-08

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Quatro famílias e dez competências, asserido por literal da spec
- [x] Cada competência com a descrição do que resolve

**Tests**: unit
**Gate**: quick

---

### T62: Faixa de atendimento ✅

**What**: Especialidades em etiquetas e os contextos onde o acompanhamento acontece.
**Where**: `src/features/site/sections/atendimento.tsx`
**Depends on**: T61
**Requirement**: SIT-09

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] As etiquetas derivam da seção de competências, sem segunda lista
- [x] Cinco contextos, incluindo a região de atendimento

**Tests**: unit
**Gate**: quick

---

### T63: Formação como conteúdo da página ✅

**What**: Formação em dois grupos, lida de `content/site.ts`, sem Firestore (AD-046).
**Where**: `src/features/site/sections/formacao.tsx`
**Depends on**: T6
**Requirement**: FOR-01, FOR-02, FOR-03, FOR-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Dois grupos: formação acadêmica e aperfeiçoamento
- [x] Item sem ano no currículo aparece sem ano, nunca com data suposta
- [x] O CRUD de formação sai do painel, junto das regras da coleção

**Tests**: unit
**Gate**: build

---

### T64: Rede de proteção do painel ✅

**What**: Toasts, prévia, guarda de alterações, confirmação de saída e ver senha.
**Where**: `src/features/admin/pendencia.tsx`
**Depends on**: T30
**Requirement**: ADM-05, ADM-07, ADM-09

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] `Toaster` montado no layout do painel, com prova de ponta a ponta
- [x] A guarda cobre o editor e os links do cabeçalho
- [x] A prévia renderiza o artigo da página pública, não uma cópia dele

**Tests**: unit
**Gate**: build

---

### T65: Entrada ao rolar em qualquer navegador ✅

**What**: `Revelador` com `IntersectionObserver` no lugar de `animation-timeline`.
**Where**: `src/components/layout/revelador.tsx`
**Depends on**: T4
**Requirement**: SIT-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [x] Funciona fora do Chrome — `animation-timeline` só existe lá
- [x] Quem pede menos movimento não tem nada escondido (SIT-06 virou testável)
- [x] Sem JS o conteúdo aparece inteiro, em vez de ficar preso invisível

**Tests**: unit
**Gate**: build
