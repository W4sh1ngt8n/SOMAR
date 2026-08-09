const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/relatorioController');

router.get('/mensal', hasPermission('relatorios:read'), ctrl.dadosMensal);
router.get('/mensal/pdf', hasPermission('relatorios:generate'), ctrl.pdfMensal);
router.get('/anual', hasPermission('relatorios:read'), ctrl.dadosAnual);
router.get('/anual/pdf', hasPermission('relatorios:generate'), ctrl.pdfAnual);
router.get('/pacientes-tratamento', hasPermission('relatorios:read'), ctrl.pacientesTratamento);
router.get('/pacientes-acompanhamento', hasPermission('relatorios:read'), ctrl.pacientesAcompanhamento);
router.get('/beneficios-concedidos', hasPermission('relatorios:read'), ctrl.beneficiosConcedidos);
router.get('/pacientes/:id/ficha-pdf', hasPermission('relatorios:generate'), ctrl.fichaPacientePdf);

module.exports = router;