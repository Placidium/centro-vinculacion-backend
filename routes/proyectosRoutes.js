const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');
const validateProyecto = require('../middleware/validateProyecto');

// Rutas CRUD para Proyectos
router.get('/', proyectosController.obtenerTodos);
router.get('/:id', proyectosController.obtenerPorId);

// 👇 Aquí usas el middleware pasando el modo correcto
router.post('/', validateProyecto('crear'), proyectosController.crear);
router.put('/:id', validateProyecto('actualizar'), proyectosController.actualizar);

router.delete('/:id', proyectosController.eliminar);

module.exports = router;
