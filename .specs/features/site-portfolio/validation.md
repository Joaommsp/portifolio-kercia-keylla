# Site Portfólio — Validation

## Validation: site-portfolio — FAIL ❌

**Date**: 2026-09-01
**Spec**: `.specs/features/site-portfolio/spec.md`
**Diff range**: `e83d4ef..HEAD` (`c7e1eaa`) — lote de correção da Fase 7 (T41–T47); o veredito é sobre a feature inteira
**Verifier**: sub-agente independente, iteração 2 (autor ≠ verificador), evidência-ou-zero, cobertura re-derivada do zero
**Veredito**: ❌ **FAIL estreito** — as 7 lacunas da iteração 1 fecharam de verdade, mas o sensor desta rodada achou **4 mutantes novos sobreviventes** em 3 requisitos (SIT-01 rodapé, SIT-02, PUB-03)

---

## O que mudou desde a iteração 1

| Sinal | Iteração 1 (`e83d4ef`) | Iteração 2 (`c7e1eaa`) |
| ----- | ---------------------- | ---------------------- |
| Testes unitários | 272 em 33 arquivos | 294 em 36 arquivos |
| Testes de regra | nenhum (não sensoreável) | 10 em `npm run test:rules`, emulador de pé |
| Requisitos sem nenhuma evidência | 9 | 3 (SIT-02, SIT-04, SIT-05) + SIT-06 |
| Mutantes sobreviventes | 2 (M11, M30) | 4 (M52/M53, M54, M55) — outros 2 requisitos |

---

## Auditoria adversarial das 7 lacunas alegadas

Cada uma reconferida com asserção lida à mão **e** com mutação injetada em worktree isolada. Nenhuma
passou por alegação.

| # | Lacuna | Fechou? | Asserção que prova (não a presença da tag) | Mutação que a defende |
| - | ------ | ------- | ------------------------------------------ | --------------------- |
| 1 | SEO-02 Open Graph + JSON-LD `Person` | ✅ | `src/features/site/seo.test.ts:26-33` — `toMatchObject({type:"website",locale:"pt_BR",siteName:perfil.nome,title: "<nome> · <papel>" recomposto de perfil,description:…,url:"/"})`; `:83-92` — `expect(JSON.parse(jsonLdDaAutora)).toEqual({…8 campos…})`; `src/app/(site)/page.test.tsx:58` — `expect(JSON.parse(bloco?.textContent ?? "null")).toEqual(pessoaDaAutora)` | M35–M41: título do OG, `jobTitle`, `@type`, `url` relativa, `sameAs` vazio, `metadadosDoSite.titulo` reduzido ao nome e remoção do `<script ld+json>` da home — **7/7 mortos** |
| 2 | Teto de 20.000 ancorado no literal | ✅ | `src/features/publicacoes/schemas.test.ts:29` — `const LIMITE_DE_CORPO_DA_SPEC = 20000` (literal, não `LIMITES_PUBLICACAO.corpo`); `:86-88` — `.toBe("O corpo do texto deve ter no máximo 20000 caracteres.")` | M11 (`corpo: 20000 → 20001`) — **morto**, era o sobrevivente nº 1 |
| 3 | Contador distingue usado de limite | ✅ | `publicacao-form.test.tsx:124` — `getByText("6/120")`; `:130` — `getByText("120/120")` | M30 (`usados/usados`) — **morto**; e é o caso novo que mata: o antigo "120/120" segue passando sob o mutante |
| 4 | `generateMetadata` da rota do texto | ✅ | `src/app/(site)/publicacoes/[slug]/page.test.tsx:66-70`, `:78-84`, `:92-95` — título, description e canonical do título/resumo; OG com `type`, `url`, `publishedTime`; slug ausente sem `undefined` | M42–M46: título vindo do resumo, canonical na home, `type` website, `publishedTime` removido, `generateMetadata` devolvendo `{}` — **5/5 mortos** |
| 5 | `notFound()` para slug ausente **e** rascunho | ✅ (com ressalva) | `page.test.tsx:103-106` e `:115-119` — `rejects.toBe(RESPOSTA_404)` + `toHaveBeenCalledTimes(1)`; `:130` — no ar não chama | M47 (rota devolve moldura vazia em vez de `notFound()`) — **morto**. Ressalva: o caso "rascunho" usa o mesmo dublê `{dados:null}` do slug inexistente, então **não discrimina sozinho**; quem prova a metade do rascunho é `queries.test.ts:163-167` (`where publicado == true`) + `firestore.rules.test.ts:104-108` |
| 6 | Regras do Firestore com teste executável | ✅ | Suíte **rodada nesta sessão**: `npm run test:rules` com `export PATH="$(brew --prefix openjdk@21)/bin:$PATH"` → openjdk 21.0.12.1, emulador subiu, **10 passaram, exit 0** | R1 `allow get: if true`, R2 `allow list: if true`, R3 escrita para qualquer autenticado, R4 escrita livre em `formacoes` — **4/4 mortos** (a suíte sai com exit 1 em cada) |
| 7 | Link de volta para a home | ✅ | `page.test.tsx:140-142` — `getByRole("link",{name:secaoPublicacoes.voltar})` → `toHaveAttribute("href", CAMINHO_HOME)` | M48 (`href` para `/publicacoes`) — **morto** |

**Conclusão da auditoria**: 7/7 fecharam com asserção de valor, não de presença. Nenhuma alegação foi
aceita sem mutação correspondente.

---

## Spec-Anchored Acceptance Criteria — os 30 requisitos, re-derivados

### P1: Visitante entende o trabalho da AT

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SIT-01 home com hero → AT → Sobre → Formação → Publicações → contato → **rodapé** | ordem exata dos 7 blocos | `src/app/(site)/page.test.tsx:71-82` — `expect(…querySelectorAll("section[id]")…).toEqual([topo, at, sobre, formacao, publicacoes, contato])` | ⚠️ **Parcial** — 6 dos 7: o rodapé (`(site)/layout.tsx:10`) não é asserido em lugar nenhum (mutante M55 sobreviveu) |
| SIT-02 os 6 pilares saem de `content/site.ts`, sem texto duplicado em componente | exatamente 6 pilares renderizados, fonte única | — nenhuma asserção; implementação em `src/content/site.ts:100-137` + `src/features/site/sections/o-que-faz-uma-at.tsx:34-46`; não existe `o-que-faz-uma-at.test.tsx` | ❌ **Sem evidência** (mutantes M52 e M53 sobreviveram) |
| SIT-03 clique no menu rola até a seção | a âncora leva a uma seção existente na mesma página | `src/app/(site)/page.test.tsx:97-99` — para cada `a[href^="#"]` do header, `expect(container.querySelector(ancora)).not.toBeNull()` | ✅ PASS (M50 morto) |
| SIT-04 viewport de 360px sem rolagem horizontal | nenhuma barra horizontal em 360px | — não verificável em jsdom | ⏭️ **UAT pendente** — honestamente declarado, não maquiado |
| SIT-05 paleta por tokens, sem cor literal em componente | zero cor literal fora de `globals.css` | — nenhuma asserção; tokens em `src/app/globals.css:91-98` (`--ground`, `--surface`, `--olive`, `--brass` em oklch, com o hex só em comentário); `grep -rE "#[0-9a-f]{3,8}|\[#|rgb\(|hsl\(|oklch\(" --include=*.tsx src` → **0 ocorrências** | ⚠️ **Verdadeiro por varredura, sem teste** — nada trava a regressão |
| SIT-06 `prefers-reduced-motion: reduce` sem animação de entrada | todas as seções sem animação | — nenhuma asserção; implementação em `src/app/globals.css:169-177` (`animation-duration: 0.01ms !important` + `scroll-behavior: auto !important`) | ⏭️ **UAT pendente** — honestamente declarado |

### P1: Visitante lê as publicações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| PUB-01 lista `publicado == true`, `publicadoEm` desc, no máximo 6 | filtro + ordem + teto 6 | `src/features/publicacoes/queries.test.ts:83-87` — `toEqual([{where publicado == true},{orderBy publicadoEm desc},{limit LIMITE_PUBLICACOES_HOME}])`; `publicacoes-section.test.tsx:46-56` — recebe 8, renderiza 6 | ✅ PASS |
| PUB-02 detalhe com título, data, markdown e link de volta | os 4 elementos | `publicacao-artigo.test.tsx:33-48` (título, meta, corpo markdown); `src/app/(site)/publicacoes/[slug]/page.test.tsx:140-142` — link de volta com `href = CAMINHO_HOME` | ✅ PASS (M48 morto) |
| PUB-03 vazio exibe "Nenhuma publicação por aqui ainda." | **essa** frase | `publicacoes-section.test.tsx:60` — `getByText(secaoPublicacoes.vazio)` | ⚠️ **Não discrimina** — a asserção compara com a mesma constante que renderiza; trocar o texto em `content/site.ts:166` não reprova nada (mutante M54 sobreviveu) |
| PUB-04 slug ausente ou rascunho responde 404 | 404 nos dois casos | `page.test.tsx:103-106` e `:115-119` — `rejects.toBe(RESPOSTA_404)`; `queries.test.ts:163-167` — a leitura pública filtra `publicado == true`; `tests/rules/firestore.rules.test.ts:104-108` — anônimo não lê rascunho | ✅ PASS (M47, R1 mortos) |
| PUB-05 falha de leitura mostra a mensagem do Firebase, resto utilizável | mensagem traduzida do Firebase, página de pé | `queries.test.ts:115-117` — `toEqual({erro:"Você não tem permissão para esta operação."})`; `publicacoes-section.test.tsx:67` — `getByRole("alert")` com a mensagem; `src/app/(site)/page.tsx:29-32` mantém a outra seção | ✅ PASS |
| PUB-06 `imagemUrl` preenchida aparece no card e no detalhe | imagem nos dois lugares | `publicacao-card.test.tsx:48-55`; `publicacao-artigo.test.tsx:49-56` — `getByRole("img")` com o título como `alt` | ✅ PASS (M32, M34 mortos na iteração 1) |
| PUB-07 `<title>`, description e OG por publicação | do título e do resumo | `page.test.tsx:66-70` — `toBe("A AT não é babá")` / `toBe("O que separa acompanhamento terapêutico de cuidado.")`; `:78-84` — OG `toMatchObject` com `type`, `title`, `description`, `url`, `publishedTime` | ✅ PASS (M42–M46 mortos) |

### P1: Keylla publica sem depender de ninguém

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| ADM-01 sem sessão, `/admin` vai para `/admin/login` | redirect + conteúdo escondido | `painel-guard.test.tsx:65-66` — `toHaveBeenCalledWith(CAMINHO_LOGIN)` + `queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument()` | ✅ PASS (M14 morto) |
| ADM-02 credencial aceita leva para `/admin` | redirect para o painel | `login-form.test.tsx:60` — `toHaveBeenCalledWith(CAMINHO_PAINEL)` | ✅ PASS |
| ADM-03 credencial recusada mostra o erro em PT, sem revelar se o e-mail existe | mensagem traduzida e idêntica nos dois códigos | `login-form.test.tsx:71` — `getByRole("alert")).toHaveTextContent(CREDENCIAL_RECUSADA)`; `errors.test.ts:78-97` — mesma mensagem para `auth/user-not-found` e `auth/wrong-password` | ✅ PASS (M15, M16 mortos) |
| ADM-04 limites 120/220/20.000 e URL https válida bloqueiam o envio | os três tetos + allowlist https | `schemas.test.ts:47-60` (120/121 com a mensagem literal), `:67-76` (220/221), `:78-89` (**20000 literal / 20001 com a mensagem**), `:114-148` (https + allowlist + teto de 2048); `publicacao-form.test.tsx:133-179` — envio bloqueado e campo apontado | ✅ PASS (M9, M10, M12 mortos na it.1; M11 morto agora) |
| ADM-05 gravando desabilita os controles e mostra carregamento | tudo desabilitado | `publicacao-form.test.tsx:200-225` — cada controle `toBeDisabled()` + rótulo `emAndamento` | ✅ PASS (M33 morto) |
| ADM-06 excluir pede confirmação em dialog próprio | só remove após confirmar | `publicacoes-table.test.tsx:67-104` — clicar em excluir não chama `aoExcluir`; só o botão do diálogo chama; cancelar não chama | ✅ PASS (M13 morto) |
| ADM-07 falha de gravação preserva o formulário e mostra a mensagem | dados mantidos + mensagem do Firebase | `publicacao-form.test.tsx:226-…` — valores preservados + `getByRole("alert")`; `publicacao-editor.test.tsx:138-…` — não sai da tela | ✅ PASS |
| ADM-08 alternar persiste `publicado` e reflete na listagem | grava e recarrega | `publicacoes-painel.test.tsx:114-115` — `toHaveBeenCalledWith(publicacao)` + `listar` chamado 2×; `mutations.test.ts:223-244` — novo estado devolvido nos dois sentidos | ✅ PASS |
| ADM-09 nunca `window.confirm/alert/prompt` | nenhuma chamada nativa | `publicacoes-table.test.tsx:113` — `expect(confirmNativo).not.toHaveBeenCalled()` com `vi.spyOn(window,"confirm")`; `grep` em `src/**` → só menções em comentário (`confirmar-exclusao.tsx:6`, `publicacoes-table.tsx:6`) | ✅ PASS |

### P2: Formação e certificações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| FOR-01 `ordem` crescente, empate por `ano` decrescente | essa ordenação | `src/features/formacoes/queries.test.ts:61-92` — ordem asserida item a item; `painel.test.ts:32-49` idem no painel | ✅ PASS (M7, M8 mortos) |
| FOR-02 `em_andamento` com rótulo distinto de "Concluído" | dois rótulos distintos | `formacoes-section.test.tsx:47-59` — os dois rótulos presentes com classes distintas; `:60-65` — sufixo de continuidade no ano | ✅ PASS (M28 morto) |
| FOR-03 falha de leitura mostra a mensagem do Firebase | mensagem traduzida | `formacoes-section.test.tsx:88-97` — `getByRole("alert")` com a mensagem | ✅ PASS |
| FOR-04 sem formações, a seção some inteira, inclusive o título | nada renderizado | `formacoes-section.test.tsx:79-87` — `queryByText(secaoFormacao.titulo)).not.toBeInTheDocument()` | ✅ PASS (M17 morto) |
| FOR-05 CRUD de formação com as mesmas regras da P1 | validação, confirmação e erro iguais | `formacao-form.test.tsx:57-160` (limites, desabilitar ao salvar, erro do Firebase); `formacoes-painel.test.tsx:169-200` (exclui só após confirmar; cancelar não exclui) | ✅ PASS |

### P3: Encontrabilidade

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEO-01 `robots.txt` + `sitemap.xml` com `/` e cada publicação no ar | as duas rotas, URLs absolutas, sem `/admin` | `robots.test.ts:14-26` — libera tudo, bloqueia `/admin`, aponta o sitemap absoluto; `sitemap.test.ts:40-95` — home + cada publicada em URL absoluta, leitura filtrada, `/admin` ausente, degrada para só a home no erro | ✅ PASS (M21, M22, M23 mortos) |
| SEO-02 Open Graph + dados estruturados `Person` na home | campos do OG e do `Person` | `src/features/site/seo.test.ts:26-33`, `:37-41`, `:45-50`, `:54`, `:60-65`, `:69`, `:73-74`, `:78-79`, `:83-92`; `src/app/(site)/page.test.tsx:47`, `:57-58` | ✅ PASS (M35–M41 mortos) |

### Segurança

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEC-01 escrita restrita ao uid da allowlist | uid de fora não escreve; anônimo não lê rascunho | `tests/rules/firestore.rules.test.ts:104-108` (anônimo não lê rascunho), `:110-119` (lista sem filtro negada, com filtro aceita), `:121-129` (anônimo não escreve), `:140-156` (autora lê rascunho e escreve), `:160-172` (uid de fora não escreve nem lê rascunho) | ✅ PASS (R1–R4 mortos) — **suíte rodada nesta sessão**, 10/10, exit 0 |

**Status**: 25/30 ✅ · 1 ⚠️ parcial (SIT-01) · 2 ⚠️ sem discriminação (PUB-03, SIT-05) · 1 ❌ sem
evidência (SIT-02) · 2 ⏭️ UAT (SIT-04, SIT-06 — declarados como não cobertos, confirmado honesto).

---

## Edge Cases

| Edge case da spec | `arquivo:linha` + asserção | Resultado |
| ----------------- | -------------------------- | --------- |
| `imagemUrl` fora da allowlist renderiza sem imagem, sem quebrar | `publicacao-card.test.tsx:67-78`; `publicacao-artigo.test.tsx:87-96`; `corpo-markdown.test.tsx:65-76`; `schemas.test.ts:161-166` (subdomínio parecido recusado) | ✅ |
| HTML bruto no markdown vira texto, não executa | `corpo-markdown.test.tsx:30-43` — `container.querySelector("button")` nulo + o texto literal presente | ✅ |
| Slug duplicado bloqueia a segunda gravação | `mutations.test.ts:112-121` e `:182-191` — `toEqual({erro: MENSAGEM_SLUG_EM_USO})` + `addDoc` não chamado; `:171-180` aceita o próprio slug | ✅ (M5 morto) |
| Título com 120 é aceito e o contador indica 120/120 | `publicacao-form.test.tsx:92-110` (120/120 + grava) e `:112-131` (**6/120**, que é o caso que discrimina) | ✅ (M30 morto) |
| Firestore fora do ar mantém a página de pé | `queries.test.ts:130-138`; `publicacoes-section.test.tsx:64-70`; observado no `npm run build` desta sessão (home em `permission-denied` e build exit 0) | ✅ |
| Variável de ambiente ausente nomeia a variável | `src/lib/firebase/config.test.ts:39-45`, `:47-58`, `:60-69` | ✅ (M26 morto) |

---

## Discrimination Sensor

**Isolamento**: duas worktrees temporárias (`git worktree add … HEAD --detach`) com `node_modules` por
symlink; cada mutação revertida com `git checkout --`; worktrees removidas com `git worktree remove
--force` + `prune`. **Nunca `git stash`, nunca a árvore real.** Baseline `git status --porcelain`
vazio capturado antes e conferido por `diff` depois — idêntico.

**Profundidade**: P0-full, focada no diff `e83d4ef..HEAD` e nos pontos que o sensor da iteração 1 não
alcançou (regras do Firestore, camada `app/`, metadados).

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| M11 | `LIMITES_PUBLICACAO.corpo` 20000 → 20001 | `src/features/publicacoes/schemas.ts:38` | ✅ Morto (era sobrevivente) |
| M30 | Contador imprime `usados/usados` | `src/components/form/campo.tsx:38` | ✅ Morto (era sobrevivente) |
| M35 | OG da home: `title` vira só `perfil.nome` | `src/features/site/seo.ts:31` | ✅ Morto |
| M36 | `Person.jobTitle` recebe o nome no lugar do papel | `src/features/site/seo.ts:53` | ✅ Morto |
| M37 | `Person.@type` `Person` → `Organization` | `src/features/site/seo.ts:51` | ✅ Morto |
| M38 | `Person.url` relativa em vez de absoluta | `src/features/site/seo.ts:55` | ✅ Morto |
| M39 | `Person.sameAs` vazio (sem Instagram) | `src/features/site/seo.ts:56` | ✅ Morto |
| M40 | `metadadosDoSite.titulo` perde o papel | `src/content/site.ts:49` | ✅ Morto |
| M41 | Home deixa de imprimir o `<script ld+json>` | `src/app/(site)/page.tsx:38-41` | ✅ Morto |
| M42 | Metadados do texto: `title` vem do resumo | `src/features/publicacoes/seo.ts:29` | ✅ Morto |
| M43 | Canonical do texto aponta para `/` | `src/features/publicacoes/seo.ts:31` | ✅ Morto |
| M44 | OG do texto `type` `article` → `website` | `src/features/publicacoes/seo.ts:33` | ✅ Morto |
| M45 | OG do texto sem `publishedTime` | `src/features/publicacoes/seo.ts:37` | ✅ Morto |
| M46 | `generateMetadata` devolve `{}` sempre | `src/app/(site)/publicacoes/[slug]/page.tsx:49` | ✅ Morto |
| M47 | Rota devolve moldura vazia em vez de `notFound()` | `src/app/(site)/publicacoes/[slug]/page.tsx:66-68` | ✅ Morto |
| M48 | Link de volta aponta para `/publicacoes` | `src/app/(site)/publicacoes/[slug]/page.tsx:83` | ✅ Morto |
| M49 | Ordem das seções: Sobre antes de "O que faz uma AT" | `src/app/(site)/page.tsx:43-45` | ✅ Morto |
| M50 | Âncora "Sobre" do menu aponta para seção inexistente | `src/content/site.ts:58` | ✅ Morto |
| M51 | Seção de formação sai da home | `src/app/(site)/page.tsx:46` | ✅ Morto |
| **M52** | **Um dos 6 pilares removido do conteúdo (ficam 5)** | `src/content/site.ts:131-136` | ❌ **Sobreviveu** (294/294 passam) |
| **M53** | **Componente renderiza `pilares.slice(0,3)` — 3 de 6** | `src/features/site/sections/o-que-faz-uma-at.tsx:34` | ❌ **Sobreviveu** (294/294 passam) |
| **M54** | **Mensagem de vazio vira "Nada por aqui."** | `src/content/site.ts:166` | ❌ **Sobreviveu** (294/294 passam) |
| **M55** | **Rodapé sai do layout do site** | `src/app/(site)/layout.tsx:10` | ❌ **Sobreviveu** (294/294 passam) |
| R1 | `allow get: if true` — anônimo lê rascunho | `firestore.rules:42` | ✅ Morto (2 casos reprovam) |
| R2 | `allow list: if true` — anônimo lista a coleção | `firestore.rules:55` | ✅ Morto |
| R3 | Escrita liberada para qualquer autenticado | `firestore.rules:57` | ✅ Morto |
| R4 | Escrita de `formacoes` liberada para todos | `firestore.rules:63` | ✅ Morto |

**Resultado**: **23/27 mortos, 4 sobreviventes** — ❌ FAIL.
Os 27 desta rodada somam-se aos 30 da iteração 1 (28 mortos lá, com M11 e M30 agora fechados).

---

## Gate Check

| Comando | Resultado |
| ------- | --------- |
| `npm test -- --run` | **294 passaram**, 0 falharam, 0 pulados — 36 arquivos |
| `npm run test:rules` | **10 passaram**, exit 0 — emulador do Firestore com openjdk 21.0.12.1 (`export PATH="$(brew --prefix openjdk@21)/bin:$PATH"`) |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 — 9 rotas; `/` e `/sitemap.xml` com `revalidate 5m` |

- **Antes da Fase 7**: 272 em 33 arquivos · **depois**: 294 em 36 arquivos + 10 de regra · **delta**: +22 unitários, +10 de regra
- **Pulados**: nenhum. **Asserção enfraquecida**: nenhuma — o diff de `schemas.test.ts` troca a comparação contra a constante por comparação contra o literal e a mensagem, o que é mais forte
- **Ruído esperado do ambiente**: o build loga `permission-denied` do Firestore ao pré-renderizar a home. As regras ainda não foram publicadas e o uid da autora é placeholder (`firestore.rules:31`). É estado do ambiente, não defeito — a home degrada para o estado de erro em vez de derrubar o build, que é PUB-05/FOR-03 funcionando

---

## Code Quality

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem feature além do pedido | ✅ |
| Sem abstração para uso único | ✅ (`features/site/seo.ts` e `features/publicacoes/seo.ts` são simétricos e cada um tem consumidor real) |
| Só os arquivos necessários tocados | ✅ |
| Segue o padrão do projeto | ✅ (AD-002: `app/` só roteia; a montagem de metadados foi movida para a feature no lote da Fase 7) |
| Verificação ancorada na spec (valor asserido = valor da spec) | ⚠️ PUB-03 compara com a própria constante (M54); SIT-01 não cobre o rodapé (M55) |
| Cobertura por camada: domínio 1:1 com ACs; rotas com feliz + borda + erro | ✅ rotas agora cobertas (metadados, 404, ordem, âncoras); ⚠️ seções estáticas da home seguem sem teste |
| Todo teste mapeia para requisito/edge case/Done-when — sem teste órfão | ✅ |
| Diretrizes documentadas seguidas | ✅ `tasks.md` (Test Coverage Matrix) + defaults da skill |
| Anti-hardcode | ✅ zero cor literal em `.tsx` (varredura por `#hex`, `[#`, `rgb(`, `hsl(`, `oklch(`); limites, rotas, textos e allowlist centralizados |
| Moeda em BRL completo | N/A — o projeto não exibe valores monetários |

---

## Gaps ranqueados

1. **SIT-02 sem nenhuma evidência (Major)** — a spec fixa **6** pilares; nada conta os pilares
   renderizados. Mutantes M52 (5 pilares no conteúdo) e M53 (`pilares.slice(0,3)` no componente)
   passam com 294/294. Não existe `o-que-faz-uma-at.test.tsx`.
   **Correção**: teste da seção asserindo `getAllByRole("article")` com length `secaoAt.pilares.length`,
   `expect(secaoAt.pilares).toHaveLength(6)` e que cada `pilar.titulo` aparece na tela.

2. **PUB-03 não discrimina a mensagem que a spec escreve (Major)** — `publicacoes-section.test.tsx:60`
   compara com `secaoPublicacoes.vazio`, a mesma constante que o componente renderiza; trocar o texto
   move os dois lados (M54 sobrevive). É a **mesma classe** do M11 que a Fase 7 fechou só no schema.
   **Correção**: asserir o literal `"Nenhuma publicação por aqui ainda."` (ou
   `expect(secaoPublicacoes.vazio).toBe("Nenhuma publicação por aqui ainda.")`).

3. **SIT-01 cobre 6 dos 7 blocos: o rodapé não é asserido (Minor)** — o teste de ordem varre
   `section[id]` e o rodapé é um `<footer>` em `(site)/layout.tsx:10`. M55 remove o rodapé e nada
   reprova.
   **Correção**: um teste do `SiteLayout` (ou do `SiteFooter`) asserindo `getByRole("contentinfo")`
   depois do `<main>`.

4. **SIT-05 verdadeiro por varredura, sem trava (Minor)** — a paleta está em token e não há cor
   literal em `.tsx` hoje, mas nada impede a regressão.
   **Correção barata**: regra de lint (`no-restricted-syntax` sobre `[#` e `#hex` em `className`) ou
   um teste de varredura sobre `src/**/*.tsx`.

5. **SIT-04 e SIT-06 seguem só em UAT (aceito)** — declarados como não cobertos no relatório e na
   tabela abaixo. **Confirmado honesto**: nenhum teste finge cobri-los, e a implementação de SIT-06
   existe e é citável (`globals.css:169-177`) mas jsdom não avalia media query.

6. **Observação, não gap — PUB-04 rascunho é redundante no nível da rota** — o caso "rascunho" usa o
   mesmo dublê `{dados:null}` do slug inexistente, então sozinho não prova nada sobre rascunho. O
   requisito está defendido em duas camadas asseridas (`queries.test.ts:163-167` e
   `firestore.rules.test.ts:104-108`), então **conta como coberto**. Vale registrar para não virar
   falsa segurança se a leitura pública mudar de contrato.

---

## Interactive UAT — pendente

Não executado nesta sessão (sem navegador). Continua devendo:

| Critério | Como conferir |
| -------- | ------------- |
| SIT-04 — viewport de 360px sem rolagem horizontal | DevTools → dispositivo de 360px, percorrer a home inteira e a página de um texto: nenhuma barra horizontal, nenhum bloco cortado |
| SIT-06 — `prefers-reduced-motion: reduce` sem animação de entrada | macOS: Ajustes → Acessibilidade → Vídeo → Reduzir movimento (ou DevTools → Rendering → Emulate `prefers-reduced-motion`), recarregar e conferir que nada anima e que a rolagem do menu é instantânea |

---

## Requirement Traceability Update

| Requirement | Status anterior | Novo status |
| ----------- | --------------- | ----------- |
| SIT-01 | ⚠️ sem verificação automatizada | ⚠️ Verificado parcialmente (rodapé sem asserção) |
| SIT-02 | ⚠️ sem verificação automatizada | ❌ Precisa de correção (sem evidência; 2 mutantes sobrevivem) |
| SIT-03 | ⚠️ sem verificação automatizada | ✅ Verificado |
| SIT-04, SIT-06 | ⚠️ sem verificação automatizada | ⏭️ UAT pendente (aceito, declarado) |
| SIT-05 | ⚠️ sem verificação automatizada | ⚠️ Verificado por varredura, sem trava |
| PUB-01, PUB-05, PUB-06 | ✅ Verificado | ✅ Verificado |
| PUB-02, PUB-04, PUB-07 | ⚠️ parcial / sem evidência | ✅ Verificado |
| PUB-03 | ✅ Verificado | ⚠️ Verificado parcialmente (mensagem não discrimina) |
| ADM-01..ADM-03, ADM-05..ADM-09 | ✅ Verificado | ✅ Verificado |
| ADM-04 | ⚠️ parcial (teto do corpo frouxo) | ✅ Verificado |
| FOR-01..FOR-05 | ✅ Verificado | ✅ Verificado |
| SEO-01 | ✅ Verificado | ✅ Verificado |
| SEO-02 | ❌ não implementado | ✅ Verificado |
| SEC-01 | ⚠️ verificado por leitura | ✅ Verificado (emulador, 10 testes, 4 mutações mortas) |

---

## Summary

**Geral**: ❌ **Não pronto** — por 3 requisitos de apresentação sem asserção discriminante, não pelo
que a Fase 7 se propôs a corrigir.

**Check ancorado na spec**: 25/30 ACs com asserção casando com o resultado da spec · 3 parciais ·
1 sem evidência · 2 em UAT declarado.
**Sensor**: 23/27 mortos nesta rodada (4 sobreviventes novos), incluindo 4/4 nas regras do Firestore.
**Gate**: 294 unitários + 10 de regra · tsc, lint e build limpos.

**O que funciona**: as 7 correções da Fase 7 são reais e discriminantes — nenhuma passou por
alegação. A camada `app/` deixou de ser cega (metadados, 404, ordem das seções, âncoras) e SEC-01
saiu de "verificado por leitura" para verificado por emulador, com 4 afrouxamentos de regra mortos.

**Onde dói**: o que restou é o conteúdo estático da home. Três valores que a spec fixa por extenso —
6 pilares, a frase de vazio e o rodapé na ordem das seções — não têm asserção que os trave, e um
deles (a frase) repete a armadilha do M11: o teste compara com a constante que ele deveria auditar.

**Próximos passos**: fechar os gaps 1–3 (dois testes novos e uma asserção literal), decidir se SIT-05
ganha trava de lint, e rodar o UAT de SIT-04 e SIT-06 em navegador.
