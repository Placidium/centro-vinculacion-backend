const express = require('express');
const router = express.Router();
const controller = require('../controllers/permisosUsuarioController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/usuario/:id', authenticateToken, controller.listarPorUsuario);
router.post('/', authenticateToken, controller.asignarPermiso);
router.delete('/:id', authenticateToken, controller.eliminarPermiso);

module.exports = router;
