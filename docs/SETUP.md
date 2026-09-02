# Configuração

Como rodar, configurar o Firebase e publicar as regras deste projeto.
O README é só a apresentação; o passo a passo mora aqui.

## Requisitos

- Node 20 ou superior e npm
- Um projeto no [Firebase](https://console.firebase.google.com) (plano gratuito
  atende), com Firestore e Authentication habilitados

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Firebase
npm run dev                  # http://localhost:3000
```

Sem `.env.local` preenchido, a aplicação sobe e as páginas estáticas aparecem,
mas as seções de publicações e formação mostram o erro nomeando a variável que
falta.

## Variáveis de ambiente

Todas são lidas em `src/lib/firebase/config.ts` (menos a última, lida em
`src/content/site.ts`). Os valores saem do Firebase Console → Project settings →
General → Your apps → app Web → SDK setup and configuration.

| Variável | Obrigatória | O que é |
| -------- | ----------- | ------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | sim | Chave pública do app Web |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | sim | Domínio do Auth (`<projeto>.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | sim | Id do projeto |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | sim | Bucket do projeto |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | sim | Id do remetente |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | sim | Id do app Web |
| `NEXT_PUBLIC_SITE_URL` | não | Endereço público do site, usado no canonical, no Open Graph, no sitemap e no robots. Padrão: `https://keyllamelo.com.br` |

As chaves do Firebase Web são públicas por natureza — elas identificam o
projeto, não autorizam nada. A proteção real está nas regras do Firestore.
Ainda assim, `.env.local` não é versionado; só o `.env.example`, sem valores.

## Configurar o Firebase

1. **Criar o projeto** no console e adicionar um app **Web**; copiar a config
   para o `.env.local`.
2. **Firestore Database** → Create database (modo produção; as regras deste
   repositório substituem as padrão).
3. **Authentication** → Sign-in method → habilitar **Email/Password**. Não há
   cadastro aberto nem recuperação de senha no site: a usuária é criada à mão.
4. **Criar a usuária**: Authentication → Users → Add user, com o e-mail e a
   senha da autora. Copiar o **User UID** que aparece na linha criada.
5. **Autorizar a autora**: abrir `firestore.rules` e trocar
   `COLE_AQUI_O_UID_DA_KEYLLA` por esse uid. A allowlist mora nas regras, e
   nunca em campo de documento — no banco, a própria autora poderia editá-la.
6. **Publicar regras e índice** (passo abaixo). Enquanto as regras padrão
   estiverem no ar, a home responde com "Você não tem permissão para esta
   operação".

### Publicar as regras e o índice

Pelo CLI, na raiz do projeto (o `firebase.json` já aponta para os dois
arquivos):

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project <id-do-projeto>
```

Pelo console, se preferir sem CLI:

- **Regras**: Firestore Database → Rules → colar o conteúdo de
  `firestore.rules` → Publish.
- **Índice**: Firestore Database → Indexes → Composite → Add index, coleção
  `publicacoes`, campos `publicado` (Ascending) e `publicadoEm` (Descending).
  É ele que a listagem da home exige, por combinar filtro com ordenação em
  outro campo.

### Testar as regras

As regras são a única proteção da escrita (SEC-01), então elas têm suíte
própria, rodada contra o emulador do Firestore:

```bash
npm run test:rules
```

Ela sobe o emulador, roda `tests/rules/firestore.rules.test.ts` e derruba tudo
no fim. O que está travado: visitante anônimo lê publicação no ar mas não lê
rascunho, não lista a coleção sem filtrar por `publicado == true` e não escreve
nada; o uid da allowlist lê rascunho e escreve; um uid autenticado fora dela,
não. O uid vem lido do próprio `firestore.rules`, então trocar o placeholder
pelo uid real não quebra a suíte.

Fica fora de `npm test` de propósito, por depender de duas coisas externas:

- **Java 11 ou superior** no `PATH` — é o emulador do Firestore que exige.
  Instalado pelo Homebrew, o OpenJDK é *keg-only* e não entra no `PATH`
  sozinho:

  ```bash
  export PATH="$(brew --prefix openjdk@21)/bin:$PATH"
  ```

- **Internet na primeira execução**, para baixar o `.jar` do emulador (o
  `firebase-tools` guarda o arquivo em cache depois disso).

Rode esta suíte sempre que mexer em `firestore.rules`: sem ela, afrouxar uma
regra não quebra teste nenhum.

## Coleções

| Coleção | Campos |
| ------- | ------ |
| `publicacoes` | `titulo`, `slug`, `resumo`, `corpo` (markdown), `imagemUrl`, `tag`, `publicado`, `publicadoEm`, `atualizadoEm` |
| `formacoes` | `titulo`, `instituicao`, `descricao`, `ano`, `status` (`concluido` \| `em_andamento`), `ordem` |

Nenhuma das duas precisa ser criada à mão: o painel cria o documento na
primeira gravação. Os limites de cada campo vivem nos `schemas.ts` de cada
domínio.

As duas seções que falam de formação têm papéis separados: **Pedagogia** é o
argumento — o que cada frente faz no atendimento, texto fixo em
`src/content/site.ts` —, e **Certificações** é o registro, com instituição, ano e
situação, vindo de `formacoes/`. Um mesmo curso pode aparecer nas duas; os papéis
é que não se misturam.

Imagem não é hospedada aqui — entra por URL, e só de um host da allowlist em
`src/content/imagens.ts`, que é a mesma lista dos `remotePatterns` do
`next.config.ts`.

## Scripts

| Script | O que faz |
| ------ | --------- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build |
| `npm run lint` | ESLint |
| `npm test` | Vitest em modo observador (`npm test -- --run` para uma passada) |
| `npm run test:rules` | Regras do Firestore no emulador (exige Java no `PATH`) |
| `npm run typecheck` | `tsc --noEmit` |

Antes de entregar qualquer alteração:

```bash
npx tsc --noEmit && npm run lint && npm test -- --run && npm run build
```
