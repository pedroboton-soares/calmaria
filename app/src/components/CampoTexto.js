// Campo de texto com rótulo em cima e mensagem de erro embaixo. Usa o tema e o tamanho de fonte escolhido.

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

// O que faz: desenha o rótulo, o campo para digitar e, se houver, a mensagem de erro.
// Propriedades extras (secureTextEntry, keyboardType, maxLength...) vão direto para o TextInput.
export default function CampoTexto({
  rotulo,
  valor,
  onChangeText,
  multiline = false,
  erro,
  accessibilityLabel,
  accessibilityHint,
  ...resto
}) {
  const { cores, tamanho } = useTema();

  return (
    <View style={estilos.grupo}>
      <Text style={{ color: cores.texto, fontSize: tamanho(14), marginBottom: 4 }}>{rotulo}</Text>
      <TextInput
        {...resto}
        value={valor}
        onChangeText={onChangeText}
        multiline={multiline}
        accessibilityLabel={accessibilityLabel || rotulo} // o leitor de tela fala o rótulo ao focar no campo
        accessibilityHint={accessibilityHint}
        placeholderTextColor={cores.textoSuave}
        style={[
          estilos.campo,
          {
            color: cores.texto,
            backgroundColor: cores.cartao,
            // Borda mais escura que a dos cartões para o campo ser fácil de enxergar; vermelha se houver erro
            borderColor: erro ? cores.erro : cores.textoSuave,
            fontSize: tamanho(16),
            minHeight: multiline ? 120 : 48, // altura mínima de toque
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
      {erro ? (
        // O texto do erro tem aviso para o leitor de tela falar quando aparecer
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: cores.erro, fontSize: tamanho(13), marginTop: 4 }}
        >
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: 4 },
  campo: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
