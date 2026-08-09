const { getDb } = require('../config/database');
function findAll({ paciente_id, status, page = 1, limit = 20 } = {}) {
  let sql = `SELECT r.*, p.nome_completo as paciente_nome, b.nome as beneficio_nome, b.categoria as beneficio_categoria FROM requisicoes r JOIN pacientes p ON p.id = r.paciente_id JOIN beneficios b ON b.id = r.beneficio_id WHERE 1=1`;
  const params = [];
  if (paciente_id) { sql += ' AND r.paciente_id = ?'; params.push(paciente_id); }
  if (status) { sql += ' AND r.status = ?'; params.push(status); }
  const offset = (page - 1) * limit;
  const countSql = sql.replace(/SELECT r\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const total = getDb().prepare(countSql).get(...params).total;
  sql += ' ORDER BY r.data_solicitacao DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = getDb().prepare(sql).all(...params);
  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}
function findById(id) {
  return getDb().prepare(`SELECT r.*, p.nome_completo as paciente_nome, b.nome as beneficio_nome, b.categoria FROM requisicoes r JOIN pacientes p ON p.id = r.paciente_id JOIN beneficios b ON b.id = r.beneficio_id WHERE r.id = ?`).get(id);
}
function create(data) {
  const info = getDb().prepare('INSERT INTO requisicoes (paciente_id, beneficio_id, quantidade, observacoes, status, solicitado_por) VALUES (?, ?, ?, ?, ?, ?)').run(data.paciente_id, data.beneficio_id, data.quantidade, data.observacoes, 'solicitada', data.solicitado_por);
  return findById(info.lastInsertRowid);
}
function updateStatus(id, status, userId) {
  const updates = { status };
  if (status === 'aprovada') { updates.data_aprovacao = new Date().toISOString(); updates.aprovado_por = userId; }
  if (status === 'entregue') updates.data_entrega = new Date().toISOString();
  if (status === 'negada') { updates.data_aprovacao = new Date().toISOString(); updates.aprovado_por = userId; }
  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(updates);
  vals.push(id);
  getDb().prepare(`UPDATE requisicoes SET ${sets} WHERE id = ?`).run(...vals);
  return findById(id);
}
function findAprovadasByPacienteId(pacienteId) {
  return getDb().prepare(`SELECT r.*, b.nome as beneficio_nome FROM requisicoes r JOIN beneficios b ON b.id = r.beneficio_id WHERE r.paciente_id = ? AND r.status IN ('aprovada','entregue') ORDER BY r.data_solicitacao DESC`).all(pacienteId);
}
function countByBeneficio(inicio, fim) {
  return getDb().prepare(`SELECT b.nome, b.categoria, COUNT(r.id) as total FROM beneficios b LEFT JOIN requisicoes r ON r.beneficio_id = b.id AND r.status IN ('aprovada','entregue') AND r.data_solicitacao >= ? AND r.data_solicitacao <= ? WHERE b.ativo = 1 GROUP BY b.id ORDER BY total DESC`).all(inicio, fim);
}
module.exports = { findAll, findById, create, updateStatus, findAprovadasByPacienteId, countByBeneficio };
