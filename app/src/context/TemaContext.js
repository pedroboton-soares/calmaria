// Guarda o tema (claro ou escuro), o tamanho da fonte e se a planta aparece na Home, e salva as escolhas no celular
// (AsyncStorage) para ela continuar valendo depois que o app for fechado.
// Qualquer tela pode usar tudo isso chamando useTema().

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nomes sob os quais as escolhas ficam guardadas no celular
const CHAVE_TEMA = 'calmaria_tema';
const CHAVE_ESCALA = 'calmaria_escala';
const CHAVE_PLANTA = 'calmaria_planta';

// Cores do tema claro, na direção visual "Planta": verde de folha, fundo azul bem claro e vaso de barro
const CORES_CLARO = {
  fundo: '#E8F2F4',
  cartao: '#FFFFFF',
  texto: '#14323A',
  textoSuave: '#4A6670',
  primaria: '#2F7D4F',
  textoSobrePrimaria: '#FFFFFF',
  borda: '#C5D6DA',
  erro: '#B3261E',
  sucesso: '#2F7D4F',
  folha: '#2F7D4F',
  folhaClara: '#6DB37F',
  vaso: '#B9774A',
  terra: '#6B4A33',
};

// Cores do tema escuro: as mesmas ideias, mais claras sobre fundo escuro, com bom contraste
const CORES_ESCURO = {
  fundo: '#0F1E22',
  cartao: '#17292E',
  texto: '#E3EEF0',
  textoSuave: '#A7BEC3',
  primaria: '#7CC497',
  textoSobrePrimaria: '#0F1E22',
  borda: '#2C4349',
  erro: '#F2B8B5',
  sucesso: '#7CC497',
  folha: '#7CC497',
  folhaClara: '#4E9A68',
  vaso: '#C98A5E',
  terra: '#5A3A24',
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
  const [mostrarPlanta, setMostrarPlanta] = useState(true); // planta e sequência aparecem na Home
  const [carregado, setCarregado] = useState(false); // vira true depois de ler o que estava salvo

  // O que faz: quando o app abre, lê as escolhas salvas no celular (roda uma vez só)
  useEffect(() => {
    async function lerEscolhas() {
      try {
        const temaSalvo = await AsyncStorage.getItem(CHAVE_TEMA);
        const escalaSalva = Number(await AsyncStorage.getItem(CHAVE_ESCALA));
        const plantaSalva = await AsyncStorage.getItem(CHAVE_PLANTA);
        if (temaSalvo === 'escuro') {
          setEscuro(true);
        }
        if (plantaSalva === 'nao') {
          setMostrarPlanta(false);
        }
        // Só aceita valores que fazem sentido (entre 1 e 2), para um valor estranho não quebrar a tela
        if (escalaSalva >= 1 && escalaSalva <= 2) {
          setEscala(escalaSalva);
        }
      } catch (erro) {
        // Se não conseguir ler, fica com o padrão: tema claro, fonte normal e planta visível
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

  // O que faz: mostra ou esconde a planta e a sequência na Home e salva a escolha.
  // O guia TrackWell pede que a parte de "jogo" do app possa ser desligada (rec. 61, p. 28)
  async function alternarPlanta() {
    const novoValor = !mostrarPlanta;
    setMostrarPlanta(novoValor);
    await guardar(CHAVE_PLANTA, novoValor ? 'sim' : 'nao');
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
    mostrarPlanta,
    alternarPlanta,
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
