const { getDb } = require('../config/database');

function findByEmail(email) {
  return getDb().prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}

function findById(id) {
  return getDb().prepare('SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE id = ?').get(id);
}

function findAll() {
  return getDb().prepare('SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios ORDER BY nome').all();
}

function create({ nome, email, senha_hash, perfil }) {
  const stmt = getDb().prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)');
  const info = stmt.run(nome, email, senha_hash, perfil);
  return findById(info.lastInsertRowid);
}

function update(id, { nome, email, perfil, ativo }) {
  const fields = [];
  const values = [];
  if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
  if (email !== undefined) { fields.push('email = ?'); values.push(email); }
  if (perfil !== undefined) { fields.push('perfil = ?'); values.push(perfil); }
  if (ativo !== undefined) { fields.push('ativo = ?'); values.push(ativo); }
  if (fields.length === 0) return findById(id);
  fields.push("atualizado_em = datetime('now','localtime')");
  values.push(id);
  getDb().prepare(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}

function updatePassword(id, senha_hash) {
  getDb().prepare("UPDATE usuarios SET senha_hash = ?, atualizado_em = datetime('now','localtime') WHERE id = ?").run(senha_hash, id);
}

function remove(id) {
  getDb().prepare('DELETE FROM usuarios WHERE id = ?').run(id);
}

module.exports = { findByEmail, findById, findAll, create, update, updatePassword, remove };