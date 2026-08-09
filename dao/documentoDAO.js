const { getDb } = require('../config/database');

function findByPacienteId(pacienteId) {
  return getDb().prepare('SELECT * FROM documentos WHERE paciente_id = ? ORDER BY criado_em DESC').all(pacienteId);
}

function findById(id) {
  return getDb().prepare('SELECT * FROM documentos WHERE id = ?').get(id);
}

function create(data) {
  const info = getDb().prepare(
    'INSERT INTO documentos (paciente_id, tipo, nome_arquivo, caminho_arquivo, observacoes, enviado_por) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.paciente_id, data.tipo, data.nome_arquivo, data.caminho_arquivo, data.observacoes, data.enviado_por);
  return findById(info.lastInsertRowid);
}

function remove(id) {
  const doc = findById(id);
  getDb().prepare('DELETE FROM documentos WHERE id = ?').run(id);
  return doc;
}

module.exports = { findByPacienteId, findById, create, remove };