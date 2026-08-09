const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const DB_PATH = env.DB_PATH;
const BACKUP_DIR = env.DB_BACKUP_PATH;
const KEEP_DAYS = env.BACKUP_KEEP_DAYS;
function performBackup() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `somar_backup_${ts}.db`;
  const backupPath = path.join(BACKUP_DIR, fileName);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`[Backup] Banco copiado: ${fileName}`);
  cleanOldBackups();
  return { fileName, path: backupPath };
}
function cleanOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const cutoff = Date.now() - (KEEP_DAYS * 24 * 60 * 60 * 1000);
  fs.readdirSync(BACKUP_DIR).forEach(file => {
    if (file.startsWith('somar_backup_') && file.endsWith('.db')) {
      const filePath = path.join(BACKUP_DIR, file);
      if (fs.statSync(filePath).mtimeMs < cutoff) { fs.unlinkSync(filePath); console.log(`[Backup] Removido: ${file}`); }
    }
  });
}
function startAutoBackup() {
  const intervalMs = (parseInt(process.env.DB_BACKUP_INTERVAL_HOURS) || 6) * 60 * 60 * 1000;
  setInterval(performBackup, intervalMs);
  console.log(`[Backup] Auto-backup agendado a cada ${process.env.DB_BACKUP_INTERVAL_HOURS || 6}h`);
}
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('somar_backup_') && f.endsWith('.db')).map(f => {
    const stat = fs.statSync(path.join(BACKUP_DIR, f));
    return { fileName: f, size: stat.size, criado_em: stat.mtime };
  }).sort((a, b) => b.criado_em - a.criado_em);
}
function restoreBackup(fileName) {
  const backupPath = path.join(BACKUP_DIR, fileName);
  if (!fs.existsSync(backupPath)) throw { status: 404, message: 'Backup não encontrado' };
  fs.copyFileSync(backupPath, DB_PATH);
  console.log(`[Backup] Restaurado: ${fileName}`);
  return { fileName, restored: true };
}
if (require.main === module && process.argv[2] === 'manual') { performBackup(); process.exit(0); }
module.exports = { performBackup, startAutoBackup, listBackups, restoreBackup };
