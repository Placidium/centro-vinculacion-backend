// middleware/validateTipoActividad.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = async (req, res, next) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del tipo de actividad es obligatorio' });
  }

  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length > 100) {
    return res.status(400).json({ message: 'El nombre no puede exceder los 100 caracteres' });
  }

const existente = await prisma.tipos_actividad.findFirst({

    where: { nombre: nombreLimpio }
  });

  if (existente) {
    return res.status(409).json({ message: 'Ya existe un tipo de actividad con este nombre' });
  }

  if (!descripcion || descripcion.trim() === '') {
    return res.status(400).json({ message: 'La descripción es obligatoria' });
  }

  if (descripcion.trim().length > 500) {
    return res.status(400).json({ message: 'La descripción no puede exceder los 500 caracteres' });
  }

  next();
};
