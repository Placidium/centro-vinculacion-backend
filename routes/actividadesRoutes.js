const checkAuth = require('../middleware/checkAuth');
const checkPermission = require('../middleware/checkPermission');

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
    checkAuth,
    checkPermission('crear_actividad'),
    validateCrearActividad,
    handleValidationErrors,
    validateRelacionesExisten,
    validateConflictosAgenda,
    actividadesController.crear
);


router.put('/:id',
    checkAuth,
    checkPermission('modificar_actividad'),
    validateModificarActividad,
    handleValidationErrors,
    validateRelacionesExisten,
    validateConflictosAgenda,
    actividadesController.actualizar
);

router.delete('/:id',
    checkAuth,
    checkPermission('eliminar_actividad'),
    actividadesController.eliminar
);
// Cancelar actividad
// Cancelar actividad - cambiar de POST a PUT para ser más RESTful
router.put('/:id/cancelar',
    checkAuth,
    checkPermission('cancelar_actividad'),
    validateCancelarActividad,
    handleValidationErrors,
    actividadesController.cancelar
);

// Reagendar actividad
router.post('/:id/reagendar',
    checkAuth,
    checkPermission('reagendar_actividad'),
    validateReagendarActividad,
    handleValidationErrors,
    validateLugarExiste,
    actividadesController.reagendar
);

module.exports = router;
