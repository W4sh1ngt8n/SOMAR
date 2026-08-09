const { getDb, initDatabase } = require('./database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

initDatabase();
const db = getDb();

const senhaAdmin = bcrypt.hashSync('admin123', 10);
const senhaCoord = bcrypt.hashSync('coord123', 10);
const senhaAssist = bcrypt.hashSync('assist123', 10);

// Limpar dados existentes
db.exec('DELETE FROM logs_auditoria; DELETE FROM documentos; DELETE FROM requisicoes; DELETE FROM acompanhamentos; DELETE FROM paciente_medicamentos; DELETE FROM paciente_patologias; DELETE FROM pacientes; DELETE FROM pre_cadastros; DELETE FROM medicamentos; DELETE FROM patologias; DELETE FROM beneficios; DELETE FROM usuarios;');

// Usuários
db.prepare(`INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)`).run('Administrador', 'admin@somar.local', senhaAdmin, 'admin');
db.prepare(`INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)`).run('Coordenadora Maria', 'coord@somar.local', senhaCoord, 'coordenador');
db.prepare(`INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)`).run('Assistente João', 'assist@somar.local', senhaAssist, 'assistente');

// Benefícios
const beneficios = [
  ['Vale Combustível', 'combustivel', 'Auxílio mensal para combustível'],
  ['Medicamentos', 'medicamento', 'Fornecimento de medicamentos'],
  ['Exames Laboratoriais', 'exame', 'Cobertura de exames solicitados'],
  ['Passagens', 'passagem', 'Passagens de ônibus para tratamento'],
  ['Nutren', 'nutren', 'Suplemento nutricional Nutren'],
  ['Dieta Enteral', 'dieta_enteral', 'Fornecimento de dieta enteral'],
];
beneficios.forEach(b => db.prepare(`INSERT INTO beneficios (nome, categoria, descricao) VALUES (?, ?, ?)`).run(...b));

// Patologias
const patologias = [
  ['Câncer', 'Doença oncológica', 'grave'],
  ['Doença Neurológica', 'Condições neurológicas crônicas', 'moderada'],
  ['Deficiência Física', 'Limitações motoras', 'moderada'],
  ['Doença Crônica', 'Condições crônicas diversas', 'leve'],
  ['Doença Renal', 'Insuficiência renal', 'grave'],
];
patologias.forEach(p => db.prepare(`INSERT INTO patologias (nome, descricao, gravidade) VALUES (?, ?, ?)`).run(...p));

// Medicamentos
const medicamentos = [
  ['Paracetamol 500mg', 'Paracetamol', 'Comprimido', '500mg a cada 6h'],
  ['Dipirona 500mg', 'Dipirona', 'Comprimido', '500mg a cada 6h'],
  ['Nutren 1.0', 'Suplemento nutricional', 'Pó', '1 lata/mês'],
  ['Omeprazol 20mg', 'Omeprazol', 'Cápsula', '20mg ao dia'],
];
medicamentos.forEach(m => db.prepare(`INSERT INTO medicamentos (nome, principio_ativo, apresentacao, dosagem_padrao) VALUES (?, ?, ?, ?)`).run(...m));

// Pacientes fictícios
const pacientes = [
  ['João Silva Santos', '111.222.333-44', 'MG-12.345.678', '1965-03-15', 'M', 'Maria Santos', 'Esposa', '(38) 3221-1234', '(38) 99887-6543', null, '38300-000', 'Rua das Flores', '123', 'Casa', 'Centro', 'Ituiutaba', 'MG', 'assistido', 'em_tratamento'],
  ['Ana Oliveira Lima', '222.333.444-55', 'MG-23.456.789', '1980-07-22', 'F', 'Carlos Lima', 'Marido', '(38) 3222-5678', '(38) 99776-5544', null, '38300-000', 'Av. Brasil', '456', 'Apto 101', 'São Cristóvão', 'Ituiutaba', 'MG', 'assistido', 'retorno_trimestral'],
  ['Pedro Costa Ferreira', '333.444.555-66', 'MG-34.567.890', '1972-11-30', 'M', null, null, '(38) 3223-9012', null, null, '38302-000', 'Rua Pioneiros', '789', null, 'JK', 'Ituiutaba', 'MG', 'triagem', null],
  ['Marcia Souza Alves', '444.555.666-77', 'MG-45.678.901', '1990-05-10', 'F', 'José Alves', 'Pai', '(38) 3224-3456', '(38) 99665-4433', null, '38300-100', 'Rua Palmeiras', '321', 'Casa', 'Centro', 'Ituiutaba', 'MG', 'alta', null],
];

pacientes.forEach(p => {
  db.prepare(`INSERT INTO pacientes (nome_completo, cpf, rg, data_nascimento, sexo, nome_responsavel, parentesco_responsavel, telefone, whatsapp, email, cep, endereco, numero, complemento, bairro, cidade, estado, status_cadastro, status_tratamento) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...p);
});

// Pré-cadastros
db.prepare(`INSERT INTO pre_cadastros (nome_completo, telefone, motivo_busca, documentos_solicitados, status) VALUES (?, ?, ?, ?, ?)`)
  .run('Carlos Eduardo Rocha', '(38) 99123-4567', 'Paciente encaminhado pelo posto de saúde para tratamento oncológico', 'RG, CPF, Comprovante residência, Laudo médico', 'aguardando');
db.prepare(`INSERT INTO pre_cadastros (nome_completo, telefone, motivo_busca, documentos_solicitados, status) VALUES (?, ?, ?, ?, ?)`)
  .run('Fernanda Almeida Prado', '(38) 99234-5678', 'Necessidade de dieta enteral para filho', 'RG, CPF, Comprovante residência, Receita médica', 'validado');

// Acompanhamentos
db.prepare(`INSERT INTO acompanhamentos (paciente_id, tipo, descricao, profissional, proximo_retorno) VALUES (?, ?, ?, ?, ?)`)
  .run(1, 'consulta', 'Paciente em tratamento oncológico. Responde bem ao protocolo atual.', 'Dra. Helena', '2026-09-08');
db.prepare(`INSERT INTO acompanhamentos (paciente_id, tipo, descricao, profissional, proximo_retorno) VALUES (?, ?, ?, ?, ?)`)
  .run(1, 'visita_domiciliar', 'Visita para verificar adesão ao tratamento.', 'Assistente João', '2026-09-01');
db.prepare(`INSERT INTO acompanhamentos (paciente_id, tipo, descricao, profissional, proximo_retorno) VALUES (?, ?, ?, ?, ?)`)
  .run(2, 'retorno', 'Retorno trimestral. Paciente estável.', 'Dra. Helena', '2026-12-08');

// Requisições
db.prepare(`INSERT INTO requisicoes (paciente_id, beneficio_id, quantidade, status, solicitado_por) VALUES (?, ?, ?, ?, ?)`)
  .run(1, 1, '2 tanques/mês', 'aprovada', 2);
db.prepare(`INSERT INTO requisicoes (paciente_id, beneficio_id, quantidade, status, solicitado_por) VALUES (?, ?, ?, ?, ?)`)
  .run(1, 2, 'Paracetamol 500mg - 30 comprimidos', 'entregue', 2);
db.prepare(`INSERT INTO requisicoes (paciente_id, beneficio_id, quantidade, status, solicitado_por) VALUES (?, ?, ?, ?, ?)`)
  .run(2, 5, '2 latas/mês', 'solicitada', 3);

// Patologias dos pacientes
db.prepare(`INSERT INTO paciente_patologias (paciente_id, patologia_id, diagnosticado_em) VALUES (?, ?, ?)`).run(1, 1, '2024-01-15');
db.prepare(`INSERT INTO paciente_patologias (paciente_id, patologia_id, diagnosticado_em) VALUES (?, ?, ?)`).run(2, 3, '2023-06-20');

// Medicamentos dos pacientes
db.prepare(`INSERT INTO paciente_medicamentos (paciente_id, medicamento_id, posologia, data_inicio, ativo) VALUES (?, ?, ?, ?, ?)`).run(1, 1, '500mg a cada 6h', '2024-01-20', 1);
db.prepare(`INSERT INTO paciente_medicamentos (paciente_id, medicamento_id, posologia, data_inicio, ativo) VALUES (?, ?, ?, ?, ?)`).run(1, 3, '1 lata ao dia', '2024-01-20', 1);

console.log('[Seed] Dados fictícios inseridos com sucesso!');
console.log('[Seed] Logins de teste:');
console.log('  Admin: admin@somar.local / admin123');
console.log('  Coordenador: coord@somar.local / coord123');
console.log('  Assistente: assist@somar.local / assist123');
process.exit(0);