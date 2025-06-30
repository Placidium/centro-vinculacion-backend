const prisma = require('../utils/prisma');

/**
 * Middleware para validar proyectos antes de crear o actualizar.
 * @param {'crear' | 'actualizar'} modo
 */
module.exports = (modo = 'crear') => {
  return async (req, res, next) => {
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    // Validar campo obligatorio: nombre
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre del proyecto es obligatorio' });
    }

    const nombreLimpio = nombre.trim();

    // Validar duplicado solo en modo "crear"
    if (modo === 'crear') {
      const existente = await prisma.proyectos.findFirst({
        where: { nombre: nombreLimpio }
      });

      if (existente) {
        return res.status(409).json({ message: 'Ya existe un proyecto con este nombre' });
      }
    }

    // Validar campo obligatorio: fecha_inicio
    if (!fecha_inicio) {
      return res.status(400).json({ message: 'La fecha de inicio es obligatoria' });
    }

    // Validar formato de fechas
    const fechaInicioDate = new Date(fecha_inicio);
    const fechaFinDate = fecha_fin ? new Date(fecha_fin) : null;

    if (isNaN(fechaInicioDate.getTime())) {
      return res.status(400).json({ message: 'La fecha de inicio no es válida' });
    }

    if (fechaFinDate && isNaN(fechaFinDate.getTime())) {
      return res.status(400).json({ message: 'La fecha de fin no es válida' });
    }

    if (fechaFinDate && fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({ message: 'La fecha de fin debe ser posterior a la de inicio' });
    }

    next();
  };
};
