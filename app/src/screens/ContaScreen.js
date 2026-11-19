// Tela Minha conta: mostra os dados da conta e reúne as ações de privacidade (LGPD):
// baixar os dados, apagar só os registros, apagar a conta inteira e sair.
// As ações que apagam dados sempre pedem confirmação antes (Alert).

import React, { useState } from 'react';
import { ScrollView, View, Text, Alert, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { useAuth } from '../context/AuthContext';
import { chamarApi } from '../services/api';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

export default function ContaScreen({ navigation }) {
  const { cores, tamanho } = useTema();
  const { usuario, sair, excluirConta } = useAuth();

  const [ocupado, setOcupado] = useState(false); // true enquanto espera a API, para não tocar duas vezes
  const [aviso, setAviso] = useState(''); // mensagem de sucesso
  const [erro, setErro] = useState('');

  // O que faz: apaga todos os registros do usuário na API, mas mantém a conta
  async function apagarRegistros() {
    setErro('');
    setAviso('');
    setOcupado(true);
    try {
      const dados = await chamarApi('/usuarios/me/dados', { method: 'DELETE' });
      setAviso(dados.mensagem || 'Seus registros foram apagados.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  // O que faz: apaga a conta na API e sai do app (o AuthContext volta para a tela de login)
  async function apagarConta() {
    setErro('');
    setAviso('');
    setOcupado(true);
    try {
      await excluirConta();
      Alert.alert('Conta apagada', 'Sua conta e todos os seus dados foram apagados.');
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  // O que faz: pergunta antes de apagar os registros, explicando o que acontece
  function confirmarApagarRegistros() {
    Alert.alert(
      'Apagar todos os registros?',
      'Todos os seus registros de humor serão apagados para sempre. Sua conta continua ativa. ' +
        'Se quiser guardar uma cópia, baixe o relatório em PDF antes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar registros', style: 'destructive', onPress: apagarRegistros },
      ]
    );
  }

  // O que faz: pergunta antes de apagar a conta, explicando o que acontece
  function confirmarApagarConta() {
    Alert.alert(
      'Apagar sua conta?',
      'Sua conta e todos os seus registros serão apagados para sempre e não poderão ser ' +
        'recuperados. Você sairá do app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar conta', style: 'destructive', onPress: apagarConta },
      ]
    );
  }

  const tituloSecao = [estilos.titulo, { color: cores.texto, fontSize: tamanho(20) }];
  const textoSuave = { color: cores.textoSuave, fontSize: tamanho(14), marginBottom: 12 };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Text accessibilityRole="header" style={tituloSecao}>
          Seus dados de acesso
        </Text>
        <Cartao accessibilityLabel={'Nome: ' + usuario?.nome + '. E-mail: ' + usuario?.email}>
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(13) }}>Nome</Text>
          <Text style={{ color: cores.texto, fontSize: tamanho(16), marginBottom: 8 }}>{usuario?.nome}</Text>
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(13) }}>E-mail</Text>
          <Text style={{ color: cores.texto, fontSize: tamanho(16) }}>{usuario?.email}</Text>
        </Cartao>

        {aviso ? (
          <Text accessibilityLiveRegion="polite" style={{ color: cores.sucesso, fontSize: tamanho(14), marginBottom: 12 }}>
            {aviso}
          </Text>
        ) : null}
        {erro ? (
          <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginBottom: 12 }}>
            {erro}
          </Text>
        ) : null}

        <Text accessibilityRole="header" style={tituloSecao}>
          Seus dados são seus
        </Text>
        <Cartao>
          <Text style={textoSuave}>
            Você pode baixar uma cópia dos seus registros em PDF, para guardar ou mostrar a alguém de confiança.
          </Text>
          <Botao
            titulo="Baixar meus registros"
            tipo="secundario"
            accessibilityHint="Abre a aba Relatório"
            onPress={() => navigation.navigate('Principal', { screen: 'Relatorio' })}
          />
        </Cartao>

        <Cartao>
          <Text style={textoSuave}>
            Apaga todos os registros de humor. Sua conta continua e você pode começar de novo.
          </Text>
          <Botao
            titulo={ocupado ? 'Aguarde...' : 'Apagar meus registros'}
            tipo="perigo"
            desabilitado={ocupado}
            onPress={confirmarApagarRegistros}
          />
        </Cartao>

        <Cartao>
          <Text style={textoSuave}>
            Apaga a conta e tudo o que está nela. Isso também retira o seu consentimento.
          </Text>
          <Botao
            titulo={ocupado ? 'Aguarde...' : 'Apagar minha conta'}
            tipo="perigo"
            desabilitado={ocupado}
            onPress={confirmarApagarConta}
          />
        </Cartao>

        <View style={estilos.links}>
          <Botao titulo="Sair da conta" tipo="secundario" onPress={sair} />
          <Botao
            titulo="Política de privacidade"
            tipo="secundario"
            onPress={() => navigation.navigate('Politica')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  titulo: { fontWeight: 'bold', marginTop: 8, marginBottom: 8 },
  links: { gap: 12, marginTop: 4 },
});
