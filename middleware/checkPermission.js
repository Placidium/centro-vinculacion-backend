// middlewares/checkPermission.js
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    // CAMBIO: req.user por req.usuario para coincidir con auth.js
    const permisos = req.usuario?.permisos || [];

    // Debug temporal - puedes eliminarlo después
    console.log('Permisos del usuario:', permisos);
    console.log('Permiso requerido:', requiredPermission);

    if (!permisos.includes(requiredPermission)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para realizar esta acción',
      });
    }

    next();
  };
}

module.exports = checkPermission;