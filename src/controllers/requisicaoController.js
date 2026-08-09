const requisicaoDAO = require('../dao/requisicaoDAO');
const pacienteDAO = require('../dao/pacienteDAO');
const pdfService = require('../services/pdfService');
const path = require('path');
function listar(req, res) { res.json(requisicaoDAO.findAll(req.query)); }
function buscar(req, res) { const r = requisicaoDAO.findById(req.params.id); if (!r) return res.status(404).json({ erro: 'Requisição não encontrada' }); res.json(r); }
function criar(req, res) {
  const paciente = pacienteDAO.findById(req.body.paciente_id);
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
  if (paciente.status_cadastro !== 'assistido') return res.status(400).json({ erro: 'Apenas pacientes assistidos podem solicitar benefícios' });
  const r = requisicaoDAO.create({ ...req.body, solicitado_por: req.user.id });
  res.status(201).json(r);
}
function aprovar(req, res) { const r = requisicaoDAO.updateStatus(req.params.id, 'aprovada', req.user.id); if (!r) return res.status(404).json({ erro: 'Requisição não encontrada' }); res.json(r); }
function negar(req, res) { const r = requisicaoDAO.updateStatus(req.params.id, 'negada', req.user.id); if (!r) return res.status(404).json({ erro: 'Requisição não encontrada' }); res.json(r); }
function entregar(req, res) { const r = requisicaoDAO.updateStatus(req.params.id, 'entregue', req.user.id); if (!r) return res.status(404).json({ erro: 'Requisição não encontrada' }); res.json(r); }
async function comprovantePdf(req, res) {
  const reqData = requisicaoDAO.findById(req.params.id);
  if (!reqData) return res.status(404).json({ erro: 'Requisição não encontrada' });
  const paciente = pacienteDAO.findById(reqData.paciente_id);
  const qrPath = paciente.qr_code_path ? path.resolve(__dirname, '../../', paciente.qr_code_path) : null;
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const OUTPUT_DIR = path.join(__dirname, '../../uploads/temp');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const fileName = `comprovante_${reqData.id}_${Date.now()}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 40, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(18).fillColor('#2c3e50').text('Fundação SOMAR', 50, 40);
  doc.fontSize(10).fillColor('#7f8c8d').text('Comprovante de Benefício Concedido', 50, 62);
  doc.moveTo(50, 78).lineTo(545, 78).strokeColor('#bdc3c7').lineWidth(1).stroke();
  doc.moveDown(2);
  doc.fontSize(12).fillColor('#34495e').text('Dados do Benefício');
  doc.fontSize(10).fillColor('#2c3e50');
  doc.text(`Requisição Nº: ${reqData.id}`);
  doc.text(`Paciente: ${reqData.paciente_nome}`);
  doc.text(`Benefício: ${reqData.beneficio_nome}`);
  doc.text(`Categoria: ${reqData.beneficio_categoria}`);
  doc.text(`Quantidade: ${reqData.quantidade || '-'}`);
  doc.text(`Status: ${reqData.status}`);
  doc.text(`Data Solicitação: ${reqData.data_solicitacao}`);
  doc.text(`Data Aprovação: ${reqData.data_aprovacao || '-'}`);
  doc.text(`Data Entrega: ${reqData.data_entrega || '-'}`);
  doc.moveDown();
  if (qrPath && fs.existsSync(qrPath)) { doc.text('QR Code de Validação:', 380, doc.y); doc.image(qrPath, 400, doc.y + 5, { width: 80 }); }
  doc.fontSize(8).fillColor('#95a5a6').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 50, 780, { align: 'center', width: 495 });
  doc.end();
  setTimeout(() => res.download(filePath), 300);
}
module.exports = { listar, buscar, criar, aprovar, negar, entregar, comprovantePdf };
