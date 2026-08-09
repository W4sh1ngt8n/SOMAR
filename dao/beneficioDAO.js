const { getDb } = require('../config/database');

function findAll() {
  return getDb().prepare('SELECT * FROM beneficios ORDER BY nome').all();
}

function findById(id) {
  return getDb().prepare('SELECT * FROM beneficios WHERE id = ?').get(id);
}

function create({ nome, descricao, categoria }) {
  const info = getDb().prepare('INSERT INTO beneficios (nome, descricao, categoria) VALUES (?, ?, ?)').run(nome, descricao, categoria);
  return findById(info.lastInsertRowid);
}

function update(id, { nome, descricao, categoria, ativo }) {
  const fields = []; const values = [];
  if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
  if (descricao !== undefined) { fields.push('descricao = ?'); values.push(descricao); }
  if (categoria !== undefined) { fields.push('categoria = ?'); values.push(categoria); }
  if (ativo !== undefined) { fields.push('ativo = ?'); values.push(ativo); }
  if (fields.length === 0) return findById(id);
  values.push(id);
  getDb().prepare(`UPDATE beneficios SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}

function remove(id) {
  getDb().prepare('DELETE FROM beneficios WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };