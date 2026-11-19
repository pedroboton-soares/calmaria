// Tela Resumo da semana: busca os registros dos últimos 7 dias, mostra quais serão enviados
// e só manda para a IA quando a pessoa toca em "Enviar para a IA".
// A resposta traz um resumo curto e uma sugestão de autocuidado, sem diagnóstico.

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import { chamarApi } from '../services/api';
import { pedirResumoSemana } from '../services/ia';
import { buscarHumor } from '../utils/humor';
import { dataDeHoje, diasAtras, formatarDataBR } from '../utils/datas';
import AvisoIA from '../components/AvisoIA';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

export default function ResumoSemanaScreen({ navigation }) {
  const { cores, tamanho } = useTema();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');

  // Quando a tela abre, busca só os registros dos últimos 7 dias (hoje e os 6 anteriores)
  useEffect(() => {
    // O que faz: pede à API do app os registros da semana
    async function carregar() {
      try {
        setRegistros(await chamarApi('/registros?inicio=' + diasAtras(6) + '&fim=' + dataDeHoje()));
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // O que faz: envia os registros da semana para a IA e mostra o resumo
  async function enviar() {
    setErro('');
    setEnviando(true);
    try {
      setResposta(await pedirResumoSemana(registros));
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={[estilos.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const temCrise = resposta.includes('188');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), marginBottom: 12 }}>
          Foi uma semana leve ou puxada? A IA pode olhar seus registros dos últimos 7 dias e devolver um resumo
          curto com uma sugestão de autocuidado.
        </Text>

        {registros.length === 0 && !erro ? (
          <Cartao>
            <Text style={{ color: cores.texto, fontSize: tamanho(15) }}>
              Você não tem registros nos últimos 7 dias. Quando tiver, o resumo aparece aqui.
            </Text>
          </Cartao>
        ) : null}

        {registros.length > 0 ? (
          <Cartao>
            <Text accessibilityRole="header" style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 6 }}>
              {registros.length === 1 ? '1 registro na semana' : registros.length + ' registros na semana'}
            </Text>
            {registros.slice(0, 20).map((r) => (
              <Text key={r.id} style={{ color: cores.texto, fontSize: tamanho(14), marginBottom: 2 }}>
                {formatarDataBR(r.data)}: {buscarHumor(r.humor)?.emoji} {buscarHumor(r.humor)?.nome}
              </Text>
            ))}
          </Cartao>
        ) : null}

        {registros.length > 0 && !resposta ? (
          <>
            <AvisoIA oQueVai="a data, o humor e o texto dos registros acima." />
            <Botao
              titulo={enviando ? 'Enviando...' : 'Enviar para a IA'}
              onPress={enviar}
              desabilitado={enviando}
              accessibilityHint="Envia os registros da semana para a IA de terceiros"
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
                Sua semana
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
            <View style={{ height: 8 }} />
            <Botao titulo="Voltar" tipo="secundario" onPress={() => navigation.goBack()} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centroPequeno: { alignItems: 'center', padding: 16 },
});
