const express = require('express');
const router = express.Router();
const mantenedorController = require('../controllers/mantenedorController');
const validateMantenedor = require('../middleware/validateMantenedor');
const preventDeleteIfRelated = require('../middleware/preventDeleteIfRelated');

router.post('/', validateMantenedor, mantenedorController.crear);
router.delete('/:id', preventDeleteIfRelated, mantenedorController.eliminar);

module.exports = router;
