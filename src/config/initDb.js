const { initDatabase } = require('./database');

initDatabase();
console.log('[DB] Schema criado com sucesso.');
process.exit(0);