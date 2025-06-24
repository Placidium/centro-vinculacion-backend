const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ArchivoService {
  async obtenerTodos() {
    try {
      const archivos = await prisma.archivos.findMany({
        include: {
          actividades: true,
          citas: true
        },
        orderBy: { id: 'desc' }
      });
      console.log('[ArchivoService] Archivos obtenidos');
      return archivos;
    } catch (error) {
      console.error('[ArchivoService] Error al obtener archivos:', error);
      throw new Error('Error al obtener los archivos');
    }
  }

  async subirArchivo({ nombre, ruta, tipo, actividad_id, cita_id }) {
    try {
      const archivo = await prisma.archivos.create({
        data: {
          nombre,
          ruta,
          tipo,
          actividad_id: actividad_id || null,
          cita_id: cita_id || null,
          // Agrega campos necesarios, por ejemplo: tamano, tipo_adjunto, descripcion, cargado_por
        }
      });
      console.log('[ArchivoService] Archivo guardado:', archivo);
      return archivo;
    } catch (error) {
      console.error('[ArchivoService] Error al guardar archivo:', error);
      throw new Error('Error al guardar el archivo');
    }
  }

  async eliminar(id) {
    try {
      const archivo = await prisma.archivos.delete({
        where: { id: parseInt(id) }
      });
      console.log('[ArchivoService] Archivo eliminado:', archivo);
      return archivo;
    } catch (error) {
      console.error('[ArchivoService] Error al eliminar archivo:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }
}

module.exports = new ArchivoService();
