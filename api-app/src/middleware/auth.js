// Middleware que protege as rotas: só deixa passar quem mandou um token válido.
// O token é criado no login (routes/auth.js) com o conteúdo { id: id_do_usuario }.

const jwt = require('jsonwebtoken');

// O que faz: lê o header Authorization ('Bearer <token>'), confere o token
// e guarda o id do usuário em req.usuarioId para as rotas usarem
function verificarToken(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  // Sem o formato 'Bearer <token>', nem tenta conferir
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }

  try {
    // jwt.verify confere a assinatura (com o JWT_SECRET do .env) e a validade
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = dados.id; // as rotas filtram os dados por este id
    next(); // token certo: segue para a rota
  } catch (e) {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = { verificarToken };
