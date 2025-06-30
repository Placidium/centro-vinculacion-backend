// middlewares/checkAuth.js
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma'); // ✅ ajusta la ruta según tu carpeta real


const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      include: {
        permisos_usuario_permisos_usuario_usuario_idTousuarios: true
      }
    });

    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    req.user = {
      id: usuario.id,
      email: usuario.email,
      permisos: usuario.permisos_usuario_permisos_usuario_usuario_idTousuarios.map(p => p.permiso)
    };

    next();
  } catch (err) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

module.exports = checkAuth;
