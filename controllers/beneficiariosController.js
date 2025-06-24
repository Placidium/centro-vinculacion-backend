 const beneficiarioService = require('../services/beneficiarioService');

const beneficiariosController = {
  // GET /api/beneficiarios
  obtenerTodos: async (req, res) => {
    try {
      const beneficiarios = await beneficiarioService.obtenerTodos();
      console.log('[BeneficiariosController] Beneficiarios obtenidos');
      res.status(200).json({ exito: true, datos: beneficiarios });
    } catch (error) {
      console.error('[BeneficiariosController] Error al obtener beneficiarios:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudieron obtener los beneficiarios.' });
    }
  },

  // GET /api/beneficiarios/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const beneficiario = await beneficiarioService.obtenerPorId(id);
      if (!beneficiario) {
        console.log('[BeneficiariosController] Beneficiario no encontrado');
        return res.status(404).json({ exito: false, mensaje: 'Beneficiario no encontrado.' });
      }
      console.log('[BeneficiariosController] Beneficiario encontrado:', beneficiario);
      res.status(200).json({ exito: true, datos: beneficiario });
    } catch (error) {
      console.error('[BeneficiariosController] Error al buscar beneficiario:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el beneficiario.' });
    }
  },

  // POST /api/beneficiarios
  crear: async (req, res) => {
    const { caracterizacion, activo } = req.body;
    if (!caracterizacion) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El campo "caracterizacion" es obligatorio.'
      });
    }

    try {
      const nuevoBeneficiario = await beneficiarioService.crear({ caracterizacion, activo });
      console.log('[BeneficiariosController] Beneficiario creado:', nuevoBeneficiario);
      res.status(201).json({ exito: true, datos: nuevoBeneficiario });
    } catch (error) {
      console.error('[BeneficiariosController] Error al crear beneficiario:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el beneficiario.' });
    }
  },

  // PUT /api/beneficiarios/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { caracterizacion, activo } = req.body;

    try {
      const actualizado = await beneficiarioService.actualizar(id, { caracterizacion, activo });
      console.log('[BeneficiariosController] Beneficiario actualizado:', actualizado);
      res.status(200).json({ exito: true, datos: actualizado });
    } catch (error) {
      console.error('[BeneficiariosController] Error al actualizar beneficiario:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el beneficiario.' });
    }
  },

  // DELETE /api/beneficiarios/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await beneficiarioService.eliminar(id);
      console.log('[BeneficiariosController] Beneficiario eliminado:', id);
      res.status(200).json({ exito: true, mensaje: 'Beneficiario eliminado correctamente.' });
    } catch (error) {
      console.error('[BeneficiariosController] Error al eliminar beneficiario:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el beneficiario.' });
    }
  }
};

module.exports = beneficiariosController;

