# Site Portfólio — Validation

## Validation: site-portfolio — FAIL ❌

**Date**: 2026-09-01
**Spec**: `.specs/features/site-portfolio/spec.md`
**Diff range**: `9e63085..6537fe7` (primeiro commit → HEAD, 60 commits — a feature inteira)
**Verifier**: sub-agente independente (autor ≠ verificador), evidência-ou-zero
**Veredito**: ❌ **FAIL** — 1 requisito sem implementação (SEO-02) e 2 mutantes sobreviventes

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1–T40 | ✅ Done | As 40 marcadas concluídas em `tasks.md`; cada uma com commit atômico no intervalo verificado |

Nenhuma task cobre a metade da SEO-02 que fala em Open Graph na home e dados estruturados `Person` — a
rastreabilidade aponta SEO-02 → T5, T27, e nenhuma das duas entrega isso (ver Gaps).

---

## Spec-Anchored Acceptance Criteria

### P1: Visitante entende o trabalho da AT

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SIT-01 home com as seções na ordem hero → AT → Sobre → Formação → Publicações → contato → rodapé | ordem exata das 7 seções | — (implementado em `src/app/(site)/page.tsx:29-36` e `src/app/(site)/layout.tsx:8-11`; nenhuma asserção) | ❌ sem evidência |
| SIT-02 os 6 pilares saem de `src/content/site.ts`, sem texto duplicado em componente | 6 pilares, fonte única | — (6 pilares em `src/content/site.ts:89-124`, consumidos em `src/features/site/sections/o-que-faz-uma-at.tsx:34`; nenhuma asserção) | ❌ sem evidência |
| SIT-03 clique no menu rola até a seção | âncora leva à seção da mesma página | — (`src/components/layout/site-header.tsx:20-29` + `ancoras` em `src/content/site.ts:22-29` + `scroll-behavior: smooth` em `src/app/globals.css:146`) | ❌ sem evidência |
| SIT-04 viewport de 360px sem rolagem horizontal | nenhuma rolagem horizontal em 360px | — (não verificável em jsdom; exige UAT em navegador) | ❌ sem evidência |
| SIT-05 paleta por tokens, sem cor literal em componente | `#EDF3E4`, `#F7FBF1`, `#4C5B34`, `#8E7A32` só em token | — (tokens em `src/app/globals.css:91-100`; varredura por hex e por paleta padrão do Tailwind em `src/**/*.tsx` retorna zero) | ⚠️ verificado por inspeção, sem asserção |
| SIT-06 `prefers-reduced-motion: reduce` renderiza sem animação de entrada | animação/transição neutralizadas | — (`src/app/globals.css:169-177`) | ❌ sem evidência |

⚠️ **Lacuna de precisão da spec (SIT-06)**: o ID é usado com dois sentidos. Na história P1 ele é
`prefers-reduced-motion`; na varredura de dimensões implícitas (`spec.md:59`) ele é citado para
"Firestore fora do ar não derruba a página", e `src/lib/firebase/config.ts:6` cita SIT-06 para a
mensagem de variável de ambiente faltante. Três leituras para um ID só.

### P1: Visitante lê as publicações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| PUB-01 lista `publicado == true`, `publicadoEm` desc, no máximo 6 | filtro + ordem + teto 6 | `src/features/publicacoes/queries.test.ts:83-87` — `expect(consultaExecutada().restricoes).toEqual([{tipo:"where",campo:"publicado",operador:"==",valor:true},{tipo:"orderBy",campo:"publicadoEm",direcao:"desc"},{tipo:"limit",quantidade:LIMITE_PUBLICACOES_HOME}])`; `src/features/publicacoes/components/publicacoes-section.test.tsx:49-54` — `expect(screen.getAllByRole("article")).toHaveLength(LIMITE_PUBLICACOES_HOME)` + `expect(screen.queryByRole("heading",{name:"Publicação 7"})).not.toBeInTheDocument()` | ✅ PASS |
| PUB-02 clique abre `/publicacoes/[slug]` com título, data, corpo em markdown e link de volta | os 4 elementos na página do texto | `src/features/publicacoes/components/publicacao-card.test.tsx:42-45` — `expect(screen.getByRole("link")).toHaveAttribute("href","/publicacoes/quando-a-crianca-diz-nao")`; `src/features/publicacoes/components/publicacao-artigo.test.tsx:36-46` — h1, `getByText(formatDateBR(...))`, h2 e corpo do markdown. **Link de volta**: `src/app/(site)/publicacoes/[slug]/page.tsx:99-105`, sem asserção | ⚠️ parcial |
| PUB-03 vazio exibe "Nenhuma publicação por aqui ainda." | esse texto no lugar da lista | `src/features/publicacoes/components/publicacoes-section.test.tsx:57-62` — `expect(screen.getByText(secaoPublicacoes.vazio)).toBeInTheDocument()` + `expect(screen.queryByRole("article")).not.toBeInTheDocument()`; literal confere em `src/content/site.ts:153` | ✅ PASS (asserção pela constante, não pelo literal da spec) |
| PUB-04 slug inexistente ou rascunho responde 404 | HTTP 404 | `src/features/publicacoes/queries.test.ts:163-167` — `restricoes` = `where slug` + `where publicado==true` + `limit 1`; `:170-174` — `expect(await obterPorSlug("inexistente")).toEqual({dados:null})`. **`notFound()`**: `src/app/(site)/publicacoes/[slug]/page.tsx:84`, sem asserção | ⚠️ parcial |
| PUB-05 falha de leitura mostra a seção em erro com a mensagem do Firebase | mensagem do Firebase, resto da página de pé | `src/features/publicacoes/queries.test.ts:107-118` — `toEqual({erro:"Você não tem permissão para esta operação."})`; `src/features/publicacoes/components/publicacoes-section.test.tsx:64-70` — `expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE)`; `:72-87` mantém o título nos três estados | ✅ PASS |
| PUB-06 `imagemUrl` preenchida exibe imagem no card e no detalhe | imagem nos dois lugares | `src/features/publicacoes/components/publicacao-card.test.tsx:48-54` — `getByRole("img",{name:"Quando a criança diz não"})`; `src/features/publicacoes/components/publicacao-artigo.test.tsx:49-55` — idem no topo | ✅ PASS |
| PUB-07 `<title>`, `description` e Open Graph por publicação | metadados a partir do título e do resumo | — (`generateMetadata` em `src/app/(site)/publicacoes/[slug]/page.tsx:34-67`; nenhuma asserção) | ❌ sem evidência |

### P1: Keylla publica sem depender de ninguém

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| ADM-01 sem sessão, rota sob `/admin` vai para `/admin/login` | redireciona e não mostra o painel | `src/features/admin/components/painel-guard.test.tsx:60-67` — `expect(substituir).toHaveBeenCalledWith(CAMINHO_LOGIN)` + `expect(screen.queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument()`; `:48-58` — carregando não vaza conteúdo nem redireciona | ✅ PASS |
| ADM-02 credenciais aceitas redirecionam para `/admin` | ida para o painel | `src/features/admin/components/login-form.test.tsx:59-61` — `expect(substituir).toHaveBeenCalledWith(CAMINHO_PAINEL)` | ✅ PASS |
| ADM-03 credencial recusada mostra a mensagem do código, em pt-BR, sem revelar se o e-mail existe | mesma mensagem para os três códigos | `src/lib/firebase/errors.test.ts:78-96` — `expect(usuarioInexistente).toBe(credencialInvalida)`, `expect(senhaErrada).toBe(credencialInvalida)` e `expect(usuarioInexistente).not.toMatch(/não (existe\|foi encontrad\|está cadastrad)\|inexistente\|senha (errada\|incorreta\|inválida)/i)`; `src/features/admin/auth.test.ts:45-58`; `src/features/admin/components/login-form.test.tsx:64-74` | ✅ PASS |
| ADM-04 título 120, resumo 220, corpo 20.000, URL https válida — bloqueia o envio e aponta o campo | os três tetos e a URL | título: `src/features/publicacoes/schemas.test.ts:48-52` — `toBe("O título deve ter no máximo 120 caracteres.")`; `src/features/publicacoes/components/publicacao-form.test.tsx:112-125` — `aria-invalid="true"` + `expect(aoSalvar).not.toHaveBeenCalled()`. resumo: `schemas.test.ts:66-68` — `toBe("O resumo deve ter no máximo 220 caracteres.")`. **corpo**: `schemas.test.ts:71-78` — `expect(primeiroErroDe("corpo", com({corpo: repetir(LIMITES_PUBLICACAO.corpo + 1)}))).not.toBeNull()` (autorreferencial, não trava o 20.000). imagem: `publicacao-form.test.tsx:141-157` + `schemas.test.ts:111-121` | ⚠️ parcial — o teto do corpo não está ancorado |
| ADM-05 gravação em andamento desabilita os controles e mostra carregamento | controles desabilitados | `src/features/publicacoes/components/publicacao-form.test.tsx:179-203` — os 6 campos e os 2 botões `toBeDisabled()`; `src/features/formacoes/components/formacao-form.test.tsx:116-141`; `src/features/admin/components/login-form.test.tsx:87-106`; `src/features/publicacoes/components/publicacoes-painel.test.tsx:150-171` | ✅ PASS |
| ADM-06 excluir pede confirmação em dialog próprio e só remove depois | nada é removido antes do confirmar | `src/features/publicacoes/components/publicacoes-table.test.tsx:67-76` — `expect(aoExcluir).not.toHaveBeenCalled()` + `findByRole("alertdialog")`; `:78-89` — `expect(aoExcluir).toHaveBeenCalledWith(publicacao)` depois de confirmar; `:91-103` — cancelar não exclui; `src/features/publicacoes/components/publicacoes-painel.test.tsx:118-132`; `src/features/formacoes/components/formacoes-painel.test.tsx:169-199` | ✅ PASS |
| ADM-07 falha de gravação mantém os dados e mostra a mensagem do Firebase | formulário preservado + mensagem fiel | `src/features/publicacoes/components/publicacao-form.test.tsx:205-219` — `getByRole("alert")` com a mensagem + `expect(campo(titulo)).toHaveValue("A AT não é babá")`; `src/features/publicacoes/components/publicacao-editor.test.tsx:138-164` — `expect(empurrar).not.toHaveBeenCalled()`; `src/features/formacoes/components/formacao-form.test.tsx:143-157` | ✅ PASS |
| ADM-08 alternar persiste `publicado` e reflete na listagem | novo valor gravado e lista atualizada | `src/features/publicacoes/mutations.test.ts:222-243` — `expect(documentoGravado(updateDocFalso).publicado).toBe(true)` / `.toBe(false)` e retorno `{dados:true}` / `{dados:false}`; `src/features/publicacoes/components/publicacoes-painel.test.tsx:104-116` — `expect(alternar).toHaveBeenCalledWith(publicacao)` + `expect(listar).toHaveBeenCalledTimes(2)` | ✅ PASS |
| ADM-09 nunca `window.confirm/alert/prompt` | ausência dos três | `src/features/publicacoes/components/publicacoes-table.test.tsx:105-116` — `expect(confirmNativo).not.toHaveBeenCalled()`; varredura do `src/` não encontra chamada dos três (só menções em comentário) | ✅ PASS |

### P2: Formação e certificações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| FOR-01 ordem crescente e, no empate, ano decrescente | sequência exata | `src/features/formacoes/queries.test.ts:61-75` — `expect(idsDe(...)).toEqual(["primeira","segunda","terceira"])`; `:77-91` — `toEqual(["recente","intermediaria","antiga"])`; `src/features/formacoes/painel.test.ts:32-48` repete no painel | ✅ PASS |
| FOR-02 `status == "em_andamento"` exibe "Em andamento", distinto de "Concluído" | os dois rótulos, aparência distinta | `src/features/formacoes/components/formacoes-section.test.tsx:47-58` — `getByText("Em andamento")`, `getByText("Concluído")`, `expect(emCurso.className).not.toBe(concluido.className)` | ✅ PASS |
| FOR-03 falha de leitura mostra a seção em erro com a mensagem do Firebase | mensagem fiel | `src/features/formacoes/queries.test.ts:149-160` — `toEqual({erro:"Você não tem permissão para esta operação."})`; `src/features/formacoes/components/formacoes-section.test.tsx:88-96` — `expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE)` | ✅ PASS |
| FOR-04 sem formações, a seção some inteira, inclusive o título | nada renderizado | `src/features/formacoes/components/formacoes-section.test.tsx:79-86` — `expect(container).toBeEmptyDOMElement()` + `expect(screen.queryByRole("heading",{name:secaoFormacao.titulo})).not.toBeInTheDocument()` | ✅ PASS |
| FOR-05 criar/editar/excluir formação aplica as mesmas regras de validação, confirmação e erro da P1 | paridade com publicações | `src/features/formacoes/components/formacao-form.test.tsx:57-72` (limite + `aria-invalid`), `:74-86` (ano fora do intervalo), `:116-141` (desabilita ao salvar), `:143-157` (erro fiel); `src/features/formacoes/components/formacoes-painel.test.tsx:169-199` (confirmação), `:201-218` (erro sem perder a lista) | ✅ PASS |

### P3: Encontrabilidade

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEO-01 `robots.txt` e `sitemap.xml` com `/` e cada publicação publicada | home + publicadas, painel fora | `src/app/sitemap.test.ts:47-51` — `expect(entradas.map(e=>e.url)).toEqual([`${siteUrl}/`, .../publicacoes/at-nao-e-baba, .../publicacoes/rotina-na-escola])`; `:54-60` — `expect(listarPublicadasFalso).toHaveBeenCalledWith(LIMITE_PUBLICACOES_SITEMAP)`; `:90-100` — painel fora; `src/app/robots.test.ts:14-24` — `userAgent "*"`, `allow CAMINHO_HOME`, `disallow CAMINHO_PAINEL`, `sitemap` absoluto | ✅ PASS |
| SEO-02 metadados Open Graph e dados estruturados `Person` na home | bloco OG + JSON-LD `Person` em `/` | — **não implementado**: `src/app/layout.tsx:26-36` declara só `metadataBase`, `title` e `description`; varredura por `ld+json`, `schema.org` e `Person` no `src/` retorna zero. O `openGraph` existente é do detalhe da publicação (`src/app/(site)/publicacoes/[slug]/page.tsx:58-65`) e atende PUB-07, não a home | ❌ GAP |

### Segurança

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEC-01 escrita restrita ao uid da allowlist nas rules | escrita anônima negada | — sem teste automatizado (não há `@firebase/rules-unit-testing` no `package.json`). Verificado por leitura: `firestore.rules:32-34` (`ehAutora()` exige `request.auth != null` e uid na lista), `:54` e `:60` (`allow create, update, delete: if ehAutora()`), `:39` e `:52` (leitura anônima só de `publicado == true`), `:63-64` (coleção não declarada é negada por padrão) | ⚠️ verificado por leitura, sem asserção |

**Status**: 18/30 com evidência de asserção casando com o resultado da spec · 3 parciais (PUB-02, PUB-04, ADM-04) · 8 sem asserção (SIT-01..SIT-06, PUB-07, SEC-01) · 1 sem implementação (SEO-02).

---

## Edge Cases

| Edge case da spec | `arquivo:linha` + asserção | Resultado |
| ----------------- | -------------------------- | --------- |
| `imagemUrl` de host fora da allowlist renderiza o card sem imagem, sem quebrar o layout | `src/features/publicacoes/components/publicacao-card.test.tsx:67-78` — `expect(screen.queryByRole("img")).not.toBeInTheDocument()` + resumo ainda presente; `publicacao-artigo.test.tsx:87-96`; `publicacoes-section.test.tsx:89-100` — `getAllByRole("article")` 2, `getAllByRole("img")` 1; `corpo-markdown.test.tsx:65-76`; `schemas.test.ts:150-154` recusa subdomínio parecido | ✅ |
| Corpo com HTML bruto é renderizado como texto, sem executar | `src/features/publicacoes/components/corpo-markdown.test.tsx:30-43` — `expect(container.querySelector("button")).toBeNull()` + `getByText('<button onclick="alert(1)">Clique</button>')` | ✅ |
| Slug duplicado bloqueia a gravação da segunda com mensagem de slug em uso | `src/features/publicacoes/mutations.test.ts:112-121` — `toEqual({erro: MENSAGEM_SLUG_EM_USO})` + `expect(addDocFalso).not.toHaveBeenCalled()`; `:182-191` no update; `:171-180` aceita o próprio slug | ✅ |
| Título com 120 caracteres é aceito (limite inclusivo) e o contador indica 120/120 | `src/features/publicacoes/components/publicacao-form.test.tsx:102-109` — `getByText("120/120")` + `expect(publicacaoGravada().titulo).toBe(noLimite)`; `schemas.test.ts:40-46` | ⚠️ o contador não discrimina (mutante M30 sobreviveu) |
| Variáveis de ambiente ausentes falham nomeando a variável faltante | `src/lib/firebase/config.test.ts:39-45` — `toThrow("Configuração do Firebase incompleta. Defina a variável de ambiente: NEXT_PUBLIC_FIREBASE_PROJECT_ID.")`; `:47-58` nomeia todas; `:60-69` trata em branco como ausente | ✅ |

---

## Discrimination Sensor

**Isolamento**: worktree temporária (`git worktree add … HEAD --detach`) com `node_modules` por symlink;
cada mutação revertida com `git checkout --`; worktree removida ao fim. Nunca `git stash`, nunca a
árvore real. Baseline `git status --porcelain` vazio antes e depois — conferido.

**Profundidade**: P0-full (30 mutações; a spec tem caminhos de auth, integridade de dados e vazamento
de rascunho em rota pública).

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| M1 | Remove `where("publicado","==",true)` da listagem pública | `src/features/publicacoes/queries.ts:40` | ✅ Morto |
| M2 | Remove `where("publicado","==",true)` da busca por slug | `src/features/publicacoes/queries.ts:68` | ✅ Morto |
| M3 | Cria publicação sem `publicadoEm` | `src/features/publicacoes/mutations.ts:82` | ✅ Morto |
| M4 | `alternarPublicado` sobrescreve `publicadoEm` em vez de preservar | `src/features/publicacoes/mutations.ts:150` | ✅ Morto |
| M5 | `slugEmUso` sempre `false` (aceita slug duplicado) | `src/features/publicacoes/mutations.ts:64` | ✅ Morto |
| M6 | Inverte a ordenação do painel (mais antiga primeiro) | `src/features/publicacoes/converter.ts:130` | ✅ Morto |
| M7 | Desempate de formação por ano crescente | `src/features/formacoes/converter.ts:101` | ✅ Morto |
| M8 | Ordem das formações decrescente | `src/features/formacoes/converter.ts:86` | ✅ Morto |
| M9 | Limite de título 120 → 121 | `src/features/publicacoes/schemas.ts:35` | ✅ Morto |
| M10 | Limite de resumo 220 → 221 | `src/features/publicacoes/schemas.ts:37` | ✅ Morto |
| M11 | **Limite de corpo 20000 → 20001** | `src/features/publicacoes/schemas.ts:38` | ❌ **Sobreviveu** |
| M12 | `ehUrlDeImagemPermitida` sempre `true` | `src/features/publicacoes/schemas.ts:67` | ✅ Morto |
| M13 | Excluir chama `aoExcluir` direto, sem confirmação | `src/features/publicacoes/components/publicacoes-table.tsx:126` | ✅ Morto |
| M14 | Guard renderiza o painel mesmo sem sessão | `src/features/admin/components/painel-guard.tsx:88-92` | ✅ Morto |
| M15 | Erro do Firebase vira sempre `MENSAGEM_SEM_DETALHE` | `src/lib/firebase/errors.ts:65` | ✅ Morto |
| M16 | `auth/user-not-found` revela que o e-mail não existe | `src/lib/firebase/errors.ts:18` | ✅ Morto |
| M17 | Seção de formação não some no vazio | `src/features/formacoes/components/formacoes-section.tsx:71` | ✅ Morto |
| M18 | `LIMITE_PUBLICACOES_HOME` 6 → 12 | `src/features/publicacoes/schemas.ts:17` | ✅ Morto |
| M21 | Sitemap usa o limite da home no lugar do teto do sitemap | `src/app/sitemap.ts:23` | ✅ Morto |
| M22 | Sitemap passa a listar `/admin` | `src/app/sitemap.ts:29-30` | ✅ Morto |
| M23 | Robots deixa de bloquear o painel | `src/app/robots.ts:23` | ✅ Morto |
| M24 | Seção da home deixa de cortar em 6 (`slice` removido) | `src/features/publicacoes/components/publicacoes-section.tsx:32` | ✅ Morto |
| M25 | Sessão nasce resolvida como deslogada | `src/hooks/use-auth.ts:53` | ✅ Morto |
| M26 | Config não nomeia a variável faltante | `src/lib/firebase/config.ts:57` | ✅ Morto |
| M27 | Vazio de publicações renderiza `null` no lugar da mensagem | `src/features/publicacoes/components/publicacoes-section.tsx:26-28` | ✅ Morto |
| M28 | Rótulo "Em andamento" com a mesma aparência de "Concluído" | `src/features/formacoes/components/formacoes-section.tsx:23` | ✅ Morto |
| M30 | **Contador do campo mostra `usados/usados` no lugar de `usados/limite`** | `src/components/form/campo.tsx:38` | ❌ **Sobreviveu** |
| M32 | Card nunca exibe a imagem | `src/features/publicacoes/components/publicacao-card.tsx:28` | ✅ Morto |
| M33 | Formulário não desabilita os campos ao salvar | `src/features/publicacoes/components/publicacao-form.tsx:86` | ✅ Morto |
| M34 | Detalhe nunca exibe a imagem de topo | `src/features/publicacoes/components/publicacao-artigo.tsx` (`imagemExibivel`) | ✅ Morto |

**Resultado**: 28/30 mortos — ❌ FAIL (2 sobreviventes).

**Não sensoreável**: `firestore.rules` não tem execução automatizada neste projeto (sem
`@firebase/rules-unit-testing`), então a mutação "regra permite escrita anônima" não pôde ser
injetada. SEC-01 fica verificada por leitura — ver a tabela de segurança.

**Descartado**: uma tentativa inicial de mutar o sitemap (`void 0;`) não alterava comportamento e foi
substituída por M21/M22, que alteram.

---

## Gate Check

| Comando | Resultado |
| ------- | --------- |
| `npm test -- --run` | 272 passaram, 0 falharam, 0 pulados — 33 arquivos |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 — 9 rotas geradas (`/` e `/sitemap.xml` com `revalidate 5m`) |

- **Testes antes da feature**: 0 (projeto novo) · **depois**: 272 · **delta**: +272
- **Pulados**: nenhum
- **Ruído esperado do ambiente**: o build loga `permission-denied` do Firestore ao pré-renderizar a
  home — as regras ainda não foram publicadas e o uid da autora é placeholder
  (`firestore.rules:28`). É estado do ambiente, não defeito: a home degrada para o estado de erro
  em vez de derrubar o build, que é justamente PUB-05/FOR-03 funcionando.

---

## Code Quality

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem feature além do pedido | ✅ |
| Sem abstração para uso único | ✅ (os primitivos extraídos — `Container`, `SectionMessage`, `Campo`, `TabelaPainel` — têm 2+ consumidores, registrados em AD-009/013/028) |
| Só os arquivos necessários tocados | ✅ |
| Segue o padrão do projeto | ✅ (feature-first `features/<domínio>/{schemas,converter,queries,mutations,painel,components}`, AD-002) |
| Verificação ancorada na spec (valor asserido = valor da spec) | ⚠️ falha em ADM-04 (corpo) e no contador do edge case de 120 |
| Cobertura por camada: domínio 1:1 com ACs; rotas com feliz + borda + erro | ⚠️ domínio ✅; **rotas sem nenhum teste** (declarado na Test Coverage Matrix como "build gate", mas o build só prova compilação — não prova 404, metadados nem ordem das seções) |
| Todo teste mapeia para requisito/edge case/Done-when — sem teste órfão | ✅ |
| Diretrizes documentadas seguidas | ✅ `tasks.md` (Test Coverage Matrix) + defaults fortes da skill |
| Anti-hardcode | ✅ limites, rotas, allowlist de host, textos e paleta centralizados; zero cor literal em componente |
| Moeda em BRL completo | N/A — o projeto não exibe valores monetários |

---

## Gaps ranqueados

1. **SEO-02 sem implementação (Blocker)** — a home não declara Open Graph nem dados estruturados
   `Person`. `src/app/layout.tsx:26-36` só tem `metadataBase`, `title` e `description`; não há
   `ld+json` no `src/`. Nenhuma task cobre essa metade do requisito (rastreabilidade aponta T5 e
   T27, e nenhuma das duas entrega). **Correção**: bloco `openGraph` no `metadata` do layout raiz
   (ou da home) + `<script type="application/ld+json">` com o `Person` montado a partir de
   `src/content/site.ts`, mais um teste que asserte os campos.

2. **ADM-04: o teto de 20.000 do corpo não está travado (Major)** — mutante M11 sobreviveu.
   `src/features/publicacoes/schemas.test.ts:71-78` compara contra `LIMITES_PUBLICACAO.corpo`, então
   mover a constante move os dois lados do teste. Título e resumo escapam porque as asserções citam
   o literal na mensagem ("120", "220"). **Correção**: asserir a mensagem literal do corpo
   (`"O corpo do texto deve ter no máximo 20000 caracteres."`) ou um `expect(LIMITES_PUBLICACAO.corpo).toBe(20000)`.

3. **Edge case do contador não discrimina (Major)** — mutante M30 sobreviveu. Com o título em 120
   caracteres, um contador que renderize `usados/usados` também exibe "120/120", então
   `src/features/publicacoes/components/publicacao-form.test.tsx:102-109` passa mesmo com o
   denominador errado. **Correção**: um caso com `usados != limite` (ex.: título de 3 caracteres
   esperando "3/120").

4. **PUB-07 sem nenhuma evidência (Major)** — `generateMetadata` de `/publicacoes/[slug]`
   (`src/app/(site)/publicacoes/[slug]/page.tsx:34-67`) não tem teste. É função exportada e pura o
   bastante para ser testada direto, com `params` mockado e `obterPorSlug` falso.

5. **PUB-04 coberto só até a fronteira do domínio (Major)** — a query filtra e devolve `null`
   (testado), mas a tradução `null → notFound()` em `page.tsx:84` não tem asserção. Vale o mesmo
   teste de rota do item 4.

6. **SEC-01 sem verificação executável (Major)** — as regras estão corretas por leitura, mas nada
   impede uma edição futura de afrouxá-las sem quebrar teste nenhum. **Correção**:
   `@firebase/rules-unit-testing` com o emulador, ou aceitar por escrito que SEC-01 é verificado
   por revisão manual a cada mudança de `firestore.rules`.

7. **PUB-02: link de volta sem asserção (Minor)** — implementado em `page.tsx:99-105`, não testado.

8. **SIT-01..SIT-06 sem evidência automatizada (Minor)** — ordem das seções, 6 pilares, âncoras do
   menu, 360px, paleta por token e `prefers-reduced-motion`. A Test Coverage Matrix declara
   "rotas/layouts/config/conteúdo estático → build gate", e o build passa; mas o build não prova
   nenhum desses comportamentos. SIT-04 e SIT-06, em particular, só se fecham por UAT em navegador.

9. **⚠️ Lacuna de precisão da spec — SIT-06 com três sentidos (Minor)** — história P1 diz
   `prefers-reduced-motion`; `spec.md:59` cita SIT-06 para falha de dependência externa;
   `src/lib/firebase/config.ts:6` cita SIT-06 para variável de ambiente faltante. O ID precisa de
   um dono só.

---

## Requirement Traceability Update

| Requirement | Status anterior | Novo status |
| ----------- | --------------- | ----------- |
| SIT-01, SIT-02, SIT-03, SIT-04, SIT-05, SIT-06 | Implementing | ⚠️ Implementado, sem verificação automatizada |
| PUB-01, PUB-03, PUB-05, PUB-06 | Implementing | ✅ Verificado |
| PUB-02, PUB-04 | Implementing | ⚠️ Verificado parcialmente (camada de domínio) |
| PUB-07 | Implementing | ⚠️ Implementado, sem evidência |
| ADM-01, ADM-02, ADM-03, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09 | Implementing | ✅ Verificado |
| ADM-04 | Implementing | ⚠️ Verificado parcialmente (teto do corpo frouxo) |
| FOR-01, FOR-02, FOR-03, FOR-04, FOR-05 | Implementing | ✅ Verificado |
| SEO-01 | Implementing | ✅ Verificado |
| SEO-02 | Implementing | ❌ Precisa de correção (não implementado) |
| SEC-01 | Implementing | ⚠️ Verificado por leitura das regras |

---

## Summary

**Geral**: ❌ Não pronto — um requisito por implementar e dois pontos cegos de teste.

**Check ancorado na spec**: 18/30 ACs com asserção casando com o resultado da spec · 3 parciais ·
8 sem asserção · 1 sem implementação · 1 lacuna de precisão da spec (SIT-06).
**Sensor**: 28/30 mutantes mortos.
**Gate**: 272 passaram · tsc, lint e build limpos.

**O que funciona**: a camada de domínio é forte e discriminante — vazamento de rascunho em rota
pública, `publicadoEm` faltante, ordenação, slug duplicado, limites de título e resumo, allowlist de
imagem, exclusão sem confirmação, guard do painel, tradução fiel de erro do Firebase e sitemap/robots
foram todos mortos pelo sensor na primeira tentativa.

**Onde dói**: a fronteira de rota (`app/`) não tem nenhum teste, e é justamente onde moram os dois
requisitos de SEO e o 404. SEO-02 nem chegou a ser escrito.

**Próximos passos**: implementar SEO-02 com teste; fechar os dois mutantes sobreviventes (M11, M30);
cobrir `generateMetadata` e o `notFound()` da rota do slug; decidir se SEC-01 passa a ter emulador ou
vira revisão manual assumida; e desambiguar SIT-06 na spec.

---

## Correções da Fase 7 (autor, 2026-09-01)

> Escrito pelo implementador, não pelo Verifier. O veredito **FAIL** acima é o da
> verificação independente e continua valendo até uma nova passada de um verificador
> fresco — o que está abaixo é o registro do que foi feito para cada lacuna, com a
> evidência de onde conferir.

| # | Lacuna | Task | Evidência | Situação |
| - | ------ | ---- | --------- | -------- |
| 1 | SEO-02 não implementado (Blocker) | T41 | `src/features/site/seo.test.ts:38-52` — `expect(pessoaDaAutora["@type"]).toBe("Person")`, `expect(pessoaDaAutora.url).toBe(`${siteUrl}/`)`, `expect(pessoaDaAutora.sameAs).toEqual([linksContato.instagram])`; `:13` — `expect(metadadosDaHome.openGraph).toMatchObject({type:"website",locale:"pt_BR",…})`; `src/app/(site)/page.test.tsx:47` — `expect(metadata).toBe(metadadosDaHome)`; `:58` — `expect(JSON.parse(bloco?.textContent ?? "null")).toEqual(pessoaDaAutora)` | ✅ implementado e asserido campo a campo |
| 2 | Teto de 20.000 do corpo frouxo (Major, M11) | T42 | `src/features/publicacoes/schemas.test.ts:29` — `const LIMITE_DE_CORPO_DA_SPEC = 20000`; `:88` — `.toBe("O corpo do texto deve ter no máximo 20000 caracteres.")` | ✅ M11 morre (limite 20001 no schema reprova a suíte) |
| 3 | Contador 120/120 não discrimina (Major, M30) | T43 | `src/features/publicacoes/components/publicacao-form.test.tsx:124` — `expect(screen.getByText("6/120")).toBeInTheDocument()`; `:130` — `expect(screen.getByText("120/120")).toBeInTheDocument()` | ✅ M30 morre (`usados/usados` reprova) |
| 4 | PUB-07 sem evidência (Major) | T44 | `src/app/(site)/publicacoes/[slug]/page.test.tsx:66-70`, `:78` — `expect(metadados.openGraph).toMatchObject({type:"article",url:`/publicacoes/${SLUG}`,publishedTime:"2026-01-10T03:00:00.000Z"})`; `:92-95` — slug ausente sem `undefined` | ✅ coberto |
| 5 | PUB-04 coberto só até o domínio (Major) | T45 | `src/app/(site)/publicacoes/[slug]/page.test.tsx:103-106` (slug inexistente), `:115-119` (rascunho, com `expect(obterPorSlugFalso).toHaveBeenCalledWith("rascunho-da-autora")`), `:127-130` (no ar não chama `notFound`) | ✅ coberto |
| 6 | SEC-01 sem verificação executável (Major) | T46 | `tests/rules/firestore.rules.test.ts:105` — `await assertFails(getDoc(doc(db,"publicacoes",RASCUNHO)))`; `:111` — `assertFails(getDocs(query(collection(db,"publicacoes"))))`; `:122-126` — escrita anônima negada; `:141`,`:147-153` — autora lê rascunho e escreve; `:161-163` — uid de fora não escreve | ✅ executável por `npm run test:rules` (emulador); com `allow create, update, delete: if true`, 3 casos reprovam |
| 7 | PUB-02 link de volta sem asserção (Minor) | T47 | `src/app/(site)/publicacoes/[slug]/page.test.tsx:140` — `expect(screen.getByRole("link",{name:secaoPublicacoes.voltar})).toHaveAttribute("href", CAMINHO_HOME)` | ✅ coberto |
| 8 | SIT-01..SIT-06 sem evidência (Minor) | fora de task | `src/app/(site)/page.test.tsx:71` — ordem dos ids das seções `toEqual([topo, at, sobre, formacao, publicacoes, contato])`; `:98` — cada âncora do menu encontra a seção na home | ⚠️ SIT-01 e SIT-03 cobertos; SIT-02 e SIT-05 seguem por inspeção; **SIT-04 e SIT-06 são UAT** (abaixo) |
| 9 | SIT-06 com três sentidos (Minor) | fora de task | `spec.md` (AC 6 da P1 e a varredura de dimensões implícitas), `src/lib/firebase/config.ts:6` | ✅ SIT-06 é só reduced-motion; falha externa e variável ausente viraram edge cases sem ID |

**Suítes**: 294 testes em 36 arquivos (`npm test -- --run`) + 10 testes de regra
(`npm run test:rules`). Antes da Fase 7: 272 em 33 arquivos.

**Revisores da Fase 7** (`revisor-reuso-padroes` + `revisor-arquitetura`, em paralelo sobre
`e83d4ef..HEAD`): 0 bloqueantes, 2 importantes apontados pelos dois e corrigidos —
(a) o `<title>` e a `description` do layout raiz eram literais enquanto o Open Graph novo
derivava de `perfil`, duas fontes para o mesmo texto: viraram `metadadosDoSite` em
`content/site.ts`, lido pelos dois lados; (b) a home montava metadados na feature e a rota do
texto montava os dela dentro de `app/`, contra o AD-002: `metadadosDaPublicacao` saiu para
`features/publicacoes/seo.ts`. Menores fechados junto: `<` escapado no JSON-LD, cartão do
Twitter sem imagem vira `summary`, id do projeto do emulador lido de `GCLOUD_PROJECT`,
`@firebase/rules-unit-testing` e `firebase-tools` pinados exatos.

## Verificação manual (UAT) — não coberto por teste

Estes dois critérios não se fecham em jsdom e **não contam como cobertos**. Precisam de
navegador, e devem ser reconferidos a cada mudança de layout ou de animação:

| Critério | Como conferir |
| -------- | ------------- |
| SIT-04 — viewport de 360px sem rolagem horizontal | DevTools → dispositivo de 360px de largura, percorrer a home inteira e a página de um texto: nenhuma barra horizontal, nenhum bloco cortado |
| SIT-06 — `prefers-reduced-motion: reduce` sem animação de entrada | macOS: Ajustes → Acessibilidade → Vídeo → Reduzir movimento (ou DevTools → Rendering → Emulate `prefers-reduced-motion`), recarregar e conferir que nada anima e que a rolagem do menu é instantânea |

SIT-02 (6 pilares vindos de `content/site.ts`) e SIT-05 (paleta por token, sem cor literal)
seguem verificados por inspeção do código, como no relatório original.
