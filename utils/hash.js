const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

function hashPassword(senha) {
  return bcrypt.hashSync(senha, SALT_ROUNDS);
}

function comparePassword(senha, hash) {
  return bcrypt.compareSync(senha, hash);
}

module.exports = { hashPassword, comparePassword };