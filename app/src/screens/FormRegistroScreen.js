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
import { dataDeHoje, formatarDataBR, lerDataBR } from '../utils/datas';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

const LIMITE_TEXTO = 1000;

// O que faz: confere os campos antes de enviar; devolve a mensagem de erro ou '' se estiver tudo certo.
// dataApi é a data já convertida para AAAA-MM-DD (ou null se a pessoa digitou uma data que não existe)
function validar(humor, texto, dataApi) {
  if (humor === null) {
    return 'Escolha como você está se sentindo.';
  }
  if (!dataApi) {
    return 'Confira a data. Escreva no formato DD/MM/AAAA, por exemplo 05/11/2026.';
  }
  if (dataApi > dataDeHoje()) {
    return 'A data não pode ser depois de hoje.';
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
  // A data aparece como DD/MM/AAAA na tela e só é convertida para AAAA-MM-DD na hora de salvar
  const [data, setData] = useState(formatarDataBR(editando ? registro.data : dataDeHoje()));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Muda o título do topo conforme o modo (criar ou editar)
  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar registro' : 'Novo registro' });
  }, [navigation, editando]);

  // O que faz: valida e envia para a API (POST se for novo, PUT se for edição).
  // Registro novo volta para a Início, que mostra a mensagem da planta; edição volta para a tela anterior
  async function salvarRegistro() {
    const dataApi = lerDataBR(data);
    const mensagem = validar(humor, texto, dataApi);
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
        body: { humor, texto, data: dataApi },
      });
      if (editando) {
        navigation.goBack();
      } else {
        // popTo volta até o Principal que já está na pilha e abre a aba Início com os parâmetros
        navigation.popTo('Principal', { screen: 'Inicio', params: { registroSalvo: true, humor } });
      }
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
          rotulo="Quer contar um pouco mais? (opcional)"
          valor={texto}
          onChangeText={setTexto}
          multiline
          maxLength={LIMITE_TEXTO}
          placeholder="Se quiser, conte como está se sentindo hoje..."
          accessibilityLabel="Texto do registro"
        />
        <Text style={{ color: cores.textoSuave, fontSize: tamanho(12), marginBottom: 12 }}>
          {texto.length}/{LIMITE_TEXTO}
        </Text>

        <CampoTexto
          rotulo="Data (DD/MM/AAAA)"
          valor={data}
          onChangeText={setData}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          accessibilityLabel="Data do registro, no formato dia, mês e ano"
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
