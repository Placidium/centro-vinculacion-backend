// middleware/validateConflictosAgenda.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const {
    lugarId,            // O el campo que uses para identificar el lugar
    fechaInicio,
    fechaFin
  } = req.body;

  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio) || isNaN(fin) || fin <= inicio) {
      return res.status(400).json({ message: 'Las fechas son inválidas o incoherentes.' });
    }

    // Validar si el lugar ya está reservado
    const lugarOcupado = await prisma.actividades.findFirst({
      where: {
        lugar_id: lugarId,
        OR: [
          {
            fechaInicio: { lte: fin },
            fechaFin: { gte: inicio }
          }
        ]
      }
    });

    if (lugarOcupado) {
      return res.status(409).json({ message: 'El lugar ya está reservado para esta fecha y hora' });
    }

    // Validar si hay otra actividad solapada (sin importar el lugar)
    const actividadSolapada = await prisma.actividades.findFirst({
      where: {
        OR: [
          {
            fechaInicio: { lte: fin },
            fechaFin: { gte: inicio }
          }
        ]
      }
    });

    if (actividadSolapada) {
      return res.status(409).json({ message: 'Ya existe otra actividad programada para esta fecha y hora' });
    }

    next();
  } catch (error) {
    console.error('[Middleware ConflictosAgenda] Error al validar conflictos:', error);
    res.status(500).json({ message: 'Error al validar conflictos de agenda' });
  }
};
