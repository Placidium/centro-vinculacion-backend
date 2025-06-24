const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SocioComunitarioService {
  async obtenerTodos() {
    try {
      const socios = await prisma.socios_comunitarios.findMany({
        orderBy: { nombre: 'asc' }
      });
      console.log('[SocioComunitarioService] Socios comunitarios obtenidos');
      return socios;
    } catch (error) {
      console.error('[SocioComunitarioService] Error al obtener socios comunitarios:', error);
      throw new Error('Error al obtener los socios comunitarios');
    }
  }

  async crear(data) {
    try {
      const socio = await prisma.socios_comunitarios.create({
        data: {
          nombre: data.nombre,
          activo: data.activo
        }
      });
      console.log('[SocioComunitarioService] Socio comunitario creado:', socio);
      return socio;
    } catch (error) {
      console.error('[SocioComunitarioService] Error al crear socio:', error);
      throw new Error('Error al crear el socio comunitario');
    }
  }

  async actualizar(id, data) {
    try {
      const socio = await prisma.socios_comunitarios.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          activo: data.activo
        }
      });
      console.log('[SocioComunitarioService] Socio comunitario actualizado:', socio);
      return socio;
    } catch (error) {
      console.error('[SocioComunitarioService] Error al actualizar socio:', error);
      throw new Error('Error al actualizar el socio comunitario');
    }
  }

  async eliminar(id) {
    try {
      const socio = await prisma.socios_comunitarios.delete({
        where: { id: parseInt(id) }
      });
      console.log('[SocioComunitarioService] Socio comunitario eliminado:', socio);
      return socio;
    } catch (error) {
      console.error('[SocioComunitarioService] Error al eliminar socio:', error);
      throw new Error('Error al eliminar el socio comunitario');
    }
  }

  async obtenerPorId(id) {
    try {
      const socio = await prisma.socios_comunitarios.findUnique({
        where: { id: parseInt(id) }
      });
      if (!socio) {
        console.log('[SocioComunitarioService] Socio comunitario no encontrado');
        return null;
      }
      console.log('[SocioComunitarioService] Socio comunitario encontrado:', socio);
      return socio;
    } catch (error) {
      console.error('[SocioComunitarioService] Error al buscar socio:', error);
      throw new Error('Error al buscar el socio comunitario');
    }
  }
}

module.exports = new SocioComunitarioService();
