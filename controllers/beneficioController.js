const beneficioDAO = require('../dao/beneficioDAO');

function listar(req, res) { res.json(beneficioDAO.findAll()); }

function buscar(req, res) {
  const b = beneficioDAO.findById(req.params.id);
  if (!b) return res.status(404).json({ erro: 'Benefício não encontrado' });
  res.json(b);
}

function criar(req, res) {
  const b = beneficioDAO.create(req.body);
  res.status(201).json(b);
}

function atualizar(req, res) {
  const b = beneficioDAO.update(req.params.id, req.body);
  if (!b) return res.status(404).json({ erro: 'Benefício não encontrado' });
  res.json(b);
}

function remover(req, res) {
  try { beneficioDAO.remove(req.params.id); res.status(204).send(); }
  catch (e) { res.status(400).json({ erro: 'Não é possível excluir: benefício vinculado a requisições' }); }
}

module.exports = { listar, buscar, criar, atualizar, remover };