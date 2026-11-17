const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const { generateAccessToken } = require('../services/tokenService');
const { asyncHandler } = require('../middleware/errorHandler');

const BCRYPT_SALT_ROUNDS = 12;

// Hash señuelo precalculado a costo 12 para mitigar enumeración de usuarios por tiempos de respuesta
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('BmwPremiumMotors_TimingGuard_2026!', BCRYPT_SALT_ROUNDS);

function formatPublicUser(u) {
  return {
    id_usuario: u.id_usuario,
    nombre: u.nombre,
    correo: u.correo,
    id_empresa: Number(u.id_empresa || 1),
    empresa_id: Number(u.id_empresa || 1),
    empresa_nombre: u.empresa_nombre || 'BMW Premium Motors Corporativo',
    rol: u.rol || 'admin',
    id_plan: Number(u.id_plan || 2),
    plan_nombre: u.plan_nombre || 'Pro',
    max_documentos: Number(u.max_documentos || 500),
    max_preguntas_mes: Number(u.max_preguntas_mes || 10000),
    fecha_creacion: u.fecha_creacion
  };
}

const register = asyncHandler(async (req, res) => {
  const nombre = req.body.nombre.trim();
  const correo = req.body.correo.trim().toLowerCase();
  const password = req.body.password;
  const empresaNombre = (req.body.empresa_nombre || req.body.nombre_empresa || '').trim();
  const planNombre = (req.body.plan || 'Gratis').trim();

  const correoExistente = await usuarioModel.existsByCorreo(correo);
  if (correoExistente) {
    return res.status(400).json({
      success: false,
      ok: false,
      message: 'El correo electrónico ingresado ya está registrado.'
    });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  let idEmpresa = 1;
  let rol = 'admin';

  if (empresaNombre) {
    const nuevaEmpresa = await empresaModel.createEmpresa({
      nombre: empresaNombre,
      plan: planNombre
    });
    idEmpresa = nuevaEmpresa.id_empresa;
    rol = 'admin';
  }

  try {
    const nuevoUsuario = await usuarioModel.create({
      nombre,
      correo,
      password_hash: passwordHash,
      id_empresa: idEmpresa,
      rol
    });

    const { token, expiresIn } = generateAccessToken(nuevoUsuario);

    return res.status(201).json({
      success: true,
      ok: true,
      message: empresaNombre
        ? `Empresa "${empresaNombre}" y administrador inicial registrados correctamente`
        : 'Usuario registrado correctamente',
      token,
      expiresIn,
      usuario: formatPublicUser(nuevoUsuario)
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

  const { token, expiresIn } = generateAccessToken(usuario);

  return res.status(200).json({
    success: true,
    ok: true,
    message: 'Inicio de sesión exitoso',
    token,
    expiresIn,
    usuario: formatPublicUser(usuario)
  });
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    ok: true,
    usuario: formatPublicUser(req.user)
  });
});

module.exports = {
  register,
  login,
  getMe
};
