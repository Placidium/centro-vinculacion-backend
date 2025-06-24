 const permisosService = require('../services/permisosUsuarioService');

const permisosUsuarioController = {
  listarPorUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const permisos = await permisosService.obtenerPorUsuario(id);
      res.json({ success: true, data: permisos });
    } catch (error) {
      console.error('Error al listar permisos del usuario:', error);
      res.status(500).json({ success: false, message: 'No se pudieron obtener los permisos' });
    }
  },

  asignarPermiso: async (req, res) => {
    try {
      const { usuario_id, permiso, asignado_por } = req.body;
      const nuevo = await permisosService.crear({
        usuario_id: parseInt(usuario_id),
        permiso,
        asignado_por: asignado_por ? parseInt(asignado_por) : null
      });
      res.status(201).json({ success: true, data: nuevo });
    } catch (error) {
      console.error('Error al asignar permiso:', error);
      res.status(500).json({ success: false, message: 'No se pudo asignar el permiso' });
    }
  },

  eliminarPermiso: async (req, res) => {
    try {
      const { id } = req.params;
      await permisosService.eliminar(parseInt(id));
      res.json({ success: true, message: 'Permiso eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar permiso:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar el permiso' });
    }
  }
};

module.exports = permisosUsuarioController;

