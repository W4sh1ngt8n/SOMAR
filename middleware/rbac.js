const PERMISSIONS = {
  admin: ['*'],
  coordenador: [
    'pacientes:read','pacientes:write','acompanhamentos:read','acompanhamentos:write',
    'beneficios:read','beneficios:write','requisicoes:read','requisicoes:write',
    'requisicoes:approve','documentos:read','documentos:write',
    'relatorios:read','relatorios:generate','patologias:read','patologias:write',
    'medicamentos:read','medicamentos:write','dashboard:read','backup:manage'
  ],
  assistente: [
    'pacientes:read','pacientes:write','acompanhamentos:read','acompanhamentos:write',
    'beneficios:read','requisicoes:read','requisicoes:write',
    'documentos:read','documentos:write','dashboard:read','patologias:read','medicamentos:read'
  ],
  visitante: ['dashboard:read','relatorios:read','pacientes:read'],
};

function hasPermission(required) {
  return (req, res, next) => {
    const userPerms = PERMISSIONS[req.user.perfil] || [];
    if (userPerms.includes('*') || userPerms.includes(required)) return next();
    return res.status(403).json({ erro: 'Acesso negado para esta operação' });
  };
}

module.exports = { hasPermission, PERMISSIONS };