const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const OUTPUT_DIR = path.join(__dirname, '../../uploads/temp');
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function header(doc, title) {
  doc.fontSize(18).fillColor('#2c3e50').text('Fundação SOMAR', 50, 40);
  doc.fontSize(10).fillColor('#7f8c8d').text('Sistema de Gestão de Pacientes', 50, 62);
  doc.moveTo(50, 80).lineTo(545, 80).strokeColor('#bdc3c7').lineWidth(1).stroke();
  doc.moveDown(2).fontSize(14).fillColor('#2c3e50').text(title, { align: 'center' });
  doc.moveDown();
}
function footer(doc) {
  doc.fontSize(8).fillColor('#95a5a6').text(`Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')} - Sistema Fundação SOMAR`, 50, 800, { align: 'center', width: 495 });
}
function generateFichaPaciente(paciente, acompanhamentos, beneficios, patologias, medicamentos, qrCodePath) {
  ensureDir(OUTPUT_DIR);
  const fileName = `ficha_paciente_${paciente.id}_${Date.now()}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 90, bottom: 60, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(filePath));
  header(doc, 'FICHA COMPLETA DO PACIENTE');
  doc.fontSize(12).fillColor('#34495e').text('Dados Pessoais');
  doc.fontSize(10).fillColor('#2c3e50');
  doc.text(`Nome: ${paciente.nome_completo}`);
  doc.text(`CPF: ${paciente.cpf || 'Não informado'}  |  RG: ${paciente.rg || 'Não informado'}`);
  doc.text(`Data Nasc.: ${paciente.data_nascimento || '-'}  |  Sexo: ${paciente.sexo || '-'}`);
  doc.text(`Telefone: ${paciente.telefone || '-'}  |  WhatsApp: ${paciente.whatsapp || '-'}`);
  doc.text(`Endereço: ${paciente.endereco || '-'}, ${paciente.numero || ''} - ${paciente.bairro || ''}, ${paciente.cidade || ''}/${paciente.estado || ''}`);
  doc.text(`Status Cadastro: ${paciente.status_cadastro}  |  Status Tratamento: ${paciente.status_tratamento || '-'}`);
  doc.moveDown();
  if (patologias && patologias.length > 0) {
    doc.fontSize(12).fillColor('#34495e').text('Patologias');
    doc.fontSize(10).fillColor('#2c3e50');
    patologias.forEach(p => doc.text(`- ${p.nome} (Gravidade: ${p.gravidade || '-'}) - Diagnosticado: ${p.diagnosticado_em || '-'}`));
    doc.moveDown();
  }
  if (medicamentos && medicamentos.length > 0) {
    doc.fontSize(12).fillColor('#34495e').text('Medicamentos');
    doc.fontSize(10).fillColor('#2c3e50');
    medicamentos.forEach(m => doc.text(`- ${m.nome} - Posologia: ${m.posologia || '-'}`));
    doc.moveDown();
  }
  doc.fontSize(12).fillColor('#34495e').text('Histórico de Acompanhamentos');
  doc.fontSize(9).fillColor('#2c3e50');
  if (acompanhamentos.length === 0) doc.text('Nenhum acompanhamento registrado.');
  acompanhamentos.forEach(a => doc.text(`[${a.data}] ${a.tipo.toUpperCase()} - ${a.descricao}${a.profissional ? ' (Prof: ' + a.profissional + ')' : ''}${a.proximo_retorno ? ' | Prox. retorno: ' + a.proximo_retorno : ''}`));
  doc.moveDown();
  doc.fontSize(12).fillColor('#34495e').text('Benefícios Concedidos');
  doc.fontSize(9).fillColor('#2c3e50');
  if (beneficios.length === 0) doc.text('Nenhum benefício concedido.');
  beneficios.forEach(b => doc.text(`[${b.data_solicitacao}] ${b.beneficio_nome} - Qtd: ${b.quantidade || '-'} - Status: ${b.status}`));
  if (qrCodePath && fs.existsSync(qrCodePath)) {
    doc.moveDown().fontSize(10).fillColor('#34495e').text('QR Code de Identificação:', 380, doc.y);
    doc.image(qrCodePath, 400, doc.y + 5, { width: 100 });
  }
  footer(doc);
  doc.end();
  return filePath;
}
function generateRelatorioMensal(dados, mes, ano) {
  ensureDir(OUTPUT_DIR);
  const fileName = `relatorio_mensal_${mes}_${ano}_${Date.now()}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 90, bottom: 60, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(filePath));
  header(doc, `RELATÓRIO MENSAL - ${String(mes).padStart(2,'0')}/${ano}`);
  doc.fontSize(12).fillColor('#34495e').text('Resumo Geral');
  doc.fontSize(10).fillColor('#2c3e50');
  doc.text(`Total de pacientes ativos: ${dados.totalAtivos}`);
  doc.text(`Novas admissões no mês: ${dados.novasAdmissoes}`);
  doc.text(`Altas no mês: ${dados.altas}`);
  doc.text(`Abandonos no mês: ${dados.abandonos}`);
  doc.text(`Óbitos no mês: ${dados.obitos}`);
  doc.moveDown();
  doc.fontSize(12).fillColor('#34495e').text('Distribuição por Status de Cadastro');
  doc.fontSize(10).fillColor('#2c3e50');
  dados.porStatus.forEach(s => doc.text(`- ${s.status_cadastro}: ${s.total}`));
  doc.moveDown();
  doc.fontSize(12).fillColor('#34495e').text('Benefícios Concedidos no Período');
  doc.fontSize(10).fillColor('#2c3e50');
  if (dados.beneficios.length === 0) doc.text('Nenhum benefício concedido no período.');
  dados.beneficios.forEach(b => doc.text(`- ${b.nome} (${b.categoria}): ${b.total} concessões`));
  footer(doc);
  doc.end();
  return filePath;
}
function generateRelatorioAnual(dados, ano) {
  ensureDir(OUTPUT_DIR);
  const fileName = `relatorio_anual_${ano}_${Date.now()}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 90, bottom: 60, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(filePath));
  header(doc, `RELATÓRIO ANUAL - ${ano}`);
  doc.fontSize(12).fillColor('#34495e').text('Resumo Anual');
  doc.fontSize(10).fillColor('#2c3e50');
  doc.text(`Total de pacientes cadastrados: ${dados.totalPacientes}`);
  doc.text(`Pacientes ativos (assistidos): ${dados.totalAssistidos}`);
  doc.text(`Total de altas: ${dados.totalAltas}`);
  doc.text(`Total de abandonos: ${dados.totalAbandonos}`);
  doc.text(`Total de óbitos: ${dados.totalObitos}`);
  doc.moveDown();
  doc.fontSize(12).fillColor('#34495e').text('Distribuição por Status');
  doc.fontSize(10).fillColor('#2c3e50');
  dados.porStatus.forEach(s => doc.text(`- ${s.status_cadastro}: ${s.total}`));
  doc.moveDown();
  doc.fontSize(12).fillColor('#34495e').text('Benefícios Concedidos no Ano');
  doc.fontSize(10).fillColor('#2c3e50');
  if (dados.beneficios.length === 0) doc.text('Nenhum benefício concedido no ano.');
  dados.beneficios.forEach(b => doc.text(`- ${b.nome} (${b.categoria}): ${b.total} concessões`));
  footer(doc);
  doc.end();
  return filePath;
}
module.exports = { generateFichaPaciente, generateRelatorioMensal, generateRelatorioAnual };
