// Rota provisória: este arquivo será substituído pela versão real.
// Enquanto isso, responde que ainda não foi feita.

const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ erro: 'Rota ainda não implementada' });
});

module.exports = router;
