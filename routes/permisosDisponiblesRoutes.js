const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');


// Lista fija de permisos que se pueden asignar
const permisosDisponibles = [
  'ver_usuarios',
  'gestionar_permisos',
  'crear_citas',
  'ver_citas',
  'editar_citas',
  'cancelar_citas',
  'subir_archivos',
  'ver_reportes'
];

router.get('/permisos-disponibles', authenticateToken, (req, res) => {
  res.json({ success: true, permisos: permisosDisponibles });
});


module.exports = router;
