// Lista dos 5 humores do app. Cada humor tem número (1 a 5), emoji e nome.
// Todas as telas usam esta lista, para o emoji e o nome ficarem sempre iguais.

export const HUMORES = [
  { valor: 1, emoji: '😞', nome: 'Muito mal' },
  { valor: 2, emoji: '🙁', nome: 'Mal' },
  { valor: 3, emoji: '😐', nome: 'Mais ou menos' },
  { valor: 4, emoji: '🙂', nome: 'Bem' },
  { valor: 5, emoji: '😄', nome: 'Muito bem' },
];

// O que faz: recebe o número do humor (1 a 5) e devolve o objeto dele (emoji e nome)
export function buscarHumor(valor) {
  return HUMORES.find((h) => h.valor === valor);
}
