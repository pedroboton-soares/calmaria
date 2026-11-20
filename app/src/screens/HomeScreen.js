// Tela inicial (aba Início). Mostra a saudação, a planta com a sequência de dias registrados,
// a mensagem depois de salvar um registro, o atalho para registrar e o contato do CVV.
// Os registros vêm de GET /registros e a sequência é calculada no próprio app (utils/sequencia.js).

import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTema } from '../context/TemaContext';
import { useAuth } from '../context/AuthContext';
import { chamarApi } from '../services/api';
import { calcularSequencia } from '../utils/sequencia';
import { saudacao, mensagemAoRegistrar, mensagemDaSequencia } from '../utils/mensagens';
import { dataDeHoje, formatarDataBR } from '../utils/datas';
import { buscarHumor } from '../utils/humor';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';
import Planta from '../components/Planta';

export default function HomeScreen({ navigation, route }) {
  const { cores, tamanho, mostrarPlanta } = useTema();
  const { usuario } = useAuth();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState(''); // frase que aparece depois de salvar um registro

  const registroSalvo = route.params?.registroSalvo;
  const humorSalvo = route.params?.humor;

  // O que faz: busca os registros na API para calcular a sequência
  async function carregar() {
    setErro('');
    try {
      const lista = await chamarApi('/registros');
      setRegistros(lista);
      return lista;
    } catch (e) {
      setErro(e.message);
      return null;
    } finally {
      setCarregando(false);
    }
  }

  // Toda vez que a tela aparece, busca de novo (pode ter registro novo, editado ou apagado).
  // Ao sair da tela, a mensagem some (ela vale só para aquele registro)
  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => setMensagem('');
    }, [])
  );

  // Se veio do FormRegistro com registroSalvo, monta a mensagem com a sequência já atualizada
  // e limpa o parâmetro, para a mensagem não voltar sozinha depois
  useEffect(() => {
    async function mostrarMensagem() {
      const lista = await carregar();
      if (lista) {
        const { atual } = calcularSequencia(lista);
        setMensagem(mensagemAoRegistrar(humorSalvo, atual));
      }
      navigation.setParams({ registroSalvo: undefined, humor: undefined });
    }
    if (registroSalvo) {
      mostrarMensagem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registroSalvo]);

  const hoje = dataDeHoje();
  const { atual, melhor, diasNoMes } = calcularSequencia(registros, hoje);
  const registrouHoje = registros.some((r) => r.data === hoje);
  const ultimo = registros[0]; // a API devolve do mais recente para o mais antigo
  const primeiroNome = (usuario?.nome || '').split(' ')[0];

  const textoSuave = { color: cores.textoSuave, fontSize: tamanho(14) };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Text accessibilityRole="header" style={{ color: cores.texto, fontSize: tamanho(24), fontWeight: 'bold' }}>
          {saudacao()}, {primeiroNome}
        </Text>
        <Text style={[textoSuave, { marginBottom: 16 }]}>
          {registrouHoje ? 'Você já se ouviu hoje.' : 'Como você está agora?'}
        </Text>

        {mensagem ? (
          <Cartao style={{ borderColor: cores.primaria, borderWidth: 2 }}>
            <Text accessibilityLiveRegion="polite" style={{ color: cores.texto, fontSize: tamanho(16) }}>
              {mensagem}
            </Text>
          </Cartao>
        ) : null}

        <Botao
          titulo={registrouHoje ? 'Fazer outro registro' : 'Registrar como estou'}
          accessibilityHint="Abre o formulário de novo registro de humor"
          onPress={() => navigation.navigate('FormRegistro')}
        />

        <View style={{ height: 16 }} />

        {carregando ? (
          <View style={estilos.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={[textoSuave, { marginTop: 8 }]}>Respire fundo, já estamos trazendo seus registros.</Text>
          </View>
        ) : erro ? (
          <Cartao>
            <Text style={{ color: cores.erro, fontSize: tamanho(14), marginBottom: 8 }}>{erro}</Text>
            <Botao titulo="Tentar de novo" tipo="secundario" onPress={carregar} />
          </Cartao>
        ) : (
          <>
            {mostrarPlanta ? (
              <Cartao>
                <Planta folhas={atual} />
                <Text style={{ color: cores.texto, fontSize: tamanho(16), textAlign: 'center', marginTop: 8 }}>
                  {mensagemDaSequencia(atual, registrouHoje)}
                </Text>
                <View style={estilos.numeros}>
                  <Numero valor={atual} rotulo={atual === 1 ? 'dia seguido' : 'dias seguidos'} />
                  <Numero valor={melhor} rotulo="melhor sequência" />
                  <Numero valor={diasNoMes} rotulo={diasNoMes === 1 ? 'dia neste mês' : 'dias neste mês'} />
                </View>
              </Cartao>
            ) : null}

            {ultimo ? (
              <Cartao
                accessibilityLabel={
                  'Último registro: ' + buscarHumor(ultimo.humor)?.nome + ', em ' + formatarDataBR(ultimo.data)
                }
              >
                <Text style={textoSuave}>Último registro</Text>
                <Text style={{ color: cores.texto, fontSize: tamanho(18) }}>
                  {buscarHumor(ultimo.humor)?.emoji} {buscarHumor(ultimo.humor)?.nome}, em {formatarDataBR(ultimo.data)}
                </Text>
              </Cartao>
            ) : null}

            {registros.length > 0 ? (
              <Botao
                titulo="Resumo da semana com IA"
                tipo="secundario"
                accessibilityHint="Abre a tela do resumo da semana. Nada é enviado sem a sua confirmação"
                onPress={() => navigation.navigate('ResumoSemana')}
              />
            ) : null}
          </>
        )}

        {/* Contato de ajuda sempre visível (guia TrackWell, rec. 31, p. 18) */}
        <Cartao style={{ marginTop: 16 }}>
          <Text style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold' }}>Precisa conversar agora?</Text>
          <Text style={[textoSuave, { marginBottom: 10 }]}>
            O CVV atende de graça, 24 horas, pelo telefone 188. Em emergência, ligue 192 (SAMU).
          </Text>
          <Botao
            titulo="Ligar para o CVV (188)"
            tipo="secundario"
            accessibilityHint="Abre o discador do celular com o número 188"
            onPress={() => Linking.openURL('tel:188')}
          />
        </Cartao>
      </View>
    </ScrollView>
  );
}

// O que faz: mostra um número grande com um rótulo embaixo (usado na sequência)
function Numero({ valor, rotulo }) {
  const { cores, tamanho } = useTema();
  return (
    <View accessible accessibilityLabel={valor + ' ' + rotulo} style={estilos.numero}>
      <Text style={{ color: cores.primaria, fontSize: tamanho(24), fontWeight: 'bold' }}>{valor}</Text>
      <Text style={{ color: cores.textoSuave, fontSize: tamanho(12), textAlign: 'center' }}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  centro: { alignItems: 'center', padding: 24 },
  numeros: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  numero: { alignItems: 'center', flex: 1 },
});
