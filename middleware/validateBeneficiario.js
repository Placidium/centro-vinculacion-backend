// middleware/validateBeneficiario.js

module.exports = (req, res, next) => {
  const { caracterizacion } = req.body;

  // Campo requerido
  if (!caracterizacion || caracterizacion.trim() === '') {
    return res.status(400).json({ message: 'La caracterización es obligatoria' });
  }

  // Longitud máxima
  if (caracterizacion.trim().length > 200) {
    return res.status(400).json({ message: 'La caracterización no puede exceder los 200 caracteres' });
  }

  next();
};
