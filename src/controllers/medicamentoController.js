const medicamentoDAO = require('../dao/medicamentoDAO');
function listar(req, res) { res.json(medicamentoDAO.findAll()); }
function buscar(req, res) { const m = medicamentoDAO.findById(req.params.id); if (!m) return res.status(404).json({ erro: 'Medicamento não encontrado' }); res.json(m); }
function criar(req, res) { res.status(201).json(medicamentoDAO.create(req.body)); }
function atualizar(req, res) { const m = medicamentoDAO.update(req.params.id, req.body); if (!m) return res.status(404).json({ erro: 'Medicamento não encontrado' }); res.json(m); }
function remover(req, res) { try { medicamentoDAO.remove(req.params.id); res.status(204).send(); } catch (e) { res.status(400).json({ erro: 'Medicamento vinculado a pacientes' }); } }
module.exports = { listar, buscar, criar, atualizar, remover };
