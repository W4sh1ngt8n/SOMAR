const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/patologiaController');

router.get('/', hasPermission('patologias:read'), ctrl.listar);
router.get('/:id', hasPermission('patologias:read'), ctrl.buscar);
router.post('/', hasPermission('patologias:write'), ctrl.criar);
router.put('/:id', hasPermission('patologias:write'), ctrl.atualizar);
router.delete('/:id', hasPermission('patologias:write'), ctrl.remover);
router.post('/vincular', hasPermission('pacientes:write'), ctrl.vincularPaciente);

module.exports = router;