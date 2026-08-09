const authService = require('../services/authService');
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    const result = await authService.login(email, senha);
    res.json(result);
  } catch (err) { next(err); }
}
function me(req, res) { res.json({ usuario: req.user }); }
module.exports = { login, me };
