// Tema provisório (claro e fixo). O Jardel vai trocar por tema claro/escuro salvo no celular, mantendo a mesma interface.
import React from 'react';

const valor = {
  cores: {
    fundo: '#F5F7FA',
    cartao: '#FFFFFF',
    texto: '#1F2933',
    textoSuave: '#52606D',
    primaria: '#2F6F8F',
    textoSobrePrimaria: '#FFFFFF',
    borda: '#CBD2D9',
    erro: '#B00020',
    sucesso: '#1B7F3B',
  },
  escuro: false,
  alternarTema: () => {},
  escala: 1,
  mudarEscala: () => {},
  tamanho: (base) => base,
};

const TemaContext = React.createContext(valor);

export function TemaProvider({ children }) {
  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return React.useContext(TemaContext);
}
