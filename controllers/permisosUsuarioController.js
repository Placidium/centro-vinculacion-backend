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
listarDisponibles: async (req, res) => {
  try {
    const permisosDisponibles = [
      "ver_usuarios",
      "gestionar_permisos",
      "crear_citas",
      "ver_citas",
      "editar_citas",
      "cancelar_citas",
      "subir_archivos",
      "ver_reportes"
    ];

    res.json(permisosDisponibles); // debe ser un array plano
  } catch (error) {
    console.error('Error al listar permisos disponibles:', error);
    res.status(500).json({ message: 'No se pudieron obtener los permisos disponibles' });
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
actualizarPermisos: async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body;

    await permisosService.actualizarPermisos(id, permisos);

    res.json({ success: true, message: 'Permisos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar permisos del usuario:', error);
    res.status(500).json({ success: false, message: 'No se pudieron actualizar los permisos' });
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

