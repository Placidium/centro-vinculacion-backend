const prisma = require('../utils/prisma'); // ✅ ya está importado correctamente

// Listar toda la auditoría
const listar = async (req, res) => {
  try {
    const auditorias = await prisma.auditoria.findMany({
      include: { usuario: true },
      orderBy: { fechaHora: 'desc' }
    });

    res.json({ success: true, data: auditorias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Filtrar auditoría
const filtrar = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, usuario_id, accion } = req.query;

    const filtros = {};

    if (fecha_inicio && fecha_fin) {
      filtros.fechaHora = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    if (usuario_id) {
      filtros.usuarioId = parseInt(usuario_id);
    }

    if (accion) {
      filtros.accion = {
        contains: accion,
        mode: 'insensitive'
      };
    }

    const resultados = await prisma.auditoria.findMany({
      where: filtros,
      include: { usuario: true },
      orderBy: { fechaHora: 'desc' }
    });

    res.json({ success: true, data: resultados });
  } catch (error) {
    console.error('Error al filtrar auditoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { listar, filtrar };
