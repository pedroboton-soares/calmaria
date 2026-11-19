// Serviço que conversa com a API de IA (publicada no Render). Só é chamado quando a pessoa
// toca no botão de enviar, depois de ver o aviso. Não manda nome nem e-mail, só humor, data e texto.

import { IA_URL } from '../config';

// O plano gratuito do Render "dorme" e pode levar quase 1 minuto para acordar
const TEMPO_MAXIMO_MS = 90 * 1000;

// O que faz: envia um pedido POST para a API de IA e devolve o texto da resposta.
// Se der errado, lança um Error com uma mensagem que pode ser mostrada na tela
async function chamarIA(caminho, corpo) {
  // AbortController cancela o pedido se passar do tempo máximo
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TEMPO_MAXIMO_MS);

  let resposta;
  try {
    resposta = await fetch(IA_URL + caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: controle.signal,
    });
  } catch (e) {
    throw new Error('Não foi possível falar com a IA agora. Confira a internet e tente de novo.');
  } finally {
    clearTimeout(relogio);
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'A IA não conseguiu responder agora. Tente de novo em instantes.');
  }
  return dados.resposta;
}

// O que faz: pede uma reflexão sobre um registro
export function pedirReflexao(registro) {
  return chamarIA('/reflexao', { humor: registro.humor, texto: registro.texto || '' });
}

// O que faz: pede o resumo da semana a partir de uma lista de registros (no máximo 20)
export function pedirResumoSemana(registros) {
  const enviados = registros.slice(0, 20).map((r) => ({ data: r.data, humor: r.humor, texto: r.texto || '' }));
  return chamarIA('/resumo-semana', { registros: enviados });
}
