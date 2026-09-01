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

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fases 1, 2 e 3 concluídas (T1–T22). Próximo: Fase 4 (T23–T27).
- **Concluído**: home estática (Fase 2) e camada de dados completa (Fase 3) — config/cliente/erros do Firebase, schemas, converters e leituras de publicações e formações. 107 testes.
- **Próximo passo**: seções dinâmicas públicas (card e seção de publicações, seção de formações, composição da home, rota `/publicacoes/[slug]`).
- **Bloqueios**: dados reais ainda placeholder. Seções da Fase 2 nunca foram renderizadas — conferência visual acontece na T26.
- **Pontos herdados da Fase 3, para as fases seguintes**:
  - A escrita (T31/T32) precisa garantir `publicadoEm` gravada: o `orderBy` da listagem omite documento sem o campo.
  - O formulário de formação (T35) não pode persistir o sentinela `ORDEM_NO_FIM` de um documento que veio sem `ordem`.
  - `next.config.ts` ainda está sem `remotePatterns`; ao configurá-lo (T23/T39) ele precisa ler a mesma `hostsDeImagemPermitidos`, e o `next.config.ts` não resolve o alias `@/` — pode ser preciso mover a lista para um módulo sem dependência de alias.
- **Branch**: main · árvore limpa.
