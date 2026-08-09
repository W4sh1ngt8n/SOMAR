const { getDb } = require('../config/database');

function findAll() {
  return getDb().prepare('SELECT * FROM medicamentos ORDER BY nome').all();
}

function findById(id) {
  return getDb().prepare('SELECT * FROM medicamentos WHERE id = ?').get(id);
}

function create({ nome, principio_ativo, apresentacao, dosagem_padrao }) {
  const info = getDb().prepare('INSERT INTO medicamentos (nome, principio_ativo, apresentacao, dosagem_padrao) VALUES (?, ?, ?, ?)').run(nome, principio_ativo, apresentacao, dosagem_padrao);
  return findById(info.lastInsertRowid);
}

function update(id, data) {
  const fields = []; const values = [];
  ['nome','principio_ativo','apresentacao','dosagem_padrao','ativo'].forEach(f => {
    if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); }
  });
  if (fields.length === 0) return findById(id);
  values.push(id);
  getDb().prepare(`UPDATE medicamentos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}

function remove(id) {
  getDb().prepare('DELETE FROM medicamentos WHERE id = ?').run(id);
}

function findByPacienteId(pacienteId) {
  return getDb().prepare(`
    SELECT pm.*, m.nome, m.principio_ativo, m.apresentacao
    FROM paciente_medicamentos pm
    JOIN medicamentos m ON m.id = pm.medicamento_id
    WHERE pm.paciente_id = ?
  `).all(pacienteId);
}

function vincularPaciente(data) {
  getDb().prepare('INSERT INTO paciente_medicamentos (paciente_id, medicamento_id, posologia, data_inicio, ativo) VALUES (?, ?, ?, ?, ?)').run(data.paciente_id, data.medicamento_id, data.posologia, data.data_inicio, 1);
}

function desvincularPaciente(id) {
  getDb().prepare('UPDATE paciente_medicamentos SET ativo = 0 WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove, findByPacienteId, vincularPaciente, desvincularPaciente };