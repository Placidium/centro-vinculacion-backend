// services/usuarioService.js

const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

class UsuarioService {
async listar() {
  try {
    const usuarios = await prisma.usuarios.findMany({
  include: {
    permisos_usuario_permisos_usuario_usuario_idTousuarios: true
  },
  orderBy: { fecha_creacion: 'desc' }
});

    return usuarios;
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    throw new Error('Error al obtener usuarios');
  }
}


async obtenerPorId(id) {
  try {
    return await prisma.usuarios.findUnique({
      where: { id: parseInt(id) },
      include: {
        permisos_usuario_permisos_usuario_usuario_idTousuarios: true
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('No se pudo obtener el usuario');
  }
}



  async crear(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          password: hashedPassword
        }
      });
      return nuevoUsuario;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error('No se pudo crear el usuario');
    }
  }

  async actualizar(id, data) {
    try {
      const actualizado = await prisma.usuarios.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          email: data.email
        }
      });
      return actualizado;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error('No se pudo actualizar el usuario');
    }
  }

  async eliminar(id) {
    try {
      return await prisma.usuarios.delete({ where: { id: parseInt(id) } });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error('No se pudo eliminar el usuario');
    }
  }
    // Eliminar todos los permisos actuales de un usuario
  async eliminarPermisos(usuarioId) {
    try {
      return await prisma.permisos_usuario.deleteMany({
        where: { usuario_id: parseInt(usuarioId) }
      });
    } catch (error) {
      console.error('Error al eliminar permisos del usuario:', error);
      throw new Error('No se pudieron eliminar los permisos');
    }
  }

  // Asignar nuevos permisos al usuario
  async asignarPermisos(usuarioId, listaPermisos, asignadoPor) {
    try {
      const data = listaPermisos.map(nombre => ({
        usuario_id: parseInt(usuarioId),
        permiso: nombre,
        fecha_asignacion: new Date(),
        asignado_por: asignadoPor
      }));

      return await prisma.permisos_usuario.createMany({ data });
    } catch (error) {
      console.error('Error al asignar permisos:', error);
      throw new Error('No se pudieron asignar los permisos');
    }
  }

}



const usuarioService = new UsuarioService();
module.exports = usuarioService;
