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

## Handoff

- **Feature**: site-portfolio
- **Fase/task**: Fase 1 concluída (T1–T6). Próximo: Fase 2 (T7–T13).
- **Concluído**: scaffold Next 16.3.4, deps fixadas, Vitest+RTL, tokens da paleta, fontes, `src/content/site.ts`.
- **Próximo passo**: worker da Fase 2 (home estática), depois fases 3–6.
- **Bloqueios**: dados reais (telefone, e-mail, cidade, texto do Sobre, fotos) ainda são placeholder.
- **Branch**: main · árvore limpa.
