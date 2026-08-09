const backupService = require('../services/backupService');
function gerar(req, res) { res.json(backupService.performBackup()); }
function listar(req, res) { res.json(backupService.listBackups()); }
function restaurar(req, res) { try { res.json(backupService.restoreBackup(req.params.filename)); } catch (err) { res.status(err.status || 500).json({ erro: err.message }); } }
module.exports = { gerar, listar, restaurar };
