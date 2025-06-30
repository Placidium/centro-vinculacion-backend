const prisma = require('../utils/prisma');
const BaseService = require('./baseService');

class PermisosUsuarioService extends BaseService {
  constructor() {
    super(prisma.permisos_usuario, 'Permiso de Usuario');
  }

  async obtenerPorUsuario(usuarioId) {
  try {
    return await prisma.permisos_usuario.findMany({
      where: { usuario_id: parseInt(usuarioId) },
      select: { permiso: true } // 🔥 esto es lo que necesitas
    });
  } catch (error) {
    console.error('Error al obtener permisos por usuario:', error);
    throw new Error('No se pudieron obtener los permisos');
  }
}

async actualizarPermisos(usuarioId, listaPermisos) {
  try {
    // Eliminar permisos actuales
    await this.eliminarTodosPorUsuario(usuarioId);

    // Crear nuevos permisos
    const data = listaPermisos.map(p => ({
      usuario_id: parseInt(usuarioId),
      permiso: p
    }));

    // Inserción masiva
    return await prisma.permisos_usuario.createMany({ data });
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    throw new Error('No se pudieron actualizar los permisos');
  }
}

  async eliminarTodosPorUsuario(usuarioId) {
    try {
      return await prisma.permisos_usuario.deleteMany({
        where: { usuario_id: parseInt(usuarioId) }
      });
    } catch (error) {
      console.error('Error al eliminar permisos de usuario:', error);
      throw new Error('Error al eliminar permisos');
    }
  }
}

module.exports = new PermisosUsuarioService();
