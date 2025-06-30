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
  // POST /api/actividades
// En actividadesController.js, método crear
crear: async (req, res) => {
  const {
    nombre,
    tipo_actividad_id,  // Cambiar de tipoActividadId
    periodicidad,
    fecha_inicio,       // Cambiar de fechaInicio
    fecha_fin,          // Cambiar de fechaFin
    hora_inicio,        // Agregar
    hora_fin,           // Agregar
    lugar_id,           // Agregar
    cupo,
    socio_comunitario_id,  // Cambiar de socioComunitarioId
    proyecto_id,           // Cambiar de proyectoId
    estado,
    creado_por,            // Cambiar de creadoPor
    oferentes_ids,         // Cambiar de oferentesIds
    beneficiarios_ids      // Cambiar de beneficiariosIds
  } = req.body;

  if (!nombre || !tipo_actividad_id || !periodicidad || !fecha_inicio || !hora_inicio || !lugar_id || !socio_comunitario_id || !creado_por) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Faltan campos obligatorios para crear la actividad.'
    });
  }

  try {
    const nuevaActividad = await actividadService.crear({
      nombre,
      tipo_actividad_id,
      periodicidad,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      lugar_id,
      cupo,
      socio_comunitario_id,
      proyecto_id,
      estado,
      creado_por,
      oferentes_ids,
      beneficiarios_ids
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
      tipo_actividad_id,
      periodicidad,
      fecha_inicio,
      fecha_fin,
      cupo,
      socio_comunitario_id,
      proyecto_id,
      estado,
      creado_por,
      oferentes_ids,
      beneficiarios_ids,
      // Campos para citas
      lugar_id,
      hora_inicio,
      hora_fin
    } = req.body;

    try {
      const actividadExistente = await actividadService.obtenerPorId(id);
      if (!actividadExistente) {
        return res.status(404).json({ 
          exito: false, 
          mensaje: 'Actividad no encontrada.' 
        });
      }

      // CA-14: Validación de actividad completada
      if (actividadExistente.estado === 'Completada') {
        return res.status(400).json({ 
          exito: false, 
          mensaje: 'No se puede modificar una actividad completada' 
        });
      }

      // Validación adicional para actividades canceladas
      if (actividadExistente.estado === 'Cancelada') {
        return res.status(400).json({ 
          exito: false, 
          mensaje: 'No se puede modificar una actividad cancelada' 
        });
      }

      const actualizada = await actividadService.actualizar(id, {
        nombre,
        tipo_actividad_id,
        periodicidad,
        fecha_inicio,
        fecha_fin,
        cupo,
        socio_comunitario_id,
        proyecto_id,
        estado,
        creado_por,
        oferentes_ids,
        beneficiarios_ids,
        lugar_id,
        hora_inicio,
        hora_fin
      });

      console.log('[ActividadesController] Actividad actualizada:', actualizada);
      res.status(200).json({ 
        exito: true, 
        datos: actualizada,
        mensaje: 'Actividad actualizada exitosamente'
      });
    } catch (error) {
      console.error('[ActividadesController] Error al actualizar actividad:', error);
      
      // Manejo específico de errores de conflictos
      if (error.message.includes('conflicto') || error.message.includes('ocupado')) {
        return res.status(409).json({ 
          exito: false, 
          mensaje: error.message 
        });
      }
      
      res.status(500).json({ 
        exito: false, 
        mensaje: 'No se pudo actualizar la actividad.' 
      });
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
  // PUT /api/actividades/:id/cancelar
cancelar: async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const actividad = await actividadService.obtenerPorId(id);
    if (!actividad) {
      return res.status(404).json({ 
        exito: false, 
        mensaje: 'Actividad no encontrada.' 
      });
    }

    if (actividad.estado === 'Cancelada') {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'Esta actividad ya está cancelada' 
      });
    }

    // Verificar que la actividad no haya pasado
    const fechaActual = new Date();
    if (new Date(actividad.fecha_inicio) < fechaActual) {
      return res.status(400).json({ 
        exito: false, 
        mensaje: 'No se puede cancelar una actividad que ya ha ocurrido' 
      });
    }

    const actividadCancelada = await actividadService.cancelar(id, motivo);

    console.log('[ActividadesController] Actividad cancelada:', actividadCancelada);
    
    res.status(200).json({
      exito: true,
      datos: actividadCancelada,
      mensaje: 'Actividad cancelada exitosamente'
    });
  } catch (error) {
    console.error('[ActividadesController] Error al cancelar actividad:', error);
    res.status(500).json({ 
      exito: false, 
      mensaje: 'No se pudo cancelar la actividad.' 
    });
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
