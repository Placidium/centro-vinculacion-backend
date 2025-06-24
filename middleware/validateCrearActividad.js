// middleware/validateCrearActividad.js
const { body, validationResult } = require('express-validator');

const validateCrearActividad = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),

  body('tipoActividadId')
    .isInt({ gt: 0 }).withMessage('El tipo de actividad es obligatorio'),

  body('periodicidad')
    .notEmpty().withMessage('La periodicidad es obligatoria'),

  body('fechaInicio')
    .isISO8601().toDate().withMessage('La fecha de inicio debe ser válida'),

  body('fechaFin')
    .optional({ nullable: true })
    .isISO8601().toDate().withMessage('La fecha de fin debe ser válida'),

  body('socioComunitarioId')
    .isInt({ gt: 0 }).withMessage('El socio comunitario es obligatorio'),

  // Puedes agregar más validaciones si quieres

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = validateCrearActividad;
