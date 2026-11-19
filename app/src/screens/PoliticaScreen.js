// Tela da política de privacidade. Explica, em partes curtas, quais dados o app guarda,
// para que servem, como a IA é usada e quais são os direitos do usuário (LGPD).
// Abre tanto antes do login (Login e Consentimento) quanto depois (Ajustes).

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import Cartao from '../components/Cartao';

// Cada item vira um cartão com título e texto. Ficam separados para a leitura ser por partes
const SECOES = [
  {
    titulo: 'Quem cuida dos seus dados',
    texto:
      'O Calmaria é um trabalho acadêmico da disciplina de Desenvolvimento de Aplicações para ' +
      'Dispositivos Móveis da UFPR, feito por Pedro, Yudi e Jardel. Não tem fins comerciais.',
  },
  {
    titulo: 'Quais dados guardamos',
    texto:
      'Seu nome, seu e-mail, sua senha (guardada só de forma criptografada, ninguém consegue ler), ' +
      'a data em que você aceitou este termo e os registros que você escrever: humor de 1 a 5, ' +
      'texto e data. Como falam da sua saúde mental, são dados pessoais sensíveis pela LGPD ' +
      '(Lei nº 13.709/2018).',
  },
  {
    titulo: 'Para que usamos',
    texto:
      'Só para você acompanhar o seu humor: ver o histórico, a sequência de dias registrados e ' +
      'baixar relatórios. Não vendemos, não divulgamos e não usamos seus dados para propaganda.',
  },
  {
    titulo: 'Onde os dados ficam',
    texto:
      'Os registros ficam no servidor do aplicativo e cada consulta só devolve os dados da própria ' +
      'conta. No celular ficam apenas o seu token de acesso e as preferências de tema e de tamanho ' +
      'do texto.',
  },
  {
    titulo: 'Uso de inteligência artificial',
    texto:
      'A reflexão e o resumo da semana usam o Gemini, um serviço de IA do Google (terceiro). Nada é ' +
      'enviado sozinho: só quando você toca no botão, depois de um aviso. Vão apenas o humor, a data ' +
      'e o texto dos registros escolhidos, sem nome e sem e-mail. Nosso servidor de IA não guarda ' +
      'esses textos. A IA não faz diagnóstico e não indica remédios.',
  },
  {
    titulo: 'Seus direitos',
    texto:
      'Você pode, a qualquer momento e dentro do app: ver e corrigir seus registros, baixar seus ' +
      'dados em PDF (aba Relatório), apagar todos os registros e manter a conta, ou apagar a conta ' +
      'inteira. Apagar a conta também retira o seu consentimento.',
  },
  {
    titulo: 'Como apagar',
    texto:
      'Vá em Ajustes, depois em Minha conta. Antes de apagar, o app pede confirmação. A exclusão ' +
      'é definitiva: os dados apagados não podem ser recuperados.',
  },
  {
    titulo: 'Se você precisar de ajuda agora',
    texto:
      'O Calmaria é um apoio e não substitui psicólogo, psiquiatra ou médico. Se você estiver em ' +
      'crise ou pensando em se machucar, ligue para o CVV, telefone 188 (gratuito, 24 horas), ou ' +
      'acesse cvv.org.br. Em emergência, ligue para o SAMU, 192.',
  },
];

// O que faz: mostra a política de privacidade dividida em cartões
export default function PoliticaScreen() {
  const { cores, tamanho } = useTema();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), marginBottom: 12 }}>
          Resumo de como o Calmaria trata os seus dados. Última atualização: novembro de 2026.
        </Text>

        {SECOES.map((secao) => (
          <Cartao key={secao.titulo}>
            <Text
              accessibilityRole="header"
              style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 4 }}
            >
              {secao.titulo}
            </Text>
            <Text style={{ color: cores.texto, fontSize: tamanho(14), lineHeight: tamanho(20) }}>
              {secao.texto}
            </Text>
          </Cartao>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
});
