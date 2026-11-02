// Arquivo principal do app: define a navegação (quais telas existem e como o usuário passa de uma para outra).
// Se o usuário está logado, vê as abas e as telas do app. Se não, vê as telas de login e cadastro.

import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TemaProvider } from './src/context/TemaContext';
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

// As 4 abas do app logado
function Abas() {
  return (
    <Tab.Navigator>
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

  // Enquanto confere se já existe login salvo, mostra uma rodinha de carregamento
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
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

// Componente raiz: os "providers" deixam tema e login disponíveis para todas as telas
export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Rotas />
          </NavigationContainer>
        </AuthProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
