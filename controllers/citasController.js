const prisma = require('../generated/prisma');

const auditoriaService = require('../services/auditoriaService');

const citasController = {
  listar: async (req, res) => {
    try {
      const citas = await prisma.citas.findMany({
        include: { actividades: true, lugares: true, usuarios: true },
        orderBy: { fecha: 'asc' }
      });
      res.json({ success: true, data: citas });
    } catch (error) {
      console.error('Error al listar citas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener citas' });
    }
  },

  filtrar: async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin, estado, usuario_id, lugar_id } = req.query;

      const condiciones = {};
      if (fecha_inicio || fecha_fin) {
        condiciones.fecha = {};
        if (fecha_inicio) condiciones.fecha.gte = new Date(fecha_inicio);
        if (fecha_fin) condiciones.fecha.lte = new Date(fecha_fin);
      }
      if (estado) condiciones.estado = estado;
      if (usuario_id) condiciones.creado_por = parseInt(usuario_id);
      if (lugar_id) condiciones.lugar_id = parseInt(lugar_id);

      const citas = await prisma.citas.findMany({
        where: condiciones,
        include: { actividades: true, lugares: true, usuarios: true },
        orderBy: { fecha: 'desc' }
      });

      res.json({ success: true, data: citas });
    } catch (error) {
      console.error('Error al filtrar citas:', error);
      res.status(500).json({ success: false, message: 'Error al filtrar citas' });
    }
  },

  obtenerPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const cita = await prisma.citas.findUnique({
        where: { id: parseInt(id) },
        include: { actividades: true, lugares: true, usuarios: true }
      });

      if (!cita) {
        return res.status(404).json({ success: false, message: 'Cita no encontrada' });
      }

      res.json({ success: true, data: cita });
    } catch (error) {
      console.error('Error al obtener cita por ID:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la cita' });
    }
  },

  crear: async (req, res) => {
    try {
      const { actividad_id, lugar_id, fecha, hora_inicio, hora_fin, creado_por } = req.body;

      const conflicto = await prisma.citas.findFirst({
        where: {
          lugar_id,
          fecha: new Date(fecha),
          estado: 'Programada',
          OR: [{ hora_inicio: { lt: new Date(hora_fin) }, hora_fin: { gt: new Date(hora_inicio) } }]
        }
      });

      if (conflicto) {
        return res.status(400).json({
          success: false,
          message: 'El lugar ya está ocupado en ese horario'
        });
      }

      const nuevaCita = await prisma.citas.create({
        data: {
          actividad_id,
          lugar_id,
          fecha: new Date(fecha),
          hora_inicio: new Date(hora_inicio),
          hora_fin: hora_fin ? new Date(hora_fin) : null,
          creado_por
        }
      });

      await auditoriaService.registrarAccion({
        accion: 'Crear',
        entidad: 'Cita',
        registroId: nuevaCita.id,
        descripcion: 'Creación de cita',
        usuarioId: req.usuario.id
      });

      res.status(201).json({ success: true, data: nuevaCita });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({ success: false, message: 'Error al crear cita' });
    }
  },

  cancelar: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const cita = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: { estado: 'Cancelada', motivo_cancelacion: motivo }
      });

      await auditoriaService.registrarAccion({
        accion: 'Cancelar',
        entidad: 'Cita',
        registroId: cita.id,
        descripcion: `Cancelación por motivo: ${motivo}`,
        usuarioId: req.usuario.id
      });

      res.json({ success: true, data: cita });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({ success: false, message: 'Error al cancelar cita' });
    }
  },

  reagendar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nueva_fecha, nueva_hora_inicio, nueva_hora_fin, motivo } = req.body;

      const citaExistente = await prisma.citas.findUnique({ where: { id: parseInt(id) } });

      const conflicto = await prisma.citas.findFirst({
        where: {
          id: { not: parseInt(id) },
          lugar_id: citaExistente.lugar_id,
          fecha: new Date(nueva_fecha),
          estado: 'Programada',
          OR: [{ hora_inicio: { lt: new Date(nueva_hora_fin) }, hora_fin: { gt: new Date(nueva_hora_inicio) } }]
        }
      });

      if (conflicto) {
        return res.status(400).json({ success: false, message: 'El lugar ya está ocupado en el nuevo horario' });
      }

      const citaReagendada = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: {
          fecha: new Date(nueva_fecha),
          hora_inicio: new Date(nueva_hora_inicio),
          hora_fin: nueva_hora_fin ? new Date(nueva_hora_fin) : null,
          motivo_cancelacion: motivo
        }
      });

      await auditoriaService.registrarAccion({
        accion: 'Reagendar',
        entidad: 'Cita',
        registroId: citaReagendada.id,
        descripcion: `Reagendada por motivo: ${motivo}`,
        usuarioId: req.usuario.id
      });

      res.json({ success: true, data: citaReagendada });
    } catch (error) {
      console.error('Error al reagendar cita:', error);
      res.status(500).json({ success: false, message: 'Error al reagendar cita' });
    }
  },

  eliminar: async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.citas.delete({ where: { id: parseInt(id) } });

      await auditoriaService.registrarAccion({
        accion: 'Eliminar',
        entidad: 'Cita',
        registroId: parseInt(id),
        descripcion: 'Eliminación de cita',
        usuarioId: req.usuario.id
      });

      res.json({ success: true, message: 'Cita eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar la cita' });
    }
  }
};

module.exports = citasController;
