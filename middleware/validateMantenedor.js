// middleware/validateMantenedor.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre } = req.body;

  // Validación: campo requerido
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  // Validación: longitud máxima
  if (nombre.length > 100) {
    return res.status(400).json({ message: 'El nombre no puede exceder los 100 caracteres' });
  }

  // Validación: nombre duplicado
  const existente = await prisma.mantenedor.findFirst({
    where: { nombre: nombre.trim() }
  });

  if (existente) {
    return res.status(409).json({ message: 'Ya existe un registro con este nombre' });
  }

  next();
};
