// services/usuarioService.js

const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

class UsuarioService {
  async listar() {
    try {
      const usuarios = await prisma.usuarios.findMany({
        select: {
          id: true,
          nombre: true,
          email: true,
          fecha_creacion: true,
          ultimo_acceso: true,
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
        select: {
          id: true,
          nombre: true,
          email: true,
          fecha_creacion: true,
          ultimo_acceso: true,
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
}

module.exports = new UsuarioService();
