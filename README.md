# Calmaria

Diário de humor com IA de apoio. Trabalho Final de Desenvolvimento de Aplicações para Dispositivos Móveis (UFPR, prof. Anderson da Silva Marcolino), domínio Saúde Mental.

**Equipe:** Pedro Arthur, Yudi Doi, Jardel Ferreira.

**Repositório:** https://github.com/pedroboton-soares/calmaria

O Calmaria é um aplicativo de **apoio e acompanhamento**. Ele não faz diagnóstico, não indica tratamento e não substitui atendimento profissional. Em crise, ligue para o CVV (188) ou para o SAMU (192).

O projeto tem três partes, todas neste repositório:

| Pasta | O que é |
|---|---|
| `api-app/` | API do aplicativo: cadastro, login, CRUD de registros, relatório em PDF e banco SQLite |
| `app/` | Aplicativo em React Native (Android) |
| `api-ia/` | API de IA generativa, publicada no Render, que conversa com o Gemini |
| `materiais-ia/` | Materiais que alimentam a IA, com as fontes em `FONTES.md` |

---

## 1. Apresentação do aplicativo

**Tema:** registro de humor (diário emocional). A pessoa registra como está (nota de 1 a 5, com texto opcional e data) e acompanha seu histórico.

**Público-alvo:** jovens e adultos que querem acompanhar o próprio humor no dia a dia, com ou sem acompanhamento profissional. Por isso a linguagem é simples, não clínica e sem cobrança.

**Por que esse tema:** o automonitoramento do humor é uma das ferramentas mais usadas em apps de saúde mental e ajuda a pessoa a perceber padrões. É também um tema que cabe em um CRUD claro (o registro é a entidade do domínio).

| Funcionalidade | Tela | Justificativa |
|---|---|---|
| Cadastro com consentimento | Cadastro, Consentimento | A conta só é criada depois do aceite explícito, porque dado de saúde é sensível pela LGPD. |
| Login com token | Login | Cada pessoa só vê os próprios dados; o token evita mandar a senha a cada pedido. |
| Registrar humor (criar e editar) | FormRegistro | É a ação principal. Escala curta de 5 opções com emoji e nome, texto opcional e data no formato brasileiro. |
| Listar, editar e excluir registros | Registros | Permite revisitar o histórico e corrigir ou apagar o que quiser (controle sobre os dados). |
| Planta e sequência de dias (inovação) | Início | Dá um retorno visual acolhedor ao hábito de se registrar. Detalhes no item 10. |
| Reflexão com IA sobre um registro | Reflexao | Ajuda a pensar sobre um dia específico, ligada ao registro e não como chat genérico. |
| Resumo da semana com IA | ResumoSemana | Mostra o que se repetiu nos últimos 7 dias e uma sugestão simples de autocuidado. |
| Relatório em PDF por período | Relatório | Permite guardar ou mostrar os dados a um profissional; exigência do trabalho e direito de portabilidade. |
| Ajustes: tema, planta e tamanho do texto | Ajustes | Personalização e acessibilidade (item 8). |
| Minha conta: apagar registros, apagar conta, sair | Conta | Direitos do titular pela LGPD. |
| Política de privacidade | Politica | Explica em linguagem simples o que é guardado, para quê e onde. |
| Atalho para o CVV 188 | Início, Reflexão, Resumo | Ajuda profissional sempre a um toque, porque o app não substitui atendimento. |

---

## 2. Tecnologias e bibliotecas utilizadas

### API do aplicativo (`api-app/`)

| Biblioteca | Versão | Motivo |
|---|---|---|
| Node.js | 22.13 ou mais novo (testado no 24) | Já vem com SQLite embutido (`node:sqlite`), sem compilar nada no Windows. |
| express | 5.3.0 | Framework de rotas mais conhecido, simples de explicar. |
| node:sqlite | embutido no Node | Banco em um único arquivo, sem instalar servidor de banco. Trocamos o better-sqlite3 porque ele exige Visual Studio C++ no Windows. |
| bcryptjs | 3.0.3 | Criptografa a senha (hash). Versão em JavaScript puro, sem compilação. |
| jsonwebtoken | 9.0.3 | Cria e confere o token de login (JWT). |
| pdfkit | 0.20.2 | Gera o relatório em PDF direto no servidor, com os dados do banco. |
| cors | 2.8.6 | Permite que o app chame a API. |
| dotenv | 18.0.9 | Lê o arquivo `.env` com o segredo do token. |

### API de IA (`api-ia/`)

| Biblioteca | Versão | Motivo |
|---|---|---|
| express | 5.3.0 | Mesmo framework da outra API, para o grupo usar um padrão só. |
| fetch (embutido no Node) | | Chama o Gemini sem instalar o SDK do Google: menos dependências e o pedido fica visível no código. |
| cors | 2.8.6 | Permite que o app chame a API. |
| dotenv | 17.4.2 | Lê a chave do Gemini do `.env` em desenvolvimento (no Render ela fica nas variáveis de ambiente). |

### Aplicativo (`app/`)

| Biblioteca | Versão | Motivo |
|---|---|---|
| React Native (CLI, sem Expo) | 0.88.0 | Pedido da disciplina; o CLI dá acesso direto ao projeto Android para gerar o APK. |
| React | 19.3.0 | Vem com o React Native 0.88. |
| @react-navigation/native, native-stack, bottom-tabs | 7.5.1, 7.21.0, 7.21.0 | Navegação padrão da comunidade: pilha de telas e abas embaixo. |
| react-native-screens, react-native-safe-area-context | 4.30.0, 5.10.1 | Exigidas pelo React Navigation. |
| @react-native-async-storage/async-storage | 2.2.0 | Guarda o token e as preferências no celular. Fixada na v2 porque a v3 quebrou o build. |
| react-native-svg | 15.16.1 | Desenha a planta (inovação) em vetor, que fica nítida em qualquer tela e muda de cor com o tema. |
| react-native-blob-util | 1.1.1 | Baixa o PDF com o token no cabeçalho e salva como arquivo; o `fetch` comum não salva arquivo. |

---

## 3. Decisões arquiteturais

### Aplicativo

```
app/
  App.js                 navegação: telas de quem não entrou e telas de quem entrou (abas + pilha)
  src/screens/           uma tela por arquivo (LoginScreen, HomeScreen, ...)
  src/components/        peças reutilizadas: Botao, CampoTexto, Cartao, Planta, AvisoIA
  src/context/           estado global: AuthContext (login) e TemaContext (tema, fonte, planta)
  src/services/          comunicação: api.js (API do app) e ia.js (API de IA)
  src/utils/             regras sem tela: humor, datas, sequencia, mensagens
  src/config.js          endereços das duas APIs
```

- **Separação por responsabilidade** (telas, componentes, comunicação e estado), como pede o enunciado. Uma tela nunca chama `fetch` direto: usa `chamarApi` ou `ia.js`. Assim, se o endereço ou o jeito de mandar o token mudar, muda em um lugar só.
- **Estado global com Context API** em vez de Redux: só dois estados são globais (usuário logado e preferências visuais), e o Context já vem no React. Menos biblioteca e mais fácil de explicar.
- **Cores e fontes só pelo `useTema()`**: nenhuma tela tem cor fixa. Por isso o tema escuro e o tamanho do texto valem para o app inteiro.
- **Regras sem tela em `utils/`**: a sequência de dias (`sequencia.js`) é uma função pura, testada com Jest em `app/__tests__/sequencia.test.js`.
- **Sessão expirada**: `api.js` avisa o `AuthContext` quando a API responde 401, e o app volta para o login sozinho.

### API do aplicativo

```
api-app/src/
  server.js              liga o Express, as rotas e os tratadores de erro
  db.js                  abre o banco e roda o schema.sql
  schema.sql             script que cria as tabelas (usuarios e registros)
  middleware/auth.js     confere o token e coloca o id do usuário em req.usuarioId
  routes/                auth.js, usuarios.js, registros.js, relatorio.js
```

- **Uma pasta de rotas por assunto** para cada membro cuidar do seu arquivo sem conflito.
- **O id do usuário sempre vem do token**, nunca da URL ou do corpo, e toda consulta tem `WHERE usuario_id = ?`. Assim ninguém acessa dado de outra pessoa.
- **Consultas parametrizadas com `?`** para evitar SQL injection.
- **Erros sem detalhes técnicos para o app**: o detalhe vai só para o terminal do servidor.

### API de IA

- Um arquivo de servidor (`server.js`), um com as regras e a mensagem de crise (`prompt.js`) e um que lê os materiais (`materiais.js`).
- **A checagem de crise é feita pelo nosso código**, não pela IA: se o texto tiver sinal de risco, a mensagem fixa do CVV 188 é acrescentada mesmo que o Gemini falhe.
- **Não guarda nada**: não tem banco e não registra o texto do usuário no log.
- **Limite de 20 pedidos a cada 10 minutos por IP** para proteger a cota gratuita do Gemini.

---

## 4. Execução em ambiente de desenvolvimento

### 4.1 Programas a instalar

1. **Git**: https://git-scm.com
2. **Node.js 22.13 ou mais novo** (recomendado o 24 LTS): https://nodejs.org
3. **Android Studio** com o Android SDK e um emulador (AVD) criado: https://developer.android.com/studio
4. **JDK 17** (vem junto com o Android Studio). A variável `JAVA_HOME` deve apontar para ele, e `ANDROID_HOME` para a pasta do SDK (no Windows, normalmente `C:\Users\<voce>\AppData\Local\Android\Sdk`).

### 4.2 Copiar o repositório

```bash
git clone https://github.com/pedroboton-soares/calmaria.git
cd calmaria
```

### 4.3 Colocar os arquivos do ZIP

O ZIP entregue na UFPR Virtual tem esta estrutura. Copie cada arquivo para a mesma pasta dentro do repositório:

| Arquivo no ZIP | Onde colocar | Para que serve |
|---|---|---|
| `api-app/.env` | `calmaria/api-app/.env` | Porta e `JWT_SECRET` (segredo que assina o token) |
| `api-ia/.env` | `calmaria/api-ia/.env` | Porta, `GEMINI_API_KEY` e `GEMINI_MODEL` (só para rodar a IA localmente; o app usa a IA publicada no Render) |

Sem o ZIP, dá para criar os arquivos a partir dos modelos `api-app/.env.example` e `api-ia/.env.example`. **O `JWT_SECRET` não pode ficar vazio**, senão o login responde erro 500. Para gerar um valor:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.4 API do aplicativo e banco de dados

```bash
cd api-app
npm install
npm start
```

O banco é criado sozinho: na primeira execução, `src/db.js` cria o arquivo `api-app/calmaria.db` e roda o script `src/schema.sql`, que cria as tabelas. Para testar, abra http://localhost:3000/saude no navegador: deve aparecer `{"ok":true}`.

Deixe esse terminal aberto.

### 4.5 API de IA (opcional em desenvolvimento)

O app já usa a API de IA publicada (item 9). Para rodar localmente:

```bash
cd api-ia
npm install
npm start
```

Teste em http://localhost:4000/saude.

### 4.6 Aplicativo

1. Abra o emulador pelo Android Studio (Device Manager, botão Play).
2. Em um terminal novo:

```bash
cd app
npm install
npm start
```

3. Em outro terminal, também na pasta `app`:

```bash
npm run android
```

A primeira compilação demora alguns minutos. O app abre no emulador, já falando com a API em `http://10.0.2.2:3000` (é o jeito do emulador chamar o computador).

**Celular de verdade:** troque `API_URL` em `app/src/config.js` pelo IP do computador na rede (por exemplo `http://192.168.0.10:3000`) e acrescente esse IP em `app/android/app/src/main/res/xml/network_security_config.xml`.

### 4.7 Testes automáticos

```bash
cd app
npm test
```

---

## 5. Geração do APK para o ambiente de produção

1. Confira os endereços em `app/src/config.js`: `IA_URL` é o endereço do Render (item 9) e `API_URL` é o endereço da API do app (no emulador, `http://10.0.2.2:3000`).
2. Gere o APK de release (Windows, PowerShell):

```powershell
cd app\android
.\gradlew.bat assembleRelease
```

No Linux ou macOS use `./gradlew assembleRelease`.

3. O APK fica em `app/android/app/build/outputs/apk/release/app-release.apk`.
4. Instale no emulador aberto (ou arraste o arquivo para a janela do emulador):

```bash
adb install -r app/android/app/build/outputs/apk/release/app-release.apk
```

5. Deixe a API do app rodando (item 4.4) antes de abrir o app.

**Configurações que tornam isso possível e por quê:**

- **Assinatura:** o APK de release é assinado com a chave de debug (`app/android/app/debug.keystore`, que é a chave pública padrão do React Native, não um segredo). Para um trabalho acadêmico basta; para publicar na Play Store seria preciso criar uma chave própria e guardá-la fora do Git.
- **http em release:** o Android bloqueia `http` sem criptografia em APK de release. Como a API do app roda no computador de quem testa, liberamos `http` **só** para `10.0.2.2`, `localhost` e `127.0.0.1`, em `app/android/app/src/main/res/xml/network_security_config.xml`. A API de IA usa `https`, então não precisa de liberação.
- **Por que a API do app não está no Render:** o plano gratuito do Render apaga o disco quando o serviço reinicia, e o banco SQLite sumiria. Por isso só a API de IA (que não guarda nada) fica no Render.

---

## 6. Requisitos de qualidade adotados

| Requisito | Medida | Justificativa |
|---|---|---|
| Facilidade de uso | Ação principal ("Registrar como estou") em destaque na Início; escala de 5 humores com emoji e nome; textos curtos e sem termos clínicos; data no formato brasileiro. | Quem está mal tem menos energia e atenção; registrar precisa levar segundos (guia TrackWell, rec. 82, p. 35). |
| Facilidade de uso | Mensagens de erro que dizem o que fazer ("Confira a data. Escreva no formato DD/MM/AAAA"). | Reduz frustração (rec. 90, p. 38). |
| Desempenho | A sequência é calculada no celular a partir da lista que já vem da API, sem rota nova; índice `(usuario_id, data)` no banco. | Evita pedidos extras ao servidor e mantém a consulta rápida mesmo com muitos registros. |
| Desempenho | Lista com `FlatList` (desenha só o que aparece na tela). | Histórico pode crescer sem travar o app. |
| Manutenibilidade | Código separado por responsabilidade, componentes reutilizados, comentário em português em toda função, nomes coerentes. | Cada membro consegue mexer e explicar a sua parte. |
| Manutenibilidade | Testes da sequência com Jest (`npm test`). | É a regra mais fácil de errar (virada de mês, dia sem registro). |
| Confiabilidade | Validação dos dados no app **e** na API (humor de 1 a 5, data que existe, texto até 1000 caracteres). | O app ajuda a pessoa; a API protege o banco mesmo que alguém chame direto. |
| Confiabilidade | Se a API cair, as telas mostram mensagem e botão "Tentar de novo"; a IA espera até 90 s e tenta de novo quando o Gemini está sobrecarregado (erro 503). | O plano gratuito do Render "dorme" e demora para acordar. |
| Confiabilidade | Mensagem do CVV 188 garantida pelo nosso código, mesmo se a IA falhar. | Em risco, a pessoa não pode ficar sem orientação. |

---

## 7. Requisitos de segurança e de proteção de dados (LGPD)

| Requisito (seção 2.6) | Onde foi implementado | Justificativa |
|---|---|---|
| Senha criptografada | `api-app/src/routes/auth.js` (bcrypt, custo 10); coluna `senha_hash` em `schema.sql` | Se o banco vazar, as senhas não podem ser lidas. |
| Autenticação por token e rotas restritas | `auth.js` cria o JWT (7 dias); `middleware/auth.js` exige `Authorization: Bearer` em `/usuarios`, `/registros` e `/relatorio` | Só quem fez login acessa os dados; o token deixa de valer se a conta for apagada. |
| Cada usuário acessa só os próprios dados | Todas as consultas em `routes/registros.js`, `relatorio.js` e `usuarios.js` usam `usuario_id = req.usuarioId`, vindo do token | Ninguém consegue ler, alterar ou apagar dado de outra pessoa trocando um id. |
| Consultar, alterar, excluir e exportar os próprios dados | Telas Registros (ver, editar, excluir), Relatório (PDF), Conta (apagar tudo) | Direitos do titular (LGPD, art. 18). |
| `.env` e chaves fora do repositório | `.gitignore` (`.env`, `*.db`, `node_modules`); modelos `.env.example`; chave do Gemini só nas variáveis do Render | Chave publicada no GitHub fica exposta para sempre no histórico. |
| Aviso de dado sensível e consentimento explícito antes do primeiro registro | Tela Consentimento (`ConsentimentoScreen.js`): a conta só é criada com o interruptor ligado; a API recusa cadastro sem `consentimento: true` e grava a data do aceite | Dado de saúde é sensível; o aceite não pode vir pré-marcado nem embutido no botão (guia, p. 44). |
| Política de privacidade em linguagem simples | Tela Politica (`PoliticaScreen.js`), aberta no Login, no Consentimento, em Ajustes e em Minha conta | Diz quais dados, para quê, onde ficam e que não são divulgados. |
| Aviso de envio à IA de terceiros, só com ação do usuário e só o necessário | Componente `AvisoIA.js` nas telas Reflexao e ResumoSemana; envio só no botão "Enviar para a IA"; `services/ia.js` manda só humor, data e texto | O Gemini é serviço de terceiros; nome e e-mail não são necessários e não vão. |
| Excluir os próprios dados e a conta | Tela Conta: `DELETE /usuarios/me/dados` e `DELETE /usuarios/me` (com `ON DELETE CASCADE`), ambos com confirmação | Direito de eliminação (LGPD); a confirmação evita apagar por engano. |
| Dados fictícios em testes e imagens | Todas as contas de teste e capturas usam nomes e textos inventados | Exigência do trabalho e cuidado com dados reais. |
| Outras medidas | `x-powered-by` desligado nas duas APIs; erro 500 sem detalhes; limite de pedidos na API de IA; `allowBackup="false"` no Android | Menos informação para quem tenta atacar e proteção da cota da IA. |

**Limitações conhecidas (não escondemos):**
- O token fica no AsyncStorage, que não é um cofre criptografado. Melhoria futura: Android Keystore.
- A API do app usa `http` no emulador (liberado só para os endereços locais). Em produção real seria preciso `https`.
- O plano gratuito do Render dorme depois de um tempo sem uso; o primeiro pedido à IA pode levar até 1 minuto.

---

## 8. Interface, IHC e UX

Todas as telas seguem o **Guia TrackWell** (Moeda Junior e Boscarioli, 2025, https://educapes.capes.gov.br/handle/capes/1132272). As páginas citadas são as do rodapé do guia.

### 8.1 Itens do guia aplicados

| # | Item do guia | Tela | Justificativa |
|---|---|---|---|
| 1 | Rec. 10: garantir controle e soberania total sobre os dados, com edição, exclusão e exportação (p. 11) | Registros, Conta, Relatório | A pessoa edita e apaga cada registro, apaga tudo ou a conta, e exporta em PDF escolhendo o período. |
| 2 | Rec. 10: telas de confirmação e revisão antes do envio de informação sensível (p. 11) | Reflexao, ResumoSemana | Antes de mandar à IA, a tela mostra exatamente o que vai e só envia no toque em "Enviar para a IA". |
| 3 | Rec. 15: explicar por que os dados são pedidos e confirmar quando ações sensíveis forem concluídas (p. 12) | Consentimento, Conta | O consentimento explica a finalidade; ao apagar, o app confirma "Seus registros foram apagados" ou "Conta apagada". |
| 4 | Consentimento sem caixa pré-marcada, com acesso à política completa e botão de aceite destacado (p. 44) | Consentimento | O interruptor começa desligado e o botão de criar conta só libera depois do aceite. |
| 5 | Rec. 51: política de privacidade acessível no onboarding e nas configurações, organizada em cards (p. 24) | Politica | Dividida em 8 cartões curtos, aberta pelo Login, Consentimento, Ajustes e Minha conta. |
| 6 | Rec. 56 e 57: confirmações e alertas antes de ações que impactam os dados (p. 25 e 26) | Registros, Conta | Toda exclusão abre um alerta que diz o que será apagado e que não tem volta. |
| 7 | Rec. 55: transparência sobre como as sugestões são geradas (p. 25) | Reflexao, ResumoSemana | O cartão "Antes de enviar" explica para quem vai, com base em quais materiais a IA responde e o que ela não faz. |
| 8 | Rec. 31: acesso rápido a ajuda, como "Encontre um profissional" (p. 18) | Início (e Reflexão/Resumo em crise) | Cartão fixo com botão "Ligar para o CVV (188)". |
| 9 | Rec. 28: respostas compreensivas e validadoras após relatos difíceis; cores suaves (p. 17) | Início | Depois de um registro com humor 1 ou 2 a mensagem acolhe ("É compreensível se sentir assim") em vez de comemorar. Paleta verde e azul clara. |
| 10 | Rec. 80 e 76: reforço positivo e marcos de consistência, como "dias seguidos" (p. 32 e 33) | Início | A planta ganha uma folha por dia seguido com registro e mostra sequência atual, melhor sequência e dias no mês. |
| 11 | Rec. 61 e 62: gamificação opcional e desativável, sem pressão de tempo (p. 28) | Ajustes, Início | Interruptor "Mostrar planta e sequência". A planta nunca murcha e a frase não cobra quem ficou dias sem registrar. |
| 12 | Rec. 88: escala de humor curta, rótulos claros, horizontal, com espaço para evitar toque errado e diferenciação visual (p. 37) | FormRegistro | 5 opções lado a lado, cada uma com emoji e nome, botões de 72 de altura e a escolhida destacada em cor e borda. |
| 13 | Rec. 59: microtextos com tom empático em campos e carregamentos (p. 26) | FormRegistro, Início, Reflexão | Campo com "Se quiser, conte como está se sentindo hoje..." e carregamento com "Respire fundo...". |
| 14 | Rec. 81 e 92: barra de navegação inferior com até 5 destinos, ícone e rótulo (p. 35 e 38) | Principal (abas) | 4 abas (Início, Registros, Relatório, Ajustes), sempre com texto além do ícone (rec. 100, p. 41). |
| 15 | Rec. 86: prevenir erros validando entradas (p. 36) | FormRegistro, Cadastro | A data é conferida (existe e não é no futuro) e cada campo mostra a mensagem logo abaixo dele. |

### 8.2 Responsividade

Todas as telas rolam (`ScrollView` ou `FlatList`), então nada some com fonte grande ou com o celular deitado. O conteúdo tem largura máxima de 640 e fica centralizado em telas largas (tablet, paisagem). Grupos de botões usam `flexWrap` e descem para a linha de baixo quando não cabem. A planta é desenhada em vetor (SVG) e escala sem perder nitidez. O app não trava a orientação. **Justificativa:** o professor e os usuários podem usar aparelhos de tamanhos diferentes, e a fonte ampliada (acessibilidade) não pode quebrar o layout.

### 8.3 Sensibilidade ao contexto

- **Horário do dia:** a Início diz "Bom dia", "Boa tarde" ou "Boa noite" (`utils/mensagens.js`).
- **Histórico de uso:** a Início muda o texto e o botão conforme a pessoa já registrou hoje ou não ("Registrar como estou" ou "Fazer outro registro") e a frase da planta muda conforme a sequência.
- **Conteúdo do registro:** a mensagem depois de salvar muda com o humor registrado (acolhe nos dias difíceis).

**Justificativa:** o guia pede adaptar a interface ao contexto e ao estado emocional (rec. 50, p. 24), e uma mensagem de comemoração em um dia ruim soaria fria.

### 8.4 Personalização

Em Ajustes: **tema claro ou escuro** e **mostrar ou esconder a planta e a sequência**. As escolhas ficam salvas no celular (AsyncStorage, em `TemaContext.js`) e continuam depois de fechar o app. **Justificativa:** o guia recomenda permitir personalizar o tema (rec. 8, p. 10) e que o usuário decida se quer elementos de jogo (rec. 61, p. 28).

### 8.5 Acessibilidade

(Separada da personalização, como pede o enunciado.)

- **Tamanho do texto ajustável** (Normal, Grande, Muito grande) em Ajustes, aplicado em todas as telas pelo `tamanho()` do `useTema()`, e salvo no celular.
- **Leitor de tela:** botões com `accessibilityLabel` e `accessibilityHint`, títulos com `accessibilityRole="header"`, erros anunciados com `accessibilityLiveRegion`, a planta descrita em texto ("Planta com 5 folhas").
- **Áreas de toque de no mínimo 48** em todos os botões e campos.
- **Informação que não depende só de cor:** a opção escolhida tem "✓" e texto em negrito; cada humor tem emoji **e** nome.
- **Contraste:** cores escolhidas com contraste de pelo menos 4,5:1 para texto (por exemplo, branco sobre o verde `#2F7D4F` dá cerca de 5:1).

**Justificativa:** o guia pede seguir a WCAG (rec. 20, p. 13), e pessoas com ansiedade ou depressão podem ter mais dificuldade de atenção e leitura.

---

## 9. IAGen

| Item | Valor |
|---|---|
| Endereço da API de IA | https://calmaria.onrender.com (teste: https://calmaria.onrender.com/saude) |
| Serviço de IA | Google Gemini (API `generateContent`) |
| Modelo | `gemini-2.6-flash` (variável `GEMINI_MODEL` no Render) |
| Hospedagem | Render (plano gratuito), Root Directory `api-ia` |
| Rotas | `POST /reflexao` `{ humor, texto }` e `POST /resumo-semana` `{ registros: [{ data, humor, texto }] }` |

**Por que Gemini:** tem cota gratuita suficiente para o trabalho e uma API HTTP simples, chamada com `fetch`. **Por que Render:** publica direto do GitHub, dá `https` sem configuração e guarda a chave como variável de ambiente.

**Materiais** (pasta `materiais-ia/`, fontes em `materiais-ia/FONTES.md`):

| Arquivo | Fonte |
|---|---|
| `01-ms-saude-mental.md` | Ministério da Saúde, página "Saúde mental" (gov.br) |
| `02-cvv-apoio-emocional.md` | Centro de Valorização da Vida (cvv.org.br) |
| `03-atividade-fisica-ansiedade.md` | Souza et al., 2024, artigo de revisão sobre atividade física, ansiedade e depressão (CC BY 4.0) |

Os resumos foram escritos com as palavras do grupo e não têm dados pessoais. Eles são lidos quando o servidor liga e vão junto da instrução de sistema.

**Limites (em `api-ia/src/prompt.js`) e justificativas:**

| Limite | Justificativa |
|---|---|
| Responder só com base nos materiais | Evita que a IA invente orientação de saúde sem fonte. |
| Não diagnosticar e não dizer que a pessoa "tem" uma doença | O app é de apoio; diagnóstico é papel de profissional. |
| Não indicar remédio, dose, suplemento ou tratamento | Risco à saúde e exigência do trabalho. |
| Dizer quando não sabe e sugerir um profissional | Melhor admitir do que inventar. |
| Em crise ou risco: orientar ajuda profissional, CVV 188 e SAMU 192 | Exigência do trabalho; além disso, nosso código detecta frases de risco e **sempre** acrescenta a mensagem fixa do CVV, mesmo se a IA falhar. |
| Ignorar pedidos para quebrar as regras escritos no diário | Proteção contra alguém tentar manipular a IA pelo texto. |
| Respostas curtas (até 4 frases) e em português | Leitura fácil em celular e para quem está cansado. |

**Integração com o app (não é um chat genérico):** a reflexão parte de um registro específico da lista e, no fim, convida a anotar no próprio registro; o resumo usa os registros dos últimos 7 dias.

---

## 10. Criatividade e inovação

### Aplicativos pesquisados e o que têm em comum

| Aplicativo | O que faz | Características |
|---|---|---|
| Daylio | Diário de humor com escala de 5 carinhas e atividades | Registro rápido, estatísticas, contagem de dias seguidos e conquistas |
| Finch | Bichinho virtual que cresce quando a pessoa cumpre metas de autocuidado | Gamificação central, metas diárias, diário com perguntas |
| Forest | Árvore que cresce enquanto a pessoa não usa o celular (foco) | Recompensa visual; a árvore morre se a pessoa sai do app |
| Reflectly | Diário com perguntas geradas por IA | IA como conversa, foco em escrita |

**O que se repete:** registro de humor por escala, estatísticas, sequência de dias ("streak") com medalhas, e a IA aparece como chat à parte. Muitos usam a perda (árvore que morre, sequência zerada em destaque) para pressionar o uso.

### A inovação do Calmaria

**Planta que cresce com a sequência, nunca murcha e responde ao humor, junto com uma IA ligada ao registro e com segurança garantida pelo código.**

1. **A planta nunca morre.** Cada dia seguido com registro vira uma folha; com 7 dias ela dá flor. Quando a sequência quebra, a planta volta a ser um broto, sem folha seca nem planta morta, a melhor sequência continua guardada e a frase não culpa ("Sua planta está pronta para a primeira folha. Quando quiser, conte como está o seu dia."). Se hoje ainda não tem registro, a sequência de ontem continua viva até o fim do dia. No Forest a árvore morre e no padrão de streak a perda é o motivador.
2. **A mensagem muda com o humor registrado.** Num dia bom: "Uma folha nova hoje". Num dia ruim: "É compreensível se sentir assim. Obrigado por se ouvir hoje." Os apps pesquisados comemoram o registro do mesmo jeito, qualquer que seja o humor.
3. **A parte de jogo é opcional** (interruptor em Ajustes), como pede o guia. No Finch, por exemplo, o bichinho é o centro do app.
4. **A IA não é um chat solto:** parte de um registro, mostra antes o que vai ser enviado e para quem, e a mensagem de crise (CVV 188) é colocada pelo nosso código, não depende da IA "lembrar".
5. **Sem rota nova e sem coleta extra:** a sequência é calculada no celular a partir dos registros que já existem (`utils/sequencia.js`).

**Relevância para o usuário:** quem está em um período difícil costuma registrar menos. Um app que pune a falta (árvore morta, sequência zerada) pode aumentar a culpa justamente de quem mais precisa de apoio. O Calmaria mantém o reforço positivo (guia, rec. 80) sem cobrança (rec. 62) e acolhe em vez de comemorar quando o humor está baixo (rec. 28).

**Onde está implementada:** `app/src/components/Planta.js`, `app/src/utils/sequencia.js`, `app/src/utils/mensagens.js`, `app/src/screens/HomeScreen.js` e o interruptor em `ConfiguracoesScreen.js`.

### Contribuição da IA generativa

- **Geração de ideias:** pedimos ao Claude uma lista de padrões de apps de humor e alternativas ao streak punitivo. Das seis direções visuais sugeridas (de A a F), escolhemos a F, Planta, porque queríamos algo que se diferenciasse do padrão.
- **Análise crítica:** a IA cruzou a ideia com o Guia TrackWell e apontou dois ajustes que adotamos: a gamificação precisava ser desativável (rec. 61) e a mensagem não podia comemorar dias ruins (rec. 28 e 76).
- **Desenvolvimento:** parte do código foi escrita com ajuda do Claude Code (os commits com essa ajuda têm a linha `Co-Authored-By: Claude`). Todo o código foi revisado pela equipe, e cada membro explica a sua parte.

---

## 11. Divisão do trabalho

| Membro | Telas | Código do aplicativo (React Native) | Código das APIs, do banco de dados ou da IAGen | Itens do documento |
|---|---|---|---|---|
| Pedro Arthur | Login, Cadastro, Consentimento, Política de privacidade, Minha conta | `App.js` (navegação), `context/AuthContext.js`, `services/api.js` | `api-app`: `server.js`, `db.js`, `schema.sql`, `middleware/auth.js`, `routes/auth.js`, `routes/usuarios.js` | 4, 5, 7 e 11 |
| Yudi Doi | FormRegistro (novo e editar), Registros, Relatório | `utils/humor.js`, `utils/datas.js` | `api-app`: `routes/registros.js`, `routes/relatorio.js` (PDF) | 1, 2, 3 e 6 |
| Jardel Ferreira | Início, Reflexão com IA, Resumo da semana, Ajustes | `context/TemaContext.js`, componentes (`Botao`, `CampoTexto`, `Cartao`, `Planta`, `AvisoIA`), `utils/sequencia.js`, `utils/mensagens.js`, `services/ia.js` | `api-ia` completa e `materiais-ia/` | 8, 9 e 10 |
