function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${err.message}`);
  if (res.headersSent) return next(err);
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ erro: 'Registro duplicado. CPF ou email já cadastrado.' });
  }
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ erro: 'Violação de restrição no banco de dados.' });
  }
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
module.exports = errorHandler;
