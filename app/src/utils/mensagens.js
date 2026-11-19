// Textos curtos da tela inicial: saudação, mensagem depois de registrar e frase da sequência.
// Seguem o guia TrackWell: convidar em vez de cobrar e, em dia difícil, acolher em vez de
// comemorar (rec. 28 e 76). Nunca culpar quem ficou dias sem registrar (rec. 62).

// Depois de um registro com humor bom ou neutro
const MENSAGENS_FOLHA_NOVA = [
  'Uma folha nova hoje. Amanhã tem mais um pouco de cuidado esperando por você.',
  'Registro guardado. Sua planta agradece esse minutinho de atenção.',
  'Mais uma folha. Pequenos cuidados também contam.',
  'Que bom que você passou por aqui. Sua planta cresceu um pouco.',
];

// Depois de um registro com humor 1 ou 2 (muito mal ou mal)
const MENSAGENS_ACOLHIMENTO = [
  'É compreensível se sentir assim. Obrigado por se ouvir hoje.',
  'Mesmo que o dia tenha sido difícil, você parou para se ouvir. Isso já é cuidado.',
  'Registro guardado. Dias pesados passam, e você não precisa enfrentar tudo de uma vez.',
];

// O que faz: devolve "Bom dia", "Boa tarde" ou "Boa noite" conforme a hora (0 a 23)
export function saudacao(hora = new Date().getHours()) {
  if (hora >= 5 && hora < 12) {
    return 'Bom dia';
  }
  if (hora >= 12 && hora < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

// O que faz: escolhe a mensagem depois de salvar um registro, conforme o humor.
// Usa o número da sequência para variar a frase sem precisar de sorteio
export function mensagemAoRegistrar(humor, sequenciaAtual = 0) {
  const lista = humor <= 2 ? MENSAGENS_ACOLHIMENTO : MENSAGENS_FOLHA_NOVA;
  return lista[sequenciaAtual % lista.length];
}

// O que faz: frase que aparece embaixo da planta, sem cobrança
export function mensagemDaSequencia(atual, registrouHoje) {
  if (atual === 0) {
    return 'Sua planta está pronta para a primeira folha. Quando quiser, conte como está o seu dia.';
  }
  if (!registrouHoje) {
    return 'Sua sequência continua viva. Se quiser, registre hoje para ganhar mais uma folha.';
  }
  if (atual === 1) {
    return 'Primeira folha da sequência. Um passo de cada vez.';
  }
  return atual + ' dias seguidos cuidando de você.';
}
