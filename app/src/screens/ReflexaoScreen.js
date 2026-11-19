// Tela Reflexão com IA: mostra o registro escolhido na lista, avisa o que será enviado
// e só manda para a IA quando a pessoa toca em "Enviar para a IA".
// Se a resposta tiver a mensagem de crise (CVV 188), aparece também o botão para ligar.

import React, { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { pedirReflexao } from '../services/ia';
import { buscarHumor } from '../utils/humor';
import { formatarDataBR } from '../utils/datas';
import AvisoIA from '../components/AvisoIA';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

export default function ReflexaoScreen({ navigation, route }) {
  const { cores, tamanho } = useTema();
  const registro = route.params?.registro;

  const [enviando, setEnviando] = useState(false);
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');

  // O que faz: envia o humor e o texto do registro para a IA e mostra a resposta
  async function enviar() {
    setErro('');
    setEnviando(true);
    try {
      setResposta(await pedirReflexao(registro));
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // Sem registro não tem o que refletir (a tela só abre pela lista de registros)
  if (!registro) {
    return (
      <View style={[estilos.centro, { backgroundColor: cores.fundo }]}>
        <Text style={{ color: cores.texto, fontSize: tamanho(16) }}>Escolha um registro na aba Registros.</Text>
      </View>
    );
  }

  const humor = buscarHumor(registro.humor);
  const temCrise = resposta.includes('188'); // a API acrescenta o CVV 188 quando percebe sinal de crise

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Cartao>
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(13) }}>Registro de {formatarDataBR(registro.data)}</Text>
          <Text style={{ color: cores.texto, fontSize: tamanho(18), fontWeight: 'bold', marginBottom: 4 }}>
            {humor?.emoji} {humor?.nome}
          </Text>
          <Text style={{ color: registro.texto ? cores.texto : cores.textoSuave, fontSize: tamanho(14) }}>
            {registro.texto || 'Sem texto. A IA vai considerar só o humor.'}
          </Text>
        </Cartao>

        {!resposta ? (
          <>
            <AvisoIA oQueVai="o humor e o texto deste registro." />
            <Botao
              titulo={enviando ? 'Enviando...' : 'Enviar para a IA'}
              onPress={enviar}
              desabilitado={enviando}
              accessibilityHint="Envia o humor e o texto deste registro para a IA de terceiros"
            />
            <View style={{ height: 8 }} />
            <Botao titulo="Agora não" tipo="secundario" onPress={() => navigation.goBack()} />
          </>
        ) : null}

        {enviando ? (
          <View style={estilos.centroPequeno}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), marginTop: 8, textAlign: 'center' }}>
              Respire fundo. A resposta pode levar alguns segundos, ou quase um minuto se a IA estiver acordando.
            </Text>
          </View>
        ) : null}

        {erro ? (
          <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginTop: 12 }}>
            {erro}
          </Text>
        ) : null}

        {resposta ? (
          <>
            <Cartao style={{ borderColor: cores.primaria, borderWidth: 2 }}>
              <Text accessibilityRole="header" style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 6 }}>
                Uma reflexão para você
              </Text>
              <Text accessibilityLiveRegion="polite" style={{ color: cores.texto, fontSize: tamanho(15), lineHeight: tamanho(22) }}>
                {resposta}
              </Text>
              <Text style={{ color: cores.textoSuave, fontSize: tamanho(12), marginTop: 10 }}>
                Resposta gerada por IA. Não é diagnóstico nem orientação profissional.
              </Text>
            </Cartao>

            {temCrise ? (
              <Botao titulo="Ligar para o CVV (188)" onPress={() => Linking.openURL('tel:188')} />
            ) : null}

            <Text style={{ color: cores.texto, fontSize: tamanho(15), marginVertical: 12 }}>
              Alguma coisa dessa reflexão fez sentido para você? Se quiser, anote no seu registro.
            </Text>
            <View style={estilos.botoes}>
              <Botao
                titulo="Anotar no registro"
                tipo="secundario"
                onPress={() => navigation.navigate('FormRegistro', { registro })}
              />
              <Botao titulo="Voltar" tipo="secundario" onPress={() => navigation.goBack()} />
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centroPequeno: { alignItems: 'center', padding: 16 },
  botoes: { gap: 12 },
});
