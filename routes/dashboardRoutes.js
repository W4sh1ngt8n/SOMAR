const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/dashboardController');

router.get('/totais', hasPermission('dashboard:read'), ctrl.totais);
router.get('/alertas', hasPermission('dashboard:read'), ctrl.alertas);
router.get('/recentes', hasPermission('dashboard:read'), ctrl.recentes);

module.exports = router;