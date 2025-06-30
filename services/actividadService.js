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
    // Primero crear la actividad
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
        estado: data.estado || 'Programada',
        fecha_creacion: new Date(),
        creado_por: data.creado_por,
      }
    });

    // Crear la cita asociada
    if (data.lugar_id && data.hora_inicio) {
      // CORRECCIÓN: Convertir las horas a DateTime completos
      const fechaBase = data.fecha_inicio; // Usar la misma fecha de la actividad
      
      // Crear DateTime completo para hora_inicio
      const horaInicioCompleta = new Date(`${fechaBase.split('T')[0]}T${data.hora_inicio}:00.000Z`);
      
      // Crear DateTime completo para hora_fin si existe
      let horaFinCompleta = null;
      if (data.hora_fin) {
        horaFinCompleta = new Date(`${fechaBase.split('T')[0]}T${data.hora_fin}:00.000Z`);
      }

      await prisma.citas.create({
        data: {
          actividad_id: actividad.id,
          lugar_id: data.lugar_id,
          fecha: new Date(data.fecha_inicio),
          hora_inicio: horaInicioCompleta,
          hora_fin: horaFinCompleta,
          estado: 'Programada',
          creado_por: data.creado_por
        }
      });
    }

    // Crear relaciones con oferentes
    if (data.oferentes_ids && data.oferentes_ids.length > 0) {
      await prisma.actividades_oferentes.createMany({
        data: data.oferentes_ids.map(oferente_id => ({
          actividad_id: actividad.id,
          oferente_id: oferente_id
        }))
      });
    }

    // Crear relaciones con beneficiarios
    if (data.beneficiarios_ids && data.beneficiarios_ids.length > 0) {
      await prisma.actividades_beneficiarios.createMany({
        data: data.beneficiarios_ids.map(beneficiario_id => ({
          actividad_id: actividad.id,
          beneficiario_id: beneficiario_id
        }))
      });
    }

    // Retornar actividad completa
    const actividadCompleta = await prisma.actividades.findUnique({
      where: { id: actividad.id },
      include: {
        tipos_actividad: true,
        socios_comunitarios: true,
        proyectos: true,
        actividades_oferentes: true,
        actividades_beneficiarios: true,
        citas: true
      }
    });

    console.log('[ActividadService] Actividad creada:', actividadCompleta);
    return actividadCompleta;
  } catch (error) {
    console.error('[ActividadService] Error al crear actividad:', error);
    throw new Error('Error al crear la actividad');
  }
}

  async actualizar(id, data) {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // Verificar conflictos de horario si se proporcionan datos de cita
        if (data.lugar_id && data.fecha_inicio && data.hora_inicio) {
          const disponible = await this.verificarDisponibilidadLugar(
            data.lugar_id, 
            data.fecha_inicio, 
            data.hora_inicio,
            data.hora_fin,
            id // Excluir la actividad actual
          );
          
          if (!disponible.disponible) {
            throw new Error(disponible.mensaje);
          }
        }

        // Actualizar la actividad principal
        const actividad = await tx.actividades.update({
          where: { id: parseInt(id) },
          data: {
            nombre: data.nombre,
            tipo_actividad_id: data.tipo_actividad_id,
            periodicidad: data.periodicidad,
            fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
            fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
            cupo: data.cupo,
            socio_comunitario_id: data.socio_comunitario_id,
            proyecto_id: data.proyecto_id || null,
            estado: data.estado,
            creado_por: data.creado_por,
          }
        });

        // Actualizar oferentes si se proporcionan
        if (data.oferentes_ids && Array.isArray(data.oferentes_ids)) {
          await tx.actividades_oferentes.deleteMany({
            where: { actividad_id: parseInt(id) }
          });

          if (data.oferentes_ids.length > 0) {
            await tx.actividades_oferentes.createMany({
              data: data.oferentes_ids.map(oferenteId => ({
                actividad_id: parseInt(id),
                oferente_id: parseInt(oferenteId)
              }))
            });
          }
        }

        // Actualizar beneficiarios si se proporcionan
        if (data.beneficiarios_ids && Array.isArray(data.beneficiarios_ids)) {
          await tx.actividades_beneficiarios.deleteMany({
            where: { actividad_id: parseInt(id) }
          });

          if (data.beneficiarios_ids.length > 0) {
            await tx.actividades_beneficiarios.createMany({
              data: data.beneficiarios_ids.map(beneficiarioId => ({
                actividad_id: parseInt(id),
                beneficiario_id: parseInt(beneficiarioId)
              }))
            });
          }
        }

        // Actualizar citas si se proporcionan datos de lugar/horario
        if (data.lugar_id || data.hora_inicio) {
          await tx.citas.updateMany({
            where: { actividad_id: parseInt(id) },
            data: {
              lugar_id: data.lugar_id ? parseInt(data.lugar_id) : undefined,
              fecha: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
              hora_inicio: data.hora_inicio ? new Date(`1970-01-01T${data.hora_inicio}`) : undefined,
              hora_fin: data.hora_fin ? new Date(`1970-01-01T${data.hora_fin}`) : undefined,
            }
          });
        }

        return actividad;
      });

      console.log('[ActividadService] Actividad actualizada:', resultado);
      return resultado;
    } catch (error) {
      console.error('[ActividadService] Error al actualizar actividad:', error);
      throw error;
    }
  }


  async cancelar(id, motivo) {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // Verificar que la actividad existe
      const actividadExistente = await tx.actividades.findUnique({
        where: { id: parseInt(id) }
      });

      if (!actividadExistente) {
        throw new Error('Actividad no encontrada');
      }

      // Verificar que no esté ya cancelada
      if (actividadExistente.estado === 'Cancelada') {
        throw new Error('Esta actividad ya está cancelada');
      }

      // Verificar que no haya pasado la fecha
      const fechaActual = new Date();
      if (new Date(actividadExistente.fecha_inicio) < fechaActual) {
        throw new Error('No se puede cancelar una actividad que ya ha ocurrido');
      }

      // Actualizar la actividad
      const actividad = await tx.actividades.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'Cancelada'
        },
        include: {
          tipos_actividad: true,
          socios_comunitarios: true,
          proyectos: true,
          actividades_oferentes: {
            include: {
              oferentes: true
            }
          },
          actividades_beneficiarios: {
            include: {
              beneficiarios: true
            }
          }
        }
      });

      // Cancelar todas las citas asociadas a esta actividad
      await tx.citas.updateMany({
        where: {
          actividad_id: parseInt(id),
          estado: { not: 'Cancelada' }
        },
        data: {
          estado: 'Cancelada',
          motivo_cancelacion: `Actividad cancelada: ${motivo}`
        }
      });

      return actividad;
    });

    console.log('[ActividadService] Actividad cancelada:', resultado);
    return resultado;
  } catch (error) {
    console.error('[ActividadService] Error al cancelar actividad:', error);
    throw error;
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

async obtenerSugerenciasAlternativas(lugarId, fecha, horaInicio) {
    // Implementar lógica para sugerir horarios/lugares alternativos
    // CA-11: Sugerencias de horarios/lugares alternativos
    try {
      const sugerencias = [];
      
      // Sugerir otros horarios en el mismo lugar
      const horasAlternativas = ['09:00', '11:00', '14:00', '16:00'];
      for (const hora of horasAlternativas) {
        if (hora !== horaInicio) {
          const disponible = await this.verificarDisponibilidadLugar(lugarId, fecha, hora);
          if (disponible.disponible) {
            sugerencias.push({
              tipo: 'horario',
              lugar_id: lugarId,
              fecha,
              hora
            });
          }
        }
      }

      // Sugerir otros lugares en el mismo horario
      const otrosLugares = await prisma.lugares.findMany({
        where: { 
          activo: true,
          id: { not: parseInt(lugarId) }
        }
      });

      for (const lugar of otrosLugares) {
        const disponible = await this.verificarDisponibilidadLugar(lugar.id, fecha, horaInicio);
        if (disponible.disponible) {
          sugerencias.push({
            tipo: 'lugar',
            lugar_id: lugar.id,
            lugar_nombre: lugar.nombre,
            fecha,
            hora: horaInicio
          });
        }
      }

      return sugerencias.slice(0, 5); // Máximo 5 sugerencias
    } catch (error) {
      console.error('[ActividadService] Error al obtener sugerencias:', error);
      return [];
    }
  }





async verificarDisponibilidadLugar(lugarId, fecha, horaInicio, horaFin, actividadExcluir = null) {
    try {
      const fechaCompleta = new Date(fecha);
      const horaInicioCompleta = new Date(`${fecha}T${horaInicio}`);
      const horaFinCompleta = horaFin ? new Date(`${fecha}T${horaFin}`) : null;

      const whereCondition = {
        lugar_id: parseInt(lugarId),
        fecha: fechaCompleta,
        estado: { not: 'Cancelada' },
        OR: [
          {
            hora_inicio: {
              gte: horaInicioCompleta,
              lt: horaFinCompleta || horaInicioCompleta
            }
          },
          {
            hora_fin: {
              gt: horaInicioCompleta,
              lte: horaFinCompleta || horaInicioCompleta
            }
          }
        ]
      };

      // Excluir la actividad actual si se está modificando
      if (actividadExcluir) {
        whereCondition.actividad_id = { not: parseInt(actividadExcluir) };
      }

      const citaConflicto = await prisma.citas.findFirst({
        where: whereCondition,
        include: {
          actividades: true,
          lugares: true
        }
      });

      if (citaConflicto) {
        const lugar = citaConflicto.lugares;
        const fechaFormateada = citaConflicto.fecha.toLocaleDateString();
        const horaInicioFormateada = citaConflicto.hora_inicio.toLocaleTimeString();
        const horaFinFormateada = citaConflicto.hora_fin?.toLocaleTimeString();
        
        // CA-11: Mensaje específico de conflicto
        const mensaje = `El lugar ${lugar.nombre} ya está ocupado el ${fechaFormateada} de ${horaInicioFormateada}${horaFinFormateada ? ` a ${horaFinFormateada}` : ''}`;
        
        return {
          disponible: false,
          mensaje,
          sugerencias: await this.obtenerSugerenciasAlternativas(lugarId, fecha, horaInicio)
        };
      }

      return { disponible: true };
    } catch (error) {
      console.error('[ActividadService] Error al verificar disponibilidad:', error);
      throw new Error('Error al verificar la disponibilidad del lugar');
    }
  }




}

module.exports = new ActividadService();
