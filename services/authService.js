const usuarioDAO = require('../dao/usuarioDAO');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

async function login(email, senha) {
  const usuario = usuarioDAO.findByEmail(email);
  if (!usuario || !usuario.ativo) throw { status: 401, message: 'Credenciais inválidas' };
  const valid = comparePassword(senha, usuario.senha_hash);
  if (!valid) throw { status: 401, message: 'Credenciais inválidas' };
  const token = generateToken({ id: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
  return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } };
}

module.exports = { login };