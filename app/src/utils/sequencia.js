// Calcula a sequência de dias com registro (a "planta" do app).
// Usa só a lista que vem de GET /registros, sem rota nova e sem mudar o banco.
// Regras: um dia com pelo menos 1 registro conta. A sequência atual termina hoje, ou ontem
// se hoje ainda não tem registro (ela continua viva até o fim do dia).

import { dataDeHoje, diaAnterior } from './datas';

// O que faz: recebe a lista de registros e devolve { atual, melhor, diasNoMes }
export function calcularSequencia(registros, hoje = dataDeHoje()) {
  // Set guarda cada data uma vez só, mesmo que o dia tenha vários registros.
  // Datas no futuro são ignoradas para não inflar a sequência.
  const dias = new Set();
  for (const r of registros) {
    if (r.data <= hoje) {
      dias.add(r.data);
    }
  }

  // Sequência atual: começa em hoje (ou ontem) e volta um dia de cada vez enquanto tiver registro
  let dia = dias.has(hoje) ? hoje : diaAnterior(hoje);
  let atual = 0;
  while (dias.has(dia)) {
    atual++;
    dia = diaAnterior(dia);
  }

  // Melhor sequência: percorre os dias em ordem e conta os que vêm grudados no anterior
  const ordenados = [...dias].sort(); // AAAA-MM-DD em ordem de texto já é ordem de data
  let melhor = 0;
  let contando = 0;
  let anterior = null;
  for (const d of ordenados) {
    contando = anterior !== null && diaAnterior(d) === anterior ? contando + 1 : 1;
    melhor = Math.max(melhor, contando);
    anterior = d;
  }

  // Dias registrados no mês: datas que começam com o mesmo AAAA-MM de hoje
  const mesAtual = hoje.slice(0, 7);
  const diasNoMes = ordenados.filter((d) => d.startsWith(mesAtual)).length;

  return { atual, melhor, diasNoMes };
}
