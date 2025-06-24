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
        include: { usuarios_permisos_usuario_usuario_idTousuarios: true }
      });
    } catch (error) {
      console.error('Error al obtener permisos por usuario:', error);
      throw new Error('No se pudieron obtener los permisos');
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
