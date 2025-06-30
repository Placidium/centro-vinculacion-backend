const jwt = require('jsonwebtoken');

// Clave secreta del JWT
const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

// Middleware para autenticar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Formato esperado: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado.'
      });
    }

    req.usuario = usuario; // Decodificado: { id, email, permisos, ... }
    next();
  });
};

// Middleware para verificar permisos específicos
const requirePermission = (permiso) => (req, res, next) => {
  const permisos = req.usuario?.permisos || [];

  if (permisos.includes(permiso)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: `Permiso denegado: ${permiso}`
    });
  }
};

module.exports = {
  authenticateToken,
  requirePermission
};
