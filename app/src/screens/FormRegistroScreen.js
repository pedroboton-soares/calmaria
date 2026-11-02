// Tela para criar um registro novo ou editar um que já existe.
// Se a tela receber route.params.registro, ela entra em modo de edição.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTema } from '../context/TemaContext';
import { chamarApi } from '../services/api';
import { HUMORES } from '../utils/humor';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

const LIMITE_TEXTO = 1000;

// O que faz: devolve a data de hoje no formato AAAA-MM-DD, usando o horário do celular
function dataDeHoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  // Não uso toISOString() porque ele usa horário UTC e à noite mostraria o dia seguinte
  return agora.getFullYear() + '-' + mes + '-' + dia;
}

// O que faz: confere os campos antes de enviar; devolve a mensagem de erro ou '' se estiver tudo certo
function validar(humor, texto, data) {
  if (humor === null) {
    return 'Escolha como você está se sentindo.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return 'Escreva a data no formato AAAA-MM-DD, por exemplo 2026-11-05.';
  }
  if (texto.length > LIMITE_TEXTO) {
    return 'O texto pode ter no máximo ' + LIMITE_TEXTO + ' caracteres.';
  }
  return '';
}

export default function FormRegistroScreen({ navigation, route }) {
  const { cores, tamanho } = useTema();

  // Se veio um registro pela navegação, é edição; senão, é um registro novo
  const registro = route.params ? route.params.registro : undefined;
  const editando = Boolean(registro);

  const [humor, setHumor] = useState(editando ? registro.humor : null);
  const [texto, setTexto] = useState(editando ? registro.texto || '' : '');
  const [data, setData] = useState(editando ? registro.data : dataDeHoje());
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Muda o título do topo conforme o modo (criar ou editar)
  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar registro' : 'Novo registro' });
  }, [navigation, editando]);

  // O que faz: valida, envia para a API (POST se for novo, PUT se for edição) e volta para a tela anterior
  async function salvarRegistro() {
    const mensagem = validar(humor, texto, data);
    if (mensagem) {
      setErro(mensagem);
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      const caminho = editando ? '/registros/' + registro.id : '/registros';
      await chamarApi(caminho, {
        method: editando ? 'PUT' : 'POST',
        body: { humor, texto, data },
      });
      navigation.goBack();
    } catch (e) {
      setErro(e.message); // mostra a mensagem que veio da API
      setSalvando(false); // libera o botão para tentar de novo
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={[estilos.rotulo, { color: cores.texto, fontSize: tamanho(16) }]}>
          Como você está se sentindo?
        </Text>

        <View style={estilos.linhaHumores}>
          {HUMORES.map((h) => {
            const escolhido = humor === h.valor;
            return (
              <TouchableOpacity
                key={h.valor}
                onPress={() => setHumor(h.valor)}
                accessibilityRole="button"
                accessibilityLabel={'Humor ' + h.nome}
                accessibilityState={{ selected: escolhido }}
                style={[
                  estilos.botaoHumor,
                  {
                    backgroundColor: escolhido ? cores.primaria : cores.cartao,
                    borderColor: escolhido ? cores.primaria : cores.borda,
                  },
                ]}
              >
                <Text style={{ fontSize: tamanho(26) }}>{h.emoji}</Text>
                <Text
                  style={{
                    fontSize: tamanho(12),
                    textAlign: 'center',
                    color: escolhido ? cores.textoSobrePrimaria : cores.texto,
                  }}
                >
                  {h.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <CampoTexto
          rotulo="Como foi o seu dia? (opcional)"
          valor={texto}
          onChangeText={setTexto}
          multiline
          accessibilityLabel="Texto do registro"
        />
        <Text style={{ color: cores.textoSuave, fontSize: tamanho(12), marginBottom: 12 }}>
          {texto.length}/{LIMITE_TEXTO}
        </Text>

        <CampoTexto
          rotulo="Data (AAAA-MM-DD)"
          valor={data}
          onChangeText={setData}
          accessibilityLabel="Data do registro"
        />

        {erro !== '' && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: cores.erro, fontSize: tamanho(14), marginVertical: 8 }}
          >
            {erro}
          </Text>
        )}

        <Botao
          titulo={salvando ? 'Salvando...' : 'Salvar'}
          onPress={salvarRegistro}
          desabilitado={salvando}
        />
        <View style={{ height: 8 }} />
        <Botao titulo="Cancelar" tipo="secundario" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: 16 },
  rotulo: { fontWeight: 'bold', marginBottom: 8 },
  linhaHumores: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  botaoHumor: {
    minHeight: 72,
    minWidth: 64,
    flexGrow: 1,
    margin: 4,
    padding: 6,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
