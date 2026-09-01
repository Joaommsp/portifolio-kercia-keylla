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

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fases 1 a 4 concluídas (T1–T27). Próximo: Fase 5 (T28–T35, admin).
- **Concluído**: home estática (Fase 2), camada de dados (Fase 3) e seções dinâmicas públicas (Fase 4) — card e seção de publicações, seção de formação, home composta em `app/(site)/` e a rota `/publicacoes/[slug]`. 136 testes.
- **Próximo passo**: `useAuth`, guarda do painel, login, escrita de publicações e o formulário (T28–T32).
- **Conferência visual da T26**: home renderizada com dados semeados em Chromium headless e comparada ao mockup aprovado. Seções na ordem de SIT-01, paleta e tipografia batendo, formação e publicações fiéis ao layout. Sem rolagem horizontal em 360px nem em 1280px (`scrollWidth == clientWidth`, nenhum elemento fora da faixa). Nada da Fase 2 apareceu quebrado.
- **Bloqueios**: dados reais ainda placeholder em `content/site.ts`. O projeto do Firebase responde `permission-denied` na leitura — as regras da T36 ainda não foram publicadas, então a home hoje renderiza a seção em estado de erro, que é o comportamento esperado.
- **Pontos herdados, para as fases seguintes**:
  - A escrita (T31/T32) precisa garantir `publicadoEm` gravada: o `orderBy` da listagem omite documento sem o campo.
  - O formulário de formação (T35) não pode persistir o sentinela `ORDEM_NO_FIM` de um documento que veio sem `ordem`.
  - **Não existe `not-found.tsx`**: o `notFound()` da T27 cai na página padrão do Next, fora da moldura e da paleta do site. Nenhuma task cobre isso, embora o `design.md` preveja o arquivo — criar em `app/(site)/not-found.tsx`, reusando `Container` e `SectionMessage`, com o texto em `content/site.ts`.
  - `revalidate = 300` cacheia o render de erro como cacheia o de sucesso: uma queda curta do Firestore fica servida por até 5 minutos. Aceito no MVP; revisitar se incomodar em produção.
  - A T33 (listagem do painel) vai chamar `listarPublicadas` querendo todas — passar o limite explicitamente, já que o default é o da home (AD-015).
- **Branch**: main · árvore limpa.
