# Calmaria: regras do projeto (leia antes de qualquer tarefa)

Trabalho Final de Desenvolvimento de Aplicações para Dispositivos Móveis (UFPR, prof. Anderson Marcolino).
Grupo: Pedro, Yudi e Jardel. Entrega: 22/11/2026 às 23h59. Apresentações: 23/11 e 30/11, 5 minutos por pessoa, sem ler.
App de saúde mental: diário de humor (nota 1 a 5, texto e data) com IA de apoio.

## Estrutura do repositório

- `api-app/`: API do app. Node + Express, SQLite via `node:sqlite` (Node 22.13+), bcryptjs, jsonwebtoken, pdfkit. Porta 3000.
- `api-ia/`: API da IA. Express + Gemini via fetch. Porta 4000. Hospedada no Render.
- `app/`: React Native CLI 0.88 (sem Expo), em JavaScript (App.js, não TypeScript). Roda no Android Studio.
- `materiais-ia/`: materiais de referência da IA (MS, CVV, atividade física).
- `docs/`: `pedro.md`, `yudi.md`, `jardel.md` (uma parte do README por pessoa).

## Regras de código (valem para tudo)

1. Código simples, em JavaScript, que um estudante consiga explicar em 5 minutos. Nada de abstração desnecessária.
2. TODA função tem um comentário curto em português dizendo o que faz.
3. Não usar travessão (travessão longo ou curto) em nenhum texto, comentário, README ou mensagem de commit. Use vírgula, dois pontos ou ponto.
4. Não parecer gerado por IA: nomes de variáveis em português coerentes com o resto do projeto, sem comentários óbvios demais, sem enfeites.
5. Antes de criar algo, leia os arquivos vizinhos e siga o mesmo estilo e os mesmos nomes.
6. Não instalar dependência nova sem avisar o motivo. Fixar `@react-native-async-storage/async-storage@2` (a v3 quebra o build).
7. Não trocar `node:sqlite` por better-sqlite3 (precisa de Visual Studio C++ e quebra no Windows).

## Segurança (inegociável)

- Nunca commitar `.env`, chaves, `node_modules`, `*.db`, keystores. Conferir `git status` antes de todo commit.
- Consultas SQL sempre parametrizadas com `?` e sempre filtradas por `usuario_id = req.usuarioId`.
- Chave do Gemini só em variável de ambiente (`GEMINI_API_KEY`). Nunca no app, nunca no repositório.
- A IA não diagnostica e não prescreve. Em sinal de crise responde a mensagem fixa com CVV 188 e SAMU 192.
- O app só envia dados à IA quando a pessoa toca no botão, com aviso de IA de terceiros.

## Contrato entre os membros (não renomear sem avisar)

- Rotas da API do app: `POST /auth/cadastro`, `POST /auth/login`, `GET /usuarios/me`, `DELETE /usuarios/me/dados`, `DELETE /usuarios/me`, CRUD em `/registros`, `GET /relatorio/pdf?inicio=&fim=`.
- Arquivos compartilhados do app: `src/services/api.js` (`chamarApi`, `obterToken`, `salvarToken`, `apagarToken`, `registrarAoExpirar`), `src/context/AuthContext.js` (`useAuth()`), `src/context/TemaContext.js` (`useTema()` devolve `{cores, escuro, alternarTema, escala, mudarEscala, tamanho, mostrarPlanta, alternarPlanta}`), `src/components/Botao.js`, `CampoTexto.js`, `Cartao.js`, `src/utils/humor.js`, `src/config.js`.
- Nomes das telas: Login, Cadastro, Consentimento, Principal (abas: Inicio, Registros, Relatorio, Ajustes), FormRegistro, Reflexao, ResumoSemana, Relatorio, Politica, Conta.
- Cores e tamanhos de fonte vêm sempre de `useTema()`. Nunca escrever cor fixa dentro de uma tela.

## Guia Trackwell (referência de design e IHC)

- Fica em `referencias/Guia-TrackWell.pdf` (pasta fora do Git, ver `.gitignore`).
- Consultar antes de criar ou mudar qualquer tela. No que for funcional (usabilidade, acessibilidade, linguagem, segurança) o guia vence; no que for estético vale a direção Planta.
- Na tabela de IHC do README, citar o critério e a página do guia. Não inventar critério.

## Direção visual: "Planta" (F)

Uma planta que ganha uma folha por dia de sequência de registros. Tom acolhedor, limpo e moderno, nunca de culpa.

- Cores: verde `#2F7D4F`, fundo `#E8F2F4`, vaso `#B9774A`, texto `#14323A`. Criar também a versão escura com poucas cores.
- Fonte: Albert Sans (opcional; precisa copiar os arquivos de fonte para o app e linkar. Se complicar, usar a fonte do sistema).
- A planta é desenhada com `react-native-svg` (componente `Planta` recebendo o número de folhas).
- Mensagens motivadoras ao registrar, exemplo: "Uma folha nova hoje. Amanhã tem mais um pouco de cuidado esperando por você."
- A planta e a sequência são opcionais (guia, rec. 61, p. 28): interruptor "Mostrar planta e sequência" em Ajustes. A planta nunca murcha.
- Em humor 1 ou 2 a mensagem acolhe em vez de comemorar (guia, rec. 28 e 76).
- Botões com altura mínima 48, contraste bom, `accessibilityLabel` nos botões só de ícone.

## Sequência de registros (inovação do trabalho)

- Calculada a partir de `GET /registros`. Sem rota nova e sem mudar o banco.
- Um dia com pelo menos 1 registro conta. A sequência atual termina hoje, ou ontem se hoje ainda não tem registro (continua viva).
- Mostrar sequência atual, melhor sequência e dias registrados no mês.
- Arquivos: `app/src/utils/sequencia.js` (`calcularSequencia(registros)` devolve `{atual, melhor, diasNoMes}`) e `app/src/utils/mensagens.js`.
- Ligação: ao salvar um registro NOVO, o FormRegistro faz `navigation.navigate('Principal', { screen: 'Inicio', params: { registroSalvo: true } })` e a Home mostra a mensagem.

## Git

- Repositório: https://github.com/pedroboton-soares/calmaria, pasta local `C:\projetos\calmaria` (Windows, PowerShell).
- Antes de push: `git pull --no-rebase --no-edit`.
- Commits pequenos, em português, um assunto por commit, sem commitar arquivos de outra pessoa sem avisar.
- Se o `react-native init` criar `.git` dentro de `app/`, remover: `Remove-Item -Recurse -Force app\.git`.

## Limitações conhecidas (documentar no README, não esconder)

- Token JWT guardado no AsyncStorage (não é cofre seguro). Melhoria futura: Keychain/Keystore.
- Em APK de release o Android bloqueia `http` puro. Para a API do app, ou usar https, ou liberar cleartext só para o endereço usado.
- Plano gratuito do Render dorme e tem disco efêmero. Por isso a API do app roda localmente (ZIP com os `.env`) e só a api-ia fica no Render.
