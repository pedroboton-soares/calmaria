-- Script que cria a estrutura do banco de dados (SQLite).
-- Roda toda vez que a API inicia. O "IF NOT EXISTS" evita erro se as tabelas já existem.

PRAGMA foreign_keys = ON;

-- Tabela dos usuários do app
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,            -- senha criptografada, nunca a senha pura
  consentimento_em TEXT NOT NULL,      -- data e hora em que o usuário aceitou o termo
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dos registros de humor. Cada registro pertence a um usuário.
CREATE TABLE IF NOT EXISTS registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  humor INTEGER NOT NULL CHECK (humor BETWEEN 1 AND 5),  -- 1 muito mal ... 5 muito bem
  texto TEXT,
  data TEXT NOT NULL,                  -- formato AAAA-MM-DD
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- se o usuário for apagado, os registros dele são apagados junto
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índice para deixar mais rápida a busca dos registros de um usuário por data
CREATE INDEX IF NOT EXISTS idx_registros_usuario_data ON registros(usuario_id, data);
