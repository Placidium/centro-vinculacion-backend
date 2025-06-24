const express = require('express');
const app = express();

// Middleware básico para parsear JSON
app.use(express.json());

// Middleware para logging básico (opcional, para debug)
app.use((req, res, next) => {
  console.log(`Ruta solicitada: ${req.method} ${req.url}`);
  next();
});

// Importar rutas
const tipoActividadRoutes = require('./routes/tipoActividadRoutes');
const lugaresRoutes = require('./routes/lugaresRoutes');
const oferentesRoutes = require('./routes/oferentesRoutes');
const sociosComunitariosRoutes = require('./routes/sociosComunitariosRoutes');
const beneficiariosRoutes = require('./routes/beneficiariosRoutes');
const proyectosRoutes = require('./routes/proyectosRoutes');
const actividadesRoutes = require('./routes/actividadesRoutes');
const citasRoutes = require('./routes/citasRoutes');
const archivosRoutes = require('./routes/archivosRoutes');
const usuarioRoutes = require('./routes/usuariosRoutes');
const permisosUsuarioRoutes = require('./routes/permisosUsuarioRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const authRoutes = require('./routes/authRoutes');  // Auth rutas

// Montar rutas
app.use('/api/tipos-actividad', tipoActividadRoutes);
app.use('/api/lugares', lugaresRoutes);
app.use('/api/oferentes', oferentesRoutes);
app.use('/api/socios-comunitarios', sociosComunitariosRoutes);
app.use('/api/beneficiarios', beneficiariosRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/uploads/actividades', express.static('uploads/actividades'));
app.use('/uploads', express.static('uploads'));
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/permisos-usuario', permisosUsuarioRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/auditorias', auditoriaRoutes);
app.use('/api/auth', authRoutes);

// Ruta raíz opcional
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
