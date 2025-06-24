const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ActividadService {
  async obtenerTodas() {
    try {
      const actividades = await prisma.actividades.findMany({
        include: {
          tipos_actividad: true,
          socios_comunitarios: true,
          proyectos: true,
          actividades_oferentes: true,
          actividades_beneficiarios: true,
        },
        orderBy: { fecha_inicio: 'desc' }
      });
      console.log('[ActividadService] Actividades obtenidas');
      return actividades;
    } catch (error) {
      console.error('[ActividadService] Error al obtener actividades:', error);
      throw new Error('Error al obtener las actividades');
    }
  }

  async obtenerPorId(id) {
    try {
      const actividad = await prisma.actividades.findUnique({
        where: { id: parseInt(id) },
        include: {
          tipos_actividad: true,
          socios_comunitarios: true,
          proyectos: true,
          actividades_oferentes: true,
          actividades_beneficiarios: true,
        }
      });
      if (!actividad) {
        console.log('[ActividadService] Actividad no encontrada');
        return null;
      }
      console.log('[ActividadService] Actividad encontrada:', actividad);
      return actividad;
    } catch (error) {
      console.error('[ActividadService] Error al buscar actividad:', error);
      throw new Error('Error al buscar la actividad');
    }
  }

  async crear(data) {
    try {
      const actividad = await prisma.actividades.create({
        data: {
          nombre: data.nombre,
          tipo_actividad_id: data.tipo_actividad_id,
          periodicidad: data.periodicidad,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
          cupo: data.cupo,
          socio_comunitario_id: data.socio_comunitario_id,
          proyecto_id: data.proyecto_id || null,
          estado: data.estado || 'Programada', // asumiendo que es enum string
          fecha_creacion: new Date(),
          creado_por: data.creado_por,
          // Relaciones muchos a muchos deben manejarse por separado
        },
        include: {
          actividades_oferentes: true,
          actividades_beneficiarios: true,
        }
      });
      console.log('[ActividadService] Actividad creada:', actividad);
      return actividad;
    } catch (error) {
      console.error('[ActividadService] Error al crear actividad:', error);
      throw new Error('Error al crear la actividad');
    }
  }

  async actualizar(id, data) {
    try {
      // Iniciar transacción para actualizar actividad y relaciones
      const resultado = await prisma.$transaction(async (tx) => {
        // Actualizar la actividad principal
        const actividad = await tx.actividades.update({
          where: { id: parseInt(id) },
          data: {
            nombre: data.nombre,
            tipo_actividad_id: data.tipoActividadId,
            periodicidad: data.periodicidad,
            fecha_inicio: new Date(data.fechaInicio),
            fecha_fin: data.fechaFin ? new Date(data.fechaFin) : null,
            cupo: data.cupo,
            socio_comunitario_id: data.socioComunitarioId,
            proyecto_id: data.proyectoId || null,
            dias_aviso_previo: data.diasAvisoPrevio,
            estado: data.estado,
            creado_por: data.creadoPor,
            fecha_modificacion: new Date()
          }
        });

        // Actualizar oferentes si se proporcionan
        if (data.oferentesIds && Array.isArray(data.oferentesIds)) {
          // Eliminar relaciones existentes
          await tx.actividades_oferentes.deleteMany({
            where: { actividad_id: parseInt(id) }
          });

          // Crear nuevas relaciones
          if (data.oferentesIds.length > 0) {
            await tx.actividades_oferentes.createMany({
              data: data.oferentesIds.map(oferenteId => ({
                actividad_id: parseInt(id),
                oferente_id: parseInt(oferenteId)
              }))
            });
          }
        }

        // Actualizar beneficiarios si se proporcionan
        if (data.beneficiariosIds && Array.isArray(data.beneficiariosIds)) {
          // Eliminar relaciones existentes
          await tx.actividades_beneficiarios.deleteMany({
            where: { actividad_id: parseInt(id) }
          });

          // Crear nuevas relaciones
          if (data.beneficiariosIds.length > 0) {
            await tx.actividades_beneficiarios.createMany({
              data: data.beneficiariosIds.map(beneficiarioId => ({
                actividad_id: parseInt(id),
                beneficiario_id: parseInt(beneficiarioId)
              }))
            });
          }
        }

        return actividad;
      });

      console.log('[ActividadService] Actividad actualizada:', resultado);
      return resultado;
    } catch (error) {
      console.error('[ActividadService] Error al actualizar actividad:', error);
      throw new Error('Error al actualizar la actividad');
    }
  }

  async cancelar(id, motivo) {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const actividad = await tx.actividades.update({
          where: { id: parseInt(id) },
          data: {
            estado: 'Cancelada',
            motivo_cancelacion: motivo,
            fecha_cancelacion: new Date(),
            fecha_modificacion: new Date()
          },
          include: {
            tipos_actividad: true,
            socios_comunitarios: true,
            proyectos: true
          }
        });

        // Cancelar todas las citas asociadas a esta actividad
        await tx.citas.updateMany({
          where: {
            actividad_id: parseInt(id),
            estado: { not: 'Cancelada' } // Solo cancelar las que no estén ya canceladas
          },
          data: {
            estado: 'Cancelada',
            motivo_cancelacion: `Actividad cancelada: ${motivo}`,
            fecha_cancelacion: new Date()
          }
        });

        return actividad;
      });

      console.log('[ActividadService] Actividad cancelada:', resultado);
      return resultado;
    } catch (error) {
      console.error('[ActividadService] Error al cancelar actividad:', error);
      throw new Error('Error al cancelar la actividad');
    }
  }

  async eliminar(id) {
    try {
      // Eliminar relaciones intermedias primero si es necesario
      await prisma.actividades_oferentes.deleteMany({
        where: { actividad_id: parseInt(id) }
      });
      await prisma.actividades_beneficiarios.deleteMany({
        where: { actividad_id: parseInt(id) }
      });

      const actividad = await prisma.actividades.delete({
        where: { id: parseInt(id) }
      });

      console.log('[ActividadService] Actividad eliminada:', actividad);
      return actividad;
    } catch (error) {
      console.error('[ActividadService] Error al eliminar actividad:', error);
      throw new Error('Error al eliminar la actividad');
    }
  }

async reagendar(id, data) {
  try {
    const { motivo, nuevaFecha, nuevaHora, lugarId } = data;
    
    const resultado = await prisma.$transaction(async (tx) => {
      // Obtener la actividad actual con sus citas
      const actividad = await tx.actividades.findUnique({
        where: { id: parseInt(id) },
        include: {
          citas: true,
          tipos_actividad: true,
          socios_comunitarios: true,
          proyectos: true
        }
      });

      if (!actividad) {
        throw new Error('Actividad no encontrada');
      }

      // Crear nueva fecha y hora completa
      const nuevaFechaHora = new Date(`${nuevaFecha}T${nuevaHora}`);

      // Actualizar la actividad con la nueva fecha
      const actividadActualizada = await tx.actividades.update({
        where: { id: parseInt(id) },
        data: {
          fecha_inicio: nuevaFechaHora,
          motivo_reagendamiento: motivo,
          fecha_reagendamiento: new Date(),
          fecha_modificacion: new Date()
        }
      });

      // Si es actividad puntual, actualizar su única cita
      if (actividad.periodicidad === 'Puntual' && actividad.citas.length > 0) {
        await tx.citas.update({
          where: { id: actividad.citas[0].id },
          data: {
            fecha: nuevaFechaHora,
            lugar_id: lugarId ? parseInt(lugarId) : actividad.citas[0].lugar_id,
            motivo_reagendamiento: motivo,
            fecha_reagendamiento: new Date()
          }
        });
      }
      // Si es periódica, podrías implementar lógica adicional aquí
      // Por ahora solo actualizamos la fecha de inicio de la actividad

      return actividadActualizada;
    });

    console.log('[ActividadService] Actividad reagendada:', resultado);
    return resultado;
  } catch (error) {
    console.error('[ActividadService] Error al reagendar actividad:', error);
    
    // Manejo específico de errores de disponibilidad
    if (error.message.includes('disponible')) {
      throw new Error('El lugar seleccionado no está disponible en la fecha y hora indicadas');
    }
    
    throw new Error('Error al reagendar la actividad');
  }
}
async verificarDisponibilidadLugar(lugarId, fecha, actividadExcluir = null) {
  try {
    const whereCondition = {
      lugar_id: parseInt(lugarId),
      fecha: new Date(fecha),
      estado: { not: 'Cancelada' }
    };

    // Si hay una actividad a excluir (en caso de reagendamiento)
    if (actividadExcluir) {
      whereCondition.actividad_id = { not: parseInt(actividadExcluir) };
    }

    const citaExistente = await prisma.citas.findFirst({
      where: whereCondition
    });

    return !citaExistente; // true si está disponible, false si está ocupado
  } catch (error) {
    console.error('[ActividadService] Error al verificar disponibilidad:', error);
    throw new Error('Error al verificar la disponibilidad del lugar');
  }
}



}

module.exports = new ActividadService();
