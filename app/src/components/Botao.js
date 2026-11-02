// Versão provisória: botão com 3 tipos (primario, secundario, perigo). O Jardel vai melhorar, mantendo as mesmas propriedades.
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

export default function Botao({ titulo, onPress, tipo = 'primario', desabilitado = false, accessibilityLabel }) {  const { cores, tamanho } = useTema();
  const fundo = tipo === 'perigo' ? cores.erro : tipo === 'secundario' ? cores.cartao : cores.primaria;
  const letra = tipo === 'secundario' ? cores.texto : cores.textoSobrePrimaria;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={[
        estilos.botao,
        { backgroundColor: fundo, borderColor: cores.borda, opacity: desabilitado ? 0.6 : 1 },
      ]}
    >
      <Text style={{ color: letra, fontSize: tamanho(16), fontWeight: 'bold' }}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
