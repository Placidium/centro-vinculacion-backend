const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { nombre, docente_responsable } = req.body;
  const { id } = req.params; // Para actualizaciones

  // Validación: nombre obligatorio
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ exito: false, mensaje: 'El nombre del oferente es obligatorio' });
  }

  // Validación: nombre no duplicado
  const nombreLimpio = nombre.trim();
  const whereClause = { nombre: nombreLimpio };
  
  // Si es una actualización, excluir el registro actual
  if (id) {
    whereClause.id = { not: parseInt(id) };
  }

  const yaExiste = await prisma.oferentes.findFirst({
    where: whereClause
  });

  if (yaExiste) {
    return res.status(409).json({ exito: false, mensaje: 'Ya existe un oferente con este nombre' });
  }

  // Validación: docente responsable obligatorio
  if (!docente_responsable || docente_responsable.trim() === '') {
    return res.status(400).json({ exito: false, mensaje: 'El docente responsable es obligatorio' });
  }

  next();
};
