const { body, param, validationResult } = require('express-validator');

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
// Validaciones para Registro - SIN rol
const validateRegister = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder los 100 caracteres')
        .trim(),

    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Por favor, introduce un email válido')
        .normalizeEmail(),

    // <-- SE ELIMINA VALIDACIÓN DEL ROL AQUÍ

    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número'),

    body('confirmarPassword')
        .notEmpty()
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
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la actividad es obligatorio')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder los 100 caracteres')
    .trim(),

  body('tipo_actividad_id')
    .notEmpty()
    .withMessage('El tipo de actividad es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El tipo de actividad debe ser válido'),

  body('periodicidad')
    .notEmpty()
    .withMessage('La periodicidad es obligatoria')
    .isIn(['Puntual', 'Peri_dica']) // CORREGIDO: Usar el nombre del enum de Prisma
    .withMessage('La periodicidad debe ser Puntual o Peri_dica'),

  body('fecha_inicio')
    .notEmpty()
    .withMessage('La fecha de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha de inicio debe tener un formato válido')
    .custom((value, { req }) => {
      const fechaInicio = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaInicio < hoy) {
        throw new Error('La fecha de inicio debe ser posterior a hoy');
      }
      return true;
    }),

  // Validación condicional para fecha_fin
  body('fecha_fin')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('La fecha de fin debe tener un formato válido')
    .custom((value, { req }) => {
      if (req.body.periodicidad === 'Peri_dica') { // CORREGIDO: Usar el nombre del enum
        if (!value) {
          throw new Error('La fecha de fin es obligatoria para actividades periódicas');
        }
        
        const fechaInicio = new Date(req.body.fecha_inicio);
        const fechaFin = new Date(value);
        
        if (fechaFin <= fechaInicio) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),

  body('hora_inicio')
    .notEmpty()
    .withMessage('La hora de inicio es obligatoria')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe tener un formato válido (HH:MM)')
    .custom((value) => {
      const [horas, minutos] = value.split(':').map(Number);
      const horaEnMinutos = horas * 60 + minutos;
      const horaMinima = 8 * 60; // 8:00
      const horaMaxima = 20 * 60; // 20:00
      
      if (horaEnMinutos < horaMinima || horaEnMinutos > horaMaxima) {
        throw new Error('La hora debe estar entre las 8:00 y las 20:00');
      }
      return true;
    }),

  body('hora_fin')
    .optional({ nullable: true })
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener un formato válido (HH:MM)')
    .custom((value, { req }) => {
      if (value) {
        const [horasInicio, minutosInicio] = req.body.hora_inicio.split(':').map(Number);
        const [horasFin, minutosFin] = value.split(':').map(Number);
        
        const horaInicioEnMinutos = horasInicio * 60 + minutosInicio;
        const horaFinEnMinutos = horasFin * 60 + minutosFin;
        
        if (horaFinEnMinutos <= horaInicioEnMinutos) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
        
        const horaMaxima = 20 * 60; // 20:00
        if (horaFinEnMinutos > horaMaxima) {
          throw new Error('La hora de fin no puede ser posterior a las 20:00');
        }
      }
      return true;
    }),

  body('lugar_id')
    .notEmpty()
    .withMessage('El lugar es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El lugar debe ser válido'),

  body('socio_comunitario_id')
    .notEmpty()
    .withMessage('El socio comunitario es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El socio comunitario debe ser válido'),

  body('proyecto_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El proyecto debe ser válido'),

  body('oferentes_ids')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un oferente'),

  body('beneficiarios_ids')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un beneficiario'),

  body('cupo')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El cupo debe ser un número positivo'),

  body('creado_por')
    .notEmpty()
    .withMessage('El usuario creador es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El usuario creador debe ser válido'),
];

// Middleware específico para validar que existen las relaciones en BD
// Middleware específico para validar que existen las relaciones en BD
const validateRelacionesExisten = async (req, res, next) => {
    // CORRECCIÓN: Usar los nombres correctos que vienen del frontend (snake_case)
    const { 
        tipo_actividad_id, 
        socio_comunitario_id, 
        proyecto_id, 
        oferentes_ids, 
        beneficiarios_ids,
        lugar_id,
        creado_por
    } = req.body;

    try {
        // Validar que existe el tipo de actividad
        if (tipo_actividad_id) {
            const tipoActividad = await prisma.tipos_actividad.findUnique({
                where: { id: parseInt(tipo_actividad_id) }
            });
            if (!tipoActividad) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El tipo de actividad seleccionado no existe'
                });
            }
        }

        // Validar que existe el socio comunitario
        if (socio_comunitario_id) {
            const socioComunitario = await prisma.socios_comunitarios.findUnique({
                where: { id: parseInt(socio_comunitario_id) }
            });
            if (!socioComunitario) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El socio comunitario seleccionado no existe'
                });
            }
        }

        // Validar lugar
        if (lugar_id) {
            const lugar = await prisma.lugares.findUnique({
                where: { id: parseInt(lugar_id) }
            });
            if (!lugar) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El lugar seleccionado no existe'
                });
            }
        }

        // Validar usuario creador
        if (creado_por) {
            const usuario = await prisma.usuarios.findUnique({
                where: { id: parseInt(creado_por) }
            });
            if (!usuario) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El usuario creador no existe'
                });
            }
        }

        // Validar proyecto si se proporciona
        if (proyecto_id) {
            const proyecto = await prisma.proyectos.findUnique({
                where: { id: parseInt(proyecto_id) }
            });
            if (!proyecto) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El proyecto seleccionado no existe'
                });
            }
        }

        // Validar oferentes
        if (oferentes_ids && Array.isArray(oferentes_ids) && oferentes_ids.length > 0) {
            const oferentesCount = await prisma.oferentes.count({
                where: { 
                    id: { in: oferentes_ids.map(id => parseInt(id)) },
                    activo: true // Asumiendo que tienes un campo activo
                }
            });
            if (oferentesCount !== oferentes_ids.length) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Uno o más oferentes seleccionados no existen o no están activos'
                });
            }
        }

        // Validar beneficiarios
        if (beneficiarios_ids && Array.isArray(beneficiarios_ids) && beneficiarios_ids.length > 0) {
            const beneficiariosCount = await prisma.beneficiarios.count({
                where: { 
                    id: { in: beneficiarios_ids.map(id => parseInt(id)) },
                    activo: true // Asumiendo que tienes un campo activo
                }
            });
            if (beneficiariosCount !== beneficiarios_ids.length) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Uno o más beneficiarios seleccionados no existen o no están activos'
                });
            }
        }

        next();
    } catch (error) {
        console.error('[Middleware ValidateRelaciones] Error:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al validar las relaciones en la base de datos'
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
        .trim()
        .escape(),

    // Validación del parámetro ID
    param('id')
        .notEmpty()
        .withMessage('Debe seleccionar una actividad para cancelar')
        .isInt({ min: 1 })
        .withMessage('El ID de la actividad debe ser un número válido'),

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

            // Verificar que la actividad no haya pasado
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0); // Resetear las horas para comparar solo fechas
            
            const fechaActividad = new Date(actividad.fecha_inicio);
            fechaActividad.setHours(0, 0, 0, 0);
            
            if (fechaActividad < fechaActual) {
                throw new Error('No se puede cancelar una actividad que ya ha ocurrido');
            }

            // Verificar que no esté completada
            if (actividad.estado === 'Completada') {
                throw new Error('No se puede cancelar una actividad que ya está completada');
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

const validateResetPassword = [
    body('token')
        .notEmpty()
        .withMessage('El token es obligatorio'),

    body('newPassword')
        .notEmpty()
        .withMessage('La nueva contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('La confirmación de contraseña es obligatoria')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
];







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
    validateResetPassword, 
};