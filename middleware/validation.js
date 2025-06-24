const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma'); // ajusta la ruta según tu estructura
// Validaciones para Login
const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Por favor, introduce un email válido')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
];

// Validaciones para Registro - COMPLETAS según documentación
const validateRegister = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres')
        .isLength({ max: 100 })  // ← NUEVA VALIDACIÓN
        .withMessage('El nombre no puede exceder los 100 caracteres')
        .trim(),

    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Por favor, introduce un email válido')
        .normalizeEmail(),

    body('rol')  // ← NUEVA VALIDACIÓN
        .notEmpty()
        .withMessage('El rol es obligatorio'),

    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número'),

    body('confirmarPassword')
        .notEmpty()  // ← NUEVA VALIDACIÓN
        .withMessage('La confirmación de contraseña es obligatoria')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
];

// Validaciones para Recuperación de Contraseña
const validateForgotPassword = [
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Por favor, introduce un email válido')
        .normalizeEmail(),
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Formatear errores según la documentación
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
        }, {});

        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: formattedErrors
        });
    }
    next();
};

// Validaciones para Crear Actividad - COMPLETAS según documentación
const validateCrearActividad = [
    // Nombre
    body('nombre')
        .notEmpty()
        .withMessage('El nombre de la actividad es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder los 100 caracteres')
        .trim(),

    // Tipo de Actividad
    body('tipoActividadId')
        .notEmpty()
        .withMessage('El tipo de actividad es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El tipo de actividad debe ser válido'),

    // Periodicidad
    body('periodicidad')
        .notEmpty()
        .withMessage('La periodicidad es obligatoria')
        .isIn(['Puntual', 'Periódica'])
        .withMessage('La periodicidad debe ser Puntual o Periódica'),

    // Fecha Inicio
    body('fechaInicio')
        .notEmpty()
        .withMessage('La fecha de inicio es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio debe tener un formato válido')
        .custom((value) => {
            const fecha = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fecha < hoy) {
                throw new Error('La fecha de inicio debe ser posterior a hoy');
            }
            return true;
        }),

    // Fecha Fin (solo para periódicas)
    body('fechaFin')
        .if(body('periodicidad').equals('Periódica'))
        .notEmpty()
        .withMessage('La fecha de fin es obligatoria para actividades periódicas')
        .isISO8601()
        .withMessage('La fecha de fin debe tener un formato válido')
        .custom((value, { req }) => {
            if (req.body.periodicidad === 'Periódica') {
                const fechaInicio = new Date(req.body.fechaInicio);
                const fechaFin = new Date(value);
                if (fechaFin <= fechaInicio) {
                    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
                }
            }
            return true;
        }),

    // Socio Comunitario
    body('socioComunitarioId')
        .notEmpty()
        .withMessage('El socio comunitario es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El socio comunitario debe ser válido'),

    // Oferentes (debe ser array con al menos uno)
    body('oferentesIds')
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un oferente')
        .custom((oferentes) => {
            if (!oferentes.every(id => Number.isInteger(id) && id > 0)) {
                throw new Error('Los oferentes seleccionados no son válidos');
            }
            return true;
        }),

    // Beneficiarios (debe ser array con al menos uno)
    body('beneficiariosIds')
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un beneficiario')
        .custom((beneficiarios) => {
            if (!beneficiarios.every(id => Number.isInteger(id) && id > 0)) {
                throw new Error('Los beneficiarios seleccionados no son válidos');
            }
            return true;
        }),

    // Cupo (opcional, pero si se proporciona debe ser positivo)
    body('cupo')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El cupo debe ser un número positivo'),

    // Creado Por
    body('creadoPor')
        .notEmpty()
        .withMessage('El usuario creador es obligatorio')
        .isInt({ min: 1 })
        .withMessage('El usuario creador debe ser válido'),

    // Proyecto (opcional)
    body('proyectoId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El proyecto debe ser válido'),

    // Días aviso previo
    body('diasAvisoPrevio')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Los días de aviso previo deben ser un número positivo o cero')
];

// Middleware específico para validar que existen las relaciones en BD
const validateRelacionesExisten = async (req, res, next) => {
    const { tipoActividadId, socioComunitarioId, proyectoId, oferentesIds, beneficiariosIds } = req.body;

    try {
        // Validar que existe el tipo de actividad
        const tipoActividad = await prisma.tipos_actividad.findUnique({
            where: { id: parseInt(tipoActividadId) }
        });
        if (!tipoActividad) {
            return res.status(400).json({
                success: false,
                message: 'El tipo de actividad seleccionado no existe'
            });
        }

        // Validar que existe el socio comunitario
        const socioComunitario = await prisma.socios_comunitarios.findUnique({
            where: { id: parseInt(socioComunitarioId) }
        });
        if (!socioComunitario) {
            return res.status(400).json({
                success: false,
                message: 'El socio comunitario seleccionado no existe'
            });
        }

        // Validar proyecto si se proporciona
        if (proyectoId) {
            const proyecto = await prisma.proyectos.findUnique({
                where: { id: parseInt(proyectoId) }
            });
            if (!proyecto) {
                return res.status(400).json({
                    success: false,
                    message: 'El proyecto seleccionado no existe'
                });
            }
        }

        // Validar oferentes
        if (oferentesIds && oferentesIds.length > 0) {
            const oferentesCount = await prisma.oferentes.count({
                where: { id: { in: oferentesIds.map(id => parseInt(id)) } }
            });
            if (oferentesCount !== oferentesIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más oferentes seleccionados no existen'
                });
            }
        }

        // Validar beneficiarios
        if (beneficiariosIds && beneficiariosIds.length > 0) {
            const beneficiariosCount = await prisma.beneficiarios.count({
                where: { id: { in: beneficiariosIds.map(id => parseInt(id)) } }
            });
            if (beneficiariosCount !== beneficiariosIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más beneficiarios seleccionados no existen'
                });
            }
        }

        next();
    } catch (error) {
        console.error('[Middleware ValidateRelaciones] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar las relaciones'
        });
    }
};

const validateModificarActividad = [
    // Reutilizar todas las validaciones de crear actividad
    ...validateCrearActividad,

    // Validación específica del ID de la actividad
    body().custom(async (value, { req }) => {
        const { id } = req.params;

        try {
            const actividad = await prisma.actividades.findUnique({
                where: { id: parseInt(id) }
            });

            if (!actividad) {
                throw new Error('Actividad no encontrada');
            }

            if (actividad.estado === 'Cancelada') {
                throw new Error('No se puede modificar una actividad cancelada');
            }

            const fechaActual = new Date();
            if (new Date(actividad.fecha_inicio) < fechaActual) {
                throw new Error('No se puede modificar una actividad que ya ha ocurrido');
            }

            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    })
];
const validateCancelarActividad = [
    // Validar que se proporciona el motivo
    body('motivo')
        .notEmpty()
        .withMessage('El motivo de cancelación es obligatorio')
        .isLength({ min: 10 })
        .withMessage('El motivo debe tener al menos 10 caracteres')
        .trim(),

    // Validación específica de la actividad
    body().custom(async (value, { req }) => {
        const { id } = req.params;

        if (!id) {
            throw new Error('Debe seleccionar una actividad para cancelar');
        }

        try {
            const actividad = await prisma.actividades.findUnique({
                where: { id: parseInt(id) }
            });

            if (!actividad) {
                throw new Error('Actividad no encontrada');
            }

            if (actividad.estado === 'Cancelada') {
                throw new Error('Esta actividad ya está cancelada');
            }

            const fechaActual = new Date();
            if (new Date(actividad.fecha_inicio) < fechaActual) {
                throw new Error('No se puede cancelar una actividad que ya ha ocurrido');
            }

            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    })
];


// Validaciones para Reagendar Actividad
const validateReagendarActividad = [
    // Validar motivo
    body('motivo')
        .notEmpty()
        .withMessage('El motivo del cambio es obligatorio')
        .isLength({ min: 10 })
        .withMessage('El motivo debe tener al menos 10 caracteres')
        .trim(),

    // Validar nueva fecha
    body('nuevaFecha')
        .notEmpty()
        .withMessage('La nueva fecha es obligatoria')
        .isISO8601()
        .withMessage('La nueva fecha debe tener un formato válido')
        .custom((value) => {
            const fecha = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fecha < hoy) {
                throw new Error('La nueva fecha debe ser posterior a hoy');
            }
            return true;
        }),

    // Validar nueva hora
    body('nuevaHora')
        .notEmpty()
        .withMessage('La nueva hora es obligatoria')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('La hora debe tener un formato válido (HH:MM)')
        .custom((value) => {
            const [hora, minuto] = value.split(':').map(Number);
            const horaCompleta = hora + (minuto / 60);

            if (horaCompleta < 8 || horaCompleta > 20) {
                throw new Error('La hora debe estar entre las 8:00 y las 20:00');
            }
            return true;
        }),

    // Validar lugar (opcional)
    body('lugarId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El lugar debe ser válido'),

    // Validación específica de la actividad y disponibilidad
    body().custom(async (value, { req }) => {
        const { id } = req.params;
        const { nuevaFecha, nuevaHora, lugarId } = req.body;

        if (!id) {
            throw new Error('Debe seleccionar una actividad para reagendar');
        }

        try {
            const actividad = await prisma.actividades.findUnique({
                where: { id: parseInt(id) }
            });

            if (!actividad) {
                throw new Error('Actividad no encontrada');
            }

            if (actividad.estado === 'Cancelada') {
                throw new Error('No se puede reagendar una actividad cancelada');
            }

            const fechaActual = new Date();
            if (new Date(actividad.fecha_inicio) < fechaActual) {
                throw new Error('No se puede reagendar una actividad que ya ha ocurrido');
            }

            // Validar disponibilidad del lugar en la nueva fecha/hora si se proporciona
            if (lugarId && nuevaFecha && nuevaHora) {
                const fechaHoraCompleta = new Date(`${nuevaFecha}T${nuevaHora}`);

                // Verificar si el lugar está disponible
                const conflicto = await prisma.citas.findFirst({
                    where: {
                        lugar_id: parseInt(lugarId),
                        fecha: fechaHoraCompleta,
                        NOT: {
                            actividad_id: parseInt(id) // Excluir la actividad actual
                        }
                    }
                });

                if (conflicto) {
                    throw new Error('El lugar seleccionado no está disponible en la fecha y hora indicadas');
                }
            }

            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    })
];


// Middleware para validar existencia de lugar (para reagendar)
const validateLugarExiste = async (req, res, next) => {
    const { lugarId } = req.body;

    if (!lugarId) {
        return next(); // Es opcional
    }

    try {
        const lugar = await prisma.lugares.findUnique({
            where: { id: parseInt(lugarId) }
        });

        if (!lugar) {
            return res.status(400).json({
                success: false,
                message: 'El lugar seleccionado no existe'
            });
        }

        next();
    } catch (error) {
        console.error('[Middleware ValidateLugar] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar el lugar'
        });
    }
};




module.exports = {
    validateLogin,
    validateRegister,
    validateForgotPassword,
    handleValidationErrors,
    validateCrearActividad,
    validateRelacionesExisten,
    validateModificarActividad,
    validateCancelarActividad,
    validateReagendarActividad,
    validateLugarExiste,
};