const express = require('express');
const router = express.Router();
const oferentesController = require('../controllers/oferentesController');
const validateOferente = require('../middleware/validateOferente');

// Rutas CRUD para Oferentes
router.get('/', oferentesController.obtenerTodos);
router.get('/:id', oferentesController.obtenerPorId);
router.post('/', validateOferente , oferentesController.crear);
router.put('/:id', validateOferente , oferentesController.actualizar);
router.delete('/:id', oferentesController.eliminar);

module.exports = router;
