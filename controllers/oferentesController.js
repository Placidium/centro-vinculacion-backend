const oferenteService = require('../services/oferenteService');

const oferentesController = {
  // GET /api/oferentes
  obtenerTodos: async (req, res) => {
    try {
      const oferentes = await oferenteService.obtenerTodos();
      console.log('[OferentesController] Lista de oferentes obtenida');
      res.status(200).json({ exito: true, data: oferentes }); // ✅ Cambiado de 'datos' a 'data'
    } catch (error) {
      console.error('[OferentesController] Error al obtener oferentes:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudieron obtener los oferentes.' });
    }
  },

  // GET /api/oferentes/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const oferente = await oferenteService.obtenerPorId(id);
      if (!oferente) {
        console.log('[OferentesController] Oferente no encontrado');
        return res.status(404).json({ exito: false, mensaje: 'Oferente no encontrado.' });
      }
      console.log('[OferentesController] Oferente encontrado:', oferente);
      res.status(200).json({ exito: true, data: oferente });
    } catch (error) {
      console.error('[OferentesController] Error al buscar oferente:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el oferente.' });
    }
  },

  // POST /api/oferentes
  crear: async (req, res) => {
    const { nombre, docente_responsable, activo = true } = req.body;
    
    try {
      const nuevoOferente = await oferenteService.crear({ nombre, docente_responsable, activo });
      console.log('[OferentesController] Oferente creado:', nuevoOferente);
      res.status(201).json({ exito: true, data: nuevoOferente });
    } catch (error) {
      console.error('[OferentesController] Error al crear oferente:', error);
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el oferente.' });
    }
  },

  // PUT /api/oferentes/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, docente_responsable, activo } = req.body;

    try {
      const actualizado = await oferenteService.actualizar(id, { nombre, docente_responsable, activo });
      console.log('[OferentesController] Oferente actualizado:', actualizado);
      res.status(200).json({ exito: true, data: actualizado });
    } catch (error) {
      console.error('[OferentesController] Error al actualizar oferente:', error);
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({ exito: false, mensaje: error.message });
      }
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el oferente.' });
    }
  },

  // DELETE /api/oferentes/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await oferenteService.eliminar(id);
      console.log('[OferentesController] Oferente eliminado:', id);
      res.status(200).json({ exito: true, mensaje: 'Oferente eliminado correctamente.' });
    } catch (error) {
      console.error('[OferentesController] Error al eliminar oferente:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el oferente.' });
    }
  }
};

module.exports = oferentesController;

