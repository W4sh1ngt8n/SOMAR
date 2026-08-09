const pacienteDAO = require('../dao/pacienteDAO');
const preCadastroDAO = require('../dao/preCadastroDAO');
const acompanhamentoDAO = require('../dao/acompanhamentoDAO');
const requisicaoDAO = require('../dao/requisicaoDAO');
const documentoDAO = require('../dao/documentoDAO');
const patologiaDAO = require('../dao/patologiaDAO');
const medicamentoDAO = require('../dao/medicamentoDAO');
const qrCodeService = require('./qrCodeService');
const { calcularIdade } = require('../utils/formatters');
async function converterPreCadastro(preCadastroId, dadosCompletos, userId) {
  const pre = preCadastroDAO.findById(preCadastroId);
  if (!pre) throw { status: 404, message: 'Pré-cadastro não encontrado' };
  if (pre.status !== 'validado') throw { status: 400, message: 'Pré-cadastro precisa estar validado' };
  if (dadosCompletos.cpf) {
    const existente = pacienteDAO.findByCpf(dadosCompletos.cpf);
    if (existente) throw { status: 409, message: 'Já existe paciente com este CPF' };
  }
  const pacienteData = { ...dadosCompletos, pre_cadastro_id: preCadastroId, status_cadastro: 'triagem', criado_por: userId };
  const paciente = pacienteDAO.create(pacienteData);
  const qrPath = await qrCodeService.generatePacienteQRCode(paciente.id);
  pacienteDAO.updateQRCode(paciente.id, qrPath);
  preCadastroDAO.markConverted(preCadastroId, paciente.id);
  return pacienteDAO.findById(paciente.id);
}
function getHistoricoCompleto(pacienteId, perfil) {
  const paciente = pacienteDAO.findById(pacienteId);
  if (!paciente) throw { status: 404, message: 'Paciente não encontrado' };
  const acompanhamentos = acompanhamentoDAO.findByPacienteId(pacienteId);
  const requisicoes = requisicaoDAO.findAprovadasByPacienteId(pacienteId);
  const documentos = documentoDAO.findByPacienteId(pacienteId);
  const patologias = patologiaDAO.findByPacienteId(pacienteId);
  const medicamentos = medicamentoDAO.findByPacienteId(pacienteId);
  if (perfil === 'visitante') {
    paciente.cpf = paciente.cpf ? '***.***.***-**' : null;
    paciente.telefone = paciente.telefone ? '(**) *****-****' : null;
    paciente.endereco = '*******';
    paciente.email = null;
  }
  return { ...paciente, idade: calcularIdade(paciente.data_nascimento), acompanhamentos, requisicoes, documentos, patologias, medicamentos };
}
module.exports = { converterPreCadastro, getHistoricoCompleto };
