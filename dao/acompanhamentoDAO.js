const { getDb } = require('../config/database');

function findByPacienteId(pacienteId) {
  return getDb().prepare('SELECT * FROM acompanhamentos WHERE paciente_id = ? ORDER BY data DESC').all(pacienteId);
}

function findById(id) {
  return getDb().prepare('SELECT * FROM acompanhamentos WHERE id = ?').get(id);
}

function create(data) {
  const info = getDb().prepare(
    'INSERT INTO acompanhamentos (paciente_id, tipo, descricao, profissional, proximo_retorno, criado_por) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.paciente_id, data.tipo, data.descricao, data.profissional, data.proximo_retorno, data.criado_por);
  return findById(info.lastInsertRowid);
}

function update(id, data) {
  const fields = []; const values = [];
  ['tipo','descricao','profissional','proximo_retorno'].forEach(f => {
    if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); }
  });
  if (fields.length === 0) return findById(id);
  values.push(id);
  getDb().prepare(`UPDATE acompanhamentos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}

function remove(id) {
  getDb().prepare('DELETE FROM acompanhamentos WHERE id = ?').run(id);
}

function findRetornosVencidos() {
  return getDb().prepare(`
    SELECT a.paciente_id, p.nome_completo, a.proximo_retorno, a.tipo
    FROM acompanhamentos a
    JOIN pacientes p ON p.id = a.paciente_id
    WHERE a.proximo_retorno IS NOT NULL
      AND a.proximo_retorno < date('now','localtime')
      AND p.status_cadastro = 'assistido'
    ORDER BY a.proximo_retorno ASC
  `).all();
}

module.exports = { findByPacienteId, findById, create, update, remove, findRetornosVencidos };