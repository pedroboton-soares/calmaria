// Cartão: uma caixa com fundo e borda para agrupar conteúdo. Usa as cores do tema.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

// O que faz: desenha a caixa em volta dos filhos.
// Se receber accessibilityLabel, o leitor de tela lê o cartão como um bloco só
// (use isso apenas em cartões SEM botões dentro, senão os botões ficam inacessíveis).
export default function Cartao({ children, accessibilityLabel, style }) {
  const { cores } = useTema();

  return (
    <View
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }, style]}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
});
