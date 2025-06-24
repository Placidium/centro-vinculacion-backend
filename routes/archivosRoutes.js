const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validateFileUpload = require('../middleware/validateFileUpload');
const { authenticateToken } = require('../middleware/auth');  // Desestructurado

const uploadDir = path.join(__dirname, '../uploads/actividades');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Solo se permiten archivos PDF.'), false);
};

const upload = multer({ storage, fileFilter });

router.use(authenticateToken);

router.get('/actividad/:idActividad', archivosController.obtenerTodos);

router.post('/actividad/:idActividad', upload.single('archivo'), validateFileUpload, archivosController.subir);

router.delete('/:id', archivosController.eliminar);

module.exports = router;
