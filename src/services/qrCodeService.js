const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const QR_DIR = path.join(__dirname, '../../uploads/qrcodes');
function ensureQrDir() { if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true }); }
async function generatePacienteQRCode(pacienteId) {
  ensureQrDir();
  const qrData = JSON.stringify({ tipo: 'paciente_somar', id: pacienteId, ts: Date.now() });
  const fileName = `paciente_${pacienteId}.png`;
  const filePath = path.join(QR_DIR, fileName);
  await QRCode.toFile(filePath, qrData, { type: 'png', width: 200, margin: 2, color: { dark: '#2c3e50', light: '#ffffff' }, errorCorrectionLevel: 'M' });
  return filePath;
}
module.exports = { generatePacienteQRCode };
