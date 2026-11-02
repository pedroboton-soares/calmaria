// Contexto de autenticação: guarda quem é o usuário logado e oferece entrar, cadastrar e sair.
// Qualquer tela pode usar com: const { usuario, entrar, sair } = useAuth();

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  chamarApi,
  obterToken,
  salvarToken,
  apagarToken,
  registrarAoExpirar,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // usuario é null quando não está logado, ou { id, nome, email }
  const [usuario, setUsuario] = useState(null);
  // carregando é true enquanto o app confere se já existe um login salvo
  const [carregando, setCarregando] = useState(true);

  // O que faz: apaga o token e limpa o usuário (volta para a tela de login)
  async function sair() {
    await apagarToken();
    setUsuario(null);
  }

  // Quando o app abre: se existe token salvo, pergunta à API quem é o usuário
  useEffect(() => {
    // Se a API responder 401 em qualquer tela, o usuário é deslogado
    registrarAoExpirar(sair);

    async function restaurarSessao() {
      try {
        const token = await obterToken();
        if (token) {
          const dados = await chamarApi('/usuarios/me');
          setUsuario(dados);
        }
      } catch (e) {
        // Só apaga o token se ele for inválido. Se for falha de conexão, o token continua guardado
        if (e.status === 401) {
          await apagarToken();
        }
      }
      setCarregando(false);
    }
    restaurarSessao();
  }, []);

  // O que faz: faz login na API, guarda o token e marca o usuário como logado
  async function entrar(email, senha) {
    const dados = await chamarApi('/auth/login', { method: 'POST', body: { email, senha } });
    await salvarToken(dados.token);
    setUsuario(dados.usuario);
  }

  // O que faz: cria a conta. Só é chamada na tela de Consentimento, depois do aceite do usuário,
  // por isso envia consentimento: true
  async function cadastrar({ nome, email, senha }) {
    await chamarApi('/auth/cadastro', {
      method: 'POST',
      body: { nome, email, senha, consentimento: true },
    });
  }

  // O que faz: apaga a conta no servidor (com todos os dados) e depois sai
  async function excluirConta() {
    await chamarApi('/usuarios/me', { method: 'DELETE' });
    await sair();
  }

  const valor = { usuario, carregando, entrar, cadastrar, sair, excluirConta };
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// O que faz: devolve o contexto para as telas usarem
export function useAuth() {
  return useContext(AuthContext);
}
