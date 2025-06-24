const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

// Listar todas las auditorías
router.get('/', auditoriaController.listar);

// Filtrar auditoría
router.get('/filtrar', auditoriaController.filtrar);
module.exports = router;
