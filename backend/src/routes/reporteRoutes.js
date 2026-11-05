const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

router.get('/ventas-periodo', reporteController.ventasPorPeriodo);
router.get('/inventario-valorizado', reporteController.inventarioValorizado);
router.get('/rendimiento-asesores', reporteController.rendimientoAsesores);
router.get('/resumen-ejecutivo', reporteController.resumenEjecutivo);

module.exports = router;

