// Arquivo principal do app: define a navegação (quais telas existem e como o usuário passa de uma para outra).
// Se o usuário está logado, vê as abas e as telas do app. Se não, vê as telas de login e cadastro.

import React from 'react';
import { ActivityIndicator, View, Text, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TemaProvider, useTema } from './src/context/TemaContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import ConsentimentoScreen from './src/screens/ConsentimentoScreen';
import PoliticaScreen from './src/screens/PoliticaScreen';
import ContaScreen from './src/screens/ContaScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListaRegistrosScreen from './src/screens/ListaRegistrosScreen';
import RelatorioScreen from './src/screens/RelatorioScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import FormRegistroScreen from './src/screens/FormRegistroScreen';
import ReflexaoScreen from './src/screens/ReflexaoScreen';
import ResumoSemanaScreen from './src/screens/ResumoSemanaScreen';

// Stack: telas que abrem uma sobre a outra. Tab: as abas de baixo.
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// O que faz: cria um ícone simples (emoji) para a aba, sem precisar de biblioteca de ícones
function icone(emoji) {
  return () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

// As 4 abas do app logado (o guia TrackWell aceita até 5 abas, com ícone e rótulo, p. 35)
function Abas() {
  const { cores } = useTema();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.cartao },
        headerTintColor: cores.texto,
        tabBarStyle: { backgroundColor: cores.cartao, borderTopColor: cores.borda, minHeight: 60 },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen}
        options={{ title: 'Início', tabBarIcon: icone('🏠') }} />
      <Tab.Screen name="Registros" component={ListaRegistrosScreen}
        options={{ title: 'Registros', tabBarIcon: icone('📖') }} />
      <Tab.Screen name="Relatorio" component={RelatorioScreen}
        options={{ title: 'Relatório', tabBarIcon: icone('📄') }} />
      <Tab.Screen name="Ajustes" component={ConfiguracoesScreen}
        options={{ title: 'Ajustes', tabBarIcon: icone('⚙️') }} />
    </Tab.Navigator>
  );
}

// O que faz: escolhe quais telas mostrar conforme o usuário esteja logado ou não
function Rotas() {
  const { usuario, carregando } = useAuth();
  const { cores } = useTema();

  // Enquanto confere se já existe login salvo, mostra uma rodinha de carregamento
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.cartao },
        headerTintColor: cores.texto,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      {usuario ? (
        <>
          <Stack.Screen name="Principal" component={Abas} options={{ headerShown: false }} />
          <Stack.Screen name="FormRegistro" component={FormRegistroScreen} />
          <Stack.Screen name="Reflexao" component={ReflexaoScreen} options={{ title: 'Reflexão com IA' }} />
          <Stack.Screen name="ResumoSemana" component={ResumoSemanaScreen} options={{ title: 'Resumo da semana' }} />
          <Stack.Screen name="Conta" component={ContaScreen} options={{ title: 'Minha conta' }} />
          <Stack.Screen name="Politica" component={PoliticaScreen} options={{ title: 'Política de privacidade' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
          <Stack.Screen name="Consentimento" component={ConsentimentoScreen} options={{ title: 'Consentimento' }} />
          <Stack.Screen name="Politica" component={PoliticaScreen} options={{ title: 'Política de privacidade' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

// O que faz: liga a navegação às cores do tema, para fundo, topo e barra de status combinarem
function Navegacao() {
  const { cores, escuro } = useTema();
  const base = escuro ? DarkTheme : DefaultTheme;
  const temaNavegacao = {
    ...base,
    colors: { ...base.colors, background: cores.fundo, card: cores.cartao, text: cores.texto, border: cores.borda, primary: cores.primaria },
  };
  return (
    <NavigationContainer theme={temaNavegacao}>
      <StatusBar barStyle={escuro ? 'light-content' : 'dark-content'} backgroundColor={cores.cartao} />
      <Rotas />
    </NavigationContainer>
  );
}

// Componente raiz: os "providers" deixam tema e login disponíveis para todas as telas
export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <AuthProvider>
          <Navegacao />
        </AuthProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
