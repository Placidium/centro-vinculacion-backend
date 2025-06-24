const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');
const validateProyecto = require('../middleware/validateProyecto');

// Rutas CRUD para Proyectos
router.get('/', proyectosController.obtenerTodos);
router.get('/:id', proyectosController.obtenerPorId);
router.post('/', validateProyecto , proyectosController.crear);
router.put('/:id', validateProyecto , proyectosController.actualizar);
router.delete('/:id', proyectosController.eliminar);

module.exports = router;
