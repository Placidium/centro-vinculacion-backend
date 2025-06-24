 const socioComunitarioService = require('../services/socioComunitarioService');

const sociosComunitariosController = {
  // GET /api/socios-comunitarios
  obtenerTodos: async (req, res) => {
    try {
      const socios = await socioComunitarioService.obtenerTodos();
      console.log('[SociosComunitariosController] Socios comunitarios obtenidos');
      res.status(200).json({ exito: true, datos: socios });
    } catch (error) {
      console.error('[SociosComunitariosController] Error al obtener socios:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudieron obtener los socios comunitarios.' });
    }
  },

  // GET /api/socios-comunitarios/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const socio = await socioComunitarioService.obtenerPorId(id);
      if (!socio) {
        console.log('[SociosComunitariosController] Socio comunitario no encontrado');
        return res.status(404).json({ exito: false, mensaje: 'Socio comunitario no encontrado.' });
      }
      console.log('[SociosComunitariosController] Socio comunitario encontrado:', socio);
      res.status(200).json({ exito: true, datos: socio });
    } catch (error) {
      console.error('[SociosComunitariosController] Error al buscar socio:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el socio comunitario.' });
    }
  },

  // POST /api/socios-comunitarios
  crear: async (req, res) => {
    const { nombre, activo } = req.body;
    if (!nombre) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El campo "nombre" es obligatorio.'
      });
    }

    try {
      const nuevoSocio = await socioComunitarioService.crear({ nombre, activo });
      console.log('[SociosComunitariosController] Socio comunitario creado:', nuevoSocio);
      res.status(201).json({ exito: true, datos: nuevoSocio });
    } catch (error) {
      console.error('[SociosComunitariosController] Error al crear socio:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el socio comunitario.' });
    }
  },

  // PUT /api/socios-comunitarios/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    try {
      const actualizado = await socioComunitarioService.actualizar(id, { nombre, activo });
      console.log('[SociosComunitariosController] Socio comunitario actualizado:', actualizado);
      res.status(200).json({ exito: true, datos: actualizado });
    } catch (error) {
      console.error('[SociosComunitariosController] Error al actualizar socio:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el socio comunitario.' });
    }
  },

  // DELETE /api/socios-comunitarios/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await socioComunitarioService.eliminar(id);
      console.log('[SociosComunitariosController] Socio comunitario eliminado:', id);
      res.status(200).json({ exito: true, mensaje: 'Socio comunitario eliminado correctamente.' });
    } catch (error) {
      console.error('[SociosComunitariosController] Error al eliminar socio:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el socio comunitario.' });
    }
  }
};

module.exports = sociosComunitariosController;

