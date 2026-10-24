// Arquivo principal da API do app. Liga o servidor e conecta as rotas.

require('dotenv').config(); // lê o arquivo .env e coloca os valores em process.env
const express = require('express');
const cors = require('cors');
require('./db'); // só de importar, o banco é aberto e as tabelas são criadas

const app = express();

app.use(cors());         // permite que o aplicativo (outro endereço) chame esta API
app.use(express.json()); // faz o servidor entender o corpo das requisições em JSON

// Rota simples para testar se a API está no ar
app.get('/saude', (req, res) => {
  res.json({ ok: true });
});

// Cada grupo de rotas fica em um arquivo separado dentro de src/routes
app.use('/auth', require('./routes/auth'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/registros', require('./routes/registros'));
app.use('/relatorio', require('./routes/relatorio'));

// Se nenhuma rota combinou, devolve erro 404 no mesmo formato das outras respostas de erro
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Porta definida no .env (ou 3000 se não tiver)
const porta = process.env.PORT || 3000;
// '0.0.0.0' deixa o celular da mesma rede Wi-Fi acessar a API
app.listen(porta, '0.0.0.0', () => {
  console.log('API do app rodando na porta ' + porta);
});
