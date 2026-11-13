// Lê os arquivos .md e .txt da pasta materiais-ia (menos o FONTES.md) e junta tudo em um
// único texto. Esse texto vai para a IA, para ela responder com base nos materiais.

const fs = require('fs');
const path = require('path');

// A pasta materiais-ia fica na raiz do repositório, duas pastas acima de src
const PASTA_MATERIAIS = path.join(__dirname, '..', '..', 'materiais-ia');

// O que faz: lê todos os materiais da pasta e devolve o texto de todos juntos
function carregarMateriais() {
  let nomes;
  try {
    nomes = fs.readdirSync(PASTA_MATERIAIS);
  } catch (erro) {
    // Se a pasta não existir, a API continua rodando, mas avisa no log
    console.error('Pasta de materiais não encontrada: ' + PASTA_MATERIAIS);
    return '';
  }

  const textos = [];
  for (const nome of nomes) {
    const extensao = path.extname(nome).toLowerCase();
    const ehMaterial = (extensao === '.md' || extensao === '.txt') && nome !== 'FONTES.md';
    if (!ehMaterial) continue; // pula .gitkeep, FONTES.md e qualquer outro arquivo

    const conteudo = fs.readFileSync(path.join(PASTA_MATERIAIS, nome), 'utf-8');
    // O título com o nome do arquivo ajuda a separar um material do outro
    textos.push('=== MATERIAL: ' + nome + ' ===\n' + conteudo.trim());
  }

  console.log('Materiais carregados: ' + textos.length + ' arquivo(s)');
  return textos.join('\n\n');
}

// Roda uma vez, quando o servidor inicia (os arquivos não são lidos a cada pergunta)
const textoMateriais = carregarMateriais();

module.exports = { textoMateriais };