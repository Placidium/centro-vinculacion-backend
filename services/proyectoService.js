const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProyectoService {
  async obtenerTodos() {
    try {
      const proyectos = await prisma.proyectos.findMany({
        orderBy: { fecha_inicio: 'desc' }
      });
      console.log('[ProyectoService] Proyectos obtenidos');
      return proyectos;
    } catch (error) {
      console.error('[ProyectoService] Error al obtener proyectos:', error);
      throw new Error('Error al obtener los proyectos');
    }
  }

async crear(data) {
  try {
    console.log('[DEBUG] Proyecto recibido en crear:', data);

    const fechaInicioParsed = new Date(data.fecha_inicio);
    const fechaFinParsed = data.fecha_fin ? new Date(data.fecha_fin) : null;

    if (isNaN(fechaInicioParsed)) {
      throw new Error('❌ fecha_inicio es inválida');
    }

    if (fechaFinParsed && isNaN(fechaFinParsed)) {
      throw new Error('❌ fecha_fin es inválida');
    }

    const proyecto = await prisma.proyectos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fecha_inicio: fechaInicioParsed,
        fecha_fin: fechaFinParsed,
        activo: data.activo ?? true
      }
    });

    console.log('[✅ Proyecto creado]', proyecto);
    return proyecto;
  } catch (error) {
    console.error('[💥 Error al crear proyecto]:', error.message);
    throw new Error(error.message || 'Error al crear proyecto');
  }
}




  async actualizar(id, data) {
    try {
      const proyecto = await prisma.proyectos.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion || null,
        fecha_inicio: new Date(data.fecha_inicio),
fecha_fin: new Date(data.fecha_fin),

          activo: data.activo
        }
      });
      console.log('[ProyectoService] Proyecto actualizado:', proyecto);
      return proyecto;
    } catch (error) {
      console.error('[ProyectoService] Error al actualizar proyecto:', error);
      throw new Error('Error al actualizar el proyecto');
    }
  }

  async eliminar(id) {
    try {
      const proyecto = await prisma.proyectos.delete({
        where: { id: parseInt(id) }
      });
      console.log('[ProyectoService] Proyecto eliminado:', proyecto);
      return proyecto;
    } catch (error) {
      console.error('[ProyectoService] Error al eliminar proyecto:', error);
      throw new Error('Error al eliminar el proyecto');
    }
  }

  async obtenerPorId(id) {
    try {
      const proyecto = await prisma.proyectos.findUnique({
        where: { id: parseInt(id) }
      });
      if (!proyecto) {
        console.log('[ProyectoService] Proyecto no encontrado');
        return null;
      }
      console.log('[ProyectoService] Proyecto encontrado:', proyecto);
      return proyecto;
    } catch (error) {
      console.error('[ProyectoService] Error al buscar proyecto:', error);
      throw new Error('Error al buscar el proyecto');
    }
  }
}

module.exports = new ProyectoService();
