const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/backupController');
router.post('/gerar', hasPermission('backup:manage'), ctrl.gerar);
router.get('/listar', hasPermission('backup:manage'), ctrl.listar);
router.post('/restaurar/:filename', hasPermission('backup:manage'), ctrl.restaurar);
module.exports = router;
