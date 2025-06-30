const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const {
    lugar_id,
    fecha_inicio,
    hora_inicio,
    hora_fin
  } = req.body;

  if (!lugar_id || !fecha_inicio || !hora_inicio) {
    return next(); // Falta información esencial, no se puede validar
  }

  try {
    const actividadId = req.params.id;

    const horaInicioCompleta = new Date(`${fecha_inicio}T${hora_inicio}`);
    const horaFinCompleta = hora_fin ? new Date(`${fecha_inicio}T${hora_fin}`) : null;

    // Definimos el rango de fecha completa del día
    const fechaInicioDia = new Date(`${fecha_inicio}T00:00:00`);
    const fechaFinDia = new Date(`${fecha_inicio}T23:59:59`);

    const whereCondition = {
      lugar_id: parseInt(lugar_id),
      fecha: {
        gte: fechaInicioDia,
        lte: fechaFinDia
      },
      estado: { not: 'Cancelada' }
    };

    if (actividadId) {
      whereCondition.actividad_id = { not: parseInt(actividadId) };
    }

    if (horaFinCompleta) {
      whereCondition.OR = [
        {
          hora_inicio: {
            gte: horaInicioCompleta,
            lt: horaFinCompleta
          }
        },
        {
          hora_fin: {
            gt: horaInicioCompleta,
            lte: horaFinCompleta
          }
        },
        {
          AND: [
            { hora_inicio: { lte: horaInicioCompleta } },
            { hora_fin: { gte: horaFinCompleta } }
          ]
        }
      ];
    }

    const citaConflicto = await prisma.citas.findFirst({
      where: whereCondition,
      include: { lugares: true }
    });

    if (citaConflicto) {
      const lugar = citaConflicto.lugares;
      const fechaFormateada = citaConflicto.fecha.toLocaleDateString();
      const horaInicioFormateada = citaConflicto.hora_inicio.toLocaleTimeString();
      const horaFinFormateada = citaConflicto.hora_fin?.toLocaleTimeString();

      const mensaje = `El lugar ${lugar.nombre} ya está ocupado el ${fechaFormateada} de ${horaInicioFormateada}${horaFinFormateada ? ` a ${horaFinFormateada}` : ''}`;

      return res.status(409).json({
        exito: false,
        mensaje,
        codigo: 'CONFLICTO_HORARIO'
      });
    }

    next();
  } catch (error) {
    console.error('[Middleware ConflictosAgenda] Error al validar conflictos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al validar conflictos de agenda'
    });
  }
};
