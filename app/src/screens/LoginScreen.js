// Tela provisória de login (responsável: Pedro). Será substituída pela tela real na etapa 5.
// Por enquanto tem um botão para testar se o emulador consegue falar com a API do app.

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useTema } from '../context/TemaContext';
import { API_URL } from '../services/api';
import Botao from '../components/Botao';

export default function LoginScreen() {
  const { cores, tamanho } = useTema();
  const [resultado, setResultado] = useState('');

  // O que faz: chama a rota /saude da API e mostra se a conexão funcionou
  async function testarConexao() {
    setResultado('Testando...');
    try {
      const resposta = await fetch(API_URL + '/saude');
      const dados = await resposta.json();
      setResultado('Conexão OK: ' + JSON.stringify(dados));
    } catch (e) {
      setResultado('Falhou: ' + e.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: cores.fundo }}>
      <Text style={{ color: cores.texto, fontSize: tamanho(18), marginBottom: 16 }}>
        Tela Login (em construção)
      </Text>
      <Botao titulo="Testar conexão com a API" onPress={testarConexao} />
      <Text style={{ color: cores.texto, fontSize: tamanho(14), marginTop: 16 }}>{resultado}</Text>
    </View>
  );
}
