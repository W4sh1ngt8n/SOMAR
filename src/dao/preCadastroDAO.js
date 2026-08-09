const { getDb } = require('../config/database');
function findAll({ search = '', status } = {}) {
  let sql = 'SELECT * FROM pre_cadastros WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND nome_completo LIKE ?'; params.push(`%${search}%`); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY criado_em DESC';
  return getDb().prepare(sql).all(...params);
}
function findById(id) { return getDb().prepare('SELECT * FROM pre_cadastros WHERE id = ?').get(id); }
function create(data) {
  const info = getDb().prepare('INSERT INTO pre_cadastros (nome_completo, telefone, whatsapp, motivo_busca, documentos_solicitados, responsavel_recepcao) VALUES (?, ?, ?, ?, ?, ?)').run(data.nome_completo, data.telefone, data.whatsapp, data.motivo_busca, data.documentos_solicitados, data.responsavel_recepcao);
  return findById(info.lastInsertRowid);
}
function update(id, data) {
  const fields = []; const values = [];
  const allowed = ['nome_completo','telefone','whatsapp','motivo_busca','documentos_solicitados','documentos_recebidos','status','responsavel_recepcao'];
  allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); } });
  if (fields.length === 0) return findById(id);
  fields.push("atualizado_em = datetime('now','localtime')");
  values.push(id);
  getDb().prepare(`UPDATE pre_cadastros SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}
function markValidated(id) { return update(id, { status: 'validado', documentos_recebidos: 1 }); }
function markConverted(id, pacienteId) {
  getDb().prepare("UPDATE pre_cadastros SET status = 'convertido', paciente_id = ?, atualizado_em = datetime('now','localtime') WHERE id = ?").run(pacienteId, id);
  return findById(id);
}
function countPendentes() { return getDb().prepare("SELECT COUNT(*) as total FROM pre_cadastros WHERE status = 'aguardando'").get().total; }
module.exports = { findAll, findById, create, update, markValidated, markConverted, countPendentes };
