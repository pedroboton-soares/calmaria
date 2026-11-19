// Funções de data usadas em várias telas. A API guarda as datas como texto AAAA-MM-DD,
// e o app mostra para a pessoa no jeito brasileiro, DD/MM/AAAA.
// Tudo usa o horário do celular (não UTC), senão à noite a data "pularia" para o dia seguinte.

// O que faz: transforma um Date em texto AAAA-MM-DD
export function paraTexto(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return data.getFullYear() + '-' + mes + '-' + dia;
}

// O que faz: devolve a data de hoje no formato AAAA-MM-DD
export function dataDeHoje() {
  return paraTexto(new Date());
}

// O que faz: recebe AAAA-MM-DD e devolve a data do dia anterior, também em AAAA-MM-DD
export function diaAnterior(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return paraTexto(new Date(ano, mes - 1, dia - 1)); // o Date acerta sozinho a virada de mês e de ano
}

// O que faz: troca 2026-11-05 por 05/11/2026
export function formatarDataBR(texto) {
  const [ano, mes, dia] = texto.split('-');
  return dia + '/' + mes + '/' + ano;
}

// O que faz: lê uma data digitada como DD/MM/AAAA e devolve AAAA-MM-DD,
// ou null se a data não existir (ex.: 31/02/2026)
export function lerDataBR(texto) {
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((texto || '').trim());
  if (!partes) {
    return null;
  }
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  // Se o Date "corrigiu" a data (31/02 vira 03/03), ela não existe
  if (data.getDate() !== dia || data.getMonth() !== mes - 1) {
    return null;
  }
  return paraTexto(data);
}
