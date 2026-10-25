// Rotas do CRUD de registros de humor (criar, listar, ver, editar e apagar).
// Todas as rotas exigem token e só mexem nos registros do próprio usuário.

const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

// Aceita tanto module.exports = verificarToken quanto module.exports = { verificarToken }
const verificarToken = auth.verificarToken || auth;

const router = express.Router();

// Todas as rotas deste arquivo passam primeiro pela verificação do token
router.use(verificarToken);

// O que faz: confere se a data está no formato AAAA-MM-DD e se existe de verdade (ex.: 2026-02-31 não existe)
function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }
  const d = new Date(data + 'T00:00:00Z');
  // Se o JS "corrigiu" a data, ela era inválida
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

// O que faz: valida humor, data e texto; devolve a mensagem de erro, ou null se estiver tudo certo
function validarRegistro(corpo) {
  const { humor, texto, data } = corpo || {};
  if (!Number.isInteger(humor) || humor < 1 || humor > 5) {
    return 'O humor deve ser um número inteiro de 1 a 5.';
  }
  if (!dataValida(data)) {
    return 'A data deve estar no formato AAAA-MM-DD.';
  }
  if (texto !== undefined && texto !== null) {
    if (typeof texto !== 'string' || texto.length > 1000) {
      return 'O texto deve ter no máximo 1000 caracteres.';
    }
  }
  return null;
}

// O que faz: busca um registro pelo id, mas só se ele for do usuário logado
function buscarRegistro(id, usuarioId) {
  return db
    .prepare('SELECT id, humor, texto, data, criado_em FROM registros WHERE id = ? AND usuario_id = ?')
    .get(id, usuarioId);
}

// O que faz: registra o erro no terminal e responde 500 sem mostrar detalhes ao usuário
function erroInterno(res, e) {
  console.error('Erro em /registros:', e.message);
  res.status(500).json({ erro: 'Erro interno ao processar o registro.' });
}

// Lista os registros do usuário, mais recentes primeiro. Filtros opcionais: ?inicio=&fim=
router.get('/', (req, res) => {
  try {
    const { inicio, fim } = req.query;
    if (inicio && !dataValida(inicio)) {
      return res.status(400).json({ erro: 'A data inicial deve estar no formato AAAA-MM-DD.' });
    }
    if (fim && !dataValida(fim)) {
      return res.status(400).json({ erro: 'A data final deve estar no formato AAAA-MM-DD.' });
    }

    // Começa só com o filtro do usuário e vai acrescentando os filtros de data se vierem
    let sql = 'SELECT id, humor, texto, data, criado_em FROM registros WHERE usuario_id = ?';
    const valores = [req.usuarioId];
    if (inicio) {
      sql += ' AND data >= ?';
      valores.push(inicio);
    }
    if (fim) {
      sql += ' AND data <= ?';
      valores.push(fim);
    }
    sql += ' ORDER BY data DESC, id DESC';

    res.json(db.prepare(sql).all(...valores));
  } catch (e) {
    erroInterno(res, e);
  }
});

// Devolve um registro pelo id
router.get('/:id', (req, res) => {
  try {
    const registro = buscarRegistro(req.params.id, req.usuarioId);
    if (!registro) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }
    res.json(registro);
  } catch (e) {
    erroInterno(res, e);
  }
});

// Cria um registro novo
router.post('/', (req, res) => {
  try {
    const erro = validarRegistro(req.body);
    if (erro) {
      return res.status(400).json({ erro });
    }
    const { humor, texto, data } = req.body;
    const resultado = db
      .prepare('INSERT INTO registros (usuario_id, humor, texto, data) VALUES (?, ?, ?, ?)')
      .run(req.usuarioId, humor, texto || '', data);
    // Busca de novo para devolver o registro completo, com id e criado_em
    res.status(201).json(buscarRegistro(Number(resultado.lastInsertRowid), req.usuarioId));
  } catch (e) {
    erroInterno(res, e);
  }
});

// Altera um registro existente
router.put('/:id', (req, res) => {
  try {
    if (!buscarRegistro(req.params.id, req.usuarioId)) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }
    const erro = validarRegistro(req.body);
    if (erro) {
      return res.status(400).json({ erro });
    }
    const { humor, texto, data } = req.body;
    // O WHERE com usuario_id garante que ninguém altera registro de outra pessoa
    db.prepare('UPDATE registros SET humor = ?, texto = ?, data = ? WHERE id = ? AND usuario_id = ?')
      .run(humor, texto || '', data, req.params.id, req.usuarioId);
    res.json(buscarRegistro(req.params.id, req.usuarioId));
  } catch (e) {
    erroInterno(res, e);
  }
});

// Apaga um registro
router.delete('/:id', (req, res) => {
  try {
    const resultado = db
      .prepare('DELETE FROM registros WHERE id = ? AND usuario_id = ?')
      .run(req.params.id, req.usuarioId);
    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }
    res.json({ mensagem: 'Registro apagado.' });
  } catch (e) {
    erroInterno(res, e);
  }
});

module.exports = router;
