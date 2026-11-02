// Versão provisória: campo de texto com rótulo e mensagem de erro. O Jardel vai melhorar, mantendo as mesmas propriedades.
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

export default function CampoTexto({ rotulo, valor, onChangeText, multiline, erro, ...resto }) {
  const { cores, tamanho } = useTema();
  return (
    <View style={estilos.grupo}>
      <Text style={{ color: cores.texto, fontSize: tamanho(14), marginBottom: 4 }}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={onChangeText}
        multiline={multiline}
        accessibilityLabel={resto.accessibilityLabel || rotulo}
        placeholderTextColor={cores.textoSuave}
        style={[
          estilos.campo,
          {
            color: cores.texto,
            backgroundColor: cores.cartao,
            borderColor: erro ? cores.erro : cores.borda,
            fontSize: tamanho(16),
            minHeight: multiline ? 120 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        {...resto}
      />
      {erro ? <Text style={{ color: cores.erro, fontSize: tamanho(12) }}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: 4 },
  campo: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
});
