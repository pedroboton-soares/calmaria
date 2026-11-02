// Serviço que conversa com a API do app. Todas as telas usam a função chamarApi.
// Ela já coloca o token no cabeçalho e transforma erros da API em Error com a mensagem.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export { API_URL };

// Nome com que o token fica guardado no celular
const CHAVE_TOKEN = 'token';

// Função que o AuthContext registra para ser chamada quando o token deixa de valer
let aoSessaoExpirar = null;

// O que faz: guarda a função que desloga o usuário quando a API responder 401 (token vencido ou conta apagada)
export function registrarAoExpirar(funcao) {
  aoSessaoExpirar = funcao;
}

// O que faz: lê o token guardado no celular (ou null se não tiver)
export async function obterToken() {
  return AsyncStorage.getItem(CHAVE_TOKEN);
}

// O que faz: guarda o token no celular depois do login
export async function salvarToken(token) {
  await AsyncStorage.setItem(CHAVE_TOKEN, token);
}

// O que faz: apaga o token do celular (usado ao sair da conta)
export async function apagarToken() {
  await AsyncStorage.removeItem(CHAVE_TOKEN);
}

// O que faz: chama a API do app com o token. Devolve o JSON da resposta
// ou lança um Error com a mensagem que veio da API.
// opcoes: { method, body }  (body é um objeto comum; a função converte para JSON)
export async function chamarApi(caminho, opcoes = {}) {
  const token = await obterToken();

  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) {
    cabecalhos.Authorization = 'Bearer ' + token; // é assim que a API reconhece quem é o usuário
  }

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, {
      method: opcoes.method || 'GET',
      headers: cabecalhos,
      body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch (e) {
    // fetch só falha assim quando não consegue falar com o servidor (API desligada, sem internet)
    throw new Error('Não foi possível conectar ao servidor.');
  }

  // Se a resposta não tiver JSON (ex.: corpo vazio), usa um objeto vazio
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // 401 com token guardado: o token não vale mais, então desloga o usuário
    if (resposta.status === 401 && token && aoSessaoExpirar) {
      aoSessaoExpirar();
    }
    const erro = new Error(dados.erro || 'Erro ao falar com o servidor.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}
