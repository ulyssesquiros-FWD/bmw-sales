const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');
const { generateAccessToken } = require('../services/tokenService');
const { asyncHandler } = require('../middleware/errorHandler');

const BCRYPT_SALT_ROUNDS = 12;

// Hash señuelo precalculado a costo 12 para mitigar enumeración de usuarios por tiempos de respuesta
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('BmwPremiumMotors_TimingGuard_2026!', BCRYPT_SALT_ROUNDS);

const register = asyncHandler(async (req, res) => {
  const nombre = req.body.nombre.trim();
  const correo = req.body.correo.trim().toLowerCase();
  const password = req.body.password;

  const correoExistente = await usuarioModel.existsByCorreo(correo);
  if (correoExistente) {
    return res.status(400).json({
      success: false,
      ok: false,
      message: 'El correo electrónico ingresado ya está registrado.'
    });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    const nuevoUsuario = await usuarioModel.create({
      nombre,
      correo,
      password_hash: passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo
      }
    });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        ok: false,
        message: 'El correo electrónico ingresado ya está registrado.'
      });
    }
    throw err;
  }
});

const login = asyncHandler(async (req, res) => {
  const correo = req.body.correo.trim().toLowerCase();
  const password = req.body.password;

  const usuario = await usuarioModel.findByCorreoForAuth(correo);

  if (!usuario) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    return res.status(401).json({
      success: false,
      ok: false,
      message: 'Correo electrónico o contraseña incorrectos.'
    });
  }

  const passwordCoincide = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordCoincide) {
    return res.status(401).json({
      success: false,
      ok: false,
      message: 'Correo electrónico o contraseña incorrectos.'
    });
  }

  const { token, expiresIn } = generateAccessToken(usuario.id_usuario);

  return res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    token,
    expiresIn,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    usuario: {
      id_usuario: req.user.id_usuario,
      nombre: req.user.nombre,
      correo: req.user.correo,
      fecha_creacion: req.user.fecha_creacion
    }
  });
});

module.exports = {
  register,
  login,
  getMe
};

