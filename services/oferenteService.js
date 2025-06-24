const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OferenteService {
  async obtenerTodos() {
    try {
      const oferentes = await prisma.oferentes.findMany({
        orderBy: { nombre: 'asc' }
      });
      console.log('[OferenteService] Oferentes obtenidos');
      return oferentes;
    } catch (error) {
      console.error('[OferenteService] Error al obtener oferentes:', error);
      throw new Error('Error al obtener los oferentes');
    }
  }

  async crear(data) {
    try {
      const oferente = await prisma.oferentes.create({
        data: {
          nombre: data.nombre,
          docente_responsable: data.docente_responsable,
          activo: data.activo
        }
      });
      console.log('[OferenteService] Oferente creado:', oferente);
      return oferente;
    } catch (error) {
      console.error('[OferenteService] Error al crear oferente:', error);
      throw new Error('Error al crear el oferente');
    }
  }

  async actualizar(id, data) {
    try {
      const oferente = await prisma.oferentes.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          docente_responsable: data.docente_responsable,
          activo: data.activo
        }
      });
      console.log('[OferenteService] Oferente actualizado:', oferente);
      return oferente;
    } catch (error) {
      console.error('[OferenteService] Error al actualizar oferente:', error);
      throw new Error('Error al actualizar el oferente');
    }
  }

  async eliminar(id) {
    try {
      const oferente = await prisma.oferentes.delete({
        where: { id: parseInt(id) }
      });
      console.log('[OferenteService] Oferente eliminado:', oferente);
      return oferente;
    } catch (error) {
      console.error('[OferenteService] Error al eliminar oferente:', error);
      throw new Error('Error al eliminar el oferente');
    }
  }

  async obtenerPorId(id) {
    try {
      const oferente = await prisma.oferentes.findUnique({
        where: { id: parseInt(id) }
      });
      if (!oferente) {
        console.log('[OferenteService] Oferente no encontrado');
        return null;
      }
      console.log('[OferenteService] Oferente encontrado:', oferente);
      return oferente;
    } catch (error) {
      console.error('[OferenteService] Error al obtener oferente:', error);
      throw new Error('Error al buscar el oferente');
    }
  }
}

module.exports = new OferenteService();
