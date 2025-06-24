// middleware/auditoria.js
const prisma = require('../utils/prisma');

const auditoria = (accion) => {
  return async (req, res, next) => {
    try {
      const usuarioId = req.usuario ? req.usuario.id : null;
      const descripcion = `${accion} - ${req.method} ${req.originalUrl}`;

      await prisma.auditoria.create({
        data: {
          usuario_id: usuarioId,
          accion,
          descripcion,
          fecha: new Date()
        }
      });

      next();
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      next();
    }
  };
};

module.exports = auditoria;

// Prisma model para Auditoría (schema.prisma)
// model auditoria {
//   id          Int       @id @default(autoincrement())
//   usuario_id  Int?
//   accion      String
//   descripcion String?
//   fecha       DateTime  @default(now())

//   usuarios    usuarios? @relation(fields: [usuario_id], references: [id])
// }
