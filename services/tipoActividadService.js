const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TipoActividadService {
  async obtenerTodos(activoSolo = true) {
    try {
      // CAMBIO: Filtrar correctamente por activos
      const whereClause = activoSolo ? { activo: true } : {};
      const tipos = await prisma.tipos_actividad.findMany({
        where: whereClause,
        orderBy: { nombre: 'asc' }
      });
      console.log('[TipoActividadService] Tipos de actividad obtenidos:', tipos.length);
      return tipos;
    } catch (error) {
      console.error('[TipoActividadService] Error al obtener tipos de actividad:', error);
      throw new Error('Error al obtener los tipos de actividad');
    }
  }

  async crear(datos) {
    try {
      const tipo = await prisma.tipos_actividad.create({
        data: {
          nombre: datos.nombre.trim(),
          descripcion: datos.descripcion ? datos.descripcion.trim() : '',
          activo: true // Asegurar que se crea como activo
        }
      });
      console.log('[TipoActividadService] Tipo de actividad creado:', tipo);
      return tipo;
    } catch (error) {
       console.error('[TipoActividadService] Error al crear tipo de actividad:', error);
        throw error;
    }
  }

  async actualizar(id, datos) {
    try {
      const tipo = await prisma.tipos_actividad.update({
        where: { id: parseInt(id) },
        data: {
          nombre: datos.nombre.trim(),
          descripcion: datos.descripcion ? datos.descripcion.trim() : ''
        }
      });
      console.log('[TipoActividadService] Tipo de actividad actualizado:', tipo);
      return tipo;
    } catch (error) {
      console.error('[TipoActividadService] Error al actualizar tipo de actividad:', error);
      throw new Error('Error al actualizar el tipo de actividad');
    }
  }

  async eliminar(id) {
    try {
      // Soft delete - marcar como inactivo en lugar de eliminar
      const tipo = await prisma.tipos_actividad.update({
        where: { id: parseInt(id) },
        data: { activo: false }
      });
      console.log('[TipoActividadService] Tipo de actividad desactivado:', tipo);
      return tipo;
    } catch (error) {
      console.error('[TipoActividadService] Error al eliminar tipo de actividad:', error);
      throw new Error('Error al eliminar el tipo de actividad');
    }
  }

  async obtenerPorId(id) {
    try {
      const tipo = await prisma.tipos_actividad.findUnique({
        where: { id: parseInt(id) }
      });
      if (!tipo) {
        console.log('[TipoActividadService] Tipo de actividad no encontrado');
        return null;
      }
      console.log('[TipoActividadService] Tipo de actividad encontrado:', tipo);
      return tipo;
    } catch (error) {
      console.error('[TipoActividadService] Error al obtener tipo de actividad:', error);
      throw new Error('Error al buscar el tipo de actividad');
    }
  }
}

module.exports = new TipoActividadService();
