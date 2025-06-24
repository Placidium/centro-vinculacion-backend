// middleware/validateRelacionesExisten.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const validateRelacionesExisten = async (req, res, next) => {
  const { tipoActividadId, socioComunitarioId, proyectoId, oferentesIds, beneficiariosIds } = req.body;

  try {
    if (tipoActividadId) {
      const tipoActividad = await prisma.tipos_actividad.findUnique({ where: { id: tipoActividadId } });
      if (!tipoActividad) {
        return res.status(400).json({ success: false, message: 'Tipo de actividad no existe' });
      }
    }

    if (socioComunitarioId) {
      const socio = await prisma.socios_comunitarios.findUnique({ where: { id: socioComunitarioId } });
      if (!socio) {
        return res.status(400).json({ success: false, message: 'Socio comunitario no existe' });
      }
    }

    if (proyectoId) {
      const proyecto = await prisma.proyectos.findUnique({ where: { id: proyectoId } });
      if (!proyecto) {
        return res.status(400).json({ success: false, message: 'Proyecto no existe' });
      }
    }

    if (oferentesIds && Array.isArray(oferentesIds)) {
      for (const id of oferentesIds) {
        const oferente = await prisma.oferentes.findUnique({ where: { id } });
        if (!oferente) {
          return res.status(400).json({ success: false, message: `Oferente con id ${id} no existe` });
        }
      }
    }

    if (beneficiariosIds && Array.isArray(beneficiariosIds)) {
      for (const id of beneficiariosIds) {
        const beneficiario = await prisma.beneficiarios.findUnique({ where: { id } });
        if (!beneficiario) {
          return res.status(400).json({ success: false, message: `Beneficiario con id ${id} no existe` });
        }
      }
    }

    next();
  } catch (error) {
    console.error('[validateRelacionesExisten] Error:', error);
    res.status(500).json({ success: false, message: 'Error al validar relaciones' });
  }
};

module.exports = validateRelacionesExisten;
