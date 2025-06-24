 const proyectoService = require('../services/proyectoService');

const proyectosController = {
  // GET /api/proyectos
  obtenerTodos: async (req, res) => {
    try {
      const proyectos = await proyectoService.obtenerTodos();
      console.log('[ProyectosController] Proyectos obtenidos');
      res.status(200).json({ exito: true, datos: proyectos });
    } catch (error) {
      console.error('[ProyectosController] Error al obtener proyectos:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudieron obtener los proyectos.' });
    }
  },

  // GET /api/proyectos/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const proyecto = await proyectoService.obtenerPorId(id);
      if (!proyecto) {
        console.log('[ProyectosController] Proyecto no encontrado');
        return res.status(404).json({ exito: false, mensaje: 'Proyecto no encontrado.' });
      }
      console.log('[ProyectosController] Proyecto encontrado:', proyecto);
      res.status(200).json({ exito: true, datos: proyecto });
    } catch (error) {
      console.error('[ProyectosController] Error al buscar proyecto:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar el proyecto.' });
    }
  },

  // POST /api/proyectos
  crear: async (req, res) => {
    const { nombre, descripcion, fechaInicio, fechaFin, activo } = req.body;

    if (!nombre || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Los campos "nombre", "fechaInicio" y "fechaFin" son obligatorios.'
      });
    }

    try {
      const nuevoProyecto = await proyectoService.crear({ nombre, descripcion, fechaInicio, fechaFin, activo });
      console.log('[ProyectosController] Proyecto creado:', nuevoProyecto);
      res.status(201).json({ exito: true, datos: nuevoProyecto });
    } catch (error) {
      console.error('[ProyectosController] Error al crear proyecto:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear el proyecto.' });
    }
  },

  // PUT /api/proyectos/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fechaInicio, fechaFin, activo } = req.body;

    try {
      const actualizado = await proyectoService.actualizar(id, { nombre, descripcion, fechaInicio, fechaFin, activo });
      console.log('[ProyectosController] Proyecto actualizado:', actualizado);
      res.status(200).json({ exito: true, datos: actualizado });
    } catch (error) {
      console.error('[ProyectosController] Error al actualizar proyecto:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el proyecto.' });
    }
  },

  // DELETE /api/proyectos/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await proyectoService.eliminar(id);
      console.log('[ProyectosController] Proyecto eliminado:', id);
      res.status(200).json({ exito: true, mensaje: 'Proyecto eliminado correctamente.' });
    } catch (error) {
      console.error('[ProyectosController] Error al eliminar proyecto:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el proyecto.' });
    }
  }
};

module.exports = proyectosController;

