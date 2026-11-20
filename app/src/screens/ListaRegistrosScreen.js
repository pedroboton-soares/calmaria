// Tela da aba Registros: lista todos os registros do usuário, do mais recente para o mais antigo.
// Cada registro tem os botões Editar, Refletir com IA e Excluir (com confirmação antes).
// Os dados vêm de GET /registros e a exclusão usa DELETE /registros/:id.

import React, { useCallback, useState } from 'react';
import { FlatList, View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTema } from '../context/TemaContext';
import { chamarApi } from '../services/api';
import { buscarHumor } from '../utils/humor';
import { formatarDataBR } from '../utils/datas';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

export default function ListaRegistrosScreen({ navigation }) {
  const { cores, tamanho } = useTema();

  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false); // puxar a lista para baixo para recarregar
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // O que faz: busca a lista de registros na API
  async function carregar() {
    setErro('');
    try {
      setRegistros(await chamarApi('/registros'));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  // Busca de novo toda vez que a aba aparece (pode ter registro novo ou editado)
  useFocusEffect(
    useCallback(() => {
      setAviso('');
      carregar();
    }, [])
  );

  // O que faz: apaga um registro na API e tira ele da lista
  async function excluir(registro) {
    try {
      await chamarApi('/registros/' + registro.id, { method: 'DELETE' });
      setRegistros((lista) => lista.filter((r) => r.id !== registro.id));
      setAviso('Registro apagado.');
    } catch (e) {
      setErro(e.message);
    }
  }

  // O que faz: pergunta antes de apagar, mostrando a data do registro
  function confirmarExclusao(registro) {
    Alert.alert(
      'Apagar este registro?',
      'O registro de ' + formatarDataBR(registro.data) + ' será apagado para sempre.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => excluir(registro) },
      ]
    );
  }

  // O que faz: desenha um registro da lista
  function desenharRegistro({ item }) {
    const humor = buscarHumor(item.humor);
    return (
      <Cartao>
        <View
          accessible
          accessibilityLabel={formatarDataBR(item.data) + ', humor ' + humor?.nome + '. ' + (item.texto || 'Sem texto.')}
        >
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(13) }}>{formatarDataBR(item.data)}</Text>
          <Text style={{ color: cores.texto, fontSize: tamanho(18), fontWeight: 'bold', marginBottom: 4 }}>
            {humor?.emoji} {humor?.nome}
          </Text>
          {item.texto ? (
            <Text numberOfLines={4} style={{ color: cores.texto, fontSize: tamanho(14) }}>
              {item.texto}
            </Text>
          ) : (
            <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), fontStyle: 'italic' }}>Sem texto</Text>
          )}
        </View>
        <View style={estilos.botoes}>
          <View style={estilos.botao}>
            <Botao
              titulo="Editar"
              tipo="secundario"
              accessibilityLabel={'Editar registro de ' + formatarDataBR(item.data)}
              onPress={() => navigation.navigate('FormRegistro', { registro: item })}
            />
          </View>
          <View style={estilos.botao}>
            <Botao
              titulo="Refletir com IA"
              tipo="secundario"
              accessibilityLabel={'Refletir com IA sobre o registro de ' + formatarDataBR(item.data)}
              accessibilityHint="Abre a tela de reflexão. Nada é enviado sem a sua confirmação"
              onPress={() => navigation.navigate('Reflexao', { registro: item })}
            />
          </View>
          <View style={estilos.botao}>
            <Botao
              titulo="Excluir"
              tipo="perigoContorno"
              accessibilityLabel={'Excluir registro de ' + formatarDataBR(item.data)}
              onPress={() => confirmarExclusao(item)}
            />
          </View>
        </View>
      </Cartao>
    );
  }

  if (carregando) {
    return (
      <View style={[estilos.centro, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.lista}
      data={registros}
      keyExtractor={(item) => String(item.id)}
      renderItem={desenharRegistro}
      refreshing={atualizando}
      onRefresh={() => {
        setAtualizando(true);
        carregar();
      }}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Botao titulo="Novo registro" onPress={() => navigation.navigate('FormRegistro')} />
          {aviso ? (
            <Text accessibilityLiveRegion="polite" style={{ color: cores.sucesso, fontSize: tamanho(14), marginTop: 8 }}>
              {aviso}
            </Text>
          ) : null}
          {erro ? (
            <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginTop: 8 }}>
              {erro}
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        erro ? null : (
          <Cartao>
            <Text style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 4 }}>
              Seu diário ainda está em branco
            </Text>
            <Text style={{ color: cores.textoSuave, fontSize: tamanho(14) }}>
              Quando quiser, registre como você está. Leva menos de um minuto, e cada registro aparece aqui.
            </Text>
          </Cartao>
        )
      }
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // flexWrap: se a fonte estiver grande, os botões descem para a linha de baixo
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  botao: { flexGrow: 1, minWidth: 90 },
});
