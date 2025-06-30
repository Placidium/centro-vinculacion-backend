const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CitaService {
  async obtenerTodas() {
    try {
      const citas = await prisma.citas.findMany({
        include: {
          actividades: true,
          lugares: true
        },
        orderBy: { fecha: 'desc' }
      });
      console.log('[CitaService] Citas obtenidas');
      return citas;
    } catch (error) {
      console.error('[CitaService] Error al obtener citas:', error);
      throw new Error('Error al obtener las citas');
    }
  }

  async obtenerPorId(id) {
    try {
      const cita = await prisma.citas.findUnique({
        where: { id: parseInt(id) },
        include: {
          actividades: true,
          lugares: true
        }
      });
      if (!cita) {
        console.log('[CitaService] Cita no encontrada');
        return null;
      }
      console.log('[CitaService] Cita encontrada:', cita);
      return cita;
    } catch (error) {
      console.error('[CitaService] Error al buscar cita:', error);
      throw new Error('Error al buscar la cita');
    }
  }

  async crear(data) {
    const { actividad_id, lugar_id, fecha, hora_inicio, hora_fin, creado_por } = data;

    try {
      console.log('--- Verificando conflicto de lugar ---');
      console.log('Lugar:', lugar_id);
      console.log('Fecha:', new Date(fecha));
      console.log('Hora inicio:', hora_inicio);
      console.log('Hora fin:', hora_fin);

      // Validar conflicto de lugar
      const conflictoLugar = await prisma.citas.findFirst({
        where: {
          lugar_id: lugar_id,
          fecha: new Date(fecha),
          estado: 'Programada',
          AND: [
            {
              hora_inicio: { lt: hora_fin }
            },
            {
              hora_fin: { gt: hora_inicio }
            }
          ]
        }
      });

      if (conflictoLugar) {
        throw new Error('Conflicto: el lugar ya está ocupado en ese horario.');
      }

      // Obtener oferentes de la actividad
      const oferentes = await prisma.actividades_oferentes.findMany({
        where: { actividad_id },
        select: { oferente_id: true }
      });

      const oferenteIds = oferentes.map(o => o.oferente_id);

      // Validar conflicto de oferente
      const conflictoOferente = await prisma.citas.findFirst({
        where: {
          fecha: new Date(fecha),
          estado: 'Programada',
          actividades: {
            actividades_oferentes: {
              some: {
                oferente_id: { in: oferenteIds }
              }
            }
          },
          AND: [
            { hora_inicio: { lt: hora_fin } },
            { hora_fin: { gt: hora_inicio } }
          ]
        }
      });

      if (conflictoOferente) {
        throw new Error('Conflicto: un oferente ya tiene otra cita en ese horario.');
      }

      // Crear la cita si no hay conflicto
      const cita = await prisma.citas.create({
        data: {
          actividad_id,
          lugar_id,
          fecha: new Date(fecha),
          hora_inicio,
          hora_fin,
          estado: data.estado || 'Programada',
          motivo_cancelacion: data.motivo_cancelacion || null,
          fecha_creacion: new Date(),
          creado_por
        },
        include: {
          actividades: true,
          lugares: true
        }
      });

      console.log('[CitaService] Cita creada sin conflictos:', cita);
      return cita;

    } catch (error) {
      console.error('[CitaService] Error en creación de cita:', error.message);
      throw new Error(error.message || 'Error al crear la cita');
    }
  }

  async actualizar(id, data) {
    const { actividad_id, lugar_id, fecha, hora_inicio, hora_fin, estado, motivo_cancelacion, creado_por } = data;

    try {
      // Validar conflicto de lugar (excluyendo la cita actual)
      const conflictoLugar = await prisma.citas.findFirst({
        where: {
          id: { not: parseInt(id) },
          lugar_id: lugar_id,
          fecha: new Date(fecha),
          estado: 'Programada',
          AND: [
            { hora_inicio: { lt: hora_fin } },
            { hora_fin: { gt: hora_inicio } }
          ]
        }
      });

      if (conflictoLugar) {
        throw new Error('Conflicto: el lugar ya está ocupado en ese horario.');
      }

      // Obtener oferentes de la actividad
      const oferentes = await prisma.actividades_oferentes.findMany({
        where: { actividad_id },
        select: { oferente_id: true }
      });

      const oferenteIds = oferentes.map(o => o.oferente_id);

      // Validar conflicto de oferente (excluyendo la cita actual)
      const conflictoOferente = await prisma.citas.findFirst({
        where: {
          id: { not: parseInt(id) },
          fecha: new Date(fecha),
          estado: 'Programada',
          actividades: {
            actividades_oferentes: {
              some: {
                oferente_id: { in: oferenteIds }
              }
            }
          },
          AND: [
            { hora_inicio: { lt: hora_fin } },
            { hora_fin: { gt: hora_inicio } }
          ]
        }
      });

      if (conflictoOferente) {
        throw new Error('Conflicto: un oferente ya tiene otra cita en ese horario.');
      }

      // Si no hay conflictos, actualizar la cita
      const cita = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: {
          actividad_id,
          lugar_id,
          fecha: new Date(fecha),
          hora_inicio,
          hora_fin,
          estado,
          motivo_cancelacion: motivo_cancelacion || null,
          creado_por
        },
        include: {
          actividades: true,
          lugares: true
        }
      });

      console.log('[CitaService] Cita actualizada sin conflictos:', cita);
      return cita;

    } catch (error) {
      console.error('[CitaService] Error en actualización de cita:', error.message);
      throw new Error(error.message || 'Error al actualizar la cita');
    }
  }

  async eliminar(id) {
    try {
      const cita = await prisma.citas.delete({
        where: { id: parseInt(id) }
      });
      console.log('[CitaService] Cita eliminada:', cita);
      return cita;
    } catch (error) {
      console.error('[CitaService] Error al eliminar cita:', error);
      throw new Error('Error al eliminar la cita');
    }
  }
}

module.exports = new CitaService();