const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LugarService {
  async obtenerTodos() {
    try {
      const lugares = await prisma.lugares.findMany({ orderBy: { nombre: 'asc' } });
      console.log('[LugarService] Lugares obtenidos');
      return lugares;
    } catch (error) {
      console.error('[LugarService] Error al obtener lugares:', error);
      throw new Error('Error al obtener los lugares');
    }
  }

  async crear(data) {
    try {
      const lugar = await prisma.lugares.create({
        data: {
          nombre: data.nombre,
          cupo: data.cupo,
          activo: data.activo
        }
      });
      console.log('[LugarService] Lugar creado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al crear lugar:', error);
      throw new Error('Error al crear el lugar');
    }
  }

  async actualizar(id, data) {
    try {
      const lugar = await prisma.lugares.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          cupo: data.cupo,
          activo: data.activo
        }
      });
      console.log('[LugarService] Lugar actualizado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al actualizar lugar:', error);
      throw new Error('Error al actualizar el lugar');
    }
  }

  async eliminar(id) {
    try {
      const lugar = await prisma.lugares.delete({
        where: { id: parseInt(id) }
      });
      console.log('[LugarService] Lugar eliminado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al eliminar lugar:', error);
      throw new Error('Error al eliminar el lugar');
    }
  }

  async obtenerPorId(id) {
    try {
      const lugar = await prisma.lugares.findUnique({
        where: { id: parseInt(id) }
      });
      if (!lugar) {
        console.log('[LugarService] Lugar no encontrado');
        return null;
      }
      console.log('[LugarService] Lugar encontrado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al obtener lugar:', error);
      throw new Error('Error al buscar el lugar');
    }
  }
}

module.exports = new LugarService();
