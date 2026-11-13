// Servidor da API de IA do Calmaria. Recebe o humor e o texto do app, pede uma
// reflexão ao Gemini com base nos materiais e devolve a resposta. Não guarda nada.
// Nesta etapa existem as rotas /saude e /reflexao.

require('dotenv').config(); // lê o arquivo .env e coloca os valores em process.env
const express = require('express');
const cors = require('cors');
const { textoMateriais } = require('./materiais');
const { montarInstrucao, temSinalDeCrise, MENSAGEM_CRISE } = require('./prompt');

const app = express();

app.use(cors()); // permite que o aplicativo (outro endereço) chame esta API
app.use(express.json({ limit: '10kb' })); // entende JSON e recusa corpo muito grande

// Mesmo limite de texto que o app usa nos registros
const TAMANHO_MAXIMO_TEXTO = 1000;

// Regras da IA + materiais, montados uma vez só quando o servidor inicia
const INSTRUCAO = montarInstrucao(textoMateriais);

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

// Rota simples para testar se a API está no ar
app.get('/saude', (req, res) => {
  res.json({ ok: true });
});

// O que faz: recebe { humor, texto } e devolve { resposta } com uma reflexão da IA
app.post('/reflexao', async (req, res) => {
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
  const crise = temSinalDeCrise(textoLimpo);

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
    res.status(500).json({ erro: 'Não foi possível gerar a reflexão agora. Tente de novo em instantes.' });
  }
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