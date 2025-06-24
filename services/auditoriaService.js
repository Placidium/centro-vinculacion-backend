// services/auditoriaService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registrarAccion = async ({ accion, entidad, registroId, descripcion, usuarioId }) => {
  await prisma.auditorias.create({
    data: {
      accion,
      entidad,
      registroId,
      descripcion,
      usuarioId
    }
  });
};

module.exports = {
  registrarAccion
};
