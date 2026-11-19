// Aviso mostrado antes de enviar qualquer coisa para a IA: o que vai, para quem vai e o que a IA não faz.
// Usado nas telas Reflexao e ResumoSemana (guia TrackWell: rec. 10, p. 11 e rec. 55, p. 25).

import React from 'react';
import { Text } from 'react-native';
import { useTema } from '../context/TemaContext';
import Cartao from './Cartao';

// O que faz: desenha o cartão de aviso; "oQueVai" descreve o que será enviado nesta tela
export default function AvisoIA({ oQueVai }) {
  const { cores, tamanho } = useTema();
  const texto = { color: cores.texto, fontSize: tamanho(14), marginBottom: 6 };

  return (
    <Cartao style={{ borderColor: cores.primaria }}>
      <Text accessibilityRole="header" style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 6 }}>
        Antes de enviar
      </Text>
      <Text style={texto}>O que vai: {oQueVai} Seu nome e seu e-mail não são enviados.</Text>
      <Text style={texto}>
        Para quem: o Gemini, um serviço de IA do Google (terceiro). Nosso servidor de IA não guarda o texto.
      </Text>
      <Text style={{ ...texto, marginBottom: 0 }}>
        Como funciona: a IA responde com base em materiais do Ministério da Saúde, do CVV e de um artigo científico. Ela não faz
        diagnóstico, não indica remédios e não substitui um profissional.
      </Text>
    </Cartao>
  );
}
