require('dotenv').config();

const required = ['JWT_SECRET', 'DB_PATH'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  throw new Error(`Variáveis obrigatórias não definidas: ${missing.join(', ')}`);
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || './src/database/somar.db',
  DB_BACKUP_PATH: process.env.DB_BACKUP_PATH || './src/database/backups',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads/documentos',
  UPLOAD_MAX_SIZE_MB: parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 10,
  BACKUP_KEEP_DAYS: parseInt(process.env.BACKUP_KEEP_DAYS) || 30,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOGIN_BLOCK_MINUTES: parseInt(process.env.LOGIN_BLOCK_MINUTES) || 15,
};