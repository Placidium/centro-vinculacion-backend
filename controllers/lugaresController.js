const lugarService = require('../services/lugarService');

const lugaresController = {
  // GET /api/lugares
  obtenerTodos: async (req, res) => {
  try {
    const lugares = await lugarService.obtenerTodos();
    console.log('[LugaresController] Lugares obtenidos');
    res.status(200).json({ success: true, data: lugares });
  } catch (error) {
    console.error('[LugaresController] Error al obtener lugares:', error);
    res.status(500).json({ success: false, message: 'No se pudieron obtener los lugares.' });
  }
},

  // GET /api/lugares/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const lugar = await lugarService.obtenerPorId(id);
      if (!lugar) {
        console.log('[LugaresController] Lugar no encontrado');
        return res.status(404).json({ exito: false, mensaje: 'Lugar no encontrado.' });
      }
      console.log('[LugaresController] Lugar encontrado:', lugar);
      res.status(200).json({ exito: true, datos: lugar });
    } catch (error) {
      console.error('[LugaresController] Error al buscar lugar:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el lugar.' });
    }
  },

  // POST /api/lugares
  crear: async (req, res) => {
    const { nombre, cupo, activo } = req.body;
    if (!nombre || typeof cupo !== 'number') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre y el cupo (número) son obligatorios.'
      });
    }

    try {
      const nuevoLugar = await lugarService.crear({ nombre, cupo, activo });
      console.log('[LugaresController] Lugar creado:', nuevoLugar);
      res.status(201).json({ exito: true, datos: nuevoLugar });
    } catch (error) {
      console.error('[LugaresController] Error al crear lugar:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el lugar.' });
    }
  },

  // PUT /api/lugares/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, cupo, activo } = req.body;

    try {
      const actualizado = await lugarService.actualizar(id, { nombre, cupo, activo });
      console.log('[LugaresController] Lugar actualizado:', actualizado);
      res.status(200).json({ exito: true, datos: actualizado });
    } catch (error) {
      console.error('[LugaresController] Error al actualizar lugar:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el lugar.' });
    }
  },

  // DELETE /api/lugares/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await lugarService.eliminar(id);
      console.log('[LugaresController] Lugar eliminado:', id);
      res.status(200).json({ exito: true, mensaje: 'Lugar eliminado correctamente.' });
    } catch (error) {
      console.error('[LugaresController] Error al eliminar lugar:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el lugar.' });
    }
  }
};

module.exports = lugaresController;
