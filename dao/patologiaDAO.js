const { getDb } = require('../config/database');

function findAll() {
  return getDb().prepare('SELECT * FROM patologias ORDER BY nome').all();
}

function findById(id) {
  return getDb().prepare('SELECT * FROM patologias WHERE id = ?').get(id);
}

function create({ nome, descricao, gravidade }) {
  const info = getDb().prepare('INSERT INTO patologias (nome, descricao, gravidade) VALUES (?, ?, ?)').run(nome, descricao, gravidade);
  return findById(info.lastInsertRowid);
}

function update(id, { nome, descricao, gravidade, ativo }) {
  const fields = []; const values = [];
  if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
  if (descricao !== undefined) { fields.push('descricao = ?'); values.push(descricao); }
  if (gravidade !== undefined) { fields.push('gravidade = ?'); values.push(gravidade); }
  if (ativo !== undefined) { fields.push('ativo = ?'); values.push(ativo); }
  if (fields.length === 0) return findById(id);
  values.push(id);
  getDb().prepare(`UPDATE patologias SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}

function remove(id) {
  getDb().prepare('DELETE FROM patologias WHERE id = ?').run(id);
}

function findByPacienteId(pacienteId) {
  return getDb().prepare(`
    SELECT pp.*, p.nome, p.gravidade
    FROM paciente_patologias pp
    JOIN patologias p ON p.id = pp.patologia_id
    WHERE pp.paciente_id = ?
  `).all(pacienteId);
}

function vincularPaciente(pacienteId, patologiaId, diagnosticadoEm, observacoes) {
  getDb().prepare('INSERT OR IGNORE INTO paciente_patologias (paciente_id, patologia_id, diagnosticado_em, observacoes) VALUES (?, ?, ?, ?)').run(pacienteId, patologiaId, diagnosticadoEm, observacoes);
}

function desvincularPaciente(pacienteId, patologiaId) {
  getDb().prepare('DELETE FROM paciente_patologias WHERE paciente_id = ? AND patologia_id = ?').run(pacienteId, patologiaId);
}

module.exports = { findAll, findById, create, update, remove, findByPacienteId, vincularPaciente, desvincularPaciente };