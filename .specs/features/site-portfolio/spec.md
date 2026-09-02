# Site Portfólio — Keylla Melo (AT) — Especificação

## Problem Statement

Keylla Melo trabalha como Assistente Terapêutica e hoje só é encontrada por indicação e pelo Instagram, onde o conteúdo se perde no feed. Ela precisa de um endereço próprio que explique o que uma AT faz, mostre sua formação e reúna os textos que ela escreve — e precisa publicar esses textos sozinha, sem depender de terceiros.

## Goals

- [ ] Uma página pública que apresenta a profissional e o papel da AT, com contato a um clique.
- [ ] Publicações e formações mantidas pela própria Keylla, sem intervenção de desenvolvedor.
- [ ] Cada publicação com URL própria, indexável e compartilhável em redes.
- [ ] Base de código com estrutura padronizada por feature, tipada e testada.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Upload/hospedagem de imagens | Decisão do usuário: imagem só por URL externa |
| Formulário de contato / envio de e-mail | Contato resolvido por links diretos (WhatsApp, e-mail, Instagram) |
| Barra de estatísticas (anos, famílias, escolas) | Cortada por não haver números confiáveis |
| Depoimentos de famílias | Exige autorização de terceiros; fora do MVP |
| Cadastro aberto de usuários / recuperação de senha | Usuária única, criada manualmente no console do Firebase |
| Comentários, curtidas, newsletter | Não pedido |
| i18n | Público exclusivamente PT-BR |
| Agendamento online | Não pedido |
| Testes E2E | Usuário escolheu unitário/componente (Vitest + Testing Library) |
| Deploy, domínio e DNS | Etapa posterior, conduzida pelo usuário |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Acesso ao Firestore | Somente Firebase Web SDK (client), sem firebase-admin | Leitura é pública e a escrita é protegida por Firestore Rules + Auth; dispensa service account e segredo em servidor | n |
| Leitura das seções dinâmicas | Server Components com `revalidate = 300` | Conteúdo indexável no Google e sem SDK no bundle da home | n |
| Corpo da publicação | Markdown renderizado com react-markdown + remark-gfm | Ela escreve texto simples; markdown cobre negrito, lista e link sem editor rico | n |
| Slug da publicação | Gerado do título, editável, único por documento | Link legível e estável mesmo se o título for corrigido | n |
| Nome, contatos e textos fixos | Placeholder em `src/content/site.ts`, marcados como pendentes | Dados reais ainda não fornecidos; centralizar evita caça a strings depois | n |
| Fotos | Placeholder CSS até a entrega das imagens reais | Não bloqueia o desenvolvimento | n |
| Domínio de imagem externa | `next/image` com `remotePatterns` restrito a uma allowlist em config | Evita proxy aberto de imagem em domínio de terceiro | n |
| Fuso/data | Datas exibidas em pt-BR, `America/Sao_Paulo` | Público local | n |
| Estado da publicação | `publicado: boolean` (rascunho ↔ no ar) | Ela precisa escrever sem publicar na hora | n |
| Exclusão | Exclusão definitiva com dialog de confirmação | Volume baixo; lixeira seria complexidade sem uso | n |

**Open questions:** none — all resolved or logged above.

### Implicit-requirement dimensions sweep

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | ADM-04: título ≤ 120, resumo ≤ 220, corpo ≤ 20.000, URL de imagem válida e https |
| Failure / partial-failure states | PUB-05, FOR-03, ADM-07: erro de leitura e de escrita fiéis à mensagem do Firebase |
| Idempotency / retry / duplicate handling | ADM-05: salvar é idempotente por id do documento; duplo clique bloqueado pelo estado `salvando` |
| Auth boundaries & rate limits | ADM-01, ADM-02, SEC-01: `/admin` exige sessão; escrita restrita ao uid da allowlist nas rules. Rate limit: N/A porque a superfície de escrita é de usuária única e a autenticação é do Firebase |
| Concurrency / ordering | N/A because a base tem uma única autora; não há escrita concorrente no mesmo documento |
| Data lifecycle / expiry | ADM-06: exclusão definitiva sob confirmação. TTL/arquivamento: N/A porque publicação não expira |
| Observability | N/A because o projeto é estático em Vercel com uma autora; logs da plataforma bastam para o MVP |
| External-dependency failure | PUB-05, FOR-03 e o edge case "Firestore fora do ar": a página fica de pé e as seções dinâmicas degradam para estado de erro; imagem externa quebrada cai em placeholder |
| State-transition integrity | ADM-08: rascunho ↔ publicado é a única transição; documento com `publicado: false` nunca aparece em rota pública |

---

## User Stories

### P1: Visitante entende o trabalho da AT ⭐ MVP

**User Story**: Como mãe de uma criança em acompanhamento, quero entender em um minuto o que uma AT faz e quem é a Keylla, para decidir se faz sentido chamá-la.

**Why P1**: É a razão de existir do site; sem isso, nada mais importa.

**Acceptance Criteria**:

1. The system SHALL render a home em `/` com as seções hero, "O que faz uma AT", "Pedagogia", "Competências", "Atendimento", "Sobre", "Certificações", "Publicações", contato e rodapé, nesta ordem.
2. The system SHALL exibir os 6 pilares do trabalho da AT a partir de `src/content/site.ts`, sem texto duplicado em componente.
3. WHEN o visitante clica em um item do menu THEN the system SHALL rolar até a seção correspondente da mesma página.
4. WHEN a home é carregada em viewport de 360px de largura THEN the system SHALL exibir todo o conteúdo sem rolagem horizontal.
5. The system SHALL aplicar a paleta aprovada (fundo `#EDF3E4`, superfície `#F7FBF1`, oliva `#4C5B34`, dourado `#8E7A32`) por tokens de tema, sem cor literal em componente.
6. IF o visitante abre o site com `prefers-reduced-motion: reduce` THEN the system SHALL renderizar todas as seções sem animação de entrada. SIT-06 trata exclusivamente de movimento: falha de dependência externa e variável de ambiente ausente são os dois edge cases abaixo, e não têm ID de requisito.

7. The system SHALL exibir as 4 frentes de formação da seção "Pedagogia" a partir de `src/content/site.ts`, numeradas na ordem em que sustentam a prática.
8. The system SHALL agrupar as 10 competências da seção "Competências" em 4 famílias — Inclusão, Comunicação, Aprendizagem e Contextos —, cada competência com a descrição do que resolve.
9. The system SHALL repetir as 10 competências como etiquetas na faixa "Atendimento", ao lado dos 4 contextos em que o acompanhamento acontece.

**Independent Test**: Abrir `/` sem Firebase configurado e ver a página estática completa, com as seções dinâmicas em estado vazio.

---

### P1: Visitante lê as publicações ⭐ MVP

**User Story**: Como visitante, quero ler os textos que a Keylla escreve e conseguir compartilhar um deles, para levar a informação a outras famílias.

**Why P1**: É a única seção dinâmica indispensável e a razão do Firebase entrar no projeto.

**Acceptance Criteria**:

1. WHEN a home é renderizada THEN the system SHALL listar as publicações com `publicado == true`, ordenadas por `publicadoEm` decrescente, no máximo 6.
2. WHEN o visitante clica em uma publicação THEN the system SHALL abrir `/publicacoes/[slug]` com título, data, corpo em markdown renderizado e link de volta para a home.
3. IF nenhuma publicação com `publicado == true` existe THEN the system SHALL exibir a mensagem "Nenhuma publicação por aqui ainda." no lugar da lista.
4. IF o slug requisitado não existe ou aponta para documento com `publicado == false` THEN the system SHALL responder 404.
5. IF a leitura do Firestore falha THEN the system SHALL exibir a seção em estado de erro com a mensagem retornada pelo Firebase, mantendo o restante da página utilizável.
6. WHERE a publicação tem `imagemUrl` preenchida the system SHALL exibir a imagem no card e no topo do detalhe.
7. The system SHALL gerar `<title>`, `description` e Open Graph por publicação a partir do título e do resumo.

**Independent Test**: Semear dois documentos (um publicado, um rascunho) e conferir que só o publicado aparece na home e responde em `/publicacoes/[slug]`.

---

### P1: Keylla publica sem depender de ninguém ⭐ MVP

**User Story**: Como autora do site, quero entrar com meu e-mail e senha e escrever, editar ou apagar uma publicação, para manter o conteúdo por conta própria.

**Why P1**: Sem o admin, o site vira estático e a promessa do projeto cai.

**Acceptance Criteria**:

1. WHILE não existe sessão autenticada the system SHALL redirecionar qualquer rota sob `/admin` para `/admin/login`.
2. WHEN as credenciais são aceitas pelo Firebase Auth THEN the system SHALL redirecionar para `/admin`.
3. IF o Firebase Auth rejeita as credenciais THEN the system SHALL exibir a mensagem de erro correspondente ao código retornado, em português, sem revelar se o e-mail existe.
4. IF um campo excede seu limite (título 120, resumo 220, corpo 20.000 caracteres) ou a URL de imagem não é uma URL https válida THEN the system SHALL bloquear o envio e apontar o campo inválido.
5. WHILE uma gravação está em andamento the system SHALL desabilitar os controles do formulário e exibir estado de carregamento.
6. WHEN a autora aciona excluir THEN the system SHALL pedir confirmação em dialog próprio e só remover o documento após confirmação explícita.
7. IF a gravação falha THEN the system SHALL manter os dados preenchidos no formulário e exibir a mensagem retornada pelo Firebase.
8. WHEN a autora alterna o estado de uma publicação THEN the system SHALL persistir `publicado` e refletir o novo estado na listagem do painel.
9. The system SHALL nunca usar `window.confirm`, `window.alert` ou `window.prompt`.

**Independent Test**: Logar, criar um rascunho, publicar, editar, excluir — e ver cada efeito na home.

---

### P2: Formação e certificações mantidas por ela

**User Story**: Como autora, quero cadastrar minha formação, incluindo cursos em andamento, para mostrar atualização contínua.

**Why P2**: Reforça credibilidade, mas o site já entrega valor sem isso.

**Acceptance Criteria**:

1. WHEN a home é renderizada THEN the system SHALL listar as formações ordenadas por `ordem` crescente e, em empate, por `ano` decrescente.
2. WHERE uma formação tem `status == "em_andamento"` the system SHALL exibi-la com o rótulo "Em andamento", distinto do rótulo "Concluído".
3. IF a leitura do Firestore falha THEN the system SHALL exibir a seção em estado de erro com a mensagem retornada pelo Firebase.
4. IF não há formações cadastradas THEN the system SHALL ocultar a seção inteira, inclusive o título.
5. WHEN a autora cria, edita ou exclui uma formação no `/admin` THEN the system SHALL aplicar as mesmas regras de validação, confirmação e erro da P1 de publicações.

**Independent Test**: Cadastrar duas formações, uma concluída e uma em andamento, e conferir ordem e rótulos na home.

---

### P3: Encontrabilidade

**User Story**: Como visitante que pesquisa "assistente terapêutica" na região, quero encontrar o site no Google.

**Why P3**: Ganho de médio prazo; não bloqueia o lançamento.

**Acceptance Criteria**:

1. The system SHALL servir `robots.txt` e um `sitemap.xml` contendo `/` e cada publicação publicada.
2. The system SHALL declarar metadados Open Graph e dados estruturados `Person` na home.

---

## Edge Cases

- IF `imagemUrl` aponta para host fora da allowlist THEN the system SHALL renderizar o card sem imagem, sem quebrar o layout.
- IF o corpo em markdown contém HTML bruto THEN the system SHALL renderizá-lo como texto, sem executar.
- IF duas publicações têm o mesmo slug THEN the system SHALL bloquear a gravação da segunda com mensagem de slug já em uso.
- WHEN o título tem 120 caracteres THEN the system SHALL aceitar (limite inclusivo) e o contador SHALL indicar 120/120.
- IF o Firestore está fora do ar ou recusa a leitura THEN the system SHALL manter a página de pé, com a seção afetada em estado de erro e o restante utilizável (desfecho detalhado em PUB-05 e FOR-03).
- IF as variáveis de ambiente do Firebase estão ausentes THEN the system SHALL falhar na inicialização com mensagem nomeando a variável faltante, em vez de erro genérico de SDK.

---

## Requirement Traceability

| Requirement ID | Story | Tasks | Status |
| -------------- | ----- | ----- | ------ |
| SIT-01 | P1: Visitante entende a AT | T5,T8,T9,T26 (teste em T41,T50) | Verified |
| SIT-02 | P1: Visitante entende a AT | T6,T11 (teste em T48,T56) | Verified |
| SIT-03 | P1: Visitante entende a AT | T8 (teste em T41) | Verified |
| SIT-04 | P1: Visitante entende a AT | T10 | Verified (UAT pendente) |
| SIT-05 | P1: Visitante entende a AT | T4 (trava em T51,T52,T55; paleta em T54) | Verified |
| SIT-06 | P1: Visitante entende a AT | T4 | Verified (UAT pendente) |
| SIT-07 | P1: Visitante entende a AT | T57,T58,T59 | Verified |
| SIT-08 | P1: Visitante entende a AT | T61,T62 | Pending |
| SIT-09 | P1: Visitante entende a AT | T61,T63 | Pending |
| PUB-01 | P1: Visitante lê publicações | T19,T24,T37 (teto em T53) | Verified |
| PUB-02 | P1: Visitante lê publicações | T27,T47 | Verified |
| PUB-03 | P1: Visitante lê publicações | T24 (teste em T49) | Verified |
| PUB-04 | P1: Visitante lê publicações | T27,T40,T45 | Verified |
| PUB-05 | P1: Visitante lê publicações | T19,T24 | Verified |
| PUB-06 | P1: Visitante lê publicações | T23 | Verified |
| PUB-07 | P1: Visitante lê publicações | T27,T44 | Verified |
| ADM-01 | P1: Keylla publica | T28,T29 | Verified |
| ADM-02 | P1: Keylla publica | T30 | Verified |
| ADM-03 | P1: Keylla publica | T16,T30 | Verified |
| ADM-04 | P1: Keylla publica | T17,T32 (limites em T53) | Verified |
| ADM-05 | P1: Keylla publica | T31,T32,T34 | Verified |
| ADM-06 | P1: Keylla publica | T33 | Verified |
| ADM-07 | P1: Keylla publica | T31,T32 | Verified |
| ADM-08 | P1: Keylla publica | T31,T33 | Verified |
| ADM-09 | P1: Keylla publica | T33 | Verified |
| FOR-01 | P2: Formação | T22,T25 | Verified |
| FOR-02 | P2: Formação | T25 | Verified |
| FOR-03 | P2: Formação | T22,T25 | Verified |
| FOR-04 | P2: Formação | T25 | Verified |
| FOR-05 | P2: Formação | T20,T35 | Verified |
| SEO-01 | P3: Encontrabilidade | T38 | Verified |
| SEO-02 | P3: Encontrabilidade | T41 | Verified |
| SEC-01 | P1: Keylla publica | T36,T46 | Verified |

**Coverage:** 33 total, 33 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Keylla cria, edita e exclui uma publicação sem ajuda, na primeira tentativa.
- [ ] `/` responde com o conteúdo dinâmico renderizado no servidor (visível no HTML sem JS).
- [ ] Nenhuma rota pública expõe documento com `publicado == false`.
- [ ] `npm run build`, `tsc --noEmit`, lint e a suíte Vitest passam limpos.
- [ ] Regras do Firestore negam escrita para uid fora da allowlist.
