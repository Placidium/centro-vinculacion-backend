const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    req.usuario = usuario;
    next();
  });
};

const requirePermission = (permiso) => (req, res, next) => {
  const permisos = req.usuario?.permisos || [];
  if (permisos.includes(permiso)) next();
  else res.status(403).json({ success: false, message: `Permiso denegado: ${permiso}` });
};

module.exports = {
  authenticateToken,
  requirePermission
};
