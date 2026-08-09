const dashboardService = require('../services/dashboardService');

function totais(req, res) { res.json(dashboardService.getTotais()); }
function alertas(req, res) { res.json(dashboardService.getAlertas()); }
function recentes(req, res) { res.json(dashboardService.getRecentes()); }

module.exports = { totais, alertas, recentes };