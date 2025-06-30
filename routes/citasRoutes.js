const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const { authenticateToken } = require('../middleware/auth');

const validateCrearCita = require('../middleware/validateCrearCita'); // ✅ Validación al crear
const validateConflictosAgenda = require('../middleware/validateConflictosAgenda'); // ✅ Validación al reagendar

// ✅ Aplicar middleware para proteger las rutas
router.get('/', authenticateToken, citasController.listar);
router.get('/:id', authenticateToken, citasController.obtenerPorId);

router.post(
  '/',
  authenticateToken,
  validateCrearCita, // ✅ Validación de campos + conflictos
  citasController.crear
);
router.put('/:id', authenticateToken, citasController.actualizar);

router.put(
  '/:id/reagendar',
  authenticateToken,
  validateConflictosAgenda, // ✅ Validación de conflictos al reagendar
  citasController.reagendar
);

router.put('/:id/cancelar', authenticateToken, citasController.cancelar);
router.delete('/:id', authenticateToken, citasController.eliminar);

module.exports = router;
