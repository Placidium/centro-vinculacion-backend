// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Definimos la carpeta donde se almacenarán los archivos
const uploadDir = path.join(__dirname, '../uploads/actividades');

// Si la carpeta no existe, la creamos
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Tipos de archivos que se permiten subir
const tiposPermitidos = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

// Filtro para validar el tipo de archivo
const filtroDeArchivos = (req, file, cb) => {
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true); // Aceptado
  } else {
    cb(new Error('Formato de archivo no permitido.'), false); // Rechazado
  }
};

// Configuración del almacenamiento en disco
const almacenamiento = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Carpeta destino
  },
  filename: function (req, file, cb) {
    // Se genera un nombre único para evitar sobreescrituras
    const nombreArchivo = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, nombreArchivo);
  }
});

// Instancia de multer con la configuración definida
const upload = multer({ storage: almacenamiento, fileFilter: filtroDeArchivos });

module.exports = upload;
