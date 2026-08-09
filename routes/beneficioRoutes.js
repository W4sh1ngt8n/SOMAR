const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/beneficioController');

router.get('/', hasPermission('beneficios:read'), ctrl.listar);
router.get('/:id', hasPermission('beneficios:read'), ctrl.buscar);
router.post('/', hasPermission('beneficios:write'), ctrl.criar);
router.put('/:id', hasPermission('beneficios:write'), ctrl.atualizar);
router.delete('/:id', hasPermission('beneficios:write'), ctrl.remover);

module.exports = router;