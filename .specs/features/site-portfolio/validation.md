# Site Portfólio — Validation

## Validation: site-portfolio — FAIL ❌ (estreito · iteração 3 de 3 · escalar)

**Date**: 2026-09-01
**Spec**: `.specs/features/site-portfolio/spec.md` (30 requisitos)
**Diff range**: `ddb79d4..HEAD` (`b80226f`) — lote da Fase 8 (T48–T52); o veredito é sobre a feature inteira
**Verifier**: sub-agente independente, iteração 3 (autor ≠ verificador), evidência-ou-zero, cobertura re-derivada do zero
**Veredito**: ❌ **FAIL estreito** — as 4 lacunas da iteração 2 fecharam com asserção discriminante (4/4 mutantes mortos por injeção, nenhuma aceita por alegação). O sensor desta rodada achou **2 sobreviventes materiais novos**, ambos fora do que a Fase 8 se propôs a corrigir: o teto de 6 publicações de PUB-01 e a metade positiva de SIT-05.

> **Limite do laço atingido.** A skill limita o ciclo corrigir→re-verificar a 3 iterações. Esta é a
> terceira. Em vez de abrir uma quarta, o que restou vai ao usuário com materialidade e custo por
> item (seção 7).

---

## O que mudou desde a iteração 2

| Sinal | Iteração 1 (`e83d4ef`) | Iteração 2 (`c7e1eaa`) | Iteração 3 (`b80226f`) |
| ----- | ---------------------- | ---------------------- | ---------------------- |
| Testes unitários | 272 em 33 arquivos | 294 em 36 | **304 em 38** |
| Testes de regra | nenhum | 10, exit 0 | **10, exit 0** (rodados nesta sessão) |
| Requisitos sem nenhuma evidência | 9 | 3 + SIT-06 | **0** |
| Requisitos parciais (teste não discrimina) | — | 3 (SIT-01, PUB-03, SIT-05) | **2 (PUB-01, SIT-05)** |
| Mutantes sobreviventes | 2 | 4 | **2 materiais** (+1 menor, +1 esperado de UAT) |

---

## 1. Auditoria adversarial das 4 lacunas alegadas

Cada uma reconferida lendo a asserção à mão **e** injetando o mutante correspondente em worktree
isolada. Nenhuma passou por alegação.

| # | Lacuna da iteração 2 | Fechou? | Asserção que prova (`arquivo:linha` + expressão) | Mutante injetado agora |
| - | -------------------- | ------- | ----------------------------------------------- | ---------------------- |
| 1 | **SIT-02** — contagem dos pilares sem evidência | ✅ | `src/features/site/sections/o-que-faz-uma-at.test.tsx:12` — `const PILARES_DA_SPEC = 6` (**literal da spec**, não `pilares.length`); `:16` — `expect(secaoAt.pilares).toHaveLength(PILARES_DA_SPEC)`; `:22` — `expect(screen.getAllByRole("article")).toHaveLength(PILARES_DA_SPEC)`; `:32` — `expect(titulos).toEqual(secaoAt.pilares.map((p) => p.titulo))` | **A1** (pilar "Parceria com a família" removido de `content/site.ts:131-137`) → **morto**, 2 testes reprovam · **A2** (`secaoAt.pilares.slice(0, 3).map` em `o-que-faz-uma-at.tsx:34`) → **morto**, 2 testes reprovam |
| 2 | **PUB-03** — vazio comparado com a própria constante | ✅ | `src/features/publicacoes/components/publicacoes-section.test.tsx:19` — `const MENSAGEM_DE_VAZIO_DA_SPEC = "Nenhuma publicação por aqui ainda."` (**literal**); `:67` — `getByText(MENSAGEM_DE_VAZIO_DA_SPEC)`; `:72` — `expect(secaoPublicacoes.vazio).toBe(MENSAGEM_DE_VAZIO_DA_SPEC)`, o caso que amarra o texto do site ao texto da spec | **A3** (`content/site.ts:166` → `"Nada por aqui."`) → **morto** · **C9** (componente troca a constante por literal próprio) → **morto**. A armadilha do M11/M54 está fechada aqui |
| 3 | **SIT-01** — rodapé fora da asserção de ordem | ✅ | `src/app/(site)/page.test.tsx:95-103` — `expect(blocosNaOrdem(container)).toEqual([topo, at, sobre, formacao, publicacoes, contato, RODAPE])`, com a home renderizada **dentro do `SiteLayout`** (`:52-56`), que é quem traz o rodapé; `:111` — `getByRole("contentinfo")`; `:112-116` — `toEqual(["MAIN","FOOTER"])` | **A4** (`<SiteFooter />` fora de `(site)/layout.tsx:10`) → **morto**, 2 testes reprovam · **C4** (rodapé **antes** do `<main>`) → **morto** · **D7** (Sobre antes de "O que faz uma AT") → **morto** |
| 4 | **SIT-05** — sem trava contra cor literal | ⚠️ **Parcial** | `src/test/paleta-em-tokens.test.ts:65` — `expect(infratores).toEqual([])` sobre todo `.ts`/`.tsx` de `src/` (menos os testes), **arquivo inteiro**; `:53-54` — auto-guarda da varredura (`arquivos.length > 10` + `toContain("app/layout.tsx")`) | **B1** hex em `className` → morto · **B2** hex dentro do `cva` de `components/ui/button.tsx` → morto · **B3** hex em `style` inline → morto · **B7** `RAIZ` apontada para `src/features` → morto. **Mas 3 burlas passam** — 1.1 |

### 1.1 A trava de SIT-05 sob tentativa de burla

Pergunta pedida: ela pega cor literal em `className`, em `style` inline **e** dentro de `cva`?
**Sim nos três** (B1, B2, B3 mortos), e ainda se auto-guarda contra varrer a pasta errada (B7).
O que ela **não** pega:

| Burla | O que injetei | Resultado |
| ----- | ------------- | --------- |
| **B4** | `className="… bg-emerald-200 text-rose-600"` em `hero.tsx` | ❌ **Sobreviveu** — 304/304 verdes. Classe da paleta padrão do Tailwind não casa com `#hex` nem com `rgb(`/`oklch(`. **E isso já está no código hoje**: `src/components/ui/dialog.tsx:34` e `src/components/ui/alert-dialog.tsx:33` trazem `bg-black/10`, com a suíte verde |
| **B5** | `style={{ color: "white", background: "darkolivegreen" }}` em `site-footer.tsx` | ❌ **Sobreviveu** — cor nomeada do CSS não é hexadecimal nem função de cor |
| **B6** | `--olive: oklch(0.4479 0.0624 125.96)` → `oklch(0.5000 0.2000 29.00)` em `globals.css` (oliva vira vermelho) | ❌ **Sobreviveu** — a trava exclui `.css` **de propósito** (é onde o token nasce), então **nada** amarra os tokens aos quatro valores que a spec escreve por extenso |

**Leitura**: a trava fecha a cláusula **negativa** de SIT-05 ("sem cor literal em componente") para o
antipadrão que o projeto realmente usa, e o docblock em `paleta-em-tokens.test.ts:6-8` promete um
pouco mais do que entrega ("nenhum arquivo de código escreve cor à mão" — `bg-black/10` escreve). A
cláusula **positiva** ("aplicar a paleta aprovada `#EDF3E4`/`#F7FBF1`/`#4C5B34`/`#8E7A32`") segue com
zero asserção: os quatro valores existem só como comentário em `globals.css:91-98`. O ponto já estava
listado como aberto pelos revisores da Fase 8 no `STATE.md` — o que esta rodada acrescenta é a prova
empírica de que sobrevive.

---

## 2. Cobertura ancorada na spec — os 30 requisitos, re-derivados

Evidência-ou-zero: requisito sem `arquivo:linha` localizado conta como não coberto.

### P1: Visitante entende o trabalho da AT

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SIT-01 hero → AT → Sobre → Formação → Publicações → contato → rodapé | ordem exata dos 7 blocos | `src/app/(site)/page.test.tsx:95-103` — `toEqual([…6 âncoras…, RODAPE])` sobre `querySelectorAll("section[id], footer")`; `:111-116` — `contentinfo` + `["MAIN","FOOTER"]` | ✅ **PASS** (A4, C4, D7 mortos) |
| SIT-02 6 pilares vindos de `content/site.ts`, sem texto duplicado em componente | exatamente 6, fonte única | `o-que-faz-uma-at.test.tsx:12,16,22,32` | ⚠️ **PASS com ressalva** — contagem e **títulos** travados; a **descrição** não: fixá-la no componente (C6) passa 304/304 |
| SIT-03 clique no menu rola até a seção | âncora do menu leva a seção existente | `page.test.tsx:127` — `expect(ancorasDoMenu.length).toBeGreaterThan(0)`; `:132` — para cada `a[href^="#"]` do header, `expect(container.querySelector(ancora)).not.toBeNull()` | ✅ **PASS** (D5b morto) |
| SIT-04 viewport de 360px sem rolagem horizontal | nenhuma barra horizontal | — nenhuma asserção; `grep -rn '360'` nos testes → **0 ocorrências** | ⏭️ **UAT pendente** — **confirmado honesto**, ninguém maquia |
| SIT-05 paleta aprovada por tokens, sem cor literal em componente | 4 hex aprovados aplicados **e** zero cor literal | `src/test/paleta-em-tokens.test.ts:65` (cláusula negativa) + `:53-54` (auto-guarda); tokens em `src/app/globals.css:91-98` | ⚠️ **Parcial** — cláusula negativa travada para hex/função de cor (B1–B3, B7 mortos); cláusula positiva **sem evidência** (B6 sobrevive) e burla por classe Tailwind/cor nomeada (B4, B5) |
| SIT-06 `prefers-reduced-motion: reduce` sem animação de entrada | todas as seções sem animação | — nenhuma asserção; `grep 'reduced-motion|matchMedia'` nos testes → **0**; implementação em `globals.css:169-177` | ⏭️ **UAT pendente** — **confirmado honesto** (C5 sobrevive, como esperado: jsdom não avalia media query) |

### P1: Visitante lê as publicações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| PUB-01 lista `publicado == true`, `publicadoEm` desc, **no máximo 6** | filtro + ordem + teto **6** | `src/features/publicacoes/queries.test.ts:83-88` — `toEqual([{where publicado==true},{orderBy publicadoEm desc},{limit LIMITE_PUBLICACOES_HOME}])`; `publicacoes-section.test.tsx:56-61` — recebe 8, `toHaveLength(LIMITE_PUBLICACOES_HOME)` + "Publicação 7" ausente | ⚠️ **Parcial** — filtro e ordem travados (C3 morto), teto **não**: os dois lados leem `LIMITE_PUBLICACOES_HOME`. **C1 sobrevive** (6→5, 304/304 verdes). O literal `6` da spec só aparece no **nome** do teste (`queries.test.ts:77`), que não asserta nada |
| PUB-02 detalhe com título, data, markdown e link de volta | os 4 elementos | `publicacao-artigo.test.tsx:33-46`; `src/app/(site)/publicacoes/[slug]/page.test.tsx:135-142` — link com `secaoPublicacoes.voltar` e `href` da home | ✅ PASS |
| PUB-03 vazio exibe "Nenhuma publicação por aqui ainda." | **essa** frase | `publicacoes-section.test.tsx:19,67,72` | ✅ **PASS** (A3, C9 mortos) |
| PUB-04 slug ausente ou rascunho → 404 | 404 nos dois casos | `page.test.tsx:100-106` e `:109-119` — `rejects.toBe(RESPOSTA_404)` + `notFound` 1×; `:122-130` — no ar não chama; `queries.test.ts:158-168` — `obterPorSlug` filtra `slug` **e** `publicado == true`; `tests/rules/firestore.rules.test.ts:104-108` | ✅ PASS (D3, C2, R5 mortos) |
| PUB-05 falha de leitura mostra a mensagem do Firebase, resto utilizável | mensagem traduzida, página de pé | `queries.test.ts:107-118`; `publicacoes-section.test.tsx:78` — `getByRole("alert")` com a mensagem; `src/app/(site)/page.tsx:29-32` | ✅ PASS |
| PUB-06 `imagemUrl` aparece no card e no detalhe | imagem nos dois lugares | `publicacao-card.test.tsx:48-55`; `publicacao-artigo.test.tsx:49-56` | ✅ PASS |
| PUB-07 `<title>`, description e OG por publicação | do título e do resumo | `page.test.tsx:66-70`, `:73-85`, `:87-95` | ✅ PASS |

### P1: Keylla publica sem depender de ninguém

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| ADM-01 sem sessão, `/admin` → `/admin/login` | redirect + conteúdo escondido | `painel-guard.test.tsx:60-66` — `toHaveBeenCalledWith(CAMINHO_LOGIN)` + conteúdo ausente; `:48-58` carregando; `:81-89` login sem laço | ✅ PASS |
| ADM-02 credencial aceita → `/admin` | redirect para o painel | `login-form.test.tsx:50-60` — `toHaveBeenCalledWith(CAMINHO_PAINEL)` | ✅ PASS |
| ADM-03 credencial recusada: erro em PT, sem revelar se o e-mail existe | mensagem traduzida e idêntica nos dois códigos | `login-form.test.tsx:64-71`; `src/lib/firebase/errors.test.ts:78-97` — mesma mensagem para `auth/user-not-found` e `auth/wrong-password` | ✅ PASS |
| ADM-04 limites 120/220/20.000 e URL https válida bloqueiam o envio | os três tetos + allowlist https | `schemas.test.ts:47-60` (120/121), `:67-76` (220/221), `:78-89` (**20000 literal** + mensagem que cita 20000), `:110-149` (https + allowlist + teto); `publicacao-form.test.tsx:133-179` | ✅ PASS (D1 morto) |
| ADM-05 gravando desabilita controles e mostra carregamento | tudo desabilitado | `publicacao-form.test.tsx:200-225` — cada controle `toBeDisabled()`; `login-form.test.tsx:87-106`; `formacao-form.test.tsx:116-142` | ✅ PASS |
| ADM-06 excluir pede confirmação em dialog próprio | só remove após confirmar | `publicacoes-table.test.tsx:67-104` — acionar não exclui, confirmar exclui, cancelar não | ✅ PASS |
| ADM-07 falha de gravação preserva o formulário e mostra a mensagem | dados mantidos + mensagem do Firebase | `publicacao-form.test.tsx:226-…`; `publicacoes-painel.test.tsx:134-148` | ✅ PASS |
| ADM-08 alternar persiste `publicado` e reflete na listagem | grava e recarrega | `publicacoes-painel.test.tsx:104-116`; `publicacoes-table.test.tsx:130-138`; `mutations.test.ts:223-244` | ✅ PASS |
| ADM-09 nunca `window.confirm/alert/prompt` | nenhuma chamada nativa | `publicacoes-table.test.tsx:105-116` — `expect(confirmNativo).not.toHaveBeenCalled()` com `vi.spyOn(window,"confirm")` | ✅ PASS |

### P2: Formação e certificações

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| FOR-01 `ordem` asc, empate por `ano` desc | essa ordenação | `formacoes/queries.test.ts:61-92` — ordem item a item; `:93-117` sentinelas | ✅ PASS |
| FOR-02 `em_andamento` com rótulo distinto de "Concluído" | dois rótulos distintos | `formacoes-section.test.tsx:47-59` — rótulos **literais** com classes distintas; `:60-65` sufixo de continuidade | ✅ PASS (D4 morto) |
| FOR-03 falha de leitura mostra a mensagem do Firebase | mensagem traduzida | `formacoes-section.test.tsx:88-97`; `formacoes/queries.test.ts:149-161` | ✅ PASS |
| FOR-04 sem formações, a seção some inteira, inclusive o título | nada renderizado | `formacoes-section.test.tsx:79-87` — `queryByText(secaoFormacao.titulo)).not.toBeInTheDocument()` | ✅ PASS (D6 morto) |
| FOR-05 CRUD de formação com as mesmas regras da P1 | validação, confirmação e erro iguais | `formacao-form.test.tsx:57-160`; `formacoes-painel.test.tsx:169-212` | ✅ PASS |

### P3: Encontrabilidade

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEO-01 `robots.txt` + `sitemap.xml` com `/` e cada publicação no ar | as duas rotas, URLs absolutas, sem `/admin` | `robots.test.ts:14-26`; `sitemap.test.ts:40-95` — home + cada publicada absoluta, leitura filtrada, `/admin` ausente, degrada para só a home no erro | ✅ PASS |
| SEO-02 Open Graph + `Person` na home | campos do OG e do `Person` | `src/features/site/seo.test.ts:25-92` — campo a campo; `page.test.tsx:81-82` — `JSON.parse(bloco.textContent)).toEqual(pessoaDaAutora)` | ✅ PASS |

### Segurança

| Critério | Resultado definido pela spec | `arquivo:linha` + asserção | Resultado |
| -------- | ---------------------------- | -------------------------- | --------- |
| SEC-01 escrita restrita ao uid da allowlist | uid de fora não escreve; anônimo não lê rascunho | `tests/rules/firestore.rules.test.ts:98-102` (lê no ar), `:104-108` (não lê rascunho), `:110-119` (lista sem filtro negada), `:121-129` (anônimo não escreve), `:131-138` (formações), `:140-158` (autora lê rascunho e escreve), `:160-172` (uid de fora não escreve nem lê rascunho) | ✅ **PASS** — suíte **rodada nesta sessão**: 10/10, exit 0; **5/5 afrouxamentos mortos** |

**Status**: **26/30 ✅** · **2 ⚠️ parciais** (PUB-01 teto de 6, SIT-05 cláusula positiva) · **2 ⏭️ UAT**
(SIT-04, SIT-06 — confirmados honestos por grep: nenhum teste finge cobri-los).
**0 requisitos sem nenhuma evidência** — eram 9 na iteração 1 e 3 na iteração 2.

---

## 3. Edge Cases

| Edge case da spec | `arquivo:linha` | Resultado |
| ----------------- | --------------- | --------- |
| `imagemUrl` fora da allowlist renderiza sem imagem, sem quebrar | `publicacao-card.test.tsx:67-78`; `publicacao-artigo.test.tsx:87-96`; `schemas.test.ts:161-166` (subdomínio parecido recusado) | ✅ |
| HTML bruto no markdown vira texto, não executa | `corpo-markdown.test.tsx:30-43` | ✅ |
| Slug duplicado bloqueia a segunda gravação | `mutations.test.ts:112-121`, `:171-191` | ✅ |
| Título com 120 é aceito e o contador indica 120/120 | `publicacao-form.test.tsx:92-110` e `:112-131` (6/120 — o caso que discrimina) | ✅ (D2 morto) |
| Firestore fora do ar mantém a página de pé | `queries.test.ts:130-138`; `publicacoes-section.test.tsx:76-81`; observado no `npm run build` desta sessão | ✅ |
| Variável de ambiente ausente nomeia a variável | `src/lib/firebase/config.test.ts:39-69` | ✅ |

---

## 4. Discrimination Sensor

**Isolamento**: worktree temporária (`git worktree add … HEAD --detach`) com `node_modules` por
symlink; cada mutação revertida com `git checkout -- .`; worktree removida com `git worktree remove
--force` + `prune`. **Nunca `git stash`, nunca a árvore real.** Baseline `git status --porcelain`
capturado **vazio** antes do sensor e conferido por `diff` depois — **idêntico**; `git worktree list`
volta a listar só o repositório.

**Profundidade**: P0-full — **24 mutações válidas**, priorizando o diff `ddb79d4..HEAD`, as regras do
Firestore e os pontos onde a cobertura parecia rasa.

### 4.1 As 4 lacunas alegadas (grupo A)

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| A1 | Pilar "Parceria com a família" removido do conteúdo (ficam 5) | `src/content/site.ts:131-137` | ✅ Morto (2 testes) |
| A2 | Componente renderiza `pilares.slice(0, 3)` | `src/features/site/sections/o-que-faz-uma-at.tsx:34` | ✅ Morto (2 testes) |
| A3 | Texto do vazio → "Nada por aqui." | `src/content/site.ts:166` | ✅ Morto (2 testes) |
| A4 | `<SiteFooter />` removido do layout | `src/app/(site)/layout.tsx:10` | ✅ Morto (2 testes) |

### 4.2 A trava de SIT-05 (grupo B)

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| B1 | `bg-[#EDF3E4]` no `className` | `src/features/site/sections/hero.tsx:9` | ✅ Morto |
| B2 | `bg-[#8E7A32]` dentro do `cva(...)` | `src/components/ui/button.tsx` | ✅ Morto |
| B3 | `style={{ color: "#8E7A32" }}` inline | `src/components/layout/site-footer.tsx:10` | ✅ Morto |
| B7 | `RAIZ` da varredura apontada para `src/features` | `src/test/paleta-em-tokens.test.ts:25` | ✅ Morto (auto-guarda funciona) |
| **B4** | **`bg-emerald-200 text-rose-600` (paleta padrão do Tailwind)** | `src/features/site/sections/hero.tsx:9` | ❌ **Sobreviveu** |
| **B5** | **`style={{ color: "white", background: "darkolivegreen" }}` (cor nomeada do CSS)** | `src/components/layout/site-footer.tsx:10` | ❌ **Sobreviveu** |
| **B6** | **`--olive` trocado de oliva para vermelho** | `src/app/globals.css:96` | ❌ **Sobreviveu** |

### 4.3 Mutações novas de cobertura (grupo C) e regressões das rodadas anteriores (grupo D)

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| **C1** | **`LIMITE_PUBLICACOES_HOME` 6 → 5** (a spec fixa "no máximo 6") | `src/features/publicacoes/schemas.ts:17` | ❌ **Sobreviveu** (304/304) |
| C2 | `obterPorSlug` sem `where("publicado","==",true)` — rascunho vaza na rota | `src/features/publicacoes/queries.ts:68` | ✅ Morto |
| C3 | `orderBy("publicadoEm","desc")` → `"asc"` | `src/features/publicacoes/queries.ts:41` | ✅ Morto |
| C4 | Rodapé antes do `<main>` no `SiteLayout` | `src/app/(site)/layout.tsx:9-10` | ✅ Morto (2 testes) |
| C8 | Seção de publicações deixa de cortar em `LIMITE` (renderiza tudo) | `publicacoes-section.tsx:32` | ✅ Morto |
| C9 | Componente troca `secaoPublicacoes.vazio` por literal próprio | `publicacoes-section.tsx` | ✅ Morto |
| **C5** | **Bloco `prefers-reduced-motion` removido** | `src/app/globals.css:169-177` | ❌ Sobreviveu — **esperado**: SIT-06 é UAT declarado, jsdom não avalia media query |
| **C6** | **Descrição do 1º pilar fixada no componente, ignorando o conteúdo** | `o-que-faz-uma-at.tsx:45` | ❌ **Sobreviveu** (metade "sem texto duplicado" de SIT-02) |
| D1 | Regressão M11: `LIMITES_PUBLICACAO.corpo` 20000 → 20001 | `schemas.ts:38` | ✅ Morto (segue fechado) |
| D2 | Regressão M30: contador imprime `usados/usados` | `src/components/form/campo.tsx:38` | ✅ Morto (segue fechado) |
| D3 | Regressão M47: rota não chama `notFound()` para `dados === null` | `(site)/publicacoes/[slug]/page.tsx:65-67` | ✅ Morto |
| D4 | Regressão M28: os dois status de formação com a mesma classe | `formacoes-section.tsx:22` | ✅ Morto |
| D5b | Regressão M50: `href` do menu "Sobre" fixado em `#nao-existe` | `src/content/site.ts:58` | ✅ Morto |
| D6 | Regressão M17: seção de formação renderiza mesmo sem registros | `formacoes-section.tsx` | ✅ Morto |
| D7 | Regressão M49: "Sobre" antes de "O que faz uma AT" | `src/app/(site)/page.tsx:43-45` | ✅ Morto |

**Descartada como mutante equivalente**: trocar o valor de `ancoras.sobre` em `content/site.ts` move a
âncora do menu **e** o `id` da seção juntos — a navegação continua funcionando, então não é falha de
comportamento e não conta como sobrevivente. Refeita como D5b, que quebra só um lado.

### 4.4 Regras do Firestore (grupo R) — suíte rodada, não alegada

`export PATH="$(brew --prefix openjdk@21)/bin:$PATH"` (openjdk 21.0.12.1) + `npm run test:rules`.
**Baseline: 10 passaram, exit 0.** Cada mutação sai com exit 1.

| # | Mutação | Arquivo:linha | Morto? |
| - | ------- | ------------- | ------ |
| R5 | `allow get: if true` — anônimo lê rascunho | `firestore.rules:42` | ✅ Morto (2 casos, exit 1) |
| R6 | `allow list: if true` — listagem sem filtro liberada | `firestore.rules:55` | ✅ Morto (exit 1) |
| R7 | `ehAutora()` → `request.auth != null` — qualquer autenticado escreve | `firestore.rules:36` | ✅ Morto (2 casos, exit 1) |
| R8 | `formacoes`: escrita liberada para todos | `firestore.rules:63` | ✅ Morto (2 casos, exit 1) |
| R9 | `publicacoes`: `delete` liberado para anônimo (só o delete) | `firestore.rules:57` | ✅ Morto (2 casos, exit 1) |

**Resultado do sensor**: **24 mutações válidas · 20 mortas · 4 sobreviventes**.
Por materialidade: **2 sobreviventes materiais** (C1, B6 — este último com B4/B5 no mesmo requisito),
**1 menor** (C6), **1 esperado** (C5, UAT declarado).

---

## 5. Gate Check

| Comando | Resultado |
| ------- | --------- |
| `npm test -- --run` | **304 passaram**, 0 falharam, 0 pulados — 38 arquivos |
| `npm run test:rules` | **10 passaram**, exit 0 — emulador do Firestore, openjdk 21.0.12.1 |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, sem achado |
| `npm run build` | exit 0 — 9 rotas; `/` e `/sitemap.xml` com `revalidate 5m` |

- **Antes da Fase 8**: 294 em 36 arquivos · **depois**: 304 em 38 · **delta**: +10 testes, +2 arquivos
- **Pulados**: nenhum. **Asserção enfraquecida**: nenhuma — o diff só troca comparação-contra-constante
  por comparação-contra-literal, que é estritamente mais forte
- **Ruído esperado do ambiente**: o build loga `permission-denied` do Firestore ao pré-renderizar a
  home. As regras não estão publicadas e o uid da autora é placeholder (`firestore.rules:31`). É
  estado do ambiente, não defeito: a home degrada para o estado de erro em vez de derrubar o build —
  PUB-05/FOR-03 funcionando

---

## 6. Code Quality

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem feature além do pedido | ✅ — o lote da Fase 8 é só teste, com uma exceção de escopo justificada (T52 endureceu a trava criada em T51) |
| Sem abstração para uso único | ✅ |
| Só os arquivos necessários tocados | ✅ — nenhum arquivo de produção alterado em `ddb79d4..HEAD` |
| Segue o padrão do projeto | ✅ (AD-036; AD-037/038/039 registrados) |
| Verificação ancorada na spec (valor asserido = valor da spec) | ⚠️ — AD-037 aplicada em SIT-02 e PUB-03, **mas não em PUB-01**: o "6" do teto continua lendo a constante |
| Cobertura por camada: domínio 1:1 com ACs; rotas com feliz + borda + erro | ✅ |
| Todo teste mapeia para requisito/edge case/Done-when — sem teste órfão | ✅ |
| Diretrizes documentadas seguidas | ✅ `tasks.md` (Test Coverage Matrix) + defaults da skill |
| Anti-hardcode | ⚠️ `bg-black/10` em `dialog.tsx:34` e `alert-dialog.tsx:33` é cor fora dos tokens, hoje, com a trava verde |
| Moeda em BRL completo | N/A — o projeto não exibe valores monetários |

---

## 7. Gaps ranqueados

1. **PUB-01 — o teto de 6 não discrimina (Major).** A spec escreve "no máximo 6" por extenso, e as
   duas asserções leem `LIMITE_PUBLICACOES_HOME`, a mesma constante que o código usa para cortar:
   `queries.test.ts:86` e `publicacoes-section.test.tsx:57`. **C1 (`6 → 5`) passa 304/304** — a home
   silenciosamente deixaria de mostrar uma publicação legítima e nada reprovaria. O literal `6` só
   aparece no **nome** do teste (`queries.test.ts:77`), que não asserta nada.
   É **exatamente a família** que reprovou as iterações 1 (M11) e 2 (M52, M54), e AD-037 existe para
   fechá-la — mas foi aplicada só em SIT-02 e PUB-03, os dois casos que o relatório anterior citou
   nominalmente. O gap é de **generalização**: a regra fechou os exemplos, não a classe.
   **Correção**: `expect(LIMITE_PUBLICACOES_HOME).toBe(6)` contra um `const TETO_DA_HOME_NA_SPEC = 6`,
   no mesmo formato de `PILARES_DA_SPEC`. **~5 minutos, 1 arquivo.**

2. **SIT-05 — a paleta aprovada em si não tem asserção (Major, já conhecido).** O requisito nomeia
   quatro valores (`#EDF3E4`, `#F7FBF1`, `#4C5B34`, `#8E7A32`) e eles existem apenas como **comentário**
   em `globals.css:91-98`. **B6 (trocar `--olive` de oliva para vermelho) passa 304/304.** A trava
   criada em T51/T52 fecha só a cláusula negativa. O ponto já está no `STATE.md` como aberto pelos
   revisores da Fase 8 — o que esta rodada acrescenta é a prova empírica.
   **Correção**: teste lendo `globals.css` e asserindo os quatro tokens contra os literais da spec
   (comparando a string `oklch(...)` fixada, ou convertendo hex→oklch). **~30 minutos** — precisa
   decidir a forma de comparação.

3. **SIT-05 — a trava é mais estreita que o docblock promete (Minor).** `bg-emerald-200` (B4) e
   `style={{ color: "white" }}` (B5) passam, e **`bg-black/10` já está no código** em
   `src/components/ui/dialog.tsx:34` e `src/components/ui/alert-dialog.tsx:33`, com a suíte verde. O
   docblock em `paleta-em-tokens.test.ts:6-8` diz "nenhum arquivo de código escreve cor à mão", o que
   não é verdade hoje.
   **Correção**: ou ampliar o detector (escala de cor do Tailwind + cores nomeadas do CSS) e decidir o
   que fazer com o `bg-black/10` do shadcn, ou estreitar o docblock para o que a trava cobre de fato.
   **~20 minutos**, e é decisão de produto tanto quanto de teste.

4. **SIT-02 — a metade "sem texto duplicado em componente" cobre só os títulos (Minor).** T48 asserta
   contagem e títulos; **C6 (fixar a descrição de um pilar no componente) passa 304/304**.
   **Correção**: estender `o-que-faz-uma-at.test.tsx:32` para comparar também as descrições.
   **~5 minutos.**

5. **SIT-04 e SIT-06 seguem só em UAT (aceito, confirmado honesto).** `grep` por `360`,
   `reduced-motion` e `matchMedia` nos testes → **0 ocorrências**: ninguém maquiou nada de coberto.
   C5 sobrevive porque jsdom não avalia media query, que é a razão declarada.

---

## 8. Interactive UAT — pendente

Não executado nesta sessão (sem navegador). Continua devendo:

| Critério | Como conferir |
| -------- | ------------- |
| SIT-04 — viewport de 360px sem rolagem horizontal | DevTools → dispositivo de 360px, percorrer a home inteira e a página de um texto: nenhuma barra horizontal, nenhum bloco cortado |
| SIT-06 — `prefers-reduced-motion: reduce` sem animação de entrada | macOS: Ajustes → Acessibilidade → Vídeo → Reduzir movimento (ou DevTools → Rendering → Emulate `prefers-reduced-motion`), recarregar e conferir que nada anima e que a rolagem do menu é instantânea |
| SIT-05 (visual) — a paleta na tela é a aprovada | Enquanto os quatro valores não tiverem teste (gap 2), conferir a olho que fundo, superfície, oliva e dourado são os da aprovação |

---

## 9. Requirement Traceability Update

| Requirement | Status na iteração 2 | Novo status |
| ----------- | -------------------- | ----------- |
| SIT-01 | ⚠️ parcial (rodapé sem asserção) | ✅ **Verificado** |
| SIT-02 | ❌ sem evidência | ✅ **Verificado** (ressalva: descrições não travadas) |
| SIT-03 | ✅ Verificado | ✅ Verificado |
| SIT-04, SIT-06 | ⏭️ UAT pendente | ⏭️ UAT pendente (honesto, reconfirmado) |
| SIT-05 | ⚠️ verdadeiro por varredura, sem trava | ⚠️ **Parcial** — cláusula negativa travada; cláusula positiva sem evidência |
| PUB-01 | ✅ Verificado | ⚠️ **Rebaixado para parcial** — o teto de 6 não discrimina (C1) |
| PUB-03 | ⚠️ parcial (mensagem não discrimina) | ✅ **Verificado** |
| PUB-02, PUB-04..PUB-07 | ✅ Verificado | ✅ Verificado |
| ADM-01..ADM-09 | ✅ Verificado | ✅ Verificado |
| FOR-01..FOR-05 | ✅ Verificado | ✅ Verificado |
| SEO-01, SEO-02 | ✅ Verificado | ✅ Verificado |
| SEC-01 | ✅ Verificado | ✅ Verificado (5 novos afrouxamentos mortos) |

---

## 10. Summary

**Geral**: ❌ **FAIL estreito — e é a 3ª iteração, então escala em vez de virar a 4ª.**

**Check ancorado na spec**: 26/30 ACs com asserção casando com o resultado da spec · 2 parciais ·
0 sem evidência · 2 em UAT declarado e confirmado honesto.
**Sensor**: 24 mutações válidas, **20 mortas, 4 sobreviventes** — 2 materiais (C1, B6), 1 menor (C6) e
1 esperado (C5, UAT). Regras do Firestore: **5/5 mortas, suíte rodada** (10/10, exit 0).
**Gate**: 304 unitários + 10 de regra · `tsc`, lint e build limpos.

**O que funciona**: as 4 lacunas da iteração 2 fecharam de verdade — nenhuma passou por alegação, e
cada uma morreu sob o mutante que a define. A armadilha das duas rodadas anteriores (asserção
ancorada na constante que o próprio código renderiza) está fechada em SIT-02 e PUB-03, com o caso
extra que amarra o conteúdo ao texto da spec. Nenhum requisito ficou sem evidência — eram 9 na
iteração 1. SEC-01 aguenta 5 afrouxamentos distintos das regras, cada um com a suíte saindo em 1.

**Onde dói**: a correção fechou os **exemplos** citados, não a **classe**. O mesmo padrão que reprovou
duas vezes segue vivo no teto de 6 publicações de PUB-01 (C1), num requisito P1 de MVP. E SIT-05
ganhou trava para a metade negativa do enunciado enquanto a metade positiva — os quatro valores da
paleta aprovada — continua sem uma única asserção (B6).

**Custo do que falta**: ~60 minutos somados (5 + 30 + 20 + 5), em 3 arquivos de teste, sem tocar
código de produção. Nenhum item é bloqueio de deploy: o site funciona; o que falta é o teste que
impede a regressão.

**Próximos passos**: decisão do usuário sobre os 4 gaps acima; depois, o UAT de SIT-04/SIT-06 em
navegador e a publicação das regras e do índice com o uid real.
