const relatorioService = require('../services/relatorioService');
const pdfService = require('../services/pdfService');
const pacienteDAO = require('../dao/pacienteDAO');
const acompanhamentoDAO = require('../dao/acompanhamentoDAO');
const requisicaoDAO = require('../dao/requisicaoDAO');
const patologiaDAO = require('../dao/patologiaDAO');
const medicamentoDAO = require('../dao/medicamentoDAO');

function dadosMensal(req, res) {
  const { mes, ano } = req.query;
  if (!mes || !ano) return res.status(400).json({ erro: 'Informe mes e ano' });
  res.json(relatorioService.getDadosMensal(parseInt(mes), parseInt(ano)));
}

function pdfMensal(req, res) {
  const { mes, ano } = req.query;
  if (!mes || !ano) return res.status(400).json({ erro: 'Informe mes e ano' });
  const dados = relatorioService.getDadosMensal(parseInt(mes), parseInt(ano));
  const filePath = pdfService.generateRelatorioMensal(dados, parseInt(mes), parseInt(ano));
  setTimeout(() => res.download(filePath), 300);
}

function dadosAnual(req, res) {
  const { ano } = req.query;
  if (!ano) return res.status(400).json({ erro: 'Informe ano' });
  res.json(relatorioService.getDadosAnual(parseInt(ano)));
}

function pdfAnual(req, res) {
  const { ano } = req.query;
  if (!ano) return res.status(400).json({ erro: 'Informe ano' });
  const dados = relatorioService.getDadosAnual(parseInt(ano));
  const filePath = pdfService.generateRelatorioAnual(dados, parseInt(ano));
  setTimeout(() => res.download(filePath), 300);
}

function pacientesTratamento(req, res) {
  const result = pacienteDAO.findAll({ status_tratamento: 'em_tratamento', limit: 9999 });
  res.json(result.data);
}

function pacientesAcompanhamento(req, res) {
  const result = pacienteDAO.findAll({ status_tratamento: 'em_acompanhamento', limit: 9999 });
  res.json(result.data);
}

function beneficiosConcedidos(req, res) {
  const { inicio, fim } = req.query;
  const i = inicio || `${new Date().getFullYear()}-01-01`;
  const f = fim || `${new Date().getFullYear()}-12-31`;
  res.json(requisicaoDAO.countByBeneficio(i, f));
}

function fichaPacientePdf(req, res) {
  const paciente = pacienteDAO.findById(req.params.id);
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
  const acs = acompanhamentoDAO.findByPacienteId(req.params.id);
  const reqs = requisicaoDAO.findAprovadasByPacienteId(req.params.id);
  const pats = patologiaDAO.findByPacienteId(req.params.id);
  const meds = medicamentoDAO.findByPacienteId(req.params.id);
  const qrPath = paciente.qr_code_path ? require('path').resolve(__dirname, '../../', paciente.qr_code_path) : null;
  const filePath = pdfService.generateFichaPaciente(paciente, acs, reqs, pats, meds, qrPath);
  setTimeout(() => res.download(filePath), 300);
}

module.exports = { dadosMensal, pdfMensal, dadosAnual, pdfAnual, pacientesTratamento, pacientesAcompanhamento, beneficiosConcedidos, fichaPacientePdf };