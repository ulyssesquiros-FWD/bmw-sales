const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const formattedErrors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path || err.param,
    message: err.msg
  }));

  return res.status(400).json({
    ok: false,
    message: formattedErrors[0]?.message || 'Datos de entrada inválidos.',
    errors: formattedErrors
  });
}

module.exports = { validateRequest };

