// Servidor da API de IA do Calmaria. Recebe dados do app, pede uma resposta ao Gemini
// com base nos materiais e devolve o resultado. Não guarda nada.
// Rotas: GET /saude, POST /reflexao e POST /resumo-semana.

require('dotenv').config(); // lê o arquivo .env e coloca os valores em process.env
const express = require('express');
const cors = require('cors');
const { textoMateriais } = require('./materiais');
const { montarInstrucao, temSinalDeCrise, montarPedidoResumo, MENSAGEM_CRISE } = require('./prompt');

const app = express();

app.disable('x-powered-by'); // não conta para quem chama que o servidor é Express
// No Render existe um proxy na frente: isto faz o req.ip ser o IP de quem chamou, e não o do proxy
app.set('trust proxy', 1);

app.use(cors()); // permite que o aplicativo (outro endereço) chame esta API
app.use(express.json({ limit: '50kb' })); // entende JSON e recusa corpo muito grande

// Mesmo limite de texto que o app usa nos registros
const TAMANHO_MAXIMO_TEXTO = 1000;
// Quantidade máxima de registros aceitos no resumo da semana
const MAXIMO_REGISTROS = 20;
// Formato de data combinado no contrato: AAAA-MM-DD
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// Regras da IA + materiais, montados uma vez só quando o servidor inicia
const INSTRUCAO = montarInstrucao(textoMateriais);

// Limite de pedidos à IA: cada IP pode fazer até 20 pedidos a cada 10 minutos.
// Protege a cota gratuita do Gemini contra uso exagerado ou automatizado.
const LIMITE_PEDIDOS = 20;
const JANELA_MS = 10 * 60 * 1000;
const pedidosPorIp = new Map(); // ip -> { inicio, quantidade }

// O que faz: conta os pedidos de cada IP e responde 429 quando passa do limite
function limitarPedidos(req, res, next) {
  const agora = Date.now();
  let contador = pedidosPorIp.get(req.ip);
  // Primeiro pedido do IP, ou a janela de 10 minutos já acabou: começa a contar de novo
  if (!contador || agora - contador.inicio > JANELA_MS) {
    contador = { inicio: agora, quantidade: 0 };
    pedidosPorIp.set(req.ip, contador);
  }
  contador.quantidade++;
  if (contador.quantidade > LIMITE_PEDIDOS) {
    return res.status(429).json({ erro: 'Muitos pedidos em pouco tempo. Respire um pouco e tente de novo em alguns minutos.' });
  }
  next();
}

// A cada 10 minutos apaga os contadores vencidos, para a memória não crescer sem parar
setInterval(() => {
  const agora = Date.now();
  for (const [ip, contador] of pedidosPorIp) {
    if (agora - contador.inicio > JANELA_MS) {
      pedidosPorIp.delete(ip);
    }
  }
}, JANELA_MS).unref();

// O que faz: manda uma instrução e uma pergunta para o Gemini e devolve o texto da resposta
async function perguntarAoGemini(instrucao, pergunta) {
  const chave = process.env.GEMINI_API_KEY;
  const modelo = process.env.GEMINI_MODEL;
  if (!chave || !modelo) {
    // Se faltar variável de ambiente, o erro aparece claro no log do servidor
    throw new Error('GEMINI_API_KEY ou GEMINI_MODEL não foram definidos no .env');
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent';

  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': chave, // a chave vai no cabeçalho, assim não aparece na URL nem em logs
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: instrucao }] }, // regras e materiais
      contents: [{ role: 'user', parts: [{ text: pergunta }] }], // o que o usuário escreveu
    }),
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // Mostra o motivo no log do servidor, mas nunca devolve detalhes técnicos para o app
    const motivo = dados.error && dados.error.message ? dados.error.message : 'sem detalhes';
    const erro = new Error('Gemini respondeu ' + resposta.status + ': ' + motivo);
    erro.status = resposta.status; // guarda o número do erro para a função de tentativas
    throw erro;
  }

  // O texto fica dentro de candidates[0].content.parts[0].text
  const candidato = dados.candidates && dados.candidates[0];
  const partes = candidato && candidato.content && candidato.content.parts;
  const texto = partes && partes[0] && partes[0].text;
  if (!texto) {
    throw new Error('Gemini não devolveu texto (motivo: ' + (candidato && candidato.finishReason) + ')');
  }
  return texto.trim();
}

// O que faz: chama o Gemini e, se ele estiver sobrecarregado (erro 503), tenta de novo até 3 vezes
async function perguntarComTentativas(instrucao, pergunta) {
  let ultimoErro;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      return await perguntarAoGemini(instrucao, pergunta);
    } catch (erro) {
      ultimoErro = erro;
      if (erro.status !== 503) throw erro; // outros erros (chave, modelo) não adianta repetir
      await new Promise((resolver) => setTimeout(resolver, 2000)); // espera 2 segundos
    }
  }
  throw ultimoErro;
}

// O que faz: pede a resposta à IA e envia ao app. Se houver sinal de crise, acrescenta a mensagem do CVV
async function responderComIA(res, pergunta, crise) {
  try {
    let resposta = await perguntarComTentativas(INSTRUCAO, pergunta);
    if (crise) {
      resposta = resposta + '\n\n' + MENSAGEM_CRISE; // acrescenta a mensagem fixa com o CVV
    }
    res.json({ resposta });
  } catch (erro) {
    // O texto do usuário não é gravado no log, por privacidade
    console.error('Erro ao chamar a IA:', erro.message);
    if (crise) {
      // Mesmo que a IA falhe, quem está em crise recebe a mensagem com o CVV
      return res.json({ resposta: MENSAGEM_CRISE });
    }
    res.status(500).json({ erro: 'Não foi possível gerar a resposta agora. Tente de novo em instantes.' });
  }
}

// O que faz: confere a lista de registros e devolve a mensagem de erro, ou null se estiver tudo certo
function validarRegistros(registros) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return 'Envie ao menos um registro.';
  }
  if (registros.length > MAXIMO_REGISTROS) {
    return 'Envie no máximo ' + MAXIMO_REGISTROS + ' registros.';
  }
  for (const r of registros) {
    if (!r || typeof r !== 'object') {
      return 'Cada registro deve ter data, humor e texto.';
    }
    if (typeof r.data !== 'string' || !FORMATO_DATA.test(r.data)) {
      return 'Cada registro precisa de uma data no formato AAAA-MM-DD.';
    }
    if (!Number.isInteger(r.humor) || r.humor < 1 || r.humor > 5) {
      return 'O humor de cada registro deve ser um número inteiro de 1 a 5.';
    }
    if (r.texto !== undefined && r.texto !== null && typeof r.texto !== 'string') {
      return 'O texto de cada registro deve ser uma frase escrita.';
    }
    if (r.texto && r.texto.length > TAMANHO_MAXIMO_TEXTO) {
      return 'O texto de cada registro pode ter no máximo ' + TAMANHO_MAXIMO_TEXTO + ' caracteres.';
    }
  }
  return null;
}

// Rota simples para testar se a API está no ar
app.get('/saude', (req, res) => {
  res.json({ ok: true });
});

// O que faz: recebe { humor, texto } e devolve { resposta } com uma reflexão da IA
app.post('/reflexao', limitarPedidos, async (req, res) => {
  const { humor, texto } = req.body || {}; // no Express 5, req.body pode vir vazio (undefined)

  if (!Number.isInteger(humor) || humor < 1 || humor > 5) {
    return res.status(400).json({ erro: 'O humor deve ser um número inteiro de 1 a 5.' });
  }
  if (texto !== undefined && typeof texto !== 'string') {
    return res.status(400).json({ erro: 'O texto deve ser uma frase escrita.' });
  }
  const textoLimpo = (texto || '').trim();
  if (textoLimpo.length > TAMANHO_MAXIMO_TEXTO) {
    return res.status(400).json({ erro: 'O texto pode ter no máximo ' + TAMANHO_MAXIMO_TEXTO + ' caracteres.' });
  }

  const pergunta =
    'Humor do dia (de 1 = muito mal até 5 = muito bem): ' + humor + '\n' +
    'Texto escrito pela pessoa: ' + (textoLimpo || '(a pessoa não escreveu texto)');

  // Esta checagem é feita por nós, sem depender da IA
  await responderComIA(res, pergunta, temSinalDeCrise(textoLimpo));
});

// O que faz: recebe { registros: [ { data, humor, texto } ] } e devolve { resposta } com o resumo da semana
app.post('/resumo-semana', limitarPedidos, async (req, res) => {
  const { registros } = req.body || {};

  const mensagemErro = validarRegistros(registros);
  if (mensagemErro) {
    return res.status(400).json({ erro: mensagemErro });
  }

  // Junta o texto de todos os registros para procurar sinais de crise em qualquer um deles
  const todosOsTextos = registros.map((r) => r.texto || '').join(' ');

  await responderComIA(res, montarPedidoResumo(registros), temSinalDeCrise(todosOsTextos));
});

// Se nenhuma rota combinou, devolve erro 404 no mesmo formato dos outros erros
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Pega erros do próprio Express (JSON quebrado, corpo grande demais).
// Precisa ter 4 parâmetros para o Express saber que é um tratador de erros.
app.use((erro, req, res, next) => {
  if (erro.status === 413) {
    return res.status(413).json({ erro: 'O texto enviado é grande demais.' });
  }
  res.status(400).json({ erro: 'Requisição inválida.' });
});

// Porta do .env (o Render define PORT sozinho). Se não tiver, usa 4000
const porta = process.env.PORT || 4000;
app.listen(porta, '0.0.0.0', () => {
  console.log('API de IA rodando na porta ' + porta);
});