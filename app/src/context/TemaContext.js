// Guarda o tema (claro ou escuro) e o tamanho da fonte do app, e salva a escolha no celular
// (AsyncStorage) para ela continuar valendo depois que o app for fechado.
// Qualquer tela pode usar tudo isso chamando useTema().

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nomes sob os quais as escolhas ficam guardadas no celular
const CHAVE_TEMA = 'calmaria_tema';
const CHAVE_ESCALA = 'calmaria_escala';

// Cores do tema claro (mesmas da versão provisória do Pedro)
const CORES_CLARO = {
  fundo: '#F5F7FA',
  cartao: '#FFFFFF',
  texto: '#1F2933',
  textoSuave: '#52606D',
  primaria: '#2F6F8F',
  textoSobrePrimaria: '#FFFFFF',
  borda: '#CBD2D9',
  erro: '#B00020',
  sucesso: '#1B7F3B',
};

// Cores do tema escuro (texto claro sobre fundo escuro, com bom contraste)
const CORES_ESCURO = {
  fundo: '#121A21',
  cartao: '#1C2630',
  texto: '#E8EDF2',
  textoSuave: '#AAB7C4',
  primaria: '#7FB8D6',
  textoSobrePrimaria: '#0B1620',
  borda: '#3A4856',
  erro: '#FF8A80',
  sucesso: '#6FCF97',
};

// O "contexto" é uma caixa compartilhada: o Provider coloca os valores nela e as telas leem
const TemaContext = createContext(null);

// O que faz: salva um valor no celular. Se der erro, só não fica salvo (o app continua funcionando)
async function guardar(chave, valor) {
  try {
    await AsyncStorage.setItem(chave, valor);
  } catch (erro) {
    console.log('Não foi possível salvar a preferência:', chave);
  }
}

// O que faz: envolve o app e entrega o tema e a escala de fonte para todas as telas
export function TemaProvider({ children }) {
  const [escuro, setEscuro] = useState(false); // false = tema claro
  const [escala, setEscala] = useState(1); // 1 = fonte normal
  const [carregado, setCarregado] = useState(false); // vira true depois de ler o que estava salvo

  // O que faz: quando o app abre, lê as escolhas salvas no celular (roda uma vez só)
  useEffect(() => {
    async function lerEscolhas() {
      try {
        const temaSalvo = await AsyncStorage.getItem(CHAVE_TEMA);
        const escalaSalva = Number(await AsyncStorage.getItem(CHAVE_ESCALA));
        if (temaSalvo === 'escuro') {
          setEscuro(true);
        }
        // Só aceita valores que fazem sentido (entre 1 e 2), para um valor estranho não quebrar a tela
        if (escalaSalva >= 1 && escalaSalva <= 2) {
          setEscala(escalaSalva);
        }
      } catch (erro) {
        // Se não conseguir ler, fica com o padrão: tema claro e fonte normal
      } finally {
        setCarregado(true);
      }
    }
    lerEscolhas();
  }, []);

  // O que faz: troca entre tema claro e escuro e salva a escolha
  async function alternarTema() {
    const novoValor = !escuro;
    setEscuro(novoValor); // muda na tela na mesma hora
    await guardar(CHAVE_TEMA, novoValor ? 'escuro' : 'claro');
  }

  // O que faz: muda o tamanho da fonte (1 = normal, 1.2 = grande, ...) e salva a escolha
  async function mudarEscala(valor) {
    if (typeof valor !== 'number' || valor < 1 || valor > 2) {
      return; // ignora valores inválidos
    }
    setEscala(valor);
    await guardar(CHAVE_ESCALA, String(valor));
  }

  // O que faz: devolve o tamanho de fonte já multiplicado pela escala escolhida
  function tamanho(base) {
    return base * escala;
  }

  // Enquanto lê o que estava salvo, não mostra nada, para a tela não "piscar" no tema errado
  if (!carregado) {
    return null;
  }

  const valor = {
    cores: escuro ? CORES_ESCURO : CORES_CLARO,
    escuro,
    alternarTema,
    escala,
    mudarEscala,
    tamanho,
  };

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

// O que faz: permite que uma tela use o tema com: const { cores, tamanho } = useTema();
export function useTema() {
  const valor = useContext(TemaContext);
  if (valor === null) {
    throw new Error('useTema precisa ser usado dentro do TemaProvider');
  }
  return valor;
}
