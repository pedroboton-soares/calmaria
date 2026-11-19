// Testes da sequência de registros. Rodar com: npm test
import { calcularSequencia } from '../src/utils/sequencia';
import { lerDataBR } from '../src/utils/datas';

// O que faz: cria registros falsos só com a data, que é o que a sequência usa
function registros(...datas) {
  return datas.map((data) => ({ data, humor: 3 }));
}

test('sem registros, tudo é zero', () => {
  expect(calcularSequencia([], '2026-11-19')).toEqual({ atual: 0, melhor: 0, diasNoMes: 0 });
});

test('conta os dias seguidos até hoje, mesmo com dois registros no mesmo dia', () => {
  const lista = registros('2026-11-19', '2026-11-19', '2026-11-18', '2026-11-17', '2026-11-15');
  expect(calcularSequencia(lista, '2026-11-19')).toEqual({ atual: 3, melhor: 3, diasNoMes: 4 });
});

test('se hoje ainda não tem registro, a sequência de ontem continua viva', () => {
  const lista = registros('2026-11-18', '2026-11-17');
  expect(calcularSequencia(lista, '2026-11-19').atual).toBe(2);
});

test('se faltou ontem e hoje, a sequência atual volta para zero, mas a melhor fica', () => {
  const lista = registros('2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13');
  expect(calcularSequencia(lista, '2026-11-19')).toEqual({ atual: 0, melhor: 4, diasNoMes: 4 });
});

test('a sequência atravessa a virada do mês e do ano', () => {
  const lista = registros('2027-01-01', '2026-12-31', '2026-12-30');
  expect(calcularSequencia(lista, '2027-01-01')).toEqual({ atual: 3, melhor: 3, diasNoMes: 1 });
});

test('lerDataBR aceita DD/MM/AAAA e recusa data que não existe', () => {
  expect(lerDataBR('05/11/2026')).toBe('2026-11-05');
  expect(lerDataBR('31/02/2026')).toBe(null);
  expect(lerDataBR('2026-11-05')).toBe(null);
});
