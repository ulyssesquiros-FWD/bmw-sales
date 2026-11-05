const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Limitador de intentos para mitigar fuerza bruta y credential stuffing en login y registro
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    message: 'Demasiados intentos de autenticación desde esta dirección IP. Intente nuevamente en unos minutos.'
  }
});

const passwordMaxBytesRule = (value) => {
  if (typeof value !== 'string') {
    throw new Error('La contraseña debe ser una cadena de texto válida.');
  }
  if (Buffer.byteLength(value, 'utf8') > 72) {
    throw new Error('La contraseña no puede superar los 72 bytes en codificación UTF-8.');
  }
  return true;
};

const registerValidationRules = [
  body('nombre')
    .isString()
    .withMessage('El nombre debe ser texto válido.')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('correo')
    .isString()
    .withMessage('El correo electrónico debe ser texto válido.')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('Debe ingresar un correo electrónico con formato válido.')
    .isLength({ max: 120 })
    .withMessage('El correo electrónico no puede superar 120 caracteres.'),
  body('password')
    .isString()
    .withMessage('La contraseña debe ser texto válido.')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener un mínimo de 8 caracteres.')
    .custom(passwordMaxBytesRule)
];

const loginValidationRules = [
  body('correo')
    .isString()
    .withMessage('El correo electrónico debe ser texto válido.')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('Debe ingresar un correo electrónico con formato válido.')
    .isLength({ max: 120 })
    .withMessage('El correo electrónico no puede superar 120 caracteres.'),
  body('password')
    .isString()
    .withMessage('La contraseña debe ser texto válido.')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .custom(passwordMaxBytesRule)
];

router.post('/register', authRateLimiter, registerValidationRules, validateRequest, authController.register);
router.post('/login', authRateLimiter, loginValidationRules, validateRequest, authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

