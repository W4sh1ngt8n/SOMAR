const { getDb } = require('../config/database');
function findAll({ search = '', status_cadastro, status_tratamento, page = 1, limit = 20 } = {}) {
  let sql = 'SELECT * FROM pacientes WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (nome_completo LIKE ? OR cpf LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (status_cadastro) { sql += ' AND status_cadastro = ?'; params.push(status_cadastro); }
  if (status_tratamento) { sql += ' AND status_tratamento = ?'; params.push(status_tratamento); }
  const offset = (page - 1) * limit;
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = getDb().prepare(countSql).get(...params).total;
  sql += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = getDb().prepare(sql).all(...params);
  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}
function findById(id) { return getDb().prepare('SELECT * FROM pacientes WHERE id = ?').get(id); }
function findByCpf(cpf) { return getDb().prepare('SELECT * FROM pacientes WHERE cpf = ?').get(cpf); }
function create(data) {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => data[k]);
  const info = getDb().prepare(`INSERT INTO pacientes (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
  return findById(info.lastInsertRowid);
}
function update(id, data) {
  const keys = Object.keys(data);
  if (keys.length === 0) return findById(id);
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => data[k]);
  values.push(id);
  getDb().prepare(`UPDATE pacientes SET ${sets}, atualizado_em = datetime('now','localtime') WHERE id = ?`).run(...values);
  return findById(id);
}
function updateStatus(id, status_cadastro, status_tratamento = null) {
  const updates = { status_cadastro };
  if (status_tratamento !== undefined) updates.status_tratamento = status_tratamento;
  if (status_cadastro === 'alta') updates.data_alta = new Date().toISOString().split('T')[0];
  if (status_cadastro === 'obito') updates.data_obito = new Date().toISOString().split('T')[0];
  return update(id, updates);
}
function updateQRCode(id, qrPath) { getDb().prepare('UPDATE pacientes SET qr_code_path = ? WHERE id = ?').run(qrPath, id); }
function countByStatus() { return getDb().prepare('SELECT status_cadastro, COUNT(*) as total FROM pacientes GROUP BY status_cadastro').all(); }
function findRecentes(limit = 5) { return getDb().prepare('SELECT id, nome_completo, status_cadastro, criado_em FROM pacientes ORDER BY criado_em DESC LIMIT ?').all(limit); }
module.exports = { findAll, findById, findByCpf, create, update, updateStatus, updateQRCode, countByStatus, findRecentes };
