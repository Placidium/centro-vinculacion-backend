const express = require('express');
const router = express.Router();
const beneficiariosController = require('../controllers/beneficiariosController');
const validateBeneficiario = require('../middleware/validateBeneficiario');

// Rutas CRUD para Beneficiarios
router.get('/', beneficiariosController.obtenerTodos);
router.get('/:id', beneficiariosController.obtenerPorId);
router.post('/', validateBeneficiario , beneficiariosController.crear);
router.put('/:id', validateBeneficiario , beneficiariosController.actualizar);
router.delete('/:id', beneficiariosController.eliminar);

module.exports = router;
