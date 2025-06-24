const prisma = require('../utils/prisma');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const reportesController = {
  // Reporte 1: Citas por mes (con filtro por fechas)
  async getCitasPorMes(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const resultado = await prisma.$queryRaw`
        SELECT 
          MONTH(fecha) AS mes, 
          YEAR(fecha) AS anio, 
          COUNT(*) AS total_citas
        FROM citas
        WHERE fecha >= ${new Date(fecha_inicio)} AND fecha <= ${new Date(fecha_fin)}
        GROUP BY anio, mes
        ORDER BY anio DESC, mes DESC;
      `;
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error al obtener reporte de citas por mes:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async exportCitasPorMesExcel(req, res) {
    try {
      const resultado = await prisma.$queryRaw`
        SELECT 
          MONTH(fecha) AS mes, 
          YEAR(fecha) AS anio, 
          COUNT(*) AS total_citas
        FROM citas
        GROUP BY anio, mes
        ORDER BY anio DESC, mes DESC;
      `;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Citas por Mes');

      worksheet.columns = [
        { header: 'Año', key: 'anio' },
        { header: 'Mes', key: 'mes' },
        { header: 'Total Citas', key: 'total_citas' }
      ];

      resultado.forEach(row => worksheet.addRow(row));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=citas_por_mes.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      res.status(500).json({ success: false, message: 'Error al exportar a Excel' });
    }
  },

  async exportCitasPorMesPDF(req, res) {
    try {
      const resultado = await prisma.$queryRaw`
        SELECT 
          MONTH(fecha) AS mes, 
          YEAR(fecha) AS anio, 
          COUNT(*) AS total_citas
        FROM citas
        GROUP BY anio, mes
        ORDER BY anio DESC, mes DESC;
      `;

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=citas_por_mes.pdf');

      doc.pipe(res);

      doc.fontSize(16).text('Reporte: Citas por Mes', { align: 'center' });
      doc.moveDown();

      resultado.forEach(row => {
        doc.fontSize(12).text(`Año: ${row.anio} | Mes: ${row.mes} | Total Citas: ${row.total_citas}`);
      });

      doc.end();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      res.status(500).json({ success: false, message: 'Error al exportar a PDF' });
    }
  },

  async getCitasCanceladas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const citas = await prisma.citas.findMany({
        where: {
          estado: 'Cancelada',
          fecha: {
            gte: fecha_inicio ? new Date(fecha_inicio) : undefined,
            lte: fecha_fin ? new Date(fecha_fin) : undefined
          }
        },
        include: {
          usuarios: { select: { id: true, nombre: true, email: true } },
          actividades: { select: { id: true, nombre: true } },
          lugares: { select: { id: true, nombre: true } }
        },
        orderBy: { fecha: 'desc' }
      });
      res.json({ success: true, data: citas });
    } catch (error) {
      console.error('Error al obtener citas canceladas:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getActividadesPorTipo(req, res) {
    try {
      const resultados = await prisma.actividades.groupBy({
        by: ['tipo_actividad_id'],
        _count: { id: true }
      });
      const tipos = await prisma.tipos_actividad.findMany();
      const datos = resultados.map(r => {
        const tipo = tipos.find(t => t.id === r.tipo_actividad_id);
        return {
          tipo_actividad_id: r.tipo_actividad_id,
          nombre: tipo?.nombre || 'Desconocido',
          total_actividades: r._count.id
        };
      });
      res.json({ success: true, data: datos });
    } catch (error) {
      console.error('Error al obtener actividades por tipo:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getActividadesPorOferente(req, res) {
    try {
      const resultados = await prisma.actividades_oferentes.groupBy({
        by: ['oferente_id'],
        _count: { id: true }
      });
      const oferentes = await prisma.oferentes.findMany();
      const datos = resultados.map(r => {
        const oferente = oferentes.find(o => o.id === r.oferente_id);
        return {
          oferente_id: r.oferente_id,
          nombre: oferente?.nombre || 'Desconocido',
          total_actividades: r._count.id
        };
      });
      res.json({ success: true, data: datos });
    } catch (error) {
      console.error('Error al obtener actividades por oferente:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getBeneficiariosMasActivos(req, res) {
    try {
      const resultados = await prisma.citas_beneficiarios.groupBy({
        by: ['beneficiario_id'],
        _count: { id: true }
      });
      const beneficiarios = await prisma.beneficiarios.findMany();
      const datos = resultados.map(r => {
        const beneficiario = beneficiarios.find(b => b.id === r.beneficiario_id);
        return {
          beneficiario_id: r.beneficiario_id,
          nombre: beneficiario?.nombre || 'Desconocido',
          total_citas: r._count.id
        };
      }).sort((a, b) => b.total_citas - a.total_citas);
      res.json({ success: true, data: datos });
    } catch (error) {
      console.error('Error al obtener beneficiarios más activos:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getLugaresMasUsados(req, res) {
    try {
      const resultados = await prisma.citas.groupBy({
        by: ['lugar_id'],
        _count: { id: true }
      });
      const lugares = await prisma.lugares.findMany();
      const datos = resultados.map(r => {
        const lugar = lugares.find(l => l.id === r.lugar_id);
        return {
          lugar_id: r.lugar_id,
          nombre: lugar?.nombre || 'Desconocido',
          total_citas: r._count.id
        };
      }).sort((a, b) => b.total_citas - a.total_citas);
      res.json({ success: true, data: datos });
    } catch (error) {
      console.error('Error al obtener lugares más usados:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getActividadesPorProyecto(req, res) {
    try {
      const resultados = await prisma.actividades.groupBy({
        by: ['proyecto_id'],
        _count: { id: true }
      });
      const proyectos = await prisma.proyectos.findMany();
      const datos = resultados.map(r => {
        const proyecto = proyectos.find(p => p.id === r.proyecto_id);
        return {
          proyecto_id: r.proyecto_id,
          nombre: proyecto?.nombre || 'Sin nombre',
          total_actividades: r._count.id
        };
      }).sort((a, b) => b.total_actividades - a.total_actividades);
      res.json({ success: true, data: datos });
    } catch (error) {
      console.error('Error al obtener actividades por proyecto:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getCitasReagendadas(req, res) {
    try {
      const citas = await prisma.citas.findMany({
        where: {
          estado: 'Programada',
          NOT: { motivo_cancelacion: null }
        },
        include: {
          usuarios: { select: { id: true, nombre: true } },
          actividades: { select: { id: true, nombre: true } },
          lugares: { select: { id: true, nombre: true } }
        },
        orderBy: { fecha: 'desc' }
      });
      res.json({ success: true, data: citas });
    } catch (error) {
      console.error('Error al obtener citas reagendadas:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getUsoSistemaPorUsuario(req, res) {
    try {
      const acciones = await prisma.auditoria.findMany({
        include: {
          usuario: { select: { id: true, nombre: true } }
        }
      });
      const resumen = {};
      acciones.forEach(a => {
        const uid = a.usuarioId || 'desconocido';
        if (!resumen[uid]) {
          resumen[uid] = {
            usuario_id: a.usuarioId,
            nombre: a.usuario?.nombre || 'Desconocido',
            total_acciones: 0,
            ultima_accion: a.fechaHora
          };
        }
        resumen[uid].total_acciones++;
        if (a.fechaHora > resumen[uid].ultima_accion) {
          resumen[uid].ultima_accion = a.fechaHora;
        }
      });
      const resultado = Object.values(resumen).sort((a, b) => b.total_acciones - a.total_acciones);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error al obtener uso del sistema por usuario:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getCitasPorCiudad(req, res) {
    try {
      const beneficiarios = await prisma.beneficiarios.findMany({
        select: { id: true, ciudad: true, citas_beneficiarios: true }
      });
      const ciudadConteo = {};
      beneficiarios.forEach(b => {
        const ciudad = b.ciudad || 'Sin ciudad';
        const totalCitas = b.citas_beneficiarios.length;
        if (!ciudadConteo[ciudad]) ciudadConteo[ciudad] = 0;
        ciudadConteo[ciudad] += totalCitas;
      });
      const resultado = Object.entries(ciudadConteo).map(([ciudad, total_citas]) => ({ ciudad, total_citas }))
        .sort((a, b) => b.total_citas - a.total_citas);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error al obtener citas por ciudad:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
  },

  async getKPIs(req, res) {
    try {
      const totalCitas = await prisma.citas.count();
      const totalCanceladas = await prisma.citas.count({ where: { estado: 'Cancelada' } });
      const totalUsuarios = await prisma.usuarios.count();
      const totalActividades = await prisma.actividades.count();
      res.json({
        success: true,
        data: {
          totalCitas,
          totalCanceladas,
          porcentajeCanceladas: ((totalCanceladas / totalCitas) * 100).toFixed(2),
          totalUsuarios,
          totalActividades
        }
      });
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      res.status(500).json({ success: false, message: 'Error al calcular KPIs' });
    }
  },

   // ✅ Reporte 11: Actividades filtradas por proyecto
  async getListadoActividadesPorProyecto(req, res) {
    try {
      const { proyecto_id } = req.query;

      if (!proyecto_id) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar un ID de proyecto' });
      }

      const actividades = await prisma.actividades.findMany({
        where: {
          proyecto_id: parseInt(proyecto_id)
        },
        include: {
          tipos_actividad: { select: { nombre: true } },
          socios_comunitarios: { select: { nombre: true } },
          proyectos: { select: { nombre: true } }
        },
        orderBy: { fecha_inicio: 'desc' }
      });

      res.json({ success: true, data: actividades });
    } catch (error) {
      console.error('Error al obtener actividades filtradas por proyecto:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el reporte por proyecto' });
    }
  },

  // 📥 Exportar listado de actividades por proyecto a Excel
  async exportListadoActividadesPorProyectoExcel(req, res) {
    try {
      const { proyecto_id } = req.query;
      if (!proyecto_id) return res.status(400).json({ success: false, message: 'ID de proyecto requerido' });

      const actividades = await prisma.actividades.findMany({
        where: { proyecto_id: parseInt(proyecto_id) },
        include: {
          tipos_actividad: { select: { nombre: true } },
          socios_comunitarios: { select: { nombre: true } },
          proyectos: { select: { nombre: true } }
        },
        orderBy: { fecha_inicio: 'desc' }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Actividades por Proyecto');

      worksheet.columns = [
        { header: 'Nombre', key: 'nombre' },
        { header: 'Tipo Actividad', key: 'tipo' },
        { header: 'Socio Comunitario', key: 'socio' },
        { header: 'Fecha Inicio', key: 'inicio' },
        { header: 'Fecha Fin', key: 'fin' }
      ];

      actividades.forEach(a => {
        worksheet.addRow({
          nombre: a.nombre,
          tipo: a.tipos_actividad?.nombre || 'N/A',
          socio: a.socios_comunitarios?.nombre || 'N/A',
          inicio: a.fecha_inicio?.toISOString().split('T')[0],
          fin: a.fecha_fin?.toISOString().split('T')[0] || 'N/A'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=actividades_por_proyecto.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      res.status(500).json({ success: false, message: 'Error al exportar actividades a Excel' });
    }
  },

  // 📥 Exportar listado de actividades por proyecto a PDF
  async exportListadoActividadesPorProyectoPDF(req, res) {
    try {
      const { proyecto_id } = req.query;
      if (!proyecto_id) return res.status(400).json({ success: false, message: 'ID de proyecto requerido' });

      const actividades = await prisma.actividades.findMany({
        where: { proyecto_id: parseInt(proyecto_id) },
        include: {
          tipos_actividad: { select: { nombre: true } },
          socios_comunitarios: { select: { nombre: true } },
          proyectos: { select: { nombre: true } }
        },
        orderBy: { fecha_inicio: 'desc' }
      });

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=actividades_por_proyecto.pdf');

      doc.pipe(res);
      doc.fontSize(16).text('Actividades del Proyecto', { align: 'center' });
      doc.moveDown();

      actividades.forEach(a => {
        doc.fontSize(12).text(`• ${a.nombre} | Tipo: ${a.tipos_actividad?.nombre || 'N/A'} | Socio: ${a.socios_comunitarios?.nombre || 'N/A'} | Inicio: ${a.fecha_inicio?.toISOString().split('T')[0]} | Fin: ${a.fecha_fin?.toISOString().split('T')[0] || 'N/A'}`);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      res.status(500).json({ success: false, message: 'Error al exportar actividades a PDF' });
    }
  }
};
module.exports = reportesController;
