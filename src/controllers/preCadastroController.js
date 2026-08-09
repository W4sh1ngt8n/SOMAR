const preCadastroDAO = require('../dao/preCadastroDAO');
const pacienteService = require('../services/pacienteService');
function listar(req, res) { res.json(preCadastroDAO.findAll(req.query)); }
function buscar(req, res) { const pc = preCadastroDAO.findById(req.params.id); if (!pc) return res.status(404).json({ erro: 'Pré-cadastro não encontrado' }); res.json(pc); }
function criar(req, res) { const pc = preCadastroDAO.create(req.body); res.status(201).json(pc); }
function atualizar(req, res) { const pc = preCadastroDAO.update(req.params.id, req.body); if (!pc) return res.status(404).json({ erro: 'Pré-cadastro não encontrado' }); res.json(pc); }
function validar(req, res) { const pc = preCadastroDAO.markValidated(req.params.id); if (!pc) return res.status(404).json({ erro: 'Pré-cadastro não encontrado' }); res.json(pc); }
async function converter(req, res) {
  try { const paciente = await pacienteService.converterPreCadastro(req.params.id, req.body, req.user.id); res.status(201).json(paciente); }
  catch (err) { res.status(err.status || 500).json({ erro: err.message }); }
}
module.exports = { listar, buscar, criar, atualizar, validar, converter };
