const bcrypt = require('bcryptjs');
const empresaModel = require('../models/empresaModel');
const usuarioModel = require('../models/usuarioModel');
const deepseekService = require('../services/deepseekService');
const visionService = require('../services/visionService');
const localEmbeddingService = require('../services/localEmbeddingService');
const { asyncHandler } = require('../middleware/errorHandler');

const BCRYPT_SALT_ROUNDS = 12;

/**
 * GET /api/empresa/mi-empresa
 * Obtiene información de la empresa derivada del JWT, plan actual, consumo, cuotas y stack IA activo.
 */
const getMiEmpresa = asyncHandler(async (req, res) => {
  const empresa = await empresaModel.getEmpresaWithStats(req.user.empresa_id);
  const planes = await empresaModel.listPlanes();

  if (!empresa) {
    return res.status(404).json({
      ok: false,
      error: 'Empresa asociada no encontrada.'
    });
  }

  const deepseekCfg = deepseekService.getDeepSeekConfig();
  const visionCfg = visionService.getVisionConfig();

  return res.status(200).json({
    ok: true,
    data: {
      ...empresa,
      planes_disponibles: planes,
      ai_stack: {
        generative_provider: 'DeepSeek',
        generative_model: deepseekCfg.model,
        deepseek_configured: deepseekCfg.isConfigured,
        vision_provider: 'OpenAI GPT-4o Vision',
        vision_model: visionCfg.model,
        vision_configured: visionCfg.isConfigured,
        embedding_provider: 'Hugging Face Transformers.js (ONNX local)',
        embedding_model: localEmbeddingService.EMBEDDING_MODEL,
        embedding_dimensions: localEmbeddingService.EMBEDDING_DIMENSIONS,
        database: 'MySQL (bmw_premium_motors)'
      }
    }
  });
});

/**
 * PUT /api/empresa/plan (Solo admin)
 * Cambia entre los planes SaaS oficiales (Gratis / Pro).
 */
const updatePlan = asyncHandler(async (req, res) => {
  const planInput = req.body.plan || req.body.id_plan;
  if (!planInput) {
    return res.status(400).json({
      ok: false,
      error: 'Debe especificar el plan (Gratis o Pro).'
    });
  }

  const normalized = String(planInput).trim().toLowerCase();
  if (!['gratis', 'pro', '1', '2'].includes(normalized)) {
    return res.status(400).json({
      ok: false,
      error: 'Plan no válido. Valores permitidos: Gratis, Pro.'
    });
  }

  const updated = await empresaModel.updatePlan(req.user.empresa_id, planInput);
  return res.status(200).json({
    ok: true,
    message: `Plan actualizado a ${updated.plan_nombre}`,
    data: updated
  });
});

/**
 * GET /api/empresa/colaboradores
 * Lista únicamente los usuarios pertenecientes a la empresa del JWT.
 */
const listColaboradores = asyncHandler(async (req, res) => {
  const usuarios = await usuarioModel.findByEmpresa(req.user.empresa_id);
  return res.status(200).json({
    ok: true,
    data: usuarios
  });
});

/**
 * POST /api/empresa/colaboradores (Solo admin)
 * Registra un colaborador o administrador adicional dentro de la misma empresa.
 */
const createColaborador = asyncHandler(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const rol = req.body.rol === 'admin' ? 'admin' : 'colaborador';

  if (!nombre || nombre.length < 2) {
    return res.status(400).json({ ok: false, error: 'El nombre es obligatorio (mínimo 2 caracteres).' });
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ ok: false, error: 'Debe proporcionar un correo válido.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const existe = await usuarioModel.existsByCorreo(correo);
  if (existe) {
    return res.status(409).json({ ok: false, error: 'El correo ya se encuentra registrado.' });
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const nuevo = await usuarioModel.create({
    nombre,
    correo,
    password_hash,
    id_empresa: req.user.empresa_id,
    rol
  });

  return res.status(201).json({
    ok: true,
    message: `Usuario ${rol} creado correctamente`,
    data: nuevo
  });
});

/**
 * DELETE /api/empresa/colaboradores/:id (Solo admin)
 */
const deleteColaborador = asyncHandler(async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isSafeInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ ok: false, error: 'ID de usuario inválido.' });
  }
  if (targetId === Number(req.user.id_usuario)) {
    return res.status(400).json({ ok: false, error: 'No puede eliminar su propia cuenta en sesión.' });
  }

  const deleted = await usuarioModel.deleteByIdAndEmpresa(targetId, req.user.empresa_id);
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Usuario no encontrado en su empresa.' });
  }

  return res.status(200).json({
    ok: true,
    message: 'Usuario eliminado de la empresa.'
  });
});

module.exports = {
  getMiEmpresa,
  updatePlan,
  listColaboradores,
  createColaborador,
  deleteColaborador
};
