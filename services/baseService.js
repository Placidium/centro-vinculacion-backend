// services/baseService.js
class BaseService {
  constructor(modelo, nombreEntidad) {
    this.modelo = modelo;
    this.nombreEntidad = nombreEntidad;
  }

  async crear(data) {
    return await this.modelo.create({ data });
  }

  async obtenerTodos(filtros = {}) {
    return await this.modelo.findMany({ where: filtros });
  }

  async obtenerPorId(id) {
    return await this.modelo.findUnique({ where: { id: parseInt(id) } });
  }

  async actualizar(id, data) {
    return await this.modelo.update({ where: { id: parseInt(id) }, data });
  }

  async eliminar(id) {
    return await this.modelo.delete({ where: { id: parseInt(id) } });
  }

  async existe(id) {
    const entidad = await this.obtenerPorId(id);
    return Boolean(entidad);
  }
}

module.exports = BaseService;
