// controllers/archivosController.js

const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

const archivosController = {
  // Subir archivo a una actividad
  async subir(req, res) {
    try {
      const { idActividad } = req.params;
      const { tipo_adjunto, descripcion } = req.body;
      const archivo = req.file;
      const usuarioId = req.usuario.id;

      if (!archivo) {
        return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
      }

      const nuevoArchivo = await prisma.archivos.create({
        data: {
          nombre: archivo.originalname,
          ruta: archivo.filename,
          tipo: archivo.mimetype,
          tamano: archivo.size,
          tipo_adjunto,
          descripcion,
          actividad_id: parseInt(idActividad),
          cargado_por: usuarioId,
        },
      });

      res.status(201).json({ success: true, message: 'Archivo subido exitosamente.', data: nuevoArchivo });
    } catch (error) {
      console.error('Error al subir archivo:', error);
      res.status(500).json({ success: false, message: 'Error interno al subir archivo.' });
    }
  },

  // Listar archivos por actividad
  async obtenerTodos(req, res) {
    try {
      const { idActividad } = req.params;
      const archivos = await prisma.archivos.findMany({
        where: { actividad_id: parseInt(idActividad) },
        orderBy: { fecha_carga: 'desc' },
      });

      res.json({ success: true, data: archivos });
    } catch (error) {
      console.error('Error al listar archivos:', error);
      res.status(500).json({ success: false, message: 'Error interno al listar archivos.' });
    }
  },

  // Descargar archivo
  async descargarArchivo(req, res) {
    try {
      const { id } = req.params;
      const archivo = await prisma.archivos.findUnique({
        where: { id: parseInt(id) },
      });

      if (!archivo) {
        return res.status(404).json({ success: false, message: 'Archivo no encontrado.' });
      }

      const rutaCompleta = path.join(__dirname, '../uploads', archivo.ruta);
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({ success: false, message: 'El archivo no existe físicamente.' });
      }

      res.download(rutaCompleta, archivo.nombre);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      res.status(500).json({ success: false, message: 'Error interno al descargar archivo.' });
    }
  },

  // Eliminar archivo
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const archivo = await prisma.archivos.findUnique({ where: { id: parseInt(id) } });

      if (!archivo) {
        return res.status(404).json({ success: false, message: 'Archivo no encontrado.' });
      }

      await prisma.archivos.delete({ where: { id: archivo.id } });

      const rutaCompleta = path.join(__dirname, '../uploads', archivo.ruta);
      if (fs.existsSync(rutaCompleta)) {
        fs.unlinkSync(rutaCompleta);
      }

      res.json({ success: true, message: 'Archivo eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      res.status(500).json({ success: false, message: 'Error interno al eliminar archivo.' });
    }
  },
};

module.exports = archivosController;
