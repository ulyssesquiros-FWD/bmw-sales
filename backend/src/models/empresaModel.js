const { pool } = require('../config/db');

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function buildSlug(nombre) {
  const base = String(nombre || 'empresa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return `${base || 'empresa'}-${Date.now().toString(36).slice(-4)}`;
}

async function listPlanes() {
  const [rows] = await pool.execute(
    'SELECT id_plan, nombre, max_documentos, max_preguntas_mes, precio_mensual FROM planes ORDER BY id_plan ASC'
  );
  return rows;
}

async function findPlanByNameOrId(planInput = 'Gratis') {
  if (typeof planInput === 'number' || /^\d+$/.test(String(planInput))) {
    const [rows] = await pool.execute('SELECT * FROM planes WHERE id_plan = ?', [Number(planInput)]);
    if (rows[0]) return rows[0];
  }
  const normalized = String(planInput || 'Gratis').trim().toLowerCase();
  const [rows] = await pool.execute('SELECT * FROM planes WHERE LOWER(nombre) = ?', [normalized]);
  if (rows[0]) return rows[0];

  const [fallback] = await pool.execute('SELECT * FROM planes WHERE id_plan = 1');
  return fallback[0] || { id_plan: 1, nombre: 'Gratis', max_documentos: 10, max_preguntas_mes: 200 };
}

async function createEmpresa({ nombre, plan = 'Gratis', google_drive_folder_id = null }) {
  const planRow = await findPlanByNameOrId(plan);
  const slug = buildSlug(nombre);
  const mes = currentMonthKey();

  const [result] = await pool.execute(
    `INSERT INTO empresas (nombre, slug, id_plan, google_drive_folder_id, google_drive_sync_status, preguntas_mes_actual, mes_control, activo)
     VALUES (?, ?, ?, ?, ?, 0, ?, 1)`,
    [
      nombre.trim(),
      slug,
      planRow.id_plan,
      google_drive_folder_id,
      google_drive_folder_id ? 'configurado' : 'sin_configurar',
      mes
    ]
  );

  return getEmpresaWithStats(result.insertId);
}

/**
 * Obtiene información consolidada de la empresa, plan, cuota de documentos y cuota mensual de preguntas.
 * Reinicia automáticamente preguntas_mes_actual si cambió el mes calendario.
 */
async function getEmpresaWithStats(idEmpresa) {
  const mesActual = currentMonthKey();

  await pool.execute(
    `UPDATE empresas
     SET preguntas_mes_actual = 0, mes_control = ?
     WHERE id_empresa = ? AND mes_control <> ?`,
    [mesActual, Number(idEmpresa), mesActual]
  );

  const [rows] = await pool.execute(
    `SELECT
       e.id_empresa,
       e.nombre,
       e.slug,
       e.id_plan,
       p.nombre AS plan_nombre,
       p.max_documentos,
       p.max_preguntas_mes,
       p.precio_mensual,
       e.google_drive_folder_id,
       e.google_drive_sync_status,
       e.ultima_sincronizacion,
       e.preguntas_mes_actual,
       e.mes_control,
       e.activo,
       (SELECT COUNT(*) FROM documentos d WHERE d.id_empresa = e.id_empresa) AS total_documentos,
       (SELECT COUNT(*) FROM fragmentos f WHERE f.id_empresa = e.id_empresa) AS total_fragmentos,
       (SELECT COUNT(*) FROM usuarios u WHERE u.id_empresa = e.id_empresa) AS total_usuarios
     FROM empresas e
     INNER JOIN planes p ON p.id_plan = e.id_plan
     WHERE e.id_empresa = ?`,
    [Number(idEmpresa)]
  );

  return rows[0] || null;
}

async function updatePlan(idEmpresa, planInput) {
  const planRow = await findPlanByNameOrId(planInput);
  await pool.execute('UPDATE empresas SET id_plan = ? WHERE id_empresa = ?', [
    planRow.id_plan,
    Number(idEmpresa)
  ]);
  return getEmpresaWithStats(idEmpresa);
}

async function updateDriveConfig(idEmpresa, folderId, status = null) {
  const cleanFolder = folderId ? String(folderId).trim() : null;
  const syncStatus = status || (cleanFolder ? 'configurado' : 'sin_configurar');
  await pool.execute(
    `UPDATE empresas
     SET google_drive_folder_id = ?, google_drive_sync_status = ?
     WHERE id_empresa = ?`,
    [cleanFolder, syncStatus, Number(idEmpresa)]
  );
  return getEmpresaWithStats(idEmpresa);
}

async function incrementMonthlyQuestions(idEmpresa) {
  const mesActual = currentMonthKey();
  await pool.execute(
    `UPDATE empresas
     SET preguntas_mes_actual = CASE WHEN mes_control = ? THEN preguntas_mes_actual + 1 ELSE 1 END,
         mes_control = ?
     WHERE id_empresa = ?`,
    [mesActual, mesActual, Number(idEmpresa)]
  );
}

module.exports = {
  currentMonthKey,
  listPlanes,
  findPlanByNameOrId,
  createEmpresa,
  getEmpresaWithStats,
  updatePlan,
  updateDriveConfig,
  incrementMonthlyQuestions
};
