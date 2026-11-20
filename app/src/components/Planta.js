// Desenho da planta do Calmaria, feito com react-native-svg.
// Recebe o número de folhas (dias seguidos com registro): a cada folha o caule cresce um pouco.
// A planta nunca murcha: com zero folhas ela aparece como um broto esperando a primeira.

import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Ellipse, Circle } from 'react-native-svg';
import { useTema } from '../context/TemaContext';

// Depois de 12 folhas o desenho para de crescer (senão sairia da área) e ganha uma flor
const MAXIMO_FOLHAS = 12;
// Distância em pixels entre uma folha e a próxima no caule
const ESPACO = 12;
// Altura do topo da terra no vaso, onde o caule começa
const BASE = 188;

// O que faz: monta o caminho de uma folha que sai do caule na altura y, para a direita ou a esquerda
function caminhoFolha(y, paraDireita) {
  const lado = paraDireita ? 1 : -1;
  const pontaX = 100 + lado * 42;
  const curvaX = 100 + lado * 24;
  // Duas curvas: uma por cima e outra por baixo, fechando o formato de folha
  return `M100 ${y} Q ${curvaX} ${y - 20} ${pontaX} ${y - 8} Q ${curvaX} ${y + 6} 100 ${y} Z`;
}

// O que faz: desenha a planta com o vaso e o número de folhas pedido
export default function Planta({ folhas = 0, tamanhoTela = 180 }) {
  const { cores } = useTema();

  const quantidade = Math.min(folhas, MAXIMO_FOLHAS);
  // Topo do caule: sobe conforme a quantidade de folhas (um brotinho quando é zero)
  const topo = BASE - 22 - quantidade * ESPACO;
  const temFlor = folhas >= 7;
  // O desenho só ocupa a altura que a planta tem: corta o espaço vazio acima do topo do caule
  const cortarEmCima = Math.max(0, Math.min(topo - 40, 110));
  const alturaDesenho = 240 - cortarEmCima;

  // Uma folha por dia, alternando os lados. A mais nova (a de cima) fica com a cor mais clara
  const listaFolhas = [];
  for (let i = 0; i < quantidade; i++) {
    const y = BASE - 14 - i * ESPACO;
    const maisNova = i === quantidade - 1;
    listaFolhas.push(
      <Path key={i} d={caminhoFolha(y, i % 2 === 0)} fill={maisNova ? cores.folhaClara : cores.folha} />
    );
  }

  // Texto lido pelo leitor de tela no lugar do desenho
  const descricao =
    folhas === 0
      ? 'Planta: um broto esperando a primeira folha'
      : 'Planta com ' + folhas + (folhas === 1 ? ' folha' : ' folhas');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={descricao} style={{ alignItems: 'center' }}>
      <Svg
        width={tamanhoTela}
        height={(tamanhoTela * alturaDesenho) / 200}
        viewBox={'0 ' + cortarEmCima + ' 200 ' + alturaDesenho}
      >
        {/* Caule */}
        <Path d={`M100 ${BASE} L100 ${topo}`} stroke={cores.folha} strokeWidth={5} strokeLinecap="round" />
        {listaFolhas}

        {/* Ponta do caule: broto, ou uma flor simples depois de 7 dias seguidos */}
        {temFlor ? (
          <>
            <Circle cx={100} cy={topo - 9} r={7} fill={cores.vaso} />
            <Circle cx={91} cy={topo - 2} r={7} fill={cores.vaso} />
            <Circle cx={109} cy={topo - 2} r={7} fill={cores.vaso} />
            <Circle cx={100} cy={topo - 3} r={5} fill={cores.folhaClara} />
          </>
        ) : (
          <Ellipse cx={100} cy={topo - 4} rx={6} ry={9} fill={cores.folhaClara} />
        )}

        {/* Vaso: terra, borda de cima e corpo */}
        <Ellipse cx={100} cy={BASE + 2} rx={40} ry={6} fill={cores.terra} />
        <Rect x={52} y={BASE + 4} width={96} height={16} rx={4} fill={cores.vaso} />
        <Path d={`M60 ${BASE + 20} L140 ${BASE + 20} L130 ${BASE + 50} L70 ${BASE + 50} Z`} fill={cores.vaso} />
      </Svg>
    </View>
  );
}
