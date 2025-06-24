// middleware/validateLugar.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre, cupo } = req.body;

  // Validación: nombre obligatorio
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del lugar es obligatorio' });
  }

  // Validación: nombre duplicado
  const nombreLimpio = nombre.trim();
  const yaExiste = await prisma.lugares.findFirst({
    where: { nombre: nombreLimpio }
  });

  if (yaExiste) {
    return res.status(409).json({ message: 'Ya existe un lugar con este nombre' });
  }

  // Validación: cupo numérico positivo
  const numeroCupo = Number(cupo);
  if (isNaN(numeroCupo) || numeroCupo <= 0) {
    return res.status(400).json({ message: 'El cupo debe ser un número positivo' });
  }

  next();
};
