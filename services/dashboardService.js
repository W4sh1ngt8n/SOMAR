const pacienteDAO = require('../dao/pacienteDAO');
const acompanhamentoDAO = require('../dao/acompanhamentoDAO');
const preCadastroDAO = require('../dao/preCadastroDAO');

function getTotais() {
  const porStatus = pacienteDAO.countByStatus();
  const totalPacientes = porStatus.reduce((acc, s) => acc + s.total, 0);
  const preCadastrosPendentes = preCadastroDAO.countPendentes();
  return { totalPacientes, porStatus, preCadastrosPendentes };
}

function getAlertas() {
  const retornosVencidos = acompanhamentoDAO.findRetornosVencidos();
  return { retornosVencidos, total: retornosVencidos.length };
}

function getRecentes(limit = 5) {
  return pacienteDAO.findRecentes(limit);
}

module.exports = { getTotais, getAlertas, getRecentes };