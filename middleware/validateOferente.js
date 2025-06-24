// middleware/validateOferente.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre, docenteResponsable } = req.body;

  // Validación: nombre obligatorio
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del oferente es obligatorio' });
  }

  // Validación: nombre no duplicado
  const nombreLimpio = nombre.trim();
  const yaExiste = await prisma.oferentes.findFirst({
    where: { nombre: nombreLimpio }
  });

  if (yaExiste) {
    return res.status(409).json({ message: 'Ya existe un oferente con este nombre' });
  }

  // Validación: docente responsable obligatorio
  if (!docenteResponsable || docenteResponsable.trim() === '') {
    return res.status(400).json({ message: 'El docente responsable es obligatorio' });
  }

  next();
};
