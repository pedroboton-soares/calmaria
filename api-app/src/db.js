// Conexão com o banco de dados SQLite.
// Usa o SQLite que já vem dentro do Node (node:sqlite), então não precisa instalar nada.
// Os outros arquivos usam este módulo com: const db = require('../db');

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// O banco fica em um único arquivo (calmaria.db) na pasta api-app.
// Se o arquivo não existir, ele é criado sozinho.
const caminhoBanco = path.join(__dirname, '..', 'calmaria.db');
const db = new DatabaseSync(caminhoBanco);

// Liga a checagem de chaves estrangeiras (necessária para o ON DELETE CASCADE funcionar)
db.exec('PRAGMA foreign_keys = ON');

// Lê o script schema.sql e executa. Isso cria as tabelas se ainda não existirem.
const script = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(script);

// Exporta a conexão para as rotas poderem fazer consultas
module.exports = db;
