# STATE — portfolio-keylla

## Decisions

| ID | Decisão | Motivo |
| -- | ------- | ------ |
| AD-001 | Sem `firebase-admin`; leitura pública via Web SDK em Server Component e autorização em `firestore.rules` | Evita service account e segredo em runtime; a base é pequena e de autora única |
| AD-002 | `features/<domínio>/{schemas,converter,queries,mutations,components}`; `app/` só roteia | Impede o SDK de escrita de vazar para o bundle público |
| AD-003 | `/publicacoes/[slug]` é rota real; o resto do site é página única | SEO e link compartilhável por publicação |
| AD-004 | Texto fixo centralizado em `src/content/site.ts`, com `PENDENTE` nos dados reais | Troca de conteúdo sem caçar string em componente |
| AD-005 | Site em tema claro único; bloco `.dark` do shadcn removido | Direção visual aprovada pelo João; evita meia-implementação de tema |
| AD-006 | Paleta aprovada mapeada nos tokens do shadcn (`--primary` = olive etc.) | Componente shadcn nasce na cor certa, sem override por componente |
| AD-007 | shadcn no preset `base-nova` (@base-ui) | Mesma base do portfólio do João, já conhecida |
| AD-008 | `ActionLink` no site público, `Button` do shadcn no painel | Link de navegação e ação com estado são coisas diferentes; unificar traria estado inútil ao site |
| AD-009 | Primitivos `Container`, `ActionLink`, `SectionHeading`, `PhotoFrame` em `components/layout/` | Reúso pesa mais que o campo `Where` da task; `SectionHeading` já serve T24/T25 |
| AD-010 | Compartilhados da camada de dados fora do `Where` das tasks: `lib/resultado.ts` (tipo `Resultado`), `lib/validacao.ts` (forma da regra de texto), `lib/documento.ts` (normalização na fronteira do Firestore), `test/firestore.ts` (Firestore falso) | Os dois domínios precisam das mesmas peças; duplicar em `publicacoes/` e `formacoes/` seria a alternativa |
| AD-011 | Firebase inicializado sob demanda (`obterDb()` / `obterAuth()`), nunca no topo do módulo | Config faltando lançava na avaliação do import, fora do `try` das queries, e derrubava a rota inteira em vez de degradar a seção |
| AD-012 | Formações são ordenadas na aplicação (`ordenarFormacoes` em `converter.ts`), não no Firestore | `orderBy` omite documento sem o campo — formação gravada sem `ordem` sumiria; e a ordem composta exigiria índice para uma coleção de poucos registros |

| AD-013 | `SectionMessage` em `components/layout/`: um bloco só para o estado vazio e para o de erro das seções dinâmicas | Publicações, formação e o detalhe precisam da mesma peça; a alternativa era triplicá-la |
| AD-014 | Allowlist de host de imagem mora em `content/imagens.ts`, módulo folha sem nenhuma importação, e é a única porta — `content/site.ts` não a reexporta | O `next.config.ts` precisa da mesma lista para os `remotePatterns` e é avaliado fora do TypeScript da aplicação, sem o alias `@/`; um re-export criaria dois caminhos para a mesma constante |
| AD-015 | `LIMITE_PUBLICACOES_HOME` mora em `schemas.ts` e é aplicado nas duas pontas: `limit()` na consulta e `slice()` na seção | Componente não pode importar `queries.ts` (AD-002); a consulta corta o tráfego e a seção garante o contrato visual da spec, que é o que o teste trava |
| AD-016 | No detalhe da publicação, falha de leitura NÃO vira 404: 404 é só slug inexistente ou rascunho. O estado de erro sai com `noindex` | Firestore fora do ar não significa que o texto não existe — devolver 404 mentiria para o visitante e para o buscador; o `noindex` evita indexar o erro no lugar do texto |
| AD-017 | `lib/rotas.ts` guarda os caminhos internos (`CAMINHO_HOME`, `caminhoDaPublicacao`) | Card, detalhe e o `sitemap.ts` da T38 montam a mesma URL; deixá-la na feature faria o sitemap importar domínio só para montar caminho |
| AD-018 | A seção de publicações mantém o título nos três estados; a de formação some inteira no vazio | Assimetria pedida pela spec (PUB-03 x FOR-04): a âncora `#publicacoes` do menu precisa existir mesmo sem texto publicado |
| AD-019 | `metadataBase` declarado no layout raiz a partir de `siteUrl`; canonical e Open Graph passam caminho relativo | Sem `metadataBase` o Next resolve relativo contra `localhost`, e a rota de publicação existe por SEO (AD-003). Vale também para o `sitemap.ts` da T38 |
| AD-020 | Separador e junção da linha de metadados vivem em `lib/format.ts` (`SEPARADOR_DE_META`, `juntarMeta`), não em `content/site.ts` | É formatação, não conteúdo editorial; as duas cópias inline já tinham divergido na regra do vazio |
| AD-021 | A sessão da autora é uma feature: `features/admin/` com `auth.ts` (entrar/sair), `painel-guard`, `painel-shell` e `login-form`; `app/(admin)/` só roteia | Formulário e guarda são domínio, não roteamento — e assim têm teste sem passar por rota |
| AD-022 | O `PainelGuard` resolve as duas direções (sem sessão → login; com sessão no login → painel) e, quando a sessão nem pôde ser consultada, mostra a mensagem em vez de redirecionar | `/admin/login` mora dentro do grupo guardado, então o laço só se evita decidindo os dois sentidos no mesmo lugar; e erro de configuração não é "deslogada" — empurrar para o login mentiria sobre a causa |
| AD-023 | Cada domínio ganha `painel.ts`: leitura do painel no cliente autenticado, separada de `queries.ts` | Client Component não importa a leitura do servidor (AD-002). Em publicações a diferença é real (vê rascunho, lê por id, ordena na aplicação para não sumir com documento sem `publicadoEm`); em formações é espelho da leitura pública, assumido por escrito no cabeçalho do arquivo |
| AD-024 | Toda escrita de publicação garante `publicadoEm`; `atualizar` e `alternarPublicado` recebem a data já gravada e só carimbam quando ela falta | O `orderBy` da home omite documento sem o campo — gravar sem a data faria a publicação sumir. E editar o texto não pode mudar a data em que ele foi publicado |
| AD-025 | `ORDEM_MAXIMA_FORMACAO` no schema torna o sentinela `ORDEM_NO_FIM` um valor inválido; `proximaOrdem` e `paraFormularioDeFormacao` fazem a troca na fronteira do formulário | O sentinela significa "sem ordem gravada"; persisti-lo transformaria uma ausência em número absurdo. Com o teto, a proteção deixa de depender de convenção |
| AD-026 | O formulário de formação só é montado depois de a lista responder, e é remontado pela `key` a cada troca de edição ou gravação concluída | A ordem sugerida sai do que já está cadastrado: montado antes da lista, o RHF congelaria `ordem = 0` e toda formação nova nasceria colidindo com a primeira. A `key` evita efeito sincronizando prop com estado de formulário |
| AD-027 | `hooks/use-carga.ts` concentra a máquina `carregando / erro / dados`, com guarda de atividade tanto na carga inicial quanto nas releituras | A guarda estava só no efeito e faltava justamente na releitura pós-ação, que é a mais demorada; e a máquina estava copiada em três telas |
| AD-028 | Primitivos do painel: `components/form/campo.tsx` (rótulo, ajuda, erro e contador), `components/layout/confirmar-exclusao.tsx` e `components/layout/tabela-painel.tsx` | Publicações e formações usam os três; `components/layout/` segue sendo a pasta de primitivos compartilhados do projeto (AD-009, AD-013), em vez de abrir mais uma |
| AD-029 | `LIMITE_PUBLICACOES_PAINEL` mora em `schemas.ts`, ao lado de `LIMITE_PUBLICACOES_HOME` | Limite é regra e vive no schema (AD-015); lado a lado, a diferença entre o teto do painel e o da home fica visível de uma vez |

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fases 1 a 5 concluídas (T1–T35). Próximo: Fase 6 (T36–T40, fechamento).
- **Concluído**: a área `/admin` inteira — `useAuth`, guarda e moldura do painel, login, escrita e listagem de publicações, formulário e rota de edição, escrita e tela de formações. 257 testes, 29 arquivos. `tsc`, lint e build limpos.
- **Próximo passo**: T36 (regras do Firestore) e T37 (índice composto) — são eles que hoje impedem a home de ler; depois T38 (sitemap/robots), T39 (README/.env.example) e T40 (404 na paleta).
- **Revisores da Fase 5**: 2 bloqueantes corrigidos — o login reimplementava o `Campo` recém-criado, e o formulário de formação montava antes da lista, congelando `ordem = 0` em toda formação criada na primeira visita (AD-026, com teste de regressão em `formacoes-painel.test.tsx`). Também fechados: `useCarga` (AD-027), `TabelaPainel` + `FormacoesTable` (AD-028), `sair` migrado para `features/admin/auth.ts`, rota de edição de volta a Server Component, caminhos do painel compostos a partir de `CAMINHO_PAINEL`, `ORDEM_MINIMA_FORMACAO`, variante do selo por mapa exaustivo.
- **Bloqueios**: as regras do Firestore (T36) ainda não foram publicadas, então o build segue renderizando a home em estado de erro (`permission-denied`) — esperado. Dados reais ainda placeholder em `content/site.ts`. A área `/admin` nunca foi exercitada contra o Firebase real: sem as rules, login e escrita não têm como ser testados de ponta a ponta.
- **Pontos herdados, para a Fase 6**:
  - **Não existe `not-found.tsx`**: o `notFound()` da T27 cai na página padrão do Next. É a T40 — criar em `app/(site)/not-found.tsx`, reusando `Container` e `SectionMessage`, com o texto em `content/site.ts`.
  - A T36 precisa cobrir o que o painel faz hoje: ler a coleção inteira de publicações (rascunho incluído) e ler documento por id — a leitura pública por slug não é mais a única.
  - `import "server-only"` nos dois `queries.ts` transformaria a fronteira do AD-002 em erro de build, mas exige uma dependência nova; ficou de fora e vale decidir na Fase 6.
  - No formulário de publicação, "Salvar rascunho" não troca o rótulo durante o envio (fica desabilitado, como o resto do `fieldset`) — assimetria conhecida com o botão "Publicar".
  - `revalidate = 300` cacheia o render de erro como cacheia o de sucesso: uma queda curta do Firestore fica servida por até 5 minutos. Aceito no MVP.
- **Branch**: main · árvore limpa.
