const usuarioService = require('../services/usuarioService');

const usuariosController = {
  // Obtener todos los usuarios
  listar: async (req, res) => {
    try {
      const usuarios = await usuarioService.listar();
      res.json({ success: true, data: usuarios });
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ success: false, message: 'Error interno al obtener los usuarios' });
    }
  },

  // Obtener un usuario por ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.obtenerPorId(id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno al obtener el usuario' });
    }
  },

  // Crear un nuevo usuario
  crear: async (req, res) => {
    try {
      const { nombre, email, password } = req.body;
      if (!nombre || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios' });
      }

      const usuario = await usuarioService.crear({ nombre, email, password });
      res.status(201).json({ success: true, data: usuario });
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno al crear el usuario' });
    }
  },

  // Actualizar un usuario
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, email } = req.body;
      const usuario = await usuarioService.actualizar(id, { nombre, email });

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: usuario });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno al actualizar el usuario' });
    }
  },

  // Eliminar un usuario
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await usuarioService.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado o ya fue eliminado' });
      }

      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno al eliminar el usuario' });
    }
  }
};

module.exports = usuariosController;
