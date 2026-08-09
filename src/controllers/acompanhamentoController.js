const acompanhamentoDAO = require('../dao/acompanhamentoDAO');
function listar(req, res) { const pacienteId = req.query.paciente_id; if (pacienteId) return res.json(acompanhamentoDAO.findByPacienteId(pacienteId)); res.json({ erro: 'Informe paciente_id' }); }
function buscar(req, res) { const a = acompanhamentoDAO.findById(req.params.id); if (!a) return res.status(404).json({ erro: 'Acompanhamento não encontrado' }); res.json(a); }
function criar(req, res) { const a = acompanhamentoDAO.create({ ...req.body, criado_por: req.user.id }); res.status(201).json(a); }
function atualizar(req, res) { const a = acompanhamentoDAO.update(req.params.id, req.body); if (!a) return res.status(404).json({ erro: 'Acompanhamento não encontrado' }); res.json(a); }
function remover(req, res) { acompanhamentoDAO.remove(req.params.id); res.status(204).send(); }
module.exports = { listar, buscar, criar, atualizar, remover };
