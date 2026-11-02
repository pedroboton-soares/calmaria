// Tela de cadastro: o usuário informa nome, e-mail e senha.
// A conta ainda NÃO é criada aqui. Se os dados estiverem certos, vai para a tela de Consentimento,
// que só cria a conta depois do aceite do usuário (LGPD).

import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTema } from '../context/TemaContext';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

export default function CadastroScreen({ navigation }) {
  const { cores, tamanho } = useTema();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  // erros guarda a mensagem de cada campo, ex.: { email: 'Informe um e-mail válido.' }
  const [erros, setErros] = useState({});

  // O que faz: confere os campos e devolve um objeto com as mensagens de erro (vazio se estiver tudo certo)
  function validar() {
    const novosErros = {};
    if (nome.trim().length < 2) {
      novosErros.nome = 'Informe seu nome.';
    }
    if (!email.includes('@') || email.trim().length < 5) {
      novosErros.email = 'Informe um e-mail válido.';
    }
    if (senha.length < 6) {
      novosErros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    }
    if (confirmar !== senha) {
      novosErros.confirmar = 'As senhas não são iguais.';
    }
    return novosErros;
  }

  // O que faz: se os dados estiverem certos, segue para a tela de Consentimento levando os dados
  function continuar() {
    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return; // tem erro, então fica na tela
    }
    navigation.navigate('Consentimento', { nome: nome.trim(), email: email.trim(), senha });
  }

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: cores.texto, fontSize: tamanho(22), fontWeight: 'bold', marginBottom: 16 }}>
        Criar conta
      </Text>

      <CampoTexto rotulo="Nome" valor={nome} onChangeText={setNome} erro={erros.nome} autoCapitalize="words" />
      <CampoTexto
        rotulo="E-mail"
        valor={email}
        onChangeText={setEmail}
        erro={erros.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto
        rotulo="Senha (mínimo 6 caracteres)"
        valor={senha}
        onChangeText={setSenha}
        erro={erros.senha}
        secureTextEntry
        autoCapitalize="none"
      />
      <CampoTexto
        rotulo="Confirmar senha"
        valor={confirmar}
        onChangeText={setConfirmar}
        erro={erros.confirmar}
        secureTextEntry
        autoCapitalize="none"
      />

      <View style={{ marginTop: 16 }}>
        <Botao titulo="Continuar" onPress={continuar} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Botao titulo="Voltar" tipo="secundario" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}
