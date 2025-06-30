const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const {
    nombre,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    lugar_id,
    tipo_actividad_id,
    periodicidad,
    socio_comunitario_id,
    proyecto_id,
    cupo,
    oferentes,
    beneficiarios
  } = req.body;

  try {
    // 1. Validar campos obligatorios
    const camposObligatorios = [
      { campo: nombre, nombre: 'Nombre de la cita' },
      { campo: fecha_inicio, nombre: 'Fecha de inicio' },
      { campo: fecha_fin, nombre: 'Fecha de fin' },
      { campo: hora_inicio, nombre: 'Hora de inicio' },
      { campo: hora_fin, nombre: 'Hora de fin' },
      { campo: lugar_id, nombre: 'Lugar' },
      { campo: tipo_actividad_id, nombre: 'Tipo de actividad' },
      { campo: periodicidad, nombre: 'Periodicidad' },
      { campo: socio_comunitario_id, nombre: 'Socio comunitario' },
      { campo: proyecto_id, nombre: 'Proyecto' },
      { campo: cupo, nombre: 'Cupo' }
    ];

    for (const { campo, nombre } of camposObligatorios) {
      if (campo === undefined || campo === null || campo === '') {
        return res.status(400).json({ message: `El campo "${nombre}" es obligatorio.` });
      }
    }

    if (isNaN(cupo) || Number(cupo) <= 0) {
      return res.status(400).json({ message: 'El campo "Cupo" debe ser un número positivo.' });
    }

    // 2. Validar oferentes y beneficiarios
    if (!Array.isArray(oferentes) || oferentes.length === 0) {
      return res.status(400).json({ message: 'Debe seleccionar al menos un oferente.' });
    }

    if (!Array.isArray(beneficiarios) || beneficiarios.length === 0) {
      return res.status(400).json({ message: 'Debe seleccionar al menos un beneficiario.' });
    }

    // 3. Validar fechas y horas
    const fechaIni = new Date(fecha_inicio);
    const fechaFinReal = new Date(fecha_fin);
    const horaIni = new Date(`${fecha_inicio}T${hora_inicio}`);
    const horaFinReal = new Date(`${fecha_inicio}T${hora_fin}`);

    if (isNaN(fechaIni) || isNaN(fechaFinReal) || isNaN(horaIni) || isNaN(horaFinReal)) {
      return res.status(400).json({ message: 'Fechas u horas inválidas.' });
    }

    if (horaIni >= horaFinReal) {
      return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio.' });
    }

    if (periodicidad === 'Puntual' && fecha_inicio !== fecha_fin) {
      return res.status(400).json({ message: 'Una cita puntual debe tener la misma fecha de inicio y fin.' });
    }

    // 4. Validar existencia y estado del lugar
    const lugar = await prisma.lugares.findUnique({ where: { id: Number(lugar_id) } });
    if (!lugar || lugar.activo === false) {
      return res.status(404).json({ message: 'El lugar seleccionado no existe o está inactivo.' });
    }

    // 4.1 Validar que el cupo no exceda la capacidad del lugar
    if (lugar.cupo !== null && Number(cupo) > lugar.cupo) {
      return res.status(400).json({
        message: `El cupo asignado (${cupo}) excede la capacidad del lugar (${lugar.cupo}).`
      });
    }

    // 5. Validar conflicto de lugar y horario
    const conflicto = await prisma.citas.findFirst({
      where: {
        lugar_id: Number(lugar_id),
        fecha: fechaIni,
        hora_inicio: {
          lte: horaFinReal,
        },
        hora_fin: {
          gte: horaIni,
        },
        estado: 'Programada',
      },
    });

    if (conflicto) {
      return res.status(409).json({
        message: `El lugar ya está ocupado el ${fecha_inicio} de ${hora_inicio} a ${hora_fin}.`
      });
    }

    next();

  } catch (error) {
    console.error('Error en validación de cita:', error);
    res.status(500).json({ message: 'Error en la validación del formulario.' });
  }
};
