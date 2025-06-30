const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BeneficiarioService {
  async obtenerTodos() {
    try {
      const beneficiarios = await prisma.beneficiarios.findMany({
        // Quitar el filtro where para mostrar todos (activos e inactivos)
        orderBy: { id: 'asc' }
      });
      console.log('[BeneficiarioService] Beneficiarios obtenidos');
      return beneficiarios;
    } catch (error) {
      console.error('[BeneficiarioService] Error al obtener beneficiarios:', error);
      throw new Error('Error al obtener los beneficiarios');
    }
  }

  async crear(data) {
    try {
      const beneficiario = await prisma.beneficiarios.create({
        data: {
          caracterizacion: data.caracterizacion,
          activo: data.activo ?? true
        }
      });
      console.log('[BeneficiarioService] Beneficiario creado:', beneficiario);
      return beneficiario;
    } catch (error) {
      console.error('[BeneficiarioService] Error al crear beneficiario:', error);
      throw new Error('Error al crear el beneficiario');
    }
  }

  async actualizar(id, data) {
    try {
      const beneficiario = await prisma.beneficiarios.update({
        where: { id: parseInt(id) },
        data: {
          caracterizacion: data.caracterizacion,
          activo: data.activo
        }
      });
      console.log('[BeneficiarioService] Beneficiario actualizado:', beneficiario);
      return beneficiario;
    } catch (error) {
      console.error('[BeneficiarioService] Error al actualizar beneficiario:', error);
      throw new Error('Error al actualizar el beneficiario');
    }
  }

  async eliminar(id) {
    try {
      // Verificar si el beneficiario está siendo utilizado en actividades
      const actividades = await prisma.actividades_beneficiarios.findMany({
        where: { beneficiario_id: parseInt(id) }
      });

      if (actividades.length > 0) {
        throw new Error('No se puede eliminar porque está siendo utilizado en actividades.');
      }

      const beneficiario = await prisma.beneficiarios.delete({
        where: { id: parseInt(id) }
      });
      console.log('[BeneficiarioService] Beneficiario eliminado:', beneficiario);
      return beneficiario;
    } catch (error) {
      console.error('[BeneficiarioService] Error al eliminar beneficiario:', error);
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      const beneficiario = await prisma.beneficiarios.findUnique({
        where: { id: parseInt(id) }
      });
      if (!beneficiario) {
        console.log('[BeneficiarioService] Beneficiario no encontrado');
        return null;
      }
      console.log('[BeneficiarioService] Beneficiario encontrado:', beneficiario);
      return beneficiario;
    } catch (error) {
      console.error('[BeneficiarioService] Error al buscar beneficiario:', error);
      throw new Error('Error al buscar el beneficiario');
    }
  }
}

module.exports = new BeneficiarioService();