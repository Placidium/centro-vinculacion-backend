 const tipoActividadService = require('../services/tipoActividadService');

const tipoActividadController = {
  // GET /api/tipos-actividad
  obtenerTodos: async (req, res) => {
  try {
    const tipos = await tipoActividadService.obtenerTodos();
    res.status(200).json({ success: true, data: tipos });
  } catch (error) {
    console.error('[TipoActividadController] Error al obtener tipos:', error);
    res.status(500).json({ success: false, message: 'No se pudieron obtener los tipos de actividad.' });
  }
},

  // GET /api/tipos-actividad/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const tipo = await tipoActividadService.obtenerPorId(id);
      if (!tipo) {
        return res.status(404).json({ exito: false, mensaje: 'Tipo de actividad no encontrado.' });
      }
      res.status(200).json({ exito: true, datos: tipo });
    } catch (error) {
      console.error('[TipoActividadController] Error al buscar tipo:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el tipo de actividad.' });
    }
  },

  // POST /api/tipos-actividad
  crear: async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ exito: false, mensaje: 'El campo "nombre" es obligatorio.' });
    }

    try {
      const nuevoTipo = await tipoActividadService.crear({ nombre, descripcion });
      res.status(201).json({ exito: true, datos: nuevoTipo });
    } catch (error) {
      console.error('[TipoActividadController] Error al crear tipo:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el tipo de actividad.' });
    }
  },

  // PUT /api/tipos-actividad/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
      const actualizado = await tipoActividadService.actualizar(id, { nombre, descripcion });
      res.status(200).json({ exito: true, datos: actualizado });
    } catch (error) {
      console.error('[TipoActividadController] Error al actualizar tipo:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el tipo de actividad.' });
    }
  },

  // DELETE /api/tipos-actividad/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await tipoActividadService.eliminar(id);
      res.status(200).json({ exito: true, mensaje: 'Tipo de actividad eliminado correctamente.' });
    } catch (error) {
      console.error('[TipoActividadController] Error al eliminar tipo:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el tipo de actividad.' });
    }
  }
};

module.exports = tipoActividadController;

