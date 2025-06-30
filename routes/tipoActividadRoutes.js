const express = require('express');
const router = express.Router();
const tipoActividadController = require('../controllers/tiposActividadController');
const validateTipoActividad = require('../middleware/validateTipoActividad'); 

// Rutas CRUD para TipoActividad
router.get('/', tipoActividadController.obtenerTodos);
router.get('/:id', tipoActividadController.obtenerPorId);
router.post('/', validateTipoActividad, tipoActividadController.crear);
router.put('/:id', validateTipoActividad, tipoActividadController.actualizar);
router.delete('/:id', tipoActividadController.eliminar);


module.exports = router;
