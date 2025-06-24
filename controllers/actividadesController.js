const actividadService = require('../services/actividadService');

const actividadesController = {
  // GET /api/actividades
  obtenerTodas: async (req, res) => {
    try {
      const actividades = await actividadService.obtenerTodas();
      console.log('[ActividadesController] Actividades obtenidas');
      res.status(200).json({ exito: true, datos: actividades });
    } catch (error) {
      console.error('[ActividadesController] Error al obtener actividades:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudieron obtener las actividades.' });
    }
  },

  // GET /api/actividades/:id
  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const actividad = await actividadService.obtenerPorId(id);
      if (!actividad) {
        console.log('[ActividadesController] Actividad no encontrada');
        return res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada.' });
      }
      res.status(200).json({ exito: true, datos: actividad });
    } catch (error) {
      console.error('[ActividadesController] Error al buscar actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al buscar la actividad.' });
    }
  },

  // POST /api/actividades
  crear: async (req, res) => {
    const {
      nombre,
      tipoActividadId,
      periodicidad,
      fechaInicio,
      fechaFin,
      cupo,
      socioComunitarioId,
      proyectoId,
      diasAvisoPrevio,
      estado,
      creadoPor,
      oferentesIds,
      beneficiariosIds
    } = req.body;

    if (!nombre || !tipoActividadId || !periodicidad || !fechaInicio || !fechaFin || !cupo || !socioComunitarioId || diasAvisoPrevio === undefined || !creadoPor) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan campos obligatorios para crear la actividad.'
      });
    }

    try {
      const nuevaActividad = await actividadService.crear({
        nombre,
        tipoActividadId,
        periodicidad,
        fechaInicio,
        fechaFin,
        cupo,
        socioComunitarioId,
        proyectoId,
        diasAvisoPrevio,
        estado,
        creadoPor,
        oferentesIds,
        beneficiariosIds
      });
      console.log('[ActividadesController] Actividad creada:', nuevaActividad);
      res.status(201).json({ exito: true, datos: nuevaActividad });
    } catch (error) {
      console.error('[ActividadesController] Error al crear actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo crear la actividad.' });
    }
  },

  // PUT /api/actividades/:id
  actualizar: async (req, res) => {
    const { id } = req.params;
    const {
      nombre,
      tipoActividadId,
      periodicidad,
      fechaInicio,
      fechaFin,
      cupo,
      socioComunitarioId,
      proyectoId,
      diasAvisoPrevio,
      estado,
      creadoPor,
      oferentesIds,
      beneficiariosIds
    } = req.body;

    try {
      const actividadExistente = await actividadService.obtenerPorId(id);
      if (!actividadExistente) {
        return res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada.' });
      }

      if (actividadExistente.estado === 'Cancelada') {
        return res.status(400).json({ exito: false, mensaje: 'No se puede modificar una actividad cancelada' });
      }

      const fechaActual = new Date();
      if (new Date(actividadExistente.fecha_inicio) < fechaActual) {
        return res.status(400).json({ exito: false, mensaje: 'No se puede modificar una actividad que ya ha ocurrido' });
      }

      const actualizada = await actividadService.actualizar(id, {
        nombre,
        tipoActividadId,
        periodicidad,
        fechaInicio,
        fechaFin,
        cupo,
        socioComunitarioId,
        proyectoId,
        diasAvisoPrevio,
        estado,
        creadoPor,
        oferentesIds,
        beneficiariosIds
      });

      console.log('[ActividadesController] Actividad actualizada:', actualizada);
      res.status(200).json({ exito: true, datos: actualizada });
    } catch (error) {
      console.error('[ActividadesController] Error al actualizar actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar la actividad.' });
    }
  },

  // DELETE /api/actividades/:id
  eliminar: async (req, res) => {
    const { id } = req.params;

    try {
      await actividadService.eliminar(id);
      console.log('[ActividadesController] Actividad eliminada:', id);
      res.status(200).json({ exito: true, mensaje: 'Actividad eliminada correctamente.' });
    } catch (error) {
      console.error('[ActividadesController] Error al eliminar actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar la actividad.' });
    }
  },

  // PUT /api/actividades/:id/cancelar
  cancelar: async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;

    try {
      const actividad = await actividadService.obtenerPorId(id);
      if (!actividad) {
        return res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada.' });
      }

      if (actividad.estado === 'Cancelada') {
        return res.status(400).json({ exito: false, mensaje: 'Esta actividad ya está cancelada' });
      }

      const fechaActual = new Date();
      if (new Date(actividad.fecha_inicio) < fechaActual) {
        return res.status(400).json({ exito: false, mensaje: 'No se puede cancelar una actividad que ya ha ocurrido' });
      }

      const actividadCancelada = await actividadService.cancelar(id, motivo);

      console.log('[ActividadesController] Actividad cancelada:', actividadCancelada);
      res.status(200).json({
        exito: true,
        datos: actividadCancelada,
        mensaje: 'Actividad cancelada correctamente.'
      });
    } catch (error) {
      console.error('[ActividadesController] Error al cancelar actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo cancelar la actividad.' });
    }
  },

  // PUT /api/actividades/:id/reagendar
  reagendar: async (req, res) => {
    const { id } = req.params;
    const { motivo, nuevaFecha, nuevaHora, lugarId } = req.body;

    try {
      const actividad = await actividadService.obtenerPorId(id);
      if (!actividad) {
        return res.status(404).json({ exito: false, mensaje: 'Actividad no encontrada.' });
      }

      if (actividad.estado === 'Cancelada') {
        return res.status(400).json({ exito: false, mensaje: 'No se puede reagendar una actividad cancelada' });
      }

      const fechaActual = new Date();
      if (new Date(actividad.fecha_inicio) < fechaActual) {
        return res.status(400).json({ exito: false, mensaje: 'No se puede reagendar una actividad que ya ha ocurrido' });
      }

      const actividadReagendada = await actividadService.reagendar(id, {
        motivo,
        nuevaFecha,
        nuevaHora,
        lugarId
      });

      console.log('[ActividadesController] Actividad reagendada:', actividadReagendada);
      res.status(200).json({
        exito: true,
        datos: actividadReagendada,
        mensaje: 'Actividad reagendada correctamente.'
      });
    } catch (error) {
      console.error('[ActividadesController] Error al reagendar actividad:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo reagendar la actividad.' });
    }
  }
};

module.exports = actividadesController;
