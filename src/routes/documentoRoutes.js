const express = require('express');
const router = express.Router();
const { hasPermission } = require('../middleware/rbac');
const ctrl = require('../controllers/documentoController');
router.get('/', hasPermission('documentos:read'), ctrl.listar);
router.post('/upload', hasPermission('documentos:write'), ctrl.upload.single('arquivo'), ctrl.uploadDoc);
router.delete('/:id', hasPermission('documentos:write'), ctrl.remover);
module.exports = router;
