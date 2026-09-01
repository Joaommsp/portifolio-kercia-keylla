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

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fases 1 e 2 concluídas (T1–T13). Próximo: Fase 3 (T14–T22).
- **Concluído**: setup completo, tokens, fontes, conteúdo fixo, home estática (header, footer, hero, pilares, sobre, contato) com 14 testes.
- **Próximo passo**: camada de dados (Firebase config/client/errors, schemas, converters, queries).
- **Bloqueios**: dados reais ainda placeholder. Seções da Fase 2 nunca foram renderizadas — conferência visual acontece na T26.
- **Branch**: main · árvore limpa.
