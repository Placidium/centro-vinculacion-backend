const express = require('express');
const router = express.Router();
const sociosComunitariosController = require('../controllers/sociosComunitariosController');
const validateSocioComunitario = require('../middleware/validateSocioComunitario');

// Rutas CRUD para Socios Comunitarios
router.get('/', sociosComunitariosController.obtenerTodos);
router.get('/:id', sociosComunitariosController.obtenerPorId);
router.post('/', validateSocioComunitario , sociosComunitariosController.crear);
router.put('/:id', validateSocioComunitario , sociosComunitariosController.actualizar);
router.delete('/:id', sociosComunitariosController.eliminar);

module.exports = router;
