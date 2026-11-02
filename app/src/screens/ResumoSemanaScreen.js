// Tela provisória (responsável: Jardel). Este arquivo será substituído pela versão real.

import React from 'react';
import { View, Text } from 'react-native';
import { useTema } from '../context/TemaContext';

export default function ResumoSemanaScreen() {
  const { cores, tamanho } = useTema();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
      <Text style={{ color: cores.texto, fontSize: tamanho(18) }}>Tela ResumoSemana (em construção)</Text>
    </View>
  );
}
