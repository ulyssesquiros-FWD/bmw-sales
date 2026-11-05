const reporteModel = require('../models/reporteModel');
const { asyncHandler } = require('../middleware/errorHandler');

const ventasPorPeriodo = asyncHandler(async (req, res) => {
  const data = await reporteModel.getVentasPorPeriodo();
  return res.status(200).json({
    ok: true,
    data
  });
});

const inventarioValorizado = asyncHandler(async (req, res) => {
  const data = await reporteModel.getInventarioValorizado();
  return res.status(200).json({
    ok: true,
    data
  });
});

const rendimientoAsesores = asyncHandler(async (req, res) => {
  const data = await reporteModel.getRendimientoAsesores();
  return res.status(200).json({
    ok: true,
    data
  });
});

const resumenEjecutivo = asyncHandler(async (req, res) => {
  const data = await reporteModel.getResumenFinanciero();
  return res.status(200).json({
    ok: true,
    moneda: 'USD',
    data
  });
});

module.exports = {
  ventasPorPeriodo,
  inventarioValorizado,
  rendimientoAsesores,
  resumenEjecutivo
};
