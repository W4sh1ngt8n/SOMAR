const app = require('./src/app');
const env = require('./src/config/env');
const { initDatabase } = require('./src/config/database');
const { startAutoBackup, performBackup } = require('./src/services/backupService');

initDatabase();
performBackup();
startAutoBackup();

app.listen(env.PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Fundação SOMAR - Sistema de Gestão`);
  console.log(`  Rodando em: http://localhost:${env.PORT}`);
  console.log(`  Ambiente: ${env.NODE_ENV}`);
  console.log(`========================================\n`);
});