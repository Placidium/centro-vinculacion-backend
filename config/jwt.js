 
// config/jwt.js - Centralizar la configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_2024';

module.exports = {
  JWT_SECRET
};

// ===== ACTUALIZAR EN authService.js =====
// Reemplazar la línea:
// const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto';
// Por:
// const { JWT_SECRET } = require('../config/jwt');

// ===== ACTUALIZAR EN middleware.js =====
// Reemplazar la línea:
// const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';
// Por:
// const { JWT_SECRET } = require('../config/jwt');