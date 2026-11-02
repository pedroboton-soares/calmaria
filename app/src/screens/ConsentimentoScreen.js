// Tela de consentimento (LGPD): avisa que o app guarda dados sensíveis de saúde, explica a finalidade
// e pede o aceite explícito. Só aqui a conta é criada, depois que o usuário marca que concorda.

import React, { useState } from 'react';
import { ScrollView, View, Text, Switch } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAuth } from '../context/AuthContext';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

export default function ConsentimentoScreen({ navigation, route }) {
  const { cores, tamanho } = useTema();
  const { cadastrar } = useAuth();

  // Dados que a tela de Cadastro mandou pela navegação
  const { nome, email, senha } = route.params || {};

  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // O que faz: cria a conta na API e, se der certo, volta para o Login com um aviso e o e-mail preenchido
  async function criarConta() {
    setErro('');
    setEnviando(true);
    try {
      await cadastrar({ nome, email, senha });
      // popTo volta até o Login que já está na pilha e entrega a ele os dados novos
      navigation.popTo('Login', { aviso: 'Conta criada! Entre com seu e-mail e senha.', email });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // Estilos repetidos nos blocos de texto
  const titulo = { color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 4 };
  const texto = { color: cores.texto, fontSize: tamanho(14), marginBottom: 12 };

  return (
    <ScrollView style={{ backgroundColor: cores.fundo }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ color: cores.texto, fontSize: tamanho(22), fontWeight: 'bold', marginBottom: 16 }}>
        Antes de criar sua conta
      </Text>

      <Cartao>
        <Text style={titulo}>O que o app guarda</Text>
        <Text style={texto}>
          Seu nome, seu e-mail, sua senha (criptografada) e os registros que você escrever: humor, texto e
          data. Essas informações falam da sua saúde mental e são dados pessoais sensíveis, protegidos pela
          LGPD (Lei nº 13.709/2018).
        </Text>

        <Text style={titulo}>Para que serve</Text>
        <Text style={texto}>
          Somente para você acompanhar o seu humor, ver o seu histórico e baixar relatórios. Seus dados não
          são divulgados a terceiros.
        </Text>

        <Text style={titulo}>Uso de inteligência artificial</Text>
        <Text style={texto}>
          Se você pedir uma reflexão ou um resumo da semana, o texto escolhido é enviado a um serviço de IA
          de terceiros. Isso só acontece quando você tocar no botão, depois de um aviso.
        </Text>

        <Text style={titulo}>Seus direitos</Text>
        <Text style={texto}>
          Você pode ver, alterar, baixar e apagar seus dados e sua conta quando quiser, dentro do app.
        </Text>

        <Text style={titulo}>Importante</Text>
        <Text style={{ ...texto, marginBottom: 0 }}>
          O Calmaria é um apoio e não substitui um profissional de saúde. Se você estiver em crise, ligue
          para o CVV, telefone 188.
        </Text>
      </Cartao>

      <Botao
        titulo="Ler a política de privacidade"
        tipo="secundario"
        onPress={() => navigation.navigate('Politica')}
      />

      {/* Aceite explícito: o botão de criar conta só libera depois que este interruptor é ligado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
        <Switch
          value={aceito}
          onValueChange={setAceito}
          accessibilityLabel="Li e concordo com o uso dos meus dados de saúde"
        />
        <Text
          onPress={() => setAceito(!aceito)}
          style={{ flex: 1, color: cores.texto, fontSize: tamanho(14), marginLeft: 8 }}
        >
          Li e concordo com o uso dos meus dados de saúde para esta finalidade.
        </Text>
      </View>

      {erro ? (
        <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginBottom: 8 }}>
          {erro}
        </Text>
      ) : null}

      <Botao
        titulo={enviando ? 'Criando conta...' : 'Concordo e criar conta'}
        onPress={criarConta}
        desabilitado={!aceito || enviando}
      />
      <View style={{ marginTop: 12 }}>
        <Botao titulo="Voltar" tipo="secundario" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}
