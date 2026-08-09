const backupService = require('../services/backupService');

function gerar(req, res) {
  const result = backupService.performBackup();
  res.json(result);
}

function listar(req, res) {
  res.json(backupService.listBackups());
}

function restaurar(req, res) {
  try {
    const result = backupService.restoreBackup(req.params.filename);
    res.json(result);
  } catch (err) { res.status(err.status || 500).json({ erro: err.message }); }
}

module.exports = { gerar, listar, restaurar };