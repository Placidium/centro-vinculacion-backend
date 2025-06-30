const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditoriaService = require('../services/auditoriaService');

// Mapeo para el enum actividades_periodicidad
const mapPeriodicidad = {
  Unica: 'Puntual',
  Recurrente: 'Peri_dica'
};


const crearFechaLocal = (fechaStr, horaStr) => {
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const [hora, minuto] = horaStr.split(':').map(Number);
  return new Date(anio, mes - 1, dia, hora, minuto);
};

const citasController = {
  listar: async (req, res) => {
    try {
      const citas = await prisma.citas.findMany({
        include: {
          actividades: {
            include: {
              actividades_beneficiarios: {
                include: {
                  beneficiarios: true
                }
              }
            }
          },
          lugares: true,
          usuarios: true
        },
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
      const {
        nombre,
        tipo_actividad_id,
        periodicidad,
        fecha_inicio,
        fecha_fin,
        cupo,
        socio_comunitario_id,
        proyecto_id,
        oferentes,
        beneficiarios,
        lugar_id,
        hora_inicio,
        hora_fin
      } = req.body;

      if (!fecha_inicio || !hora_inicio || !hora_fin) {
        return res.status(400).json({ success: false, message: 'Debes ingresar una fecha y horas válidas.' });
      }

      const formatoHoraValido = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!formatoHoraValido.test(hora_inicio) || !formatoHoraValido.test(hora_fin)) {
        return res.status(400).json({ success: false, message: 'El formato de hora debe ser HH:mm' });
      }

      const inicio = crearFechaLocal(fecha_inicio, hora_inicio);
      const fin = crearFechaLocal(fecha_inicio, hora_fin);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ success: false, message: 'Formato de hora inválido.' });
      }

      if (inicio >= fin) {
        return res.status(400).json({ success: false, message: 'La hora de inicio debe ser anterior a la hora de fin.' });
      }

      const conflictoLugar = await prisma.citas.findFirst({
        where: {
          lugar_id,
          fecha: new Date(fecha_inicio),
          estado: 'Programada',
          OR: [
            { hora_inicio: { lt: fin }, hora_fin: { gt: inicio } }
          ]
        }
      });

      if (conflictoLugar) {
        return res.status(400).json({
          success: false,
          message: `El lugar ya está ocupado el ${fecha_inicio} de ${hora_inicio} a ${hora_fin}.`
        });
      }

      const oferentesActividad = oferentes || [];
      if (oferentesActividad.length > 0) {
        const conflictoOferente = await prisma.citas.findFirst({
          where: {
            fecha: new Date(fecha_inicio),
            estado: 'Programada',
            AND: [
              { hora_inicio: { lt: fin } },
              { hora_fin: { gt: inicio } }
            ],
            actividades: {
              actividades_oferentes: {
                some: {
                  oferente_id: { in: oferentesActividad }
                }
              }
            }
          }
        });

        if (conflictoOferente) {
          return res.status(400).json({
            success: false,
            message: `Conflicto: un oferente ya tiene una cita el ${fecha_inicio} entre ${hora_inicio} y ${hora_fin}.`
          });
        }
      }

      const actividad = await prisma.actividades.create({
        data: {
          nombre,
          tipo_actividad_id,
          periodicidad,
          fecha_inicio: new Date(fecha_inicio),
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          cupo: cupo ? parseInt(cupo) : null,
          socio_comunitario_id,
          proyecto_id: proyecto_id || null,
          creado_por: req.usuario.id
        }
      });

      if (!actividad?.id) {
        return res.status(500).json({ success: false, message: 'No se pudo crear la actividad.' });
      }

      if (Array.isArray(oferentes) && oferentes.length > 0) {
        await prisma.actividades_oferentes.createMany({
          data: oferentes.map(id => ({ actividad_id: actividad.id, oferente_id: id }))
        });
      }

      if (Array.isArray(beneficiarios) && beneficiarios.length > 0) {
        await prisma.actividades_beneficiarios.createMany({
          data: beneficiarios.map(id => ({ actividad_id: actividad.id, beneficiario_id: id }))
        });
      }

      const cita = await prisma.citas.create({
        data: {
          actividad_id: actividad.id,
          lugar_id,
          fecha: new Date(fecha_inicio),
          hora_inicio: inicio,
          hora_fin: fin,
          creado_por: req.usuario.id
        }
      });

      res.status(201).json({ success: true, data: { actividad, cita } });

    } catch (error) {
      console.error('Error al crear actividad y cita:', error);
      res.status(500).json({ success: false, message: 'Error al crear la actividad y la cita' });
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

  actualizar: async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin } = req.body;

    try {
      const cita = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: {
          fecha: fecha ? new Date(fecha) : undefined,
          hora_inicio: hora_inicio ? crearFechaLocal(fecha, hora_inicio) : undefined,
          hora_fin: hora_fin ? crearFechaLocal(fecha, hora_fin) : undefined
        }
      });

      await auditoriaService.registrarAccion({
        accion: 'Actualizar',
        entidad: 'Cita',
        registroId: cita.id,
        descripcion: 'Cita modificada por acción drag & drop o resize en el calendario',
        usuarioId: req.usuario.id
      });

      res.json({ success: true, data: cita });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar la cita' });
    }
  },

  reagendar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nueva_fecha, nueva_hora_inicio, nueva_hora_fin, motivo } = req.body;

      if (!nueva_fecha || !nueva_hora_inicio || !nueva_hora_fin) {
        return res.status(400).json({ success: false, message: 'Fecha y horas son requeridas' });
      }

      const inicio = crearFechaLocal(nueva_fecha, nueva_hora_inicio);
      const fin = crearFechaLocal(nueva_fecha, nueva_hora_fin);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return res.status(400).json({ success: false, message: 'Fecha u horas inválidas' });
      }

      if (inicio >= fin) {
        return res.status(400).json({ success: false, message: 'La hora de inicio debe ser anterior a la hora de fin' });
      }

      const citaExistente = await prisma.citas.findUnique({ where: { id: parseInt(id) } });

      if (!citaExistente) {
        return res.status(404).json({ success: false, message: 'Cita no encontrada' });
      }

      const actividad = await prisma.actividades.findUnique({
        where: { id: citaExistente.actividad_id },
        include: {
          actividades_oferentes: true
        }
      });

      const oferenteIds = actividad.actividades_oferentes.map(o => o.oferente_id);

      if (oferenteIds.length > 0) {
        const conflictoOferente = await prisma.citas.findFirst({
          where: {
            id: { not: parseInt(id) },
            fecha: new Date(nueva_fecha),
            estado: 'Programada',
            OR: [
              { hora_inicio: { lt: fin } },
              { hora_fin: { gt: inicio } }
            ],
            actividades: {
              actividades_oferentes: {
                some: {
                  oferente_id: { in: oferenteIds }
                }
              }
            }
          }
        });

        if (conflictoOferente) {
          return res.status(400).json({
            success: false,
            message: `Conflicto: un oferente ya tiene otra cita el ${nueva_fecha} entre ${nueva_hora_inicio} y ${nueva_hora_fin}`
          });
        }
      }

      const citaReagendada = await prisma.citas.update({
        where: { id: parseInt(id) },
        data: {
          fecha: new Date(nueva_fecha),
          hora_inicio: inicio,
          hora_fin: fin,
          motivo_cancelacion: motivo || null,
          estado: 'Programada'
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
      res.status(500).json({ success: false, message: 'Error interno al reagendar cita' });
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
