// Rotas da conta do usuário logado:
//   GET    /usuarios/me         mostra os dados da conta
//   DELETE /usuarios/me/dados   apaga só os registros de humor (a conta continua)
//   DELETE /usuarios/me         apaga a conta inteira e tudo que é dela
// Todas exigem token, e o id do usuário vem do token (req.usuarioId), nunca da URL.
// Assim ninguém consegue mexer na conta de outra pessoa.

const express = require('express');
const db = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas deste arquivo passam primeiro pela verificação do token
router.use(verificarToken);

// Mostra os dados da conta (nunca devolve a senha)
router.get('/me', (req, res) => {
  try {
    const usuario = db
      .prepare('SELECT id, nome, email FROM usuarios WHERE id = ?')
      .get(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(usuario);
  } catch (e) {
    console.error('Erro em GET /usuarios/me:', e.message);
    res.status(500).json({ erro: 'Erro interno ao buscar a conta.' });
  }
});

// Apaga todos os registros de humor do usuário, mas mantém a conta (direito de excluir os dados)
router.delete('/me/dados', (req, res) => {
  try {
    db.prepare('DELETE FROM registros WHERE usuario_id = ?').run(req.usuarioId);
    res.json({ mensagem: 'Seus registros foram apagados.' });
  } catch (e) {
    console.error('Erro em DELETE /usuarios/me/dados:', e.message);
    res.status(500).json({ erro: 'Erro interno ao apagar os dados.' });
  }
});

// Apaga a conta. Os registros do usuário somem junto, por causa do ON DELETE CASCADE do banco
router.delete('/me', (req, res) => {
  try {
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.usuarioId);
    res.json({ mensagem: 'Sua conta e seus dados foram apagados.' });
  } catch (e) {
    console.error('Erro em DELETE /usuarios/me:', e.message);
    res.status(500).json({ erro: 'Erro interno ao apagar a conta.' });
  }
});

module.exports = router;
