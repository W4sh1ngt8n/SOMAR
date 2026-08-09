const pacienteDAO = require('../dao/pacienteDAO');
const pacienteService = require('../services/pacienteService');
const { maskCPF, maskPhone } = require('../utils/formatters');
function listar(req, res) {
  const result = pacienteDAO.findAll(req.query);
  if (req.user.perfil === 'visitante') {
    result.data = result.data.map(p => ({ ...p, cpf: maskCPF(p.cpf, 'visitante'), telefone: maskPhone(p.telefone, 'visitante'), endereco: '*******', email: null }));
  }
  res.json(result);
}
function buscar(req, res) {
  const paciente = pacienteDAO.findById(req.params.id);
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
  if (req.user.perfil === 'visitante') {
    paciente.cpf = maskCPF(paciente.cpf, 'visitante');
    paciente.telefone = maskPhone(paciente.telefone, 'visitante');
    paciente.endereco = '*******'; paciente.email = null;
  }
  res.json(paciente);
}
function criar(req, res) {
  const data = { ...req.body, criado_por: req.user.id };
  if (data.cpf) { const existente = pacienteDAO.findByCpf(data.cpf); if (existente) return res.status(409).json({ erro: 'Já existe paciente com este CPF' }); }
  const p = pacienteDAO.create(data);
  res.status(201).json(p);
}
function atualizar(req, res) { const p = pacienteDAO.update(req.params.id, req.body); if (!p) return res.status(404).json({ erro: 'Paciente não encontrado' }); res.json(p); }
function alterarStatus(req, res) {
  const { status_cadastro, status_tratamento, motivo_alta } = req.body;
  const p = pacienteDAO.findById(req.params.id);
  if (!p) return res.status(404).json({ erro: 'Paciente não encontrado' });
  let updates = { status_cadastro };
  if (status_tratamento !== undefined) updates.status_tratamento = status_tratamento;
  if (motivo_alta) updates.motivo_alta = motivo_alta;
  if (status_cadastro === 'alta') updates.data_alta = new Date().toISOString().split('T')[0];
  if (status_cadastro === 'obito') updates.data_obito = new Date().toISOString().split('T')[0];
  const updated = pacienteDAO.update(req.params.id, updates);
  res.json(updated);
}
function historico(req, res) {
  try { const h = pacienteService.getHistoricoCompleto(req.params.id, req.user.perfil); res.json(h); }
  catch (err) { res.status(err.status || 500).json({ erro: err.message }); }
}
module.exports = { listar, buscar, criar, atualizar, alterarStatus, historico };
