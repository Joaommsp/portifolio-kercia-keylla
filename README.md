# Site da Keylla Melo

Página única que apresenta o trabalho da Keylla — pedagoga e Assistente
Terapêutica — para as famílias que procuram acompanhamento para os filhos.

Ela é encontrada hoje por indicação e pelo Instagram, onde o conteúdo se perde
no feed. O site dá a ela um endereço próprio: explica o que uma AT faz, mostra a
formação que sustenta o trabalho e reúne os textos que ela escreve — e ela
publica esses textos sozinha, sem depender de ninguém.

## O que a página tem

Uma rota só, nesta ordem:

| Seção | O que mostra |
| ----- | ------------ |
| Abertura | Nome, papel, retrato e os dois caminhos: falar com ela ou entender o trabalho |
| O que faz uma AT | Os seis pilares do acompanhamento — acolhimento, observação, mediação, autonomia, inclusão e parceria com a família |
| Pedagogia | As quatro frentes de formação que sustentam a prática, na ordem em que se somam |
| Sobre | Quem ela é, em primeira pessoa |
| Certificações | Diplomas e cursos, com instituição, ano e situação — inclusive os em andamento |
| Publicações | Os textos dela, cada um com página própria e link compartilhável |
| Contato | WhatsApp, e-mail e Instagram, sem formulário no meio do caminho |

**Certificações** e **Publicações** vêm do banco: ela cria, edita e publica pelo
painel em `/admin`, protegido por login. As duas seções que falam de formação
têm papéis distintos — *Pedagogia* é o argumento (o que cada frente faz no
atendimento), *Certificações* é o registro (o que está no papel).

Cada publicação também responde em `/publicacoes/[slug]`, com metadados
próprios: o link cai bem quando ela compartilha no Instagram ou no WhatsApp.

## Como foi construído

Next 16 (App Router) e TypeScript, Tailwind v4 com a paleta em tokens, shadcn/ui
e Firebase — Firestore para os dados, Auth para a entrada no painel.

Não há servidor próprio. A leitura pública roda em Server Component, para o
conteúdo existir no HTML e o Google enxergar; a escrita roda no navegador
autenticado. Quem autoriza é o `firestore.rules`, que tem suíte de testes
própria, rodada contra o emulador — nas regras, um erro não dá erro: dá acesso.

A base tem 334 testes e passou por verificação independente com injeção de
falhas, para separar teste que cobre de teste que só acompanha.

## Onde está o quê

```
src/
├── app/         # só roteamento: home, /publicacoes/[slug], /admin, sitemap, robots
├── components/  # peças sem domínio: shadcn, formulário, layout
├── features/    # domínio por assunto: publicacoes, formacoes, admin, seções do site
├── content/     # todo texto fixo do site e do painel
└── lib/         # firebase, formatação, rotas
```

Duas convenções explicam quase todo o resto: nenhum texto de interface é escrito
dentro de componente, e nenhuma cor literal aparece fora dos tokens do tema.

## Documentação

- [`docs/SETUP.md`](docs/SETUP.md) — rodar o projeto, configurar o Firebase e
  publicar as regras
- `.specs/` — a especificação viva: requisitos com rastreabilidade
  (`spec.md`), arquitetura (`design.md`), tasks (`tasks.md`), relatório de
  verificação (`validation.md`) e o log de decisões (`STATE.md`)
