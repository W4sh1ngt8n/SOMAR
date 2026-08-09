const documentoDAO = require('../dao/documentoDAO');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(__dirname, '../../', env.UPLOAD_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc_${Date.now()}_${file.originalname.replace(/\s/g, '_')}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const exts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (exts.includes(ext)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido'));
  },
});

function listar(req, res) {
  const pacienteId = req.query.paciente_id;
  if (!pacienteId) return res.json([]);
  res.json(documentoDAO.findByPacienteId(pacienteId));
}

function uploadDoc(req, res) {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
  const { paciente_id, tipo, observacoes } = req.body;
  const doc = documentoDAO.create({
    paciente_id, tipo,
    nome_arquivo: req.file.originalname,
    caminho_arquivo: path.relative(path.resolve(__dirname, '../..'), req.file.path),
    observacoes, enviado_por: req.user.id,
  });
  res.status(201).json(doc);
}

function remover(req, res) {
  const doc = documentoDAO.remove(req.params.id);
  if (doc && doc.caminho_arquivo) {
    const fullPath = path.resolve(__dirname, '../../', doc.caminho_arquivo);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  res.status(204).send();
}

module.exports = { listar, uploadDoc, remover, upload };