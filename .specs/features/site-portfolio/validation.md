# site-portfolio — Validação

**Data**: 2026-09-02
**Spec**: `.specs/features/site-portfolio/spec.md` (33 linhas de rastreabilidade; FOR-05 removido por AD-046 → **32 requisitos vivos**)
**Superfície de diff**: `b48c45d..9842760` — 38 commits, 111 arquivos, +4150/−3232 · veredito sobre a **feature inteira**, contra a spec atual
**Verificador**: sub-agente independente, iteração 5 (autor ≠ verificador; evidência-ou-zero, cobertura re-derivada do zero)

---

## Veredito

## Validation: site-portfolio — FAIL ❌

**Spec-anchored check**: 28/32 requisitos com `file:line` + expressão que bate com o desfecho da spec · **2 sem nenhuma evidência** (SIT-06, ADM-09) e ainda assim marcados `Verified` na spec · **1 com regressão de teste** (SEC-01) · **1 requisito e 1 metade por UAT declarado** (SIT-04, rolagem de SIT-03).
**Gate**: 301 testes em 40 arquivos (`npm test -- --run`, exit 0) · 8 testes de regra (`npm run test:rules`, emulador, exit 0, **rodado nesta sessão**) · `npx tsc --noEmit` exit 0 · `npm run lint` exit 0 (1 warning) · `npm run build` exit 0 (**rodado em worktree isolada** — há dev server na 7070 e build com dev de pé corrompe o `.next`).
**Sensor**: **35 mutações de comportamento injetadas, 23 mortas, 12 sobreviventes.** Entre as sobreviventes está a regra que libera **escrita no Firestore para qualquer uid autenticado** — a suíte de regras segue 8/8 verde.

**Nenhum comportamento do produto foi encontrado errado.** O que reprova é a verificação: o produto está certo e nada impede que deixe de estar. Três dos doze sobreviventes são exatamente os bugs que esta iteração acabou de corrigir (Toaster nunca montado, provedor de pendência ausente, animação que só existia no Chrome) — e nenhum deles ficou travado por teste.

---

## 1. Regressão de teste — a mais material

`159c049` ("trazer a formação para o corpo da página, fora do firestore") apagou de `tests/rules/firestore.rules.test.ts` o caso inteiro `uid fora da allowlist > "não escreve publicação nem formação"` (−21 linhas, +0). A cláusula de `formacoes` estava obsoleta; **as duas de `publicacoes` não estavam**.

O que se perdeu, verbatim do commit:

```ts
await assertFails(setDoc(doc(db, "publicacoes", "nova"), publicacao(true)));
await assertFails(deleteDoc(doc(db, "publicacoes", PUBLICADA)));
```

Consequência medida (mutação **R1**): trocar `firestore.rules:176`

```
allow create, update, delete: if ehAutora();   →   if request.auth != null;
```

e `npm run test:rules` devolve **8 passed, exit 0**. Qualquer pessoa com uma conta no projeto Firebase passa a criar, editar e apagar publicação, e a suíte não vê.

Isso contradiz três coisas ao mesmo tempo:

- o requisito **SEC-01**, marcado `Verified` na spec;
- o Success Criterion literal *"Regras do Firestore negam escrita para uid fora da allowlist"*;
- a AD-033, que criou a suíte de regras justamente porque *"SEC-01 era o único requisito sem verificação executável: afrouxar `firestore.rules` não quebrava teste nenhum"*.

A contagem de testes caiu de 10 para 8 na suíte de regras e de 323 para 301 na unitária. A queda da unitária é legítima (remoção do domínio `formacoes`). A das regras **não é**: só um dos dois casos removidos era sobre formação.

---

## 2. Cobertura ancorada na spec (evidência-ou-zero)

Requisito sem `file:line` localizado conta como **não coberto**, independente do status escrito na spec.

### P1 — Visitante entende o trabalho da AT

| Critério | Desfecho da spec | `file:line` + expressão | Resultado |
| -------- | ---------------- | ----------------------- | --------- |
| SIT-01 — home com 10 blocos, nesta ordem | hero, AT, Pedagogia, Competências, Atendimento, Sobre, Formação, Publicações, contato, rodapé | `src/app/(site)/page.test.tsx:74-85` — `expect(blocosNaOrdem(container)).toEqual([ancoras.topo, ancoras.at, ancoras.pedagogia, ancoras.competencias, ancoras.atendimento, ancoras.sobre, ancoras.formacao, ancoras.publicacoes, ancoras.contato, RODAPE])`, renderizado dentro do `SiteLayout` (AD-038) | ✅ PASS |
| SIT-02 — 6 pilares, sem texto duplicado em componente | exatamente 6 | `src/features/site/sections/o-que-faz-uma-at.test.tsx:16` — `expect(secaoAt.pilares).toHaveLength(PILARES_DA_SPEC)` com `PILARES_DA_SPEC = 6` literal em `:12`; `:22` conta os `article`; `:32,:37` comparam título **e** descrição com o conteúdo | ✅ PASS |
| SIT-03 — item do menu rola até a seção | destino existe na mesma página | `src/app/(site)/page.test.tsx:100-113` — cada `a[href^="#"]` do `SiteHeader` resolve por `container.querySelector(ancora)` na home | ⚠️ Metade: destino provado; **rolagem** é `scroll-behavior` do CSS (`globals.css:159`) → UAT |
| SIT-04 — 360px sem rolagem horizontal | nenhuma barra horizontal | — | ⏭️ Sem evidência automatizada; jsdom não faz layout. **UAT declarado** |
| SIT-05 — paleta por token, sem cor literal | `#EDF3E4` / `#F7FBF1` / `#4C5B34` / `#786418` | metade positiva: `src/test/paleta-aprovada.test.ts:106-131` — `it.each` dos 10 tokens, `hexParaOklch(aprovado)` vs. declaração lida de `globals.css`, folga `{L .0005, C .0005, H .05}`; metade negativa: `src/test/paleta-em-tokens.test.ts:191,196,202` — `expect(infratoresDe(...)).toEqual([])` para literal, classe Tailwind e `style` inline | ✅ PASS (mutação M23 mata) |
| SIT-06 — `prefers-reduced-motion: reduce` sem animação de entrada | todas as seções renderizadas sem animação | **nenhuma** | ❌ **GAP** — ver §4 |
| SIT-07 — 4 frentes de Pedagogia, numeradas na ordem | "Pedagogia escolar", "Pedagogia hospitalar", "Educação e inclusão", "Acompanhamento terapêutico" | `src/features/site/sections/pedagogia.test.tsx:32-34` — `expect(secaoPedagogia.frentes.map(f => f.titulo)).toEqual(FRENTES_DA_SPEC)` (literal em `:13-18`); `:40` mesma ordem no DOM; `:50` — `expect(numeros).toEqual(["01","02","03","04"])` | ✅ PASS |
| SIT-08 — 10 competências em 4 famílias, cada uma com descrição | Inclusão, Comunicação, Aprendizagem, Contextos | `src/features/site/sections/competencias.test.tsx:22-24` — famílias vs. literal `:12-17`; `:30` — `expect(screen.getAllByRole("listitem")).toHaveLength(10)`; `:41` agrupamento; `:51` descrição presente | ✅ PASS (ressalva em §4.1, M6) |
| SIT-09 — as 10 competências repetidas como etiquetas + 5 contextos | 10 etiquetas, 5 contextos | `src/features/site/sections/atendimento.test.tsx:20-23` — `expect(titulos).toHaveLength(10)` derivado de `secaoCompetencias` + presença no DOM; `:29-32` — `expect(secaoAtendimento.contextos).toHaveLength(5)` | ✅ PASS (o docblock `:8` ainda diz "4 contextos" — texto desatualizado, constante certa) |

### P1 — Visitante lê as publicações

| Critério | Desfecho da spec | `file:line` + expressão | Resultado |
| -------- | ---------------- | ----------------------- | --------- |
| PUB-01 — publicado, `publicadoEm` desc, máx. 6 | teto 6 | `src/features/publicacoes/queries.test.ts:83-87` — `restricoes` com `where publicado==true`, `orderBy publicadoEm desc`, `limit TETO_DA_HOME_NA_SPEC`; `publicacoes-section.test.tsx:61` — `toHaveLength(TETO_DA_HOME_NA_SPEC)` (6 literal em `src/test/valores-da-spec.ts:25`) | ✅ PASS |
| PUB-02 — `/publicacoes/[slug]` com título, data, markdown e volta | artigo renderizado | `src/app/(site)/publicacoes/[slug]/page.test.tsx:122-130`; corpo/meta em `publicacao-artigo.test.tsx:34-50`; volta em `page.test.tsx:135-141` | ✅ PASS |
| PUB-03 — "Nenhuma publicação por aqui ainda." | literal | `publicacoes-section.test.tsx:72` — `getByText(MENSAGEM_DE_VAZIO_DA_SPEC)`; `:77` liga o literal ao conteúdo | ✅ PASS |
| PUB-04 — 404 para slug inexistente ou rascunho | `notFound()` | `page.test.tsx:100-106` e `:109-119` — `expect(notFoundFalso).toHaveBeenCalledTimes(1)` nos dois casos | ✅ PASS |
| PUB-05 — falha de leitura em estado de erro, página de pé | mensagem do Firebase | `publicacoes-section.test.tsx:83` — `expect(screen.getByRole("alert")).toHaveTextContent(ERRO_DO_FIREBASE)`; origem em `queries.test.ts:115` | ✅ PASS |
| PUB-06 — imagem no card e no topo | quando `imagemUrl` existe | `publicacoes-section.test.tsx:116-117`; `publicacao-artigo.test.tsx:53-59` e `:94-104` (host fora da allowlist cai fora) | ✅ PASS |
| PUB-07 — title/description/OG por publicação | do título e do resumo | `page.test.tsx:66-70` e `:73-86`; `:87-95` — slug ausente não vaza `undefined` | ✅ PASS |

### P1 — Keylla publica sem depender de ninguém

| Critério | Desfecho da spec | `file:line` + expressão | Resultado |
| -------- | ---------------- | ----------------------- | --------- |
| ADM-01 — `/admin` sem sessão → `/admin/login` | redireciona e esconde | `painel-guard.test.tsx:66-67` — `expect(substituir).toHaveBeenCalledWith(CAMINHO_LOGIN)` + conteúdo ausente | ✅ PASS |
| ADM-02 — credencial aceita → `/admin` | redireciona | `login-form.test.tsx:66-68` — `expect(substituir).toHaveBeenCalledWith(CAMINHO_PAINEL)` | ✅ PASS |
| ADM-03 — erro em PT sem revelar se o e-mail existe | mensagem por código | `login-form.test.tsx:77-83` — `toast.error(painel.avisos.entrouFalhou, { description: CREDENCIAL_RECUSADA })`; `src/lib/firebase/errors.test.ts:78` — mesma mensagem para e-mail inexistente e senha errada | ✅ PASS |
| ADM-04 — limites 120/220/20000 + URL https válida | inclusivo no limite | `schemas.test.ts:41-95` — aceita 120/220/20000 e rejeita 121/221/20001; `:114-153` — https, allowlist de host, http recusado | ✅ PASS |
| ADM-05 — gravando desabilita e mostra carregamento | controles `disabled` | `login-form.test.tsx:109-113`; `publicacoes-painel.test.tsx:190-191` | ✅ PASS |
| ADM-06 — excluir só após confirmação em dialog próprio | dialog da casa | `publicacoes-painel.test.tsx:140` — `expect(excluir).not.toHaveBeenCalled()` antes; `:148` chamada depois | ✅ PASS |
| ADM-07 — falha de gravação mantém os dados e mostra a mensagem | mensagem do Firebase | `publicacao-editor.test.tsx:170-179` — `toast.error(painel.avisos.naoSalvou, { description: … })` + `expect(campo(titulo)).toHaveValue("Texto novo")` | ✅ PASS |
| ADM-08 — alternar persiste e reflete na listagem | recarrega a lista | `publicacoes-painel.test.tsx:128-129` — `alternar` chamado e `listar` chamado 2× | ✅ PASS |
| ADM-09 — nunca `window.confirm/alert/prompt` | ausência em todo o projeto | **nenhuma** — só docblocks (`confirmar-acao.tsx:7`, `publicacoes-table.tsx:6`) | ❌ **GAP** — ver §4 |

### P2 — Formação (conteúdo fixo, AD-046)

| Critério | Desfecho da spec | `file:line` + expressão | Resultado |
| -------- | ---------------- | ----------------------- | --------- |
| FOR-01 — dois grupos, lidos de `content/site.ts` | "Formação acadêmica", "Aperfeiçoamento e capacitação" | `src/features/site/sections/formacao.test.tsx:13-15` — `expect(secaoFormacao.grupos.map(g => g.titulo)).toEqual(GRUPOS_DA_SPEC)` (literal em `:9`) | ✅ PASS |
| FOR-02 — ano ao lado do título quando existe | ano visível | `formacao.test.tsx:33-36` — `within(comAno).getByText("2022")` | ✅ PASS |
| FOR-03 — sem ano registrado, linha sem ano | nunca data suposta | `formacao.test.tsx:38-41` — `expect(semAno.textContent).not.toMatch(/\d{4}/)` | ✅ PASS |
| FOR-04 — instituição e detalhe numa linha só | junção com separador | `formacao.test.tsx:47-51` — `getByText("Faculdade Venda Nova do Imigrante — FAVENI · 720 horas")` | ✅ PASS |
| FOR-05 | — | removido (AD-046) | ➖ N/A |

### P3 — Encontrabilidade e segurança

| Critério | Desfecho da spec | `file:line` + expressão | Resultado |
| -------- | ---------------- | ----------------------- | --------- |
| SEO-01 — `robots.txt` + `sitemap.xml` com `/` e cada publicação | URLs absolutas | `src/app/robots.test.ts:15-24`; `src/app/sitemap.test.ts:47-52`, `:82-87` (falha → só a home), `:90-97` (painel fora) | ✅ PASS |
| SEO-02 — Open Graph + `Person` na home | os dois | `src/features/site/seo.test.ts:21-28` (OG) e `:77-97` (`Person` campo a campo, endereço incluído); impressão no HTML em `src/app/(site)/page.test.tsx:55-64` | ✅ PASS |
| SEC-01 — escrita restrita ao uid da allowlist | quem não está na lista **não escreve** | leitura coberta (`tests/rules/firestore.rules.test.ts:93,99,105,129,150`); **escrita por uid autenticado fora da lista: nenhuma asserção** | ❌ **GAP** — §1, mutação R1 |

**Status**: 28 PASS · 2 GAP sem evidência (SIT-06, ADM-09) · 1 GAP por regressão (SEC-01) · 1 requisito + 1 metade por UAT (SIT-04, SIT-03).

---

## 3. A rastreabilidade da spec mente

| # | O que a spec diz | O que existe | Gravidade |
| - | ---------------- | ------------ | --------- |
| T1 | SIT-08 → `T61,T62`; SIT-09 → `T61,T63`; FOR-01..FOR-04 → `T64` | **`tasks.md` termina em T60.** T61–T64 não existem em lugar nenhum do repositório | Alta — 6 requisitos apontam para tasks inventadas |
| T2 | SIT-08, SIT-09, FOR-01..FOR-04 = `Pending` | os seis estão implementados **e testados** (§2). O status subestima | Média |
| T3 | `**Coverage:** 33 total, 33 mapped to tasks, 0 unmapped` | 32 vivos; 26 mapeados para tasks existentes, 6 para tasks inexistentes, 1 sem task por decisão | Média |
| T4 | SEC-01 = `Verified` | perdeu o teste que o verificava (§1) | **Alta** |
| T5 | ADM-09 = `Verified` (tasks T33) | nenhuma varredura; T33 é a task do dialog de exclusão, não do requisito de ausência | Alta |
| T6 | SIT-06 = `Verified (UAT pendente)` (task T4) | T4 é a task de tokens/tema; o movimento migrou para `Revelador` em `6439503` e nenhuma task cobre isso | Alta |
| T7 | `FOR-03` aparece com **dois sentidos**: "item sem ano" (User Stories) e "erro de leitura do Firestore" (varredura de dimensões implícitas, Edge Cases) | resíduo de AD-046. Mesmo problema com `FOR-04` na AD-018 do `STATE.md` ("a de formação some inteira no vazio" — hoje a seção é fixa e nunca some) | Média — é a lição **L-006**, reincidindo |
| T8 | `tasks.md` documenta até a Phase 10 (Pedagogia) | **13 commits de feature** entraram depois sem nenhuma task: competências/atendimento (`66749f9`, `4620908`), formação fixa (`159c049`), rodapé (`8bd2b5a`, `057a837`, `9602cdf`), SEO (`89d218b`), a11y/menu (`75b79c0`, `9443cb6`, `2854e9d`), motion (`771ccbc`, `bca6e4d`, `6439503`), painel (`a14b1a4`, `9fb5bc7`) | Alta — sem `Done when` nem gate registrado por task |

---

## 4. Sensor de discriminação

Isolamento: duas worktrees temporárias (`git worktree add --detach HEAD`) — uma para as mutações, outra para o `build` (o `node_modules` por symlink faz o Turbopack entrar em pânico; foi hardlink). Nunca `git stash`, nunca a árvore real. `git status --porcelain` da árvore real: **0 linhas antes, 0 linhas depois**; ambas as worktrees removidas e `git worktree list` de volta a uma linha.

**35 mutações · 23 mortas · 12 sobreviventes.**

### 4.1 Sobreviventes (ranqueados por dano)

| # | Mutação | Arquivo:linha | Por que ninguém vê | Dano |
| - | ------- | ------------- | ------------------ | ---- |
| **R1** | `allow create, update, delete: if ehAutora()` → `if request.auth != null` | `firestore.rules:176` | o único caso de escrita negada para uid autenticado fora da allowlist foi apagado em `159c049` | **Blocker** — qualquer conta do projeto escreve na base |
| **M27** | remover `<ProvedorDePendencia>` do layout do painel | `src/app/(admin)/admin/layout.tsx:16-18` | os testes montam o provedor por conta própria (`src/test/painel.tsx:13`); ninguém renderiza o layout | **Blocker** — `usePendencia` lança e **todo o painel** quebra em produção, com 301/301 verde |
| **M26** | remover `<Toaster position="bottom-right" />` | `src/app/(admin)/admin/layout.tsx:19` | todo teste de toast faz `vi.mock("sonner")` | **Major** — é literalmente o bug que `a14b1a4` corrigiu ("o Toaster nunca estivera montado"), e nada impede o retorno |
| **M28** | remover `<Revelador />` da moldura pública | `src/app/(site)/layout.tsx:12` | nenhum teste | Major — o site perde a entrada ao rolar, em silêncio |
| **M16** | ignorar `prefers-reduced-motion` (`if (querMenosMovimento) return` → `if (false)`) | `src/components/layout/revelador.tsx:23` | `revelador.tsx` **não tem arquivo de teste** | **Major** — é o requisito SIT-06 inteiro |
| **M17** | nunca marcar `data-revelado` na interseção | `src/components/layout/revelador.tsx:32` | idem | Major — em navegador o conteúdo fica preso invisível; é a falha que `6439503` acabou de consertar no Safari/Firefox |
| **M29** | introduzir `window.confirm` em código de produção | `src/features/publicacoes/components/publicacoes-painel.tsx` | ADM-09 é requisito de **ausência** e não tem varredura | Major |
| **M25** | `titulo: painel.avisos.naoExcluiu` → `naoAlternou` | `publicacoes-painel.tsx:102` | o teste de falha de ação assere só a mensagem alternada, não o título de exclusão | Menor |
| **M24** | `toast.success(painel.avisos.publicada)` → `rascunhoSalvo` | `publicacao-editor.tsx:95` | nenhum teste assere `toast.success` | Menor |
| **R5** | remover `match /{document=**} { allow read, write: if false }` | `firestore.rules:180-182` | nenhum caso cobre coleção não declarada | Menor — defense in depth não verificada |
| **M3** | renomear item de formação fora das âncoras literais ("Formação de Missionários Transculturais") | `src/content/site.ts:373` | o teste itera sobre o próprio conteúdo | Cosmético — a spec não fixa os itens (lacuna de precisão, não defeito) |
| **M6** | renomear uma competência ("Educação especial") | `src/content/site.ts:~247` | idem | Cosmético — a spec fixa 10 e as 4 famílias, não os nomes |

### 4.2 Mortas (23)

| # | Mutação | Asserção que mata |
| - | ------- | ----------------- |
| M1 | dar `ano: 2019` a item que o currículo não registra | `formacao.test.tsx:41` — `not.toMatch(/\d{4}/)` |
| M2 | `detalhe: "720 horas"` → `"700 horas"` | `formacao.test.tsx:48-51` (literal) |
| M4 | parar de renderizar `{item.ano}` | `formacao.test.tsx:36` |
| M5 | inverter `juntarMeta(instituicao, detalhe)` | `formacao.test.tsx:48-51` |
| M7 | família `"Aprendizagem"` → `"Aprendizado"` | `competencias.test.tsx:22-24` (literal) |
| M8 | suprimir a descrição de cada competência | `competencias.test.tsx:51` |
| M9 | exibir só 3 das 10 especialidades | `atendimento.test.tsx:20-23` |
| M10 | remover um dos 5 contextos | `atendimento.test.tsx:29` |
| M11 | renomear a 2ª frente de Pedagogia | `pedagogia.test.tsx:32-34` e `:40` |
| M12 | numerar por `indice` em vez de `indice + 1` | `pedagogia.test.tsx:50` |
| M13 | não travar `body.style.overflow` com a folha aberta | `menu-mobile.test.tsx:66-72` |
| M14 | Esc deixa de fechar a folha | `menu-mobile.test.tsx:50-56` (+2 casos) |
| M15 | não devolver o foco ao botão ao fechar | `menu-mobile.test.tsx:58-64` |
| M18 | `toast.error(naoSalvou)` → `naoSaiu` | `publicacao-form.test.tsx:245` e `publicacao-editor.test.tsx:172` |
| M19 | prévia com cabeçalho próprio no lugar de `PublicacaoArtigo` | `publicacao-previa.test.tsx:25-42` (+2 casos) — AD-051 travada |
| M20 | `tentarSair` navega sempre, sem perguntar | `publicacao-editor.test.tsx:182-198` |
| M21 | trocar a ordem de `<Competencias />` e `<Atendimento />` | `page.test.tsx:74-85` |
| M22 | remover `address` do `Person` | `seo.test.ts:77-97` |
| M23 | `--brass` de volta ao dourado claro reprovado por contraste | `paleta-aprovada.test.ts:106-131` |
| M30 | âncora do menu apontando para seção inexistente | `page.test.tsx:100-113` |
| R2 | `allow get: if true` (rascunho para todos) | `firestore.rules.test.ts:99` e `:150` |
| R3 | `allow list: if true` (listagem sem filtro) | `firestore.rules.test.ts:105-110` |
| R4 | `ehAutora()` → `request.auth != null` | `firestore.rules.test.ts:150` — mata só pela **leitura**; a escrita continua sem guarda (R1) |

**Profundidade**: expandida (P0 — regra de autorização e superfície de escrita). **Resultado**: 23/35 — ❌ FAIL.

---

## 5. Gate

| Comando | Resultado |
| ------- | --------- |
| `npm test -- --run` | **301 passed / 40 arquivos**, exit 0 |
| `npm run test:rules` (emulador, `openjdk@21` no PATH) | **8 passed / 1 arquivo**, exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 — 1 warning: `publicacao-editor.test.tsx:1` `'render' is defined but never used` |
| `npm run build` | exit 0 · 11 rotas · `/` com `revalidate 5m` · **rodado em worktree isolada**; o `.next` do dev na 7070 não foi tocado |

**Integridade da contagem**: 323 → 301 na unitária (−22) e 10 → 8 nas regras (−2), contra `b48c45d`. A queda unitária é justificada pela remoção do domínio `formacoes` (14 arquivos, ~1.900 linhas). **A queda nas regras não é**: dos 2 casos removidos, só metade de um era sobre formação (§1).

---

## 6. Qualidade de código

| Princípio | Status |
| --------- | ------ |
| Código mínimo | ✅ |
| Mudança cirúrgica | ✅ |
| Sem escopo extra | ✅ |
| Segue os padrões da casa | ✅ — `features/<domínio>` (AD-002), primitivos em `components/layout/` (AD-009), conteúdo em `content/site.ts` (AD-004) |
| Asserção bate com o desfecho da spec | ⚠️ — bate onde existe; 3 requisitos sem asserção nenhuma |
| Cobertura por camada | ⚠️ — `revelador.tsx`, `pendencia.tsx` e `app/(admin)/admin/layout.tsx` sem teste |
| Todo teste mapeia para requisito | ✅ — nenhum teste órfão encontrado |
| Diretriz documentada seguida | ✅ — `AGENTS.md`, `docs/SETUP.md`, `eslint.config.mjs:25` (`no-restricted-imports` sobre `src/test/`) |

Achados de leitura, sem efeito de comportamento:

- `src/features/site/sections/atendimento.test.tsx:8` — docblock diz "4 contextos"; a constante e a spec dizem 5.
- `tests/rules/firestore.rules.test.ts:123,146` — `describe` com linha em branco onde o caso apagado morava.
- `src/features/site/seo.test.ts:25` assere `` `${perfil.nome} · ${perfil.papel}` `` contra `seo.ts:31`, que usa `metadadosDoSite.titulo`; passa porque hoje são iguais, e um dia falhará por um motivo diferente do que o nome do teste promete.

---

## 7. Edge cases

- [x] `imagemUrl` fora da allowlist → card sem imagem — `publicacao-artigo.test.tsx:94-104`
- [x] HTML bruto no markdown renderizado como texto — `corpo-markdown.test.tsx`
- [x] Slug duplicado bloqueado — `publicacao-form.test.tsx`
- [x] Título com 120 caracteres aceito, contador 120/120 — `schemas.test.ts:41-47` + `components/form/campo.tsx`
- [x] Firestore fora do ar → página de pé, seção em erro — `publicacoes-section.test.tsx:83`, `sitemap.test.ts:82-87`
- [x] Variável de ambiente ausente nomeada no erro — `src/lib/firebase/config.test.ts`
- [ ] **Sem JS, ou com o `Revelador` falhando, o conteúdo aparece mesmo assim** — a proteção existe (`globals.css:191` só esconde sob `[data-revelacao="ativa"]`, atributo que só o `Revelador` põe) e é a decisão certa, mas **não tem teste**: M17 sobrevive.

---

## 8. UAT pendente (navegador, com o João)

1. `/` em 360×640 — nenhuma rolagem horizontal (**SIT-04**).
2. Sistema em "reduzir movimento" — todas as seções visíveis, sem entrada animada (**SIT-06**).
3. Menu do celular: abrir, Esc, toque fora, foco preso, fundo travado, escolher item rola até a seção (**SIT-03**).
4. Painel: salvar → o toast aparece de verdade (o `Toaster` está montado); sair com texto não salvo → pergunta; "Ver a senha" no login.
5. Prévia do editor lado a lado com o artigo publicado.
6. Compartilhar `/` e uma publicação no WhatsApp — imagem OG e título corretos.
7. Contraste do dourado `#786418` sobre `#F7FBF1` e sobre `#EDF3E4` (AA).

---

## 9. Planos de correção

### Fix 1 — restaurar a negação de escrita nas regras · **Blocker** · ~10 linhas
- **Causa raiz**: `159c049` apagou o caso inteiro em vez da cláusula de `formacoes`.
- **Tarefa**: em `tests/rules/firestore.rules.test.ts`, no `describe("uid fora da allowlist")`, recriar `it("não escreve publicação")` com `assertFails(setDoc(...))` e `assertFails(deleteDoc(...))`.
- **Prova**: mutar `firestore.rules:176` para `if request.auth != null` e ver `npm run test:rules` reprovar.

### Fix 2 — travar a fiação do layout do painel · **Blocker** · ~30 linhas
- **Causa raiz**: nenhum teste renderiza `src/app/(admin)/admin/layout.tsx`; os testes montam `ProvedorDePendencia` por conta própria.
- **Tarefa**: `src/app/(admin)/admin/layout.test.tsx` — renderizar o layout com um filho que chame `usePendencia()` (não pode lançar) e asserir a região do `Toaster` no documento (sem `vi.mock("sonner")`).
- **Prova**: M26 e M27 passam a reprovar.

### Fix 3 — SIT-06 e o `Revelador` sob teste · **Major** · ~40 linhas
- **Causa raiz**: com `6439503` a decisão de movimento saiu do CSS e foi para JS (`window.matchMedia`) — passou a ser testável em jsdom, e a dívida "só fecha por UAT" ficou desatualizada.
- **Tarefa**: `src/components/layout/revelador.test.tsx` — com `matchMedia` devolvendo `matches: true`, `document.documentElement.dataset.revelacao` fica `undefined`; com `false`, vira `"ativa"`; disparar a entrada do observador dublê e conferir `data-revelado`. Somar um caso de que `<Revelador />` está montado na moldura pública.
- **Prova**: M16, M17 e M28 passam a reprovar. SIT-06 sai de "UAT" para "verificado + UAT visual".

### Fix 4 — ADM-09 por varredura · **Major** · ~30 linhas
- **Causa raiz**: requisito de ausência fechado por inspeção (lição **L-010**, reincidindo).
- **Tarefa**: teste de varredura no molde de `paleta-em-tokens.test.ts`, reprovando `window.confirm|alert|prompt` em `src/**` fora de `src/test/`, com caso positivo e negativo do detector.
- **Prova**: M29 passa a reprovar.

### Fix 5 — spec e tasks dizerem a verdade · **Major** · documentação
- Criar as tasks reais das Phases 11+ (competências/atendimento, formação fixa, rodapé, SEO, a11y/menu, motion, painel) ou trocar as citações T61–T64 pelos commits correspondentes.
- SIT-08, SIT-09 e FOR-01..FOR-04 de `Pending` para `Verified`; SEC-01, ADM-09 e SIT-06 de `Verified` para `Needs Fix` até os Fixes 1, 3 e 4.
- Corrigir `Coverage:` (32 vivos).
- Desambiguar `FOR-03` — o sentido "erro de leitura do Firestore" morreu com AD-046; tirar as menções da varredura de dimensões implícitas e dos Edge Cases, e corrigir AD-018 no `STATE.md`.

### Fix 6 — toasts e telas novas sem asserção · **Menor** · ~40 linhas
- Asserir `toast.success` (publicada / rascunho salvo / excluída) e o título de `naoExcluiu`; testar "Ver a senha" (`aria-pressed`, `type` alternando) e o diálogo `semSalvar` (aparece, confirmar navega, cancelar fica).
- **Prova**: M24 e M25 passam a reprovar.

**Custo total**: ~150 linhas de teste mais uma passagem de edição em `spec.md` / `tasks.md` / `STATE.md`. Uma sessão focada. **Nenhuma linha de código de produção precisa mudar** — o produto está certo; falta o que impede que deixe de estar.

---

## 10. O que este relatório NÃO cobre

1. **Nenhum navegador real.** 301 testes em jsdom: sem layout, sem cascata, sem media query nativa. SIT-04 segue sem qualquer evidência automatizada, e a paleta é conferida no **texto** do CSS, não no pixel.
2. **Nenhum Firestore de produção.** As regras foram provadas contra o emulador, com o uid da autora ainda em `COLE_AQUI_O_UID_DA_KEYLLA` (`firestore.rules:149`) e as regras não publicadas. O ruleset é compartilhado com o portfólio do João — publicar substitui os dois sites.
3. **Nenhuma prova de conteúdo real.** Os testes provam que o componente lê de `content/site.ts`; não provam que o texto lá é o que a Keylla escreveria.
4. **`NEXT_PUBLIC_SITE_URL` local aponta para localhost** — as URLs absolutas asseridas (`sitemap`, `Person`, `robots`) valem para o valor de ambiente, não para o domínio final.
5. **A fidelidade de `src/test/valores-da-spec.ts` à spec segue humana** (residual da iteração 4, lição L-017): mudar o número nos dois lados juntos passa verde.
6. **Sem E2E, sem acessibilidade automatizada, sem desempenho** — os dois primeiros fora de escopo por decisão registrada.

---

## 11. Rastreabilidade — atualização a aplicar em `spec.md`

O verificador não edita a spec. O que precisa mudar:

| Requisito | Status atual | Status correto |
| --------- | ------------ | -------------- |
| SIT-08, SIT-09, FOR-01, FOR-02, FOR-03, FOR-04 | `Pending`, tasks T61–T64 (inexistentes) | ✅ `Verified`, com as tasks reais criadas |
| SEC-01 | `Verified` | ❌ `Needs Fix` (Fix 1) |
| ADM-09 | `Verified` | ❌ `Needs Fix` (Fix 4) |
| SIT-06 | `Verified (UAT pendente)` | ❌ `Needs Fix` (Fix 3) |
| SIT-01..SIT-05, SIT-07, PUB-01..PUB-07, ADM-01..ADM-08, SEO-01, SEO-02 | `Verified` | ✅ mantém (SIT-04 e a rolagem de SIT-03 seguem com UAT pendente) |
| `Coverage: 33 total, 33 mapped` | — | 32 vivos; 6 apontam para tasks que não existem |

---

## Resumo

**Geral**: ❌ **Não pronto** — por verificação, não por comportamento.

**O que funciona**: as três seções novas (Pedagogia, Competências, Atendimento) estão ancoradas em literais da spec e matam mutação de conteúdo e de código; a formação fixa fecha FOR-01..FOR-04 com asserção que reprova ano inventado e junção invertida; o menu do celular tem Esc, retorno de foco e trava de rolagem sob teste; a prévia do editor está travada contra divergir do artigo público (AD-051); a paleta escurecida `#786418` está travada nos dois sentidos; o ano do rodapé sai do relógio. Gate limpo nos cinco comandos, com emulador e build rodados nesta sessão.

**O que quebrou**: a suíte de regras perdeu, num commit de limpeza, o único caso que provava SEC-01 — e a mutação correspondente sobrevive hoje. Os três consertos desta iteração (Toaster, provedor de pendência, `Revelador`) entraram sem teste que impeça o retorno: derrubar qualquer um dos três mantém 301/301 verde, e um deles quebra o painel inteiro em produção. ADM-09 e SIT-06 estão marcados `Verified` sem uma linha de evidência.

**O que segue aberto**: os 6 planos da §9 (~150 linhas de teste, nenhuma mudança de produção), a rastreabilidade da §3 (T61–T64 inventadas, 13 commits sem task, `FOR-03` com dois sentidos) e o UAT da §8.

**Próximo passo**: Fix 1 e Fix 2 primeiro — são blockers e custam ~40 linhas juntos. Depois Fix 3 e Fix 4, e só então reabrir a rastreabilidade.
