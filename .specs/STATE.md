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
| AD-030 | `firebase.json` na raiz, fora do `Where` da T37 | Sem ele `firebase deploy --only firestore:rules,firestore:indexes` não sabe onde estão os dois arquivos — e é esse o comando que o README manda rodar |
| AD-031 | A 404 mora em `src/app/not-found.tsx`, na raiz, e não dentro do grupo `(site)` | Da raiz ela atende as duas entradas: endereço que não casa com rota nenhuma e o `notFound()` de `/publicacoes/[slug]`. O preço é renderizar sem cabeçalho e rodapé — assimetria conhecida com o estado de erro da mesma rota, que os mantém. A variante no grupo só se confirma com o site de pé, e aqui não se sobe dev server |
| AD-032 | `siteUrl` e `URL_PADRAO_DO_SITE` vivem em `lib/url.ts`, e variável em branco vale como ausente | Endereço é configuração de ambiente, não texto editorial (AD-020), e assim `lib/` deixa de importar `content/` — inversão que fecharia ciclo no dia em que `content/site.ts` precisasse de URL absoluta. O `??` anterior deixava passar a string vazia que vem do `.env.example`, e `new URL("")` derrubava todas as páginas por causa de uma variável opcional |

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fases 1 a 6 concluídas (T1–T40). Todas as tasks de `tasks.md` marcadas.
- **Concluído nesta fase**: `firestore.rules` (leitura pública só do que está no ar, allowlist de uid nas próprias regras), `firestore.indexes.json` + `firebase.json`, `sitemap.ts` e `robots.ts`, README e `.env.example`, e a 404 na paleta. 272 testes, 33 arquivos. `tsc`, lint e build limpos.
- **Próximo passo**: publicar as regras e o índice no projeto do Firebase, trocando `COLE_AQUI_O_UID_DA_AUTORA` pelo uid real — é o que ainda faz a home renderizar em estado de erro. Depois, exercitar `/admin` contra o Firebase de verdade (login, gravação, exclusão), que nunca rodou ponta a ponta.
- **Revisores da Fase 6**: 1 bloqueante corrigido, apontado pelos dois — `NEXT_PUBLIC_SITE_URL=` em branco no `.env.example` virava `""`, o `??` não caía no padrão e `new URL("")` derrubava todas as páginas logo depois do `cp .env.example .env.local` que o README manda fazer. Fechado com AD-032 e teste em `src/lib/url.test.ts`. Junto foi o importante de camada (`lib/` importando `content/`).
- **Bloqueios**: nenhum no código. Fora dele: regras não publicadas, dados reais ainda placeholder (telefone, e-mail, cidade, texto do Sobre, fotos) e domínio real ausente em `NEXT_PUBLIC_SITE_URL`.
- **Pontos deixados em aberto pelos revisores** (nenhum bloqueante):
  - `ActionLink` renderiza `<a>` cru, então a volta da 404 para a home é recarga completa; o detalhe da publicação usa `next/link` para o mesmo destino. Cabe dar ao `ActionLink` a opção de renderizar `Link` quando o destino é interno (`ehDestinoExterno` já existe em `lib/link.ts`).
  - A 404 no grupo `(site)`, para o `notFound()` do slug sair com cabeçalho e rodapé (AD-031 explica por que ficou na raiz).
  - `revalidate = 300` está literal em três arquivos porque o Next exige valor estático no segmento; nada trava a divergência entre eles.
  - Falha de leitura no `sitemap.ts` degrada em silêncio — sem log, por a spec marcar observabilidade como N/A.
  - A tabela de rastreabilidade do `spec.md` nunca foi atualizada durante a execução (segue "0 mapped"); o hábito da casa é marcar só o `tasks.md`.
- **Branch**: main · árvore limpa.
