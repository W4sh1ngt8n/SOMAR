const usuarioDAO = require('../dao/usuarioDAO');
const { hashPassword } = require('../utils/hash');

function listar(req, res) {
  res.json(usuarioDAO.findAll());
}

function buscar(req, res) {
  const u = usuarioDAO.findById(req.params.id);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(u);
}

function criar(req, res) {
  const { nome, email, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil) return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, perfil' });
  if (usuarioDAO.findByEmail(email)) return res.status(409).json({ erro: 'Email já cadastrado' });
  const senha_hash = hashPassword(senha);
  const u = usuarioDAO.create({ nome, email, senha_hash, perfil });
  res.status(201).json(u);
}

function atualizar(req, res) {
  const u = usuarioDAO.update(req.params.id, req.body);
  if (!u) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(u);
}

function alterarSenha(req, res) {
  const { senha } = req.body;
  if (!senha || senha.length < 6) return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
  usuarioDAO.updatePassword(req.params.id, hashPassword(senha));
  res.json({ message: 'Senha alterada' });
}

function remover(req, res) {
  usuarioDAO.remove(req.params.id);
  res.status(204).send();
}

module.exports = { listar, buscar, criar, atualizar, alterarSenha, remover };