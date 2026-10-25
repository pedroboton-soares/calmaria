// Rota do relatório em PDF: GET /relatorio/pdf?inicio=&fim=
// Gera um PDF com o nome do usuário, o período, a média do humor e a lista de registros.
// Só usa os dados do usuário que está logado.

const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');
const auth = require('../middleware/auth');

// Aceita tanto module.exports = verificarToken quanto module.exports = { verificarToken }
const verificarToken = auth.verificarToken || auth;

const router = express.Router();

// Mesmos nomes de humor do app (utils/humor.js). O PDF mostra só o nome, porque a fonte padrão do PDF não desenha emoji
const NOMES_HUMOR = {
  1: 'Muito mal',
  2: 'Mal',
  3: 'Mais ou menos',
  4: 'Bem',
  5: 'Muito bem',
};

// O que faz: confere se a data está no formato AAAA-MM-DD e se existe de verdade
function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }
  const d = new Date(data + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

// O que faz: troca 2026-11-05 por 05/11/2026 para ficar no jeito brasileiro
function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return dia + '/' + mes + '/' + ano;
}

// O que faz: calcula a média do humor com uma casa decimal (ex.: 3,7); devolve null se a lista estiver vazia
function calcularMedia(registros) {
  if (registros.length === 0) {
    return null;
  }
  let soma = 0;
  for (const r of registros) {
    soma += r.humor;
  }
  return (soma / registros.length).toFixed(1).replace('.', ',');
}

// O que faz: escreve o PDF dentro do documento (título, dados do usuário, média e registros)
function montarPdf(doc, usuario, registros, inicio, fim) {
  doc.font('Helvetica-Bold').fontSize(20).text('Calmaria - Relatório de humor');
  doc.moveDown();

  doc.font('Helvetica').fontSize(12);
  doc.text('Usuário: ' + usuario.nome);
  const periodo =
    (inicio ? formatarData(inicio) : 'início') + ' a ' + (fim ? formatarData(fim) : 'hoje');
  doc.text('Período: ' + periodo);
  doc.text('Total de registros: ' + registros.length);
  const media = calcularMedia(registros);
  doc.text('Média do humor: ' + (media ? media + ' (de 1 a 5)' : 'sem registros'));
  doc.moveDown();

  if (registros.length === 0) {
    doc.text('Nenhum registro neste período.');
    return;
  }

  for (const r of registros) {
    // Se já está perto do fim da página, começa uma nova antes de escrever o registro
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }
    doc.font('Helvetica-Bold').fontSize(12)
      .text(formatarData(r.data) + ' - ' + NOMES_HUMOR[r.humor] + ' (' + r.humor + ')');
    doc.font('Helvetica').fontSize(11)
      .text(r.texto ? r.texto : '(sem texto)');
    doc.moveDown();
  }
}

// Gera e devolve o PDF do usuário logado
router.get('/pdf', verificarToken, (req, res) => {
  try {
    const { inicio, fim } = req.query;
    if (inicio && !dataValida(inicio)) {
      return res.status(400).json({ erro: 'A data inicial deve estar no formato AAAA-MM-DD.' });
    }
    if (fim && !dataValida(fim)) {
      return res.status(400).json({ erro: 'A data final deve estar no formato AAAA-MM-DD.' });
    }

    const usuario = db.prepare('SELECT nome FROM usuarios WHERE id = ?').get(req.usuarioId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Mesmo filtro do CRUD: sempre por usuario_id, e as datas só se vierem
    let sql = 'SELECT humor, texto, data FROM registros WHERE usuario_id = ?';
    const valores = [req.usuarioId];
    if (inicio) {
      sql += ' AND data >= ?';
      valores.push(inicio);
    }
    if (fim) {
      sql += ' AND data <= ?';
      valores.push(fim);
    }
    sql += ' ORDER BY data ASC, id ASC';
    const registros = db.prepare(sql).all(...valores);

    // Os dados já foram lidos; agora é só montar e enviar o arquivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-calmaria.pdf"');
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res); // o PDF vai sendo enviado direto na resposta
    montarPdf(doc, usuario, registros, inicio, fim);
    doc.end();
  } catch (e) {
    console.error('Erro em /relatorio/pdf:', e.message);
    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro ao gerar o relatório.' });
    }
  }
});

module.exports = router;
