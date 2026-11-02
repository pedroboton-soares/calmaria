// Tela de login: o usuário informa e-mail e senha e entra no app.
// Quando o login dá certo, o AuthContext guarda o usuário e o App.js troca as telas sozinho.

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAuth } from '../context/AuthContext';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

export default function LoginScreen({ navigation, route }) {
  const { cores, tamanho } = useTema();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Parâmetros que a tela de Consentimento manda depois de criar a conta
  const aviso = route.params?.aviso;
  const emailRecebido = route.params?.email;

  // Se chegou um e-mail pela navegação, já deixa preenchido no campo
  useEffect(() => {
    if (emailRecebido) {
      setEmail(emailRecebido);
    }
  }, [emailRecebido]);

  // O que faz: confere se os campos foram preenchidos e tenta fazer o login na API
  async function fazerLogin() {
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro('');
    setEnviando(true); // desabilita o botão enquanto espera a resposta
    try {
      await entrar(email.trim(), senha);
    } catch (e) {
      setErro(e.message); // mostra a mensagem que veio da API
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled" // o toque no botão funciona mesmo com o teclado aberto
    >
      <Text style={{ color: cores.texto, fontSize: tamanho(28), fontWeight: 'bold' }}>Calmaria</Text>
      <Text style={{ color: cores.textoSuave, fontSize: tamanho(16), marginBottom: 24 }}>
        Seu diário de humor
      </Text>

      {aviso ? (
        <Text style={{ color: cores.sucesso, fontSize: tamanho(14), marginBottom: 12 }}>{aviso}</Text>
      ) : null}

      <CampoTexto
        rotulo="E-mail"
        valor={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <CampoTexto rotulo="Senha" valor={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" />

      {/* Mensagem de erro (accessibilityLiveRegion faz o leitor de tela avisar quando ela aparece) */}
      {erro ? (
        <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginTop: 8 }}>
          {erro}
        </Text>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <Botao titulo={enviando ? 'Entrando...' : 'Entrar'} onPress={fazerLogin} desabilitado={enviando} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Botao titulo="Criar conta" tipo="secundario" onPress={() => navigation.navigate('Cadastro')} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Botao
          titulo="Política de privacidade"
          tipo="secundario"
          onPress={() => navigation.navigate('Politica')}
        />
      </View>

      <Text style={{ color: cores.textoSuave, fontSize: tamanho(12), marginTop: 24 }}>
        O Calmaria é um app de apoio e acompanhamento. Ele não faz diagnóstico e não substitui o atendimento
        de um profissional de saúde.
      </Text>
    </ScrollView>
  );
}
