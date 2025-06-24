const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// Rutas para Citas
router.get('/', citasController.listar);                          // Listar todas las citas
router.get('/:id', citasController.obtenerPorId);                 // Obtener cita por ID
router.post('/', citasController.crear);                          // Crear nueva cita
                 
router.put('/:id/cancelar', citasController.cancelar);            // Cancelar una cita
router.put('/:id/reagendar', citasController.reagendar);          // Reagendar cita
router.delete('/:id', citasController.eliminar);                  // Eliminar cita

module.exports = router;
