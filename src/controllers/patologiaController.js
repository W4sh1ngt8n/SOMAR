const patologiaDAO = require('../dao/patologiaDAO');
function listar(req, res) { res.json(patologiaDAO.findAll()); }
function buscar(req, res) { const p = patologiaDAO.findById(req.params.id); if (!p) return res.status(404).json({ erro: 'Patologia não encontrada' }); res.json(p); }
function criar(req, res) { res.status(201).json(patologiaDAO.create(req.body)); }
function atualizar(req, res) { const p = patologiaDAO.update(req.params.id, req.body); if (!p) return res.status(404).json({ erro: 'Patologia não encontrada' }); res.json(p); }
function remover(req, res) { try { patologiaDAO.remove(req.params.id); res.status(204).send(); } catch (e) { res.status(400).json({ erro: 'Patologia vinculada a pacientes' }); } }
function vincularPaciente(req, res) { const { paciente_id, patologia_id, diagnosticado_em, observacoes } = req.body; patologiaDAO.vincularPaciente(paciente_id, patologia_id, diagnosticado_em, observacoes); res.status(201).json({ message: 'Patologia vinculada' }); }
module.exports = { listar, buscar, criar, atualizar, remover, vincularPaciente };
