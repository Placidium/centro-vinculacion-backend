const express = require('express');
const router = express.Router();
const lugaresController = require('../controllers/lugaresController');
const validateLugar = require('../middleware/validateLugar');

// Rutas CRUD para Lugares
router.get('/', lugaresController.obtenerTodos);
router.get('/:id', lugaresController.obtenerPorId);
router.post('/', validateLugar , lugaresController.crear);
router.put('/:id', validateLugar , lugaresController.actualizar);
router.delete('/:id', lugaresController.eliminar);

module.exports = router;
