// Rotas de cadastro e login: POST /auth/cadastro e POST /auth/login.
// Aqui a senha é criptografada (bcrypt) e o token de login (JWT) é criado.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// O que faz: confere os dados do cadastro; devolve a mensagem de erro ou null se estiver tudo certo
function validarCadastro(corpo) {
  const { nome, email, senha, consentimento } = corpo || {};

  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
    return 'Informe o nome (de 2 a 100 caracteres).';
  }
  if (typeof email !== 'string' || !email.includes('@') || email.length > 150) {
    return 'Informe um e-mail válido.';
  }
  // O bcrypt só usa os primeiros 72 caracteres da senha, por isso o limite
  if (typeof senha !== 'string' || senha.length < 6 || senha.length > 72) {
    return 'A senha deve ter de 6 a 72 caracteres.';
  }
  // Sem o aceite explícito do termo, não cria a conta (exigência da LGPD)
  if (consentimento !== true) {
    return 'É preciso aceitar o termo de consentimento para criar a conta.';
  }
  return null;
}

// Cria uma conta nova
router.post('/cadastro', (req, res) => {
  try {
    const erro = validarCadastro(req.body);
    if (erro) {
      return res.status(400).json({ erro });
    }

    const nome = req.body.nome.trim();
    // E-mail em minúsculo e sem espaços, para "Ana@x.com" e "ana@x.com" serem o mesmo
    const email = req.body.email.trim().toLowerCase();

    // Antes de criar, vê se o e-mail já tem conta
    const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existente) {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Guarda só o hash da senha (criptografada), nunca a senha pura
    const senhaHash = bcrypt.hashSync(req.body.senha, 10);
    // Guarda também quando o usuário aceitou o termo
    const consentimentoEm = new Date().toISOString();

    db.prepare(
      'INSERT INTO usuarios (nome, email, senha_hash, consentimento_em) VALUES (?, ?, ?, ?)'
    ).run(nome, email, senhaHash, consentimentoEm);

    res.status(201).json({ mensagem: 'Conta criada com sucesso.' });
  } catch (e) {
    console.error('Erro em /auth/cadastro:', e.message);
    res.status(500).json({ erro: 'Erro interno ao criar a conta.' });
  }
});

// Faz login: confere e-mail e senha e devolve o token
router.post('/login', (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || typeof senha !== 'string') {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no .env');
      return res.status(500).json({ erro: 'Erro de configuração do servidor.' });
    }

    const usuario = db
      .prepare('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?')
      .get(email.trim().toLowerCase());

    // Mesma mensagem para e-mail errado e senha errada, para não revelar quais e-mails existem
    if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // O token guarda o id do usuário (o middleware lê dados.id) e vale por 7 dias
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (e) {
    console.error('Erro em /auth/login:', e.message);
    res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
});

module.exports = router;
