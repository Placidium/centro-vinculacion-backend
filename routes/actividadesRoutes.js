const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');
const {
    validateCrearActividad,
    validateModificarActividad,
    validateCancelarActividad,
    validateReagendarActividad,
    validateRelacionesExisten,
    validateLugarExiste,
    handleValidationErrors
} = require('../middleware/validation');
const validateConflictosAgenda = require('../middleware/validateConflictosAgenda');

// Rutas CRUD
router.get('/', actividadesController.obtenerTodas);
router.get('/:id', actividadesController.obtenerPorId);

router.post('/',
    validateCrearActividad,
    handleValidationErrors,
    validateRelacionesExisten,
    validateConflictosAgenda,
    actividadesController.crear
);

router.put('/:id',
    validateModificarActividad,
    handleValidationErrors,
    validateRelacionesExisten,
    validateConflictosAgenda,
    actividadesController.actualizar
);

router.delete('/:id', actividadesController.eliminar);

// Cancelar actividad
router.post('/:id/cancelar',
    validateCancelarActividad,
    handleValidationErrors,
    actividadesController.cancelar
);

// Reagendar actividad
router.post('/:id/reagendar',
    validateReagendarActividad,
    handleValidationErrors,
    validateLugarExiste,
    actividadesController.reagendar
);

module.exports = router;
