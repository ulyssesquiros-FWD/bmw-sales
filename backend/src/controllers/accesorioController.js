const accesorioModel = require('../models/accesorioModel');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const listarAccesorios = asyncHandler(async (req, res) => {
  const { categoria, search } = req.query;
  const accesorios = await accesorioModel.findAll({ categoria, search });
  return res.status(200).json({
    ok: true,
    count: accesorios.length,
    data: accesorios
  });
});

const obtenerAccesorioPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const accesorio = await accesorioModel.findById(id);
  if (!accesorio) {
    throw new AppError('El accesorio BMW solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    data: accesorio
  });
});

const crearAccesorio = asyncHandler(async (req, res) => {
  const nuevo = await accesorioModel.create(req.body);
  return res.status(201).json({
    ok: true,
    message: 'Accesorio / Pieza BMW M Performance registrada exitosamente.',
    data: nuevo
  });
});

const actualizarAccesorio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existente = await accesorioModel.findById(id);
  if (!existente) {
    throw new AppError('El accesorio BMW solicitado no existe.', 404);
  }
  const actualizado = await accesorioModel.update(id, req.body);
  return res.status(200).json({
    ok: true,
    message: 'Accesorio actualizado exitosamente.',
    data: actualizado
  });
});

const eliminarAccesorio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const eliminado = await accesorioModel.remove(id);
  if (!eliminado) {
    throw new AppError('El accesorio BMW solicitado no existe.', 404);
  }
  return res.status(200).json({
    ok: true,
    message: 'Accesorio eliminado exitosamente.'
  });
});

module.exports = {
  listarAccesorios,
  obtenerAccesorioPorId,
  crearAccesorio,
  actualizarAccesorio,
  eliminarAccesorio
};

