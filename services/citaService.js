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
    try {
      const cita = await prisma.citas.create({
        data: {
          actividad_id: data.actividad_id,
          lugar_id: data.lugar_id,
          fecha: new Date(data.fecha),
          hora_inicio: data.hora_inicio,
          hora_fin: data.hora_fin,
          estado: data.estado || 'Programada',
          motivo_cancelacion: data.motivo_cancelacion || null,
          fecha_creacion: new Date(),
          creado_por: data.creado_por
        },
        include: {
          actividades: true,
          lugares: true
        }
      });
      console.log('[CitaService] Cita creada:', cita);
      return cita;
    } catch (error) {
      console.error('[CitaService] Error al crear cita:', error);
      throw new Error('Error al crear la cita');
    }
  }

  async actualizar(id, data) {
    try {
      const cita = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: {
          actividad_id: data.actividad_id,
          lugar_id: data.lugar_id,
          fecha: new Date(data.fecha),
          hora_inicio: data.hora_inicio,
          hora_fin: data.hora_fin,
          estado: data.estado,
          motivo_cancelacion: data.motivo_cancelacion || null,
          creado_por: data.creado_por
        }
      });
      console.log('[CitaService] Cita actualizada:', cita);
      return cita;
    } catch (error) {
      console.error('[CitaService] Error al actualizar cita:', error);
      throw new Error('Error al actualizar la cita');
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
