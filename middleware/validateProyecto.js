// middleware/validateProyecto.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre, fechaInicio, fechaFin } = req.body;

  // Validar campo obligatorio: nombre
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del proyecto es obligatorio' });
  }

  const nombreLimpio = nombre.trim();

  // Validar duplicado
  const existente = await prisma.proyectos.findFirst({
    where: { nombre: nombreLimpio }
  });

  if (existente) {
    return res.status(409).json({ message: 'Ya existe un proyecto con este nombre' });
  }

  // Validar campo obligatorio: fechaInicio
  if (!fechaInicio) {
    return res.status(400).json({ message: 'La fecha de inicio es obligatoria' });
  }

  // Validar que fechaFin sea posterior a fechaInicio (si viene)
  if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
    return res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
  }

  next();
};
