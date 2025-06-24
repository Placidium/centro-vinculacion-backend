const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReportesService {
  // Reporte de ocupación de lugares
  async getOccupancyReport() {
    try {
      const datos = await prisma.citas.groupBy({
        by: ['lugar_id'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });

      return datos;
    } catch (error) {
      console.error('[ReportesService] Error en getOccupancyReport:', error);
      throw new Error('Error al generar el reporte de ocupación');
    }
  }

  // Reporte de actividades por tipo
  async getActivitiesByTypeReport() {
    try {
      const datos = await prisma.actividades.groupBy({
        by: ['tipo_actividad_id'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });

      return datos;
    } catch (error) {
      console.error('[ReportesService] Error en getActivitiesByTypeReport:', error);
      throw new Error('Error al generar el reporte de actividades por tipo');
    }
  }

  // Reporte de cancelaciones
  async getCancellationsReport() {
    try {
      const datos = await prisma.citas.findMany({
        where: {
          estado: 'Cancelada'  // Enum con mayúscula según esquema
        },
        include: {
          lugares: true,
          actividades: true
        },
        orderBy: {
          fecha: 'desc'
        }
      });

      return datos;
    } catch (error) {
      console.error('[ReportesService] Error en getCancellationsReport:', error);
      throw new Error('Error al generar el reporte de cancelaciones');
    }
  }

  // Reporte general
  async getGeneralStatistics() {
    try {
      const totalUsuarios = await prisma.usuarios.count();
      const totalActividades = await prisma.actividades.count();
      const totalCitas = await prisma.citas.count();
      const totalProyectos = await prisma.proyectos.count();

      return {
        totalUsuarios,
        totalActividades,
        totalCitas,
        totalProyectos
      };
    } catch (error) {
      console.error('[ReportesService] Error en getGeneralStatistics:', error);
      throw new Error('Error al obtener estadísticas generales');
    }
  }

  // Reporte de actividades por fecha
  async getActivitiesByDateReport(fecha_inicio, fecha_fin) {
    try {
      const actividades = await prisma.actividades.findMany({
        where: {
          fecha_inicio: {
            gte: new Date(fecha_inicio),
            lte: new Date(fecha_fin)
          }
        },
        include: {
          tipos_actividad: true,
          proyectos: true
        },
        orderBy: {
          fecha_inicio: 'asc'
        }
      });

      return actividades;
    } catch (error) {
      console.error('[ReportesService] Error en getActivitiesByDateReport:', error);
      throw new Error('Error al obtener actividades por fecha');
    }
  }

  // Reporte de archivos subidos
  async getUploadedFilesReport() {
    try {
      const archivos = await prisma.archivos.findMany({
        include: {
          actividades: true,
          usuarios: true
        },
        orderBy: {
          fecha_carga: 'desc'  // Ajustado según esquema
        }
      });

      return archivos;
    } catch (error) {
      console.error('[ReportesService] Error en getUploadedFilesReport:', error);
      throw new Error('Error al obtener reporte de archivos');
    }
  }
}

module.exports = new ReportesService();
