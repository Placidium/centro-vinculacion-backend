// middleware/preventDeleteIfRelated.js

const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const { id } = req.params;

  const relaciones = await prisma.actividades.findFirst({
    where: { mantenedor_id: parseInt(id) }
  });

  if (relaciones) {
    return res.status(400).json({ message: 'No se puede eliminar porque está siendo utilizado en actividades' });
  }

  next();
};
