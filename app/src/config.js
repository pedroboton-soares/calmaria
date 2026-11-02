// Endereços das APIs que o app usa. Endereço não é segredo, então este arquivo vai para o GitHub.

// API do app (login, registros, relatório).
// __DEV__ é true quando o app roda em desenvolvimento (emulador) e false no APK de produção.
// 10.0.2.2 é o jeito do emulador Android chamar o localhost do computador.
// Se for testar em celular de verdade, troque pelo IP do computador na rede (ex.: http://192.168.0.10:3000).
export const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'COLOCAR_ENDERECO_DE_PRODUCAO';

// API de IA (publicada no Render pelo Jardel). O app só conversa com a IA por aqui.
export const IA_URL = 'https://nome-do-servico.onrender.com';
