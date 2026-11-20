// Botão do app, com 4 tipos (primario, secundario, perigo e perigoContorno). Usa as cores e o tamanho de fonte do tema
// e tem área de toque de pelo menos 48 de altura, para ser fácil de tocar.

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';

// O que faz: desenha um botão. O tipo muda as cores; "desabilitado" bloqueia o toque
export default function Botao({
  titulo,
  onPress,
  tipo = 'primario',
  desabilitado = false,
  accessibilityLabel,
  accessibilityHint,
}) {
  const { cores, tamanho } = useTema();

  // Começa com as cores do botão primário e troca se for outro tipo
  let fundo = cores.primaria;
  let letra = cores.textoSobrePrimaria;
  let borda = cores.primaria;
  if (tipo === 'secundario') {
    fundo = cores.cartao;
    letra = cores.texto;
    borda = cores.primaria; // a borda deixa o botão visível mesmo sem preenchimento
  }
  if (tipo === 'perigo') {
    fundo = cores.erro;
    borda = cores.erro;
  }
  // Ação de apagar que não é a principal da tela: vermelho só na borda e no texto, para não chamar mais atenção
  if (tipo === 'perigoContorno') {
    fundo = cores.cartao;
    letra = cores.erro;
    borda = cores.erro;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desabilitado}
      activeOpacity={0.7}
      accessibilityRole="button" // o leitor de tela anuncia "botão"
      accessibilityLabel={accessibilityLabel || titulo} // texto que o leitor de tela fala
      accessibilityHint={accessibilityHint} // dica opcional do que acontece ao tocar
      accessibilityState={{ disabled: desabilitado }}
      style={[
        estilos.botao,
        { backgroundColor: fundo, borderColor: borda, opacity: desabilitado ? 0.6 : 1 },
      ]}
    >
      <Text style={[estilos.texto, { color: letra, fontSize: tamanho(16) }]}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 48, // altura mínima de toque
    paddingVertical: 10, // deixa o botão crescer se a fonte aumentar
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
