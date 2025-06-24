// routes/reportesRoutes.js

const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Reportes válidos (confirmados en el controller)
router.get('/citas-por-mes', reportesController.getCitasPorMes);
router.get('/citas-canceladas', reportesController.getCitasCanceladas);
router.get('/actividades-por-tipo', reportesController.getActividadesPorTipo);
router.get('/actividades-por-oferente', reportesController.getActividadesPorOferente);
router.get('/beneficiarios-mas-activos', reportesController.getBeneficiariosMasActivos);
router.get('/lugares-mas-usados', reportesController.getLugaresMasUsados);
router.get('/actividades-por-proyecto', reportesController.getActividadesPorProyecto);
router.get('/citas-reagendadas', reportesController.getCitasReagendadas);
router.get('/uso-por-usuario', reportesController.getUsoSistemaPorUsuario);
router.get('/citas-por-ciudad', reportesController.getCitasPorCiudad);
router.get('/actividades-por-proyecto/listado', reportesController.getListadoActividadesPorProyecto);
router.get('/actividades-por-proyecto/excel', reportesController.exportListadoActividadesPorProyectoExcel);
router.get('/actividades-por-proyecto/pdf', reportesController.exportListadoActividadesPorProyectoPDF);
router.get('/exportar-citas-mes/excel', reportesController.exportCitasPorMesExcel);
router.get('/exportar-citas-mes/pdf', reportesController.exportCitasPorMesPDF);
module.exports = router;
