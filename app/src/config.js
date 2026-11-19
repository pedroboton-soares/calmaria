// Endereços das APIs que o app usa. Endereço não é segredo, então este arquivo vai para o GitHub.

// API do app (login, registros, relatório). Ela roda no computador de quem for testar (veja o README),
// então o endereço é o mesmo no modo de desenvolvimento e no APK de release.
// 10.0.2.2 é o jeito do emulador Android chamar o localhost do computador.
// Para testar em celular de verdade, troque pelo IP do computador na rede (ex.: http://192.168.0.10:3000)
// e acrescente esse IP em android/app/src/main/res/xml/network_security_config.xml.
export const API_URL = 'http://10.0.2.2:3000';

// API de IA (publicada no Render pelo Jardel). O app só conversa com a IA por aqui.
export const IA_URL = 'https://nome-do-servico.onrender.com';
