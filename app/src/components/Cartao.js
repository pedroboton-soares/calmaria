// Versão provisória: cartão com fundo e borda. O Jardel vai melhorar, mantendo as mesmas propriedades.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

export default function Cartao({ children }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
});
