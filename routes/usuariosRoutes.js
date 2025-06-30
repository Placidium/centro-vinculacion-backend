const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// ========================
// RUTAS DE USUARIOS
// ========================

// Listar todos los usuarios
router.get('/', authenticateToken, requirePermission('ver_usuarios'), usuariosController.listar);

// Obtener un usuario por su ID
router.get('/:id', authenticateToken, requirePermission('ver_usuarios'), usuariosController.obtenerPorId);

// Crear un nuevo usuario
router.post('/', authenticateToken, requirePermission('crear_usuario'), usuariosController.crear);

// Actualizar un usuario existente
router.put('/:id', authenticateToken, requirePermission('editar_usuario'), usuariosController.actualizar);

// Eliminar un usuario
router.delete('/:id', authenticateToken, requirePermission('eliminar_usuario'), usuariosController.eliminar);

// Actualizar permisos de un usuario
router.put(
  '/:id/permisos',
  authenticateToken,
  requirePermission('gestionar_permisos'), // Puedes cambiar el nombre del permiso si usas otro
  usuariosController.actualizarPermisos
);

// Solo para admin con permisos
router.get('/permisos-disponibles', authenticateToken, requirePermission('gestionar_permisos'), (req, res) => {
  const permisos = [
    'ver_usuarios',
    'crear_usuario',
    'editar_usuario',
    'eliminar_usuario',
    'gestionar_permisos'
  ];
  res.json(permisos);
});

module.exports = router;
