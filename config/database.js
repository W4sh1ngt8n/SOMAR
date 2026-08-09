const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const env = require('./env');

let db = null;

function initDatabase() {
  const dbDir = path.dirname(env.DB_PATH);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  db = new Database(env.DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
  console.log('[DB] Banco de dados inicializado');
  return db;
}

function getDb() {
  if (!db) throw new Error('Banco não inicializado. Chame initDatabase() primeiro.');
  return db;
}

module.exports = { initDatabase, getDb };