// middleware/validateSocioComunitario.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre } = req.body;

  // Validación: campo requerido
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del socio comunitario es obligatorio' });
  }

  // Validación: nombre no duplicado
  const nombreLimpio = nombre.trim();
  const existente = await prisma.socios_comunitarios.findFirst({
    where: { nombre: nombreLimpio }
  });

  if (existente) {
    return res.status(409).json({ message: 'Ya existe un socio comunitario con este nombre' });
  }

  next();
};
