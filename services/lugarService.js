const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LugarService {
  async obtenerTodos() {
    try {
      const lugares = await prisma.lugares.findMany({ orderBy: { nombre: 'asc' } });
      console.log('[LugarService] Lugares obtenidos');
      return lugares;
    } catch (error) {
      console.error('[LugarService] Error al obtener lugares:', error);
      throw new Error('Error al obtener los lugares');
    }
  }

async crear(data) {
  try {
    console.log('[LugarService] Datos recibidos:', data);

    // Validaciones básicas
    if (!data.nombre || typeof data.nombre !== 'string') {
      throw new Error('Nombre inválido');
    }
    if (typeof data.cupo !== 'number') {
      throw new Error('Cupo debe ser un número');
    }
    if (typeof data.activo !== 'boolean') {
      data.activo = true; // valor por defecto si no se entrega
    }

    // Verificar si ya existe un lugar con ese nombre (sin case-insensitive si no es compatible)
    const existente = await prisma.lugares.findFirst({
      where: {
        nombre: data.nombre
        // Elimina 'mode: insensitive' si usas SQLite
      }
    });

    if (existente) {
      const error = new Error('Ya existe un lugar con ese nombre.');
      error.code = 409;
      throw error;
    }

   const lugar = await prisma.lugares.create({
  data: {
    nombre: data.nombre,
    cupo: data.cupo ?? undefined,     // Asegura compatibilidad con Int?
    activo: data.activo ?? true       // Usa true si no viene definido
  }
});


    console.log('[LugarService] Lugar creado:', lugar);
    return lugar;
  } catch (error) {
    console.error('[LugarService] Error al crear lugar:', error.message);
    // Propaga el error con su código si es personalizado
    if (error.code === 409) throw error;
    throw new Error('Error al crear el lugar: ' + error.message);
  }
}

  async actualizar(id, data) {
    try {
      const lugar = await prisma.lugares.update({
        where: { id: parseInt(id) },
        data: {
          nombre: data.nombre,
          cupo: data.cupo,
          activo: data.activo
        }
      });
      console.log('[LugarService] Lugar actualizado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al actualizar lugar:', error);
      throw new Error('Error al actualizar el lugar');
    }
  }

  async eliminar(id) {
    try {
      const lugar = await prisma.lugares.delete({
        where: { id: parseInt(id) }
      });
      console.log('[LugarService] Lugar eliminado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al eliminar lugar:', error);
      throw new Error('Error al eliminar el lugar');
    }
  }

  async obtenerPorId(id) {
    try {
      const lugar = await prisma.lugares.findUnique({
        where: { id: parseInt(id) }
      });
      if (!lugar) {
        console.log('[LugarService] Lugar no encontrado');
        return null;
      }
      console.log('[LugarService] Lugar encontrado:', lugar);
      return lugar;
    } catch (error) {
      console.error('[LugarService] Error al obtener lugar:', error);
      throw new Error('Error al buscar el lugar');
    }
  }
}

module.exports = new LugarService();
