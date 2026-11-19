// Tela de Ajustes. Tem três partes: personalização (tema claro ou escuro e planta), acessibilidade
// (tamanho da fonte) e links para a conta e para a política de privacidade.
// As escolhas de tema e de fonte são salvas no celular pelo TemaContext.

import React from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useTema } from '../context/TemaContext';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

// Os três níveis de tamanho de fonte (o número é por quanto o texto é multiplicado)
const NIVEIS_FONTE = [
  { nome: 'Normal', valor: 1 },
  { nome: 'Grande', valor: 1.2 },
  { nome: 'Muito grande', valor: 1.4 },
];

// O que faz: desenha uma das opções de tamanho. A opção escolhida fica preenchida e com um "✓",
// assim a escolha aparece também pelo texto e não só pela cor.
function OpcaoTamanho({ nivel, selecionado, aoEscolher }) {
  const { cores, tamanho } = useTema();

  return (
    <TouchableOpacity
      onPress={() => aoEscolher(nivel.valor)}
      accessibilityRole="radio" // o leitor de tela anuncia como opção de escolha única
      accessibilityLabel={'Tamanho do texto: ' + nivel.nome}
      accessibilityState={{ selected: selecionado, checked: selecionado }}
      style={[
        estilos.opcao,
        {
          backgroundColor: selecionado ? cores.primaria : cores.cartao,
          borderColor: cores.primaria,
        },
      ]}
    >
      <Text
        style={{
          color: selecionado ? cores.textoSobrePrimaria : cores.texto,
          fontSize: tamanho(15),
          fontWeight: selecionado ? 'bold' : 'normal',
          textAlign: 'center',
        }}
      >
        {(selecionado ? '✓ ' : '') + nivel.nome}
      </Text>
    </TouchableOpacity>
  );
}

// O que faz: mostra a tela de Ajustes
export default function ConfiguracoesScreen({ navigation }) {
  const { cores, escuro, alternarTema, escala, mudarEscala, tamanho, mostrarPlanta, alternarPlanta } =
    useTema();

  return (
    // ScrollView: a tela rola se não couber (fonte grande ou celular deitado)
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.rolagem}
    >
      <View style={estilos.conteudo}>
        {/* Parte 1: personalização */}
        <Text
          accessibilityRole="header"
          style={[estilos.titulo, { color: cores.texto, fontSize: tamanho(20) }]}
        >
          Personalização
        </Text>
        <Cartao>
          {/* A linha inteira é tocável (área grande); o Switch é só o desenho do interruptor */}
          <TouchableOpacity
            onPress={alternarTema}
            accessibilityRole="switch"
            accessibilityLabel="Tema escuro"
            accessibilityHint="Troca entre o tema claro e o escuro"
            accessibilityState={{ checked: escuro }}
            style={estilos.linhaTema}
          >
            <View style={estilos.textosTema}>
              <Text style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold' }}>
                Tema escuro
              </Text>
              <Text style={{ color: cores.textoSuave, fontSize: tamanho(14) }}>
                {escuro ? 'Ativado' : 'Desativado'}. Cores escuras cansam menos a vista em lugares com pouca luz.
              </Text>
            </View>
            <View pointerEvents="none">
              <Switch
                value={escuro}
                trackColor={{ false: cores.borda, true: cores.primaria }}
                thumbColor={cores.cartao}
              />
            </View>
          </TouchableOpacity>
        </Cartao>
        <Cartao>
          {/* A planta é o lado de "jogo" do app; o guia TrackWell pede que ela possa ser desligada */}
          <TouchableOpacity
            onPress={alternarPlanta}
            accessibilityRole="switch"
            accessibilityLabel="Mostrar planta e sequência"
            accessibilityHint="Mostra ou esconde a planta e a contagem de dias seguidos na tela inicial"
            accessibilityState={{ checked: mostrarPlanta }}
            style={estilos.linhaTema}
          >
            <View style={estilos.textosTema}>
              <Text style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold' }}>
                Mostrar planta e sequência
              </Text>
              <Text style={{ color: cores.textoSuave, fontSize: tamanho(14) }}>
                {mostrarPlanta ? 'Ativado' : 'Desativado'}. A planta ganha uma folha por dia seguido com
                registro. Se preferir sem contagem, é só desligar.
              </Text>
            </View>
            <View pointerEvents="none">
              <Switch
                value={mostrarPlanta}
                trackColor={{ false: cores.borda, true: cores.primaria }}
                thumbColor={cores.cartao}
              />
            </View>
          </TouchableOpacity>
        </Cartao>

        {/* Parte 2: acessibilidade */}
        <Text
          accessibilityRole="header"
          style={[estilos.titulo, { color: cores.texto, fontSize: tamanho(20) }]}
        >
          Acessibilidade
        </Text>
        <Cartao>
          <Text style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold' }}>
            Tamanho do texto
          </Text>
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), marginBottom: 10 }}>
            Escolha o tamanho que for mais confortável para ler. A mudança vale para o app todo.
          </Text>
          <View style={estilos.opcoes} accessibilityRole="radiogroup">
            {NIVEIS_FONTE.map((nivel) => (
              <OpcaoTamanho
                key={nivel.nome}
                nivel={nivel}
                selecionado={escala === nivel.valor}
                aoEscolher={mudarEscala}
              />
            ))}
          </View>
          <Text style={{ color: cores.texto, fontSize: tamanho(16), marginTop: 12 }}>
            Exemplo: assim ficam os textos do Calmaria.
          </Text>
        </Cartao>

        {/* Parte 3: conta e privacidade (telas do Pedro) */}
        <Text
          accessibilityRole="header"
          style={[estilos.titulo, { color: cores.texto, fontSize: tamanho(20) }]}
        >
          Conta e privacidade
        </Text>
        <View style={estilos.links}>
          <Botao
            titulo="Minha conta"
            tipo="secundario"
            accessibilityHint="Abre a tela da sua conta"
            onPress={() => navigation.navigate('Conta')}
          />
          <Botao
            titulo="Política de privacidade"
            tipo="secundario"
            accessibilityHint="Abre a política de privacidade do aplicativo"
            onPress={() => navigation.navigate('Politica')}
          />
        </View>

        <Text style={{ color: cores.textoSuave, fontSize: tamanho(13), marginTop: 16 }}>
          Suas escolhas de tema e de tamanho do texto ficam salvas neste celular.
        </Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  // Em celular deitado a tela fica larga: limita a largura e centraliza o conteúdo
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  titulo: { fontWeight: 'bold', marginTop: 8, marginBottom: 8 },
  linhaTema: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textosTema: { flex: 1 },
  // flexWrap deixa as opções caírem para a linha de baixo se não couberem lado a lado
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    flexGrow: 1,
    minWidth: 110,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  links: { gap: 12 },
});
