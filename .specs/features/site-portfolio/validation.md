# site-portfolio — Validação

**Data**: 2026-09-01
**Spec**: `.specs/features/site-portfolio/spec.md` (30 requisitos)
**Superfície de diff**: `b48c45d..3c2266d` (T53–T56 + STATE/spec/design/tasks) · veredito sobre a **feature inteira**
**Verificador**: sub-agente independente, iteração 4 (autor ≠ verificador; evidência-ou-zero, coberturas re-derivadas do zero)

---

## Veredito

## Validation: site-portfolio — PASS ✅

**Spec-anchored check**: 28/30 requisitos com `file:line` + expressão de asserção que bate com o desfecho da spec · 2 (SIT-04, SIT-06) sem evidência automatizada e **declarados como UAT manual**, sem nenhum teste fingindo cobri-los.
**Gate**: 323 testes em 39 arquivos (`npm test -- --run`, exit 0) + 10 testes de regra (`npm run test:rules`, emulador Firestore, exit 0, **rodado nesta sessão**) · `tsc --noEmit` exit 0 · `eslint` exit 0 · `next build` exit 0.
**Sensor**: 15 mutações de comportamento injetadas, **15 mortas, 0 sobreviventes**; 4 sondas de burla, 4 bloqueadas; 1 mutação de controle sobrevive por desenho (documentada).

As quatro lacunas que reprovaram a iteração 3 estão fechadas com asserção discriminante, **nenhuma aceita por alegação**: cada uma foi reinjetada por este verificador e reprovou.

---

## 1. Auditoria adversarial das 4 lacunas da iteração 3

Cada lacuna foi reinjetada em worktree isolada e a suíte rodada inteira.

| # | Lacuna da iteração 3 | Mutação injetada agora | Asserção que a mata (`file:line` + expressão) | Resultado |
| - | -------------------- | ---------------------- | --------------------------------------------- | --------- |
| C1 | Teto de 6 lido da constante que o código usa para cortar | `LIMITE_PUBLICACOES_HOME = 6` → `5` (`src/features/publicacoes/schemas.ts:17`) | `src/features/publicacoes/queries.test.ts:83-87` — `expect(consultaExecutada().restricoes).toEqual([… { tipo: "limit", quantidade: TETO_DA_HOME_NA_SPEC }])`, com `TETO_DA_HOME_NA_SPEC = 6` em `src/test/valores-da-spec.ts:26`; `src/features/publicacoes/components/publicacoes-section.test.tsx:54-61` — `expect(screen.getAllByRole("article")).toHaveLength(TETO_DA_HOME_NA_SPEC)` + ausência de `Publicação ${TETO+1}` | ✅ **Morta** (2 arquivos reprovam) |
| B6 | Paleta sem cláusula positiva: hex só existia como comentário no CSS | `--olive: oklch(0.4479 0.0624 125.96)` → `oklch(0.5500 0.2200 27.00)` (vermelho), `src/app/globals.css:96` | `src/test/paleta-aprovada.test.ts:104-125` — `it.each` sobre os 10 tokens, `hexParaOklch("#4C5B34")` comparado com a declaração lida do CSS, folga `{L 0.0005, C 0.0005, H 0.05}` (`:44`) | ✅ **Morta** |
| B4 | Trava não via classe utilitária fora dos tokens | `bg-emerald-200` acrescentado ao `<h3>` de `src/features/site/sections/o-que-faz-uma-at.tsx:42` | `src/test/paleta-em-tokens.test.ts:169-171` — `expect(infratoresDe(classesForaDaPaletaEm, semAsClassesDeTerceiro)).toEqual([])`, detector em `:57-60` | ✅ **Morta** |
| B5 | Trava não via cor em `style` inline | `style={{ color: "white" }}` acrescentado ao mesmo `<h3>` | `src/test/paleta-em-tokens.test.ts:173-175` — `expect(infratoresDe(coresEmStyleInlineEm)).toEqual([])`, detector em `:66-74` (regra por **valor**, pega cor nomeada do CSS) | ✅ **Morta** |
| C6 | Descrições dos pilares não travadas | `{pilar.descricao}` → literal fixo em `src/features/site/sections/o-que-faz-uma-at.tsx:43` | `src/features/site/sections/o-que-faz-uma-at.test.tsx:36-38` — `secaoAt.pilares.forEach((pilar, i) => expect(within(cards[i]).getByText(pilar.descricao)).toBeInTheDocument())` | ✅ **Morta** |

### Sondas adversariais sobre a correção

| Sonda | Pergunta | Resultado |
| ----- | -------- | --------- |
| **P1/P5** | `src/test/valores-da-spec.ts` resolve a armadilha ou só a move um nível? | **Move um nível — e o nível novo é o certo, mas não é travado.** Alterar `LIMITE_PUBLICACOES_HOME` **e** `TETO_DA_HOME_NA_SPEC` juntos (6→5) passa 323/323. O módulo só vale enquanto for transcrição fiel da spec, e **nada no repositório liga `valores-da-spec.ts` a `spec.md`**. Ver residual R2. |
| **P2** | `no-restricted-imports` pega caminho relativo, além do alias? | **Pega os dois.** `import … from "@/test/valores-da-spec"` e `import … from "../../../test/valores-da-spec"` em `publicacoes-section.tsx` → `eslint` erro `no-restricted-imports` nas duas formas (grupo `["@/test/*", "**/test/*"]`, `eslint.config.mjs:25`). |
| **P3** | Qual a tolerância real da comparação de cor? | **Apertada de verdade.** `--brass` girado **+15°** de matiz reprova; girado **+1°** também reprova (folga declarada é 0,05°, desvio real de arredondamento medido é ~0,005°). A trava reprova desvio de cor, não só troca grosseira. |
| **P4** | Dá para burlar a exceção do shadcn com arquivo novo em `src/components/ui/`? | **Não.** Arquivo novo `src/components/ui/veu.tsx` com `bg-black bg-emerald-200` + `style={{color:"white"}}` reprova em 2 testes — a exceção é chaveada pelo **caminho exato** (`paleta-em-tokens.test.ts:87-90`). Um `bg-black` **a mais dentro do próprio `dialog.tsx`** também reprova, em 2 testes, porque a exceção registra **quantidade**. |
| **P6** | A spec fixa algum dos valores que o autor deixou lendo a constante? | **Não.** Varredura de `spec.md`: os únicos números escritos por extenso são 6 (pilares, SIT-02), 6 (teto da home, PUB-01), 360px (SIT-04, sem teste por desenho) e 120/220/20.000 (ADM-04). `LIMITE_PUBLICACOES_PAINEL` (200), `LIMITE_PUBLICACOES_SITEMAP` (1000), `LIMITES_PUBLICACAO.slug/.tag/.imagemUrl`, todo `LIMITES_FORMACAO` e `ORDEM_MAXIMA_FORMACAO` (999) **não aparecem na spec** — a constante do código é mesmo o contrato, e a decisão de AD-040 está correta. Ressalva menor em R3 (SEO-01). |

---

## 2. Cobertura ancorada na spec (evidência-ou-zero, 30 requisitos)

Re-derivada desta rodada, a partir do mapeamento de todos os 40 arquivos de teste. Requisito sem `file:line` conta como **não coberto**.

### P1 — Visitante entende o trabalho da AT

| Critério | Desfecho fixado pela spec | `file:line` + expressão | Resultado |
| -------- | ------------------------- | ----------------------- | --------- |
| SIT-01 home com hero → AT → Sobre → Formação → Publicações → contato → rodapé, nesta ordem | os 7 blocos na ordem exata | `src/app/(site)/page.test.tsx:95-103` — `expect(blocosNaOrdem(container)).toEqual([ancoras.topo, ancoras.at, ancoras.sobre, ancoras.formacao, ancoras.publicacoes, ancoras.contato, RODAPE])`; `:110-116` — `["MAIN","FOOTER"]` | ✅ PASS |
| SIT-02 6 pilares vindos de `content/site.ts`, sem texto duplicado em componente | exatamente 6, título **e** descrição com fonte única | `o-que-faz-uma-at.test.tsx:16` — `expect(secaoAt.pilares).toHaveLength(PILARES_DA_SPEC /* 6 */)`; `:22` — `getAllByRole("article")).toHaveLength(6)`; `:31-33` títulos na ordem; `:36-38` **descrições** por card | ✅ PASS (C6 morto) |
| SIT-03 clique no menu rola até a seção | âncora do menu resolve para seção existente na home | `page.test.tsx:127` — `expect(ancorasDoMenu.length).toBeGreaterThan(0)`; `:131-133` — para cada `a[href^="#"]`, `expect(container.querySelector(ancora)).not.toBeNull()` | ⚠️ PASS parcial — prova o **destino**, não a rolagem (jsdom não rola). Rolagem suave vem de `scroll-mt-cabecalho` + CSS; fecha no UAT junto de SIT-06. |
| SIT-04 viewport de 360px sem rolagem horizontal | nenhuma barra horizontal | **nenhuma asserção** — `grep -rn "360" src tests` nos testes → 0 ocorrências | ⏭️ **UAT manual** — confirmado honesto, nenhum teste finge cobrir |
| SIT-05 paleta aprovada por tokens, sem cor literal em componente | as 4 cores nomeadas na spec + as 6 do design, e zero cor à mão | **positiva**: `paleta-aprovada.test.ts:104-125` (10 tokens, hex→OKLCH, folga 0,0005/0,05); **negativa**: `paleta-em-tokens.test.ts:165-167` (literal), `:169-171` (classe Tailwind), `:173-175` (`style` inline), `:177-190` (exceção de terceiro ainda aponta para código real) | ✅ PASS (B4, B5, B6 mortos) |
| SIT-06 `prefers-reduced-motion: reduce` sem animação de entrada | todas as seções sem animação | **nenhuma asserção** — implementação em `src/app/globals.css:169-177`; jsdom não avalia media query | ⏭️ **UAT manual** — confirmado honesto. **Rastreabilidade errada, ver R1.** |

### P1 — Visitante lê as publicações

| Critério | Desfecho fixado pela spec | `file:line` + expressão | Resultado |
| -------- | ------------------------- | ----------------------- | --------- |
| PUB-01 `publicado == true`, `publicadoEm` desc, no máximo 6 | os três, com o 6 da spec | `queries.test.ts:82-87` — `toEqual([{where publicado == true}, {orderBy publicadoEm desc}, {limit TETO_DA_HOME_NA_SPEC}])`; `publicacoes-section.test.tsx:54-61` corte na tela | ✅ PASS (C1 morto) |
| PUB-02 detalhe com título, data, markdown e link de volta | os 4 elementos | `publicacao-artigo.test.tsx:33-48`; `src/app/(site)/publicacoes/[slug]/page.test.tsx:135-142` (link de volta com o rótulo do conteúdo) | ✅ PASS |
| PUB-03 vazio exibe "Nenhuma publicação por aqui ainda." | **essa** frase | `publicacoes-section.test.tsx:64-69` — `getByText(MENSAGEM_DE_VAZIO_DA_SPEC)` + ausência de `article`; `:71-73` — `expect(secaoPublicacoes.vazio).toBe(MENSAGEM_DE_VAZIO_DA_SPEC)` (liga conteúdo↔spec) | ✅ PASS |
| PUB-04 slug ausente ou rascunho → 404 | 404 nos dois casos | `[slug]/page.test.tsx:100-107` e `:109-120` — `rejects.toBe(RESPOSTA_404)` + `notFound` 1×; `:122-132` publicado não chama; `queries.test.ts:158-168` — `obterPorSlug` filtra `slug` **e** `publicado == true`; `tests/rules/firestore.rules.test.ts` (anônimo não lê rascunho) | ✅ PASS (M6, R3 mortos) |
| PUB-05 falha de leitura mostra a mensagem do Firebase, resto utilizável | mensagem traduzida, página de pé | `queries.test.ts:107-118` (`{ erro }`, sem lançar); `publicacoes-section.test.tsx:75-81` — mensagem do Firebase em `role="alert"`, título da seção preservado (`:83-98`) | ✅ PASS (M10 morto) |
| PUB-06 `imagemUrl` no card e no detalhe | imagem nos dois lugares | `publicacao-card.test.tsx:48-54` — `getByRole("img", { name: "Quando a criança diz não" })`; `publicacao-artigo.test.tsx:49-56` | ✅ PASS |
| PUB-07 `<title>`, description e OG por publicação | do título e do resumo | `[slug]/page.test.tsx:60-72`, `:73-86` (OG com título, resumo, endereço, data), `:87-98` (slug ausente não vaza `undefined`) | ✅ PASS |

### P1 — Keylla publica sem depender de ninguém

| Critério | Desfecho fixado pela spec | `file:line` + expressão | Resultado |
| -------- | ------------------------- | ----------------------- | --------- |
| ADM-01 sem sessão, `/admin` → `/admin/login` | redirect + conteúdo escondido | `painel-guard.test.tsx:60-67` — `expect(substituir).toHaveBeenCalledWith(CAMINHO_LOGIN)` + `queryByText(CONTEUDO_DO_PAINEL)).not.toBeInTheDocument()`; `:48-58` carregando não vaza; `:81-89` login sem laço | ✅ PASS (M9 morto) |
| ADM-02 credencial aceita → `/admin` | redirect para o painel | `login-form.test.tsx:50-63` — `toHaveBeenCalledWith(CAMINHO_PAINEL)` | ✅ PASS |
| ADM-03 credencial recusada: erro em PT, sem revelar se o e-mail existe | mensagem traduzida e **idêntica** nos códigos de credencial | `src/lib/firebase/errors.test.ts:78-97` — mesma string para `auth/user-not-found` e `auth/wrong-password`; `auth.test.ts:45-59`; `login-form.test.tsx:64-75` | ✅ PASS (M10 morto) |
| ADM-04 limites 120/220/20.000 e URL https válida bloqueiam o envio | os três tetos, inclusivos, + allowlist https | `schemas.test.ts:41-57` (120 aceita / 121 recusa citando 120), `:64-77` (220/221), `:78-94` (20000/20001), `:114-153` (https, allowlist, teto de caracteres, não-URL) — todos contra `LIMITES_DE_PUBLICACAO_DA_SPEC`; `publicacao-form.test.tsx:90-111` (contador 120/120), `:133-179` | ✅ PASS |
| ADM-05 gravando desabilita controles e mostra carregamento | tudo desabilitado | `publicacao-form.test.tsx:200-225` — cada controle `toBeDisabled()`; `login-form.test.tsx:87-107`; `formacao-form.test.tsx:116-142` | ✅ PASS |
| ADM-06 excluir pede confirmação em dialog próprio | só remove após confirmação explícita | `publicacoes-table.test.tsx:67-77` (acionar só abre), `:78-90` (confirmar exclui), `:91-104` (cancelar não exclui); `publicacoes-painel.test.tsx:118-133` | ✅ PASS |
| ADM-07 falha de gravação preserva o formulário e mostra a mensagem | dados mantidos + mensagem do Firebase | `publicacao-form.test.tsx:226-…`; `publicacao-editor.test.tsx:138-…` (não sai da tela); `publicacoes-painel.test.tsx:134-149` | ✅ PASS |
| ADM-08 alternar persiste `publicado` e reflete na listagem | grava e recarrega | `mutations.test.ts:223-244` (põe no ar / volta a rascunho, devolve novo estado), `:245-260` (`publicadoEm` ganha data); `publicacoes-painel.test.tsx:104-117` | ✅ PASS (M7 morto) |
| ADM-09 nunca `window.confirm/alert/prompt` | nenhuma chamada nativa | `publicacoes-table.test.tsx:105-116` — `vi.spyOn(window,"confirm")` + `expect(confirmNativo).not.toHaveBeenCalled()` no fluxo completo de exclusão | ✅ PASS |

### P2 — Formação

| Critério | Desfecho fixado pela spec | `file:line` + expressão | Resultado |
| -------- | ------------------------- | ----------------------- | --------- |
| FOR-01 `ordem` asc, empate por `ano` desc | essa ordenação | `formacoes/queries.test.ts:61-76` (ordem), `:77-92` (empate pelo ano desc), `:93-117` (sem ordem/sem ano vão para o fim sem sumir); `formacoes/painel.test.ts:32-65` | ✅ PASS (M8 morto) |
| FOR-02 `em_andamento` com rótulo distinto de "Concluído" | dois rótulos literais e visualmente distintos | `formacoes-section.test.tsx:47-59` — `getByText("Em andamento")`, `getByText("Concluído")`, `expect(emCurso.className).not.toBe(concluido.className)` | ✅ PASS |
| FOR-03 falha de leitura mostra a mensagem do Firebase | mensagem traduzida | `formacoes-section.test.tsx:88-97`; `formacoes/queries.test.ts:149-181` (erro, config ausente, código desconhecido — sem lançar em nenhum) | ✅ PASS |
| FOR-04 sem formações, a seção some inteira, inclusive o título | nada renderizado | `formacoes-section.test.tsx:79-87` — `expect(container).toBeEmptyDOMElement()` + `queryByRole("heading", { name: secaoFormacao.titulo })).not.toBeInTheDocument()` | ✅ PASS |
| FOR-05 CRUD de formação com as mesmas regras da P1 | validação, confirmação e erro iguais | `formacao-form.test.tsx:57-160` (limite, intervalo de ano, teto de ordem, desabilitar ao salvar, erro fiel preservando o preenchido); `formacoes-painel.test.tsx:169-212` (exclui só após confirmar, cancelar não exclui, erro não perde a lista) | ✅ PASS |

### P3 — Encontrabilidade · Segurança

| Critério | Desfecho fixado pela spec | `file:line` + expressão | Resultado |
| -------- | ------------------------- | ----------------------- | --------- |
| SEO-01 `robots.txt` + `sitemap.xml` com `/` e cada publicação no ar | as duas rotas, URLs absolutas, `/admin` fora | `robots.test.ts:14-26` (libera, bloqueia painel, sitemap absoluto); `sitemap.test.ts:40-95` (home + cada publicada absoluta, leitura filtrada com o teto do sitemap, `lastModified`, degrada para só a home no erro, `/admin` ausente) | ✅ PASS (ressalva R3) |
| SEO-02 Open Graph + dados estruturados `Person` na home | campos do OG e do `Person` | `src/features/site/seo.test.ts:25-92` — campo a campo, canonical, `sameAs`, escape de `<`, JSON válido; `page.test.tsx:70-85` — `JSON.parse` do bloco JSON-LD `toEqual(pessoaDaAutora)` | ✅ PASS |
| SEC-01 escrita restrita ao uid da allowlist | uid de fora não escreve; anônimo não lê rascunho | `tests/rules/firestore.rules.test.ts` — 10/10 verdes contra o emulador **nesta sessão** (`npm run test:rules`, exit 0): anônimo lê no ar / não lê rascunho / não lista sem filtro / não escreve; uid fora da allowlist não escreve nem lê rascunho; autora lê rascunho e escreve | ✅ PASS (R1, R2, R3 mortos) |

**Status**: **28/30 com evidência discriminante** · **2 ⏭️ UAT manual** (SIT-04, SIT-06 — nenhum teste os maquia) · **1 ⚠️ parcial declarado** (SIT-03: destino travado, rolagem no UAT).

---

## 3. Sensor de discriminação

**Isolamento**: worktree temporária (`git worktree add … HEAD`), `node_modules` por symlink. Baseline `git status --porcelain` do repositório real capturado antes (**vazio**, 0 bytes), worktree removida com `git worktree remove --force` + `git worktree prune`, porcelain reconferido depois: **idêntico ao baseline**. Nenhum `git stash`, nenhuma edição na árvore real.

### As 5 mutações da auditoria

| # | Mutação | `file:line` | Morta? |
| - | ------- | ----------- | ------ |
| M1 | `LIMITE_PUBLICACOES_HOME` 6 → 5 (C1) | `src/features/publicacoes/schemas.ts:17` | ✅ 2 arquivos |
| M2 | `--olive` vira vermelho `oklch(0.55 0.22 27)` (B6) | `src/app/globals.css:96` | ✅ |
| M3 | `bg-emerald-200` no card do pilar (B4) | `src/features/site/sections/o-que-faz-uma-at.tsx:42` | ✅ |
| M4 | `style={{ color: "white" }}` no mesmo card (B5) | `src/features/site/sections/o-que-faz-uma-at.tsx:42` | ✅ |
| M5 | Descrição do pilar fixada no componente (C6) | `src/features/site/sections/o-que-faz-uma-at.tsx:43` | ✅ |

### Famílias que doeriam em produção

| # | Mutação | `file:line` | Morta? |
| - | ------- | ----------- | ------ |
| M6 | Rascunho vaza em `/publicacoes/[slug]`: removido `where("publicado","==",true)` | `src/features/publicacoes/queries.ts:68` | ✅ |
| M7 | `publicadoEm` não gravada no `criarPublicacao` (publicação sumiria da home) | `src/features/publicacoes/mutations.ts:82` | ✅ 2 testes |
| M8 | Ordem das formações invertida (`a.ordem - b.ordem` → `b.ordem - a.ordem`) | `src/features/formacoes/converter.ts:86` | ✅ 4 testes |
| M9 | Guard não manda para o login (`!ehLogin` → `ehLogin`) | `src/features/admin/components/painel-guard.tsx:60` | ✅ 2 testes |
| M10 | Erro do Firebase vira genérico (sempre `MENSAGEM_SEM_DETALHE`) | `src/lib/firebase/errors.ts:58-66` | ✅ 4+ testes |

### Regras do Firestore (`npm run test:rules` rodado, não alegado)

| # | Mutação | `firestore.rules` | Morta? |
| - | ------- | ----------------- | ------ |
| R1 | `allow list` liberado para qualquer um | `:55` | ✅ (`visitante anônimo > não lista a coleção sem filtrar pelo que está no ar`) |
| R2 | Escrita de publicações passa a exigir só estar logado | `:57` | ✅ (`uid fora da allowlist > não escreve publicação nem formação`) |
| R3 | `allow get` liberado (rascunho vaza por id) | `:42` | ✅ 2 testes |

### Sondas de burla

| # | Sonda | Resultado |
| - | ----- | --------- |
| P2a | `import "@/test/valores-da-spec"` em componente de produção | 🔒 `eslint` reprova (`no-restricted-imports`) |
| P2b | O mesmo import por caminho relativo `../../../test/valores-da-spec` | 🔒 `eslint` reprova |
| P3 | `--brass` girado +15° e +1° de matiz | 🔒 reprova nos dois (tolerância real ~0,05°) |
| P4a | Arquivo novo `src/components/ui/veu.tsx` com `bg-black bg-emerald-200` + `style` branco | 🔒 reprova em 2 testes — exceção é por caminho exato |
| P4b | Um `bg-black` **a mais** dentro do próprio `dialog.tsx` | 🔒 reprova em 2 testes — exceção registra quantidade |

### Mutação de controle (sobrevive por desenho)

| # | Mutação | Resultado |
| - | ------- | --------- |
| P5 | `LIMITE_PUBLICACOES_HOME` 6→5 **e** `TETO_DA_HOME_NA_SPEC` 6→5, juntos | ❌ **Sobrevive** (323/323 verdes) — esperado: `valores-da-spec.ts` é a transcrição da spec, editá-lo equivale a editar a spec. Mas **nada liga esse arquivo a `spec.md`**: a armadilha mudou de endereço, não desapareceu. → **R2**. |

**Profundidade**: leve-expandida (15 mutações de comportamento + 5 sondas), acima do mínimo de 1–3, por causa da superfície de segurança (SEC-01) e do histórico de 3 reprovações.
**Resultado**: **15/15 mortas** — ✅ PASS.

---

## 4. Gate

| Comando | Resultado |
| ------- | --------- |
| `npm test -- --run` | **323 passaram / 0 falharam**, 39 arquivos, 4,35s, exit 0 |
| `npm run test:rules` (emulador Firestore, `openjdk@21` no PATH) | **10 passaram / 0 falharam**, exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 — 9 rotas geradas, `/` e `/sitemap.xml` com `revalidate 5m` |

**Contagem antes desta fase**: 304 testes em 38 arquivos (handoff da Fase 8). **Depois**: 323 em 39. **Delta +19, 0 removidos, 0 pulados.** Nenhuma asserção foi enfraquecida: as trocas de `LIMITES_PUBLICACAO.x` por `LIMITES_DE_PUBLICACAO_DA_SPEC.x` movem o lado direito da comparação para longe do código sob teste — é fortalecimento, comprovado por M1.

O `build` renderiza a home em `permission-denied` porque as regras não estão publicadas e o uid é placeholder. **Não é defeito**: é PUB-05/FOR-03 funcionando, e o build conclui exit 0 com a página de pé.

---

## 5. Qualidade de código (diff `b48c45d..HEAD`)

| Princípio | Status |
| --------- | ------ |
| Código mínimo, sem feature além do pedido | ✅ — o diff é 100% teste/config; `src/` de produção não foi tocado |
| Sem abstração para uso único | ✅ — `valores-da-spec.ts` tem 2 exports usados por 4 arquivos |
| Mudanças cirúrgicas, só nos arquivos necessários | ✅ |
| Casa com os padrões do projeto | ✅ — docblock em PT-BR explicando o **porquê**, nomes em português, `as const` |
| Check spec-anchored: valor asserido bate com o da spec | ✅ (28/30; 2 declarados sem asserção) |
| Todo teste mapeia para requisito/edge case/done-when | ✅ — os testes de `detectores da trava` (`paleta-em-tokens.test.ts:193-256`) e `:126-137` de `paleta-aprovada` são autoteste do detector, que é o que evita a trava passar vazia |
| Regra de lint torna a convenção verificável, não combinada | ✅ — `eslint.config.mjs:16-38`, provada por P2a/P2b |

---

## 6. Edge cases da spec

| Edge case | Evidência | Status |
| --------- | --------- | ------ |
| `imagemUrl` fora da allowlist → card sem imagem, sem quebrar | `publicacao-card.test.tsx:67-79`; `publicacao-artigo.test.tsx:87-…`; `schemas.test.ts:126-131`, `:165-170` (subdomínio parecido recusado) | ✅ |
| HTML bruto no markdown renderiza como texto | `corpo-markdown.test.tsx:30-44` | ✅ |
| Slug duplicado bloqueia a gravação da segunda | `mutations.test.ts:112-122` (criar), `:182-192` (atualizar), `:171-181` (o próprio slug é aceito) | ✅ |
| Título com 120 caracteres aceito e contador em 120/120 | `schemas.test.ts:41-48`; `publicacao-form.test.tsx:90-111` | ✅ |
| Firestore fora do ar → página de pé, seção em erro | `queries.test.ts:107-140`; `formacoes/queries.test.ts:149-181`; `publicacoes-section.test.tsx:75-98` | ✅ |
| Variáveis do Firebase ausentes → erro nomeando a variável | `src/lib/firebase/config.test.ts:39-64` (nomeia **todas** as faltantes, trata em branco como ausente); `use-auth.test.ts:87-98` | ✅ |

---

## 7. Residuais em aberto (ranqueados) — nenhum bloqueia o PASS

**R1 — Rastreabilidade de SIT-06 aponta para a task errada.** `spec.md:177` mapeia `SIT-06 → T14`, mas T14 é "Configuração validada do Firebase" (`tasks.md`), que trata do edge case de variável de ambiente — exatamente o que a própria spec **exclui** de SIT-06 ("SIT-06 trata exclusivamente de movimento"). O código já sabe disso: `src/lib/firebase/config.ts:7` comenta "SIT-06 é só reduced-motion". A implementação real de SIT-06 está em `src/app/globals.css:169-177`, entregue pelo done-when de **T4** (`tasks.md:222`). *Materialidade: baixa — o requisito está implementado; o defeito é de documentação.* *Custo: uma linha em `spec.md`.*

**R2 — `src/test/valores-da-spec.ts` não é conferido contra `spec.md`.** P5 comprova: mover os dois lados juntos passa 323/323. O módulo faz o trabalho para o qual foi criado (produção não o lê, e o lint garante isso), mas a fidelidade dele à spec é hoje mantida só por disciplina. *Materialidade: média — é a mesma classe de armadilha de C1, um nível acima.* *Custo: baixo — um teste que leia `spec.md` e case os literais 6/120/220/20000, ou uma revisão obrigatória do arquivo quando a spec muda.*

**R3 — `LIMITE_PUBLICACOES_SITEMAP = 1000` é um teto que SEO-01 não prevê.** SEO-01 pede "cada publicação publicada" no sitemap, sem teto; o código corta em 1000. Não há teste que possa pegar isso porque o desvio só aparece com >1000 publicações. *Materialidade: desprezível para uma autora só, mas é um desvio silencioso da spec.* *Custo: uma linha na spec registrando o teto, ou um comentário `// SPEC_DEVIATION`.*

**R4 — 26 critérios de "Done when" seguem desmarcados em tasks marcadas ✅.** `tasks.md` linhas 166-168, 185-186, 203-204, 221-222, 239-240, 257-259, 278-279, 296-298, 315, 332-333, 350-351, 368-369, 386-387 — todas nas Fases 1–2. As tasks passaram no gate de build da época; a caixa é que não foi marcada. *Materialidade: baixa (higiene de processo), mas atrapalha qualquer reconciliação futura de estado.* *Custo: minutos.*

**R5 — A trava de cor lê texto, não estilo computado.** Classe montada em runtime (`` `bg-${cor}-200` ``) escapa. O próprio docblock declara isso (`paleta-em-tokens.test.ts:21-24`). O item "nenhum `.css` além de `globals.css` é auditado" está **vazio hoje**: `find src -name "*.css"` devolve só `globals.css`. *Materialidade: baixa e declarada.*

**R6 — Bookkeeping das lições: L-014 é duplicata de L-003 por causa da chave.** A chave do store é `signal::texto_normalizado` (`.specs/lessons.json`): L-003 entrou como `ac_gap`, L-014 com o **mesmo texto** como `surviving_mutant` → chaves diferentes, sem deduplicação. O efeito prático é que a recorrência fica diluída e nenhuma lição chega ao limiar de promoção (todas as 15 seguem `candidate, x1`). Ver seção 9.

---

## 8. UAT pendente (bloqueia o "pronto para o ar", não o PASS técnico)

| # | Teste | Como conferir | Requisito |
| - | ----- | ------------- | --------- |
| 1 | Sem rolagem horizontal em 360px | DevTools → dispositivo de 360px de largura; percorrer a home inteira e a página de um texto: nenhuma barra horizontal, nenhum bloco cortado | SIT-04 |
| 2 | Movimento reduzido | macOS → Ajustes → Acessibilidade → Vídeo → Reduzir movimento (ou DevTools → Rendering → emular `prefers-reduced-motion: reduce`), recarregar: nada anima na entrada | SIT-06 |
| 3 | Rolagem do menu | Clicar cada item do menu e ver a página rolar até a seção, com o cabeçalho não cobrindo o título | SIT-03 (metade não automatizável) |
| 4 | Fluxo completo da autora | Com o uid real nas regras publicadas: entrar, criar rascunho, publicar, editar, excluir — e ver cada efeito na home | Success criteria |

---

## 9. Lições

Rodado `python3 ~/.claude/skills/tlc-spec-driven/scripts/lessons.py list --status all`: **L-001..L-015, todas `candidate, x1`, nenhuma promovida a `confirmed`**.

**L-014**: confirmada como duplicata textual exata de L-003. **Não foi removida nem editada à mão** — o store é de propriedade do script, que não tem `merge` nem `delete`, e apagar destruiria a evidência (`C6 … o-que-faz-uma-at.tsx:45`) que L-014 carrega e L-003 não. A causa está registrada em R6: a chave de deduplicação inclui o `signal`, então a mesma frase entrando por sinais diferentes escapa. Registrado como lição própria abaixo para não se repetir.

Lições distiladas desta iteração (todas ancoradas em achado desta rodada):

- **R1 → L-016** (`ac_gap`, escopo `rastreabilidade`): linha de rastreabilidade tem de apontar para a task que implementa o requisito; task que fecha um edge case vizinho não serve de evidência.
- **R2 → L-017** (`spec_precision_gap`, escopo `verificacao`): módulo que transcreve valores da spec precisa de um check que o ligue ao texto da spec — sem isso a armadilha só muda de arquivo.
- **R6 → L-018** (`spec_deviation`, escopo `verificacao`): antes de `lessons.py add`, conferir `list --status all` — a chave inclui o sinal, então a mesma frase por sinal diferente cria duplicata em vez de corroborar.

---

## 10. O que este PASS **não** cobre

Dito de forma direta, porque um PASS sem esta seção mente por omissão:

1. **Nenhum navegador real.** Os 323 testes rodam em jsdom: sem layout, sem cascata de CSS, sem media query. SIT-04 e SIT-06 não têm **nenhuma** evidência automatizada, e SIT-03 tem só metade. A trava de paleta compara o **texto** de `globals.css`, não o pixel pintado.
2. **Nenhum Firestore de verdade.** Todo o comportamento de leitura/escrita é verificado contra dublês; as regras, contra o emulador. O caminho feliz ponta a ponta (autora autenticada gravando num projeto real) **nunca foi executado**. Com o uid ainda em `COLE_AQUI_O_UID_DA_AUTORA` e as regras não publicadas, SEC-01 está provado para o **arquivo**, não para a produção.
3. **Nenhuma prova de conteúdo real.** Nome, telefone, e-mail, cidade, texto do "Sobre" e as fotos seguem placeholder. Os testes provam que o componente lê de `content/site.ts`; não provam que o que está lá é o certo.
4. **Nenhum teste de desempenho, acessibilidade automatizada ou E2E** — os dois últimos estão fora de escopo por decisão registrada na spec.
5. **A fidelidade de `valores-da-spec.ts` à spec é humana** (R2), e o teto do sitemap diverge de SEO-01 sem trava possível (R3).

---

## 11. Rastreabilidade

Atualização a aplicar em `spec.md` (o verificador não edita a spec — os 30 requisitos saem de `Implementing` para):

| Requisito | Novo status |
| --------- | ----------- |
| SIT-01, SIT-02, SIT-05, PUB-01..PUB-07, ADM-01..ADM-09, FOR-01..FOR-05, SEO-01, SEO-02, SEC-01 (27) | ✅ Verificado |
| SIT-03 (1) | ✅ Verificado no destino · rolagem em UAT |
| SIT-04, SIT-06 (2) | ⏭️ UAT manual pendente |

---

## Resumo

**Geral**: ✅ **Pronto** no que é automatizável — com 4 itens de UAT em navegador antes do ar.

**O que funciona**: as 4 lacunas da iteração 3 fecharam com asserção que reprova a injeção, comprovado por reinjeção independente. O sensor matou 15/15, incluindo as 5 famílias que doeriam em produção (rascunho vazando, `publicadoEm` ausente, ordenação, guard do painel, erro genérico) e as 3 de regra, com o emulador rodado nesta sessão. Nenhuma sonda de burla passou.

**O que segue aberto**: R1 (rastreabilidade de SIT-06, 1 linha), R2 (transcrição da spec sem trava, custo baixo), R3 (teto do sitemap não previsto), R4 (26 done-when desmarcados), R5/R6 (declarados). Nada disso é comportamento errado; é dívida de documentação e de bookkeeping.

**Próximo passo**: rodar o UAT da seção 8, publicar as regras com o uid real, trocar os placeholders de conteúdo. Fechar R1 e R2 na próxima passagem pela spec.
