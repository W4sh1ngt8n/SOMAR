const { getDb } = require('../config/database');
const requisicaoDAO = require('../dao/requisicaoDAO');
const pacienteDAO = require('../dao/pacienteDAO');
const pdfService = require('./pdfService');

function getDadosMensal(mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = `${ano}-${String(mes).padStart(2, '0')}-31`;
  const db = getDb();

  const porStatus = pacienteDAO.countByStatus();
  const beneficios = requisicaoDAO.countByBeneficio(inicio, fim);

  const totalAtivos = porStatus.find(s => s.status_cadastro === 'assistido')?.total || 0;
  const novasAdmissoes = db.prepare(`SELECT COUNT(*) as t FROM pacientes WHERE strftime('%Y-%m', data_entrada) = ?`).get(`${ano}-${String(mes).padStart(2,'0')}`).t;
  const altas = db.prepare(`SELECT COUNT(*) as t FROM pacientes WHERE status_cadastro = 'alta' AND strftime('%Y-%m', data_alta) = ?`).get(`${ano}-${String(mes).padStart(2,'0')}`).t;
  const abandonos = db.prepare(`SELECT COUNT(*) as t FROM pacientes WHERE status_cadastro = 'abandono' AND strftime('%Y-%m', atualizado_em) = ?`).get(`${ano}-${String(mes).padStart(2,'0')}`).t;
  const obitos = db.prepare(`SELECT COUNT(*) as t FROM pacientes WHERE status_cadastro = 'obito' AND strftime('%Y-%m', data_obito) = ?`).get(`${ano}-${String(mes).padStart(2,'0')}`).t;

  return { totalAtivos, novasAdmissoes, altas, abandonos, obitos, porStatus, beneficios };
}

function getDadosAnual(ano) {
  const inicio = `${ano}-01-01`;
  const fim = `${ano}-12-31`;
  const porStatus = pacienteDAO.countByStatus();
  const beneficios = requisicaoDAO.countByBeneficio(inicio, fim);

  const totalPacientes = porStatus.reduce((a, s) => a + s.total, 0);
  const totalAssistidos = porStatus.find(s => s.status_cadastro === 'assistido')?.total || 0;
  const totalAltas = porStatus.find(s => s.status_cadastro === 'alta')?.total || 0;
  const totalAbandonos = porStatus.find(s => s.status_cadastro === 'abandono')?.total || 0;
  const totalObitos = porStatus.find(s => s.status_cadastro === 'obito')?.total || 0;

  return { totalPacientes, totalAssistidos, totalAltas, totalAbandonos, totalObitos, porStatus, beneficios };
}

module.exports = { getDadosMensal, getDadosAnual };