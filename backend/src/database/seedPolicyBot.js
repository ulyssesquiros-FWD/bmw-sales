const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { pool } = require('../config/db');
const empresaModel = require('../models/empresaModel');
const usuarioModel = require('../models/usuarioModel');
const ragService = require('../services/ragService');

const TENANTS_SEED = [
  {
    empresa: {
      nombre: 'Café Montaña S.A.',
      slug: 'cafe-montana-sa',
      plan: 'Gratis'
    },
    usuarios: [
      {
        nombre: 'Sofía Vargas (Admin Café Montaña)',
        correo: 'admin@cafemontana.com',
        password: 'AdminCafe2026!',
        rol: 'admin'
      },
      {
        nombre: 'Diego Rojas (Colaborador Café Montaña)',
        correo: 'colab@cafemontana.com',
        password: 'ColabCafe2026!',
        rol: 'colaborador'
      }
    ],
    documentos: [
      {
        nombre_archivo: 'Politica_Vacaciones_Cafe_Montana.txt',
        origen: 'manual',
        contenido: `POLÍTICA OFICIAL DE VACACIONES — CAFÉ MONTAÑA S.A.
Vigencia: 2026

Artículo 1. Días de vacaciones anuales:
Todo colaborador con contrato indefinido en Café Montaña S.A. tiene derecho a 18 días hábiles de vacaciones pagadas por cada año continuo de servicio.

Artículo 2. Acumulación y anticipación de solicitud:
Las vacaciones son acumulables únicamente hasta un máximo de 36 días hábiles. Toda solicitud formal debe presentarse en el portal de Talento Humano con al menos 15 días de anticipación.`
      },
      {
        nombre_archivo: 'Politica_Teletrabajo_Cafe_Montana.txt',
        origen: 'manual',
        contenido: `POLÍTICA DE TELETRABAJO HÍBRIDO — CAFÉ MONTAÑA S.A.
Vigencia: 2026

Artículo 1. Modalidad semanal:
Los colaboradores administrativos de Café Montaña S.A. pueden realizar teletrabajo hasta 2 días por semana (preferiblemente martes y jueves), previa coordinación con su jefatura.

Artículo 2. Auxilio de conectividad:
La empresa otorga un bono de conectividad de $35 USD mensuales en la planilla.`
      },
      {
        nombre_archivo: 'Politica_Reembolso_Gastos_Cafe_Montana.txt',
        origen: 'manual',
        contenido: `POLÍTICA DE REEMBOLSO DE GASTOS — CAFÉ MONTAÑA S.A.
Vigencia: 2026

Artículo 1. Topes de viáticos y reembolsos:
En giras comerciales de Café Montaña S.A., el tope de reembolso por alimentación es de hasta $45 USD diarios y por hospedaje de hasta $120 USD por noche.

Artículo 2. Plazo de liquidación:
Las facturas autorizadas deben presentarse dentro de los 10 días hábiles posteriores al regreso del viaje.`
      }
    ]
  },
  {
    empresa: {
      nombre: 'Logística Pacífico',
      slug: 'logistica-pacifico',
      plan: 'Pro'
    },
    usuarios: [
      {
        nombre: 'Carlos Méndez (Admin Logística Pacífico)',
        correo: 'admin@logisticapacifico.com',
        password: 'AdminLogistica2026!',
        rol: 'admin'
      },
      {
        nombre: 'Lucía Castro (Colaboradora Logística Pacífico)',
        correo: 'colab@logisticapacifico.com',
        password: 'ColabLogistica2026!',
        rol: 'colaborador'
      }
    ],
    documentos: [
      {
        nombre_archivo: 'Manual_Vacaciones_Logistica_Pacifico.txt',
        origen: 'manual',
        contenido: `MANUAL DE VACACIONES — LOGÍSTICA PACÍFICO
Vigencia: 2026

Sección 1. Derecho anual de vacaciones:
Todo trabajador operativo y administrativo de Logística Pacífico recibe 24 días hábiles de vacaciones anuales remuneradas tras cumplir 12 meses de antigüedad.

Sección 2. Prima vacacional y preaviso:
Adicionalmente, Logística Pacífico paga una prima vacacional del 35% sobre los días disfrutados. El aviso de programación debe realizarse con 30 días de anticipación.`
      },
      {
        nombre_archivo: 'Reglamento_Teletrabajo_Logistica_Pacifico.txt',
        origen: 'manual',
        contenido: `REGLAMENTO DE TELETRABAJO — LOGÍSTICA PACÍFICO
Vigencia: 2026

Sección 1. Días remotos permitidos:
Las áreas corporativas y de planificación de Logística Pacífico pueden trabajar en modalidad de teletrabajo hasta 4 días por semana, asistiendo presencialmente los lunes a comité operativo.

Sección 2. Subsidio tecnológico:
Logística Pacífico cubre un subsidio mensual de internet y energía eléctrica de $60 USD.`
      },
      {
        nombre_archivo: 'Politica_Viaticos_Reembolsos_Logistica_Pacifico.txt',
        origen: 'manual',
        contenido: `POLÍTICA DE VIÁTICOS Y REEMBOLSOS — LOGÍSTICA PACÍFICO
Vigencia: 2026

Sección 1. Límites diarios aprobados:
Para rutas nacionales e internacionales en Logística Pacífico, el reembolso máximo por alimentación es de hasta $75 USD diarios y el hospedaje de hasta $180 USD por noche.

Sección 2. Tiempo de pago:
Los reembolsos aprobados se depositan en un máximo de 5 días hábiles tras subir los comprobantes.`
      }
    ]
  }
];

async function upsertEmpresaSeed(tenant) {
  const planRow = await empresaModel.findPlanByNameOrId(tenant.empresa.plan);
  const [existingEmp] = await pool.execute('SELECT id_empresa FROM empresas WHERE slug = ?', [
    tenant.empresa.slug
  ]);

  let idEmpresa;
  if (existingEmp.length > 0) {
    idEmpresa = existingEmp[0].id_empresa;
    await pool.execute(
      `UPDATE empresas
       SET nombre = ?, id_plan = ?, preguntas_mes_actual = 0
       WHERE id_empresa = ?`,
      [tenant.empresa.nombre, planRow.id_plan, idEmpresa]
    );
  } else {
    const mes = empresaModel.currentMonthKey();
    const [ins] = await pool.execute(
      `INSERT INTO empresas (nombre, slug, id_plan, google_drive_sync_status, preguntas_mes_actual, mes_control, activo)
       VALUES (?, ?, ?, 'sin_configurar', 0, ?, 1)`,
      [tenant.empresa.nombre, tenant.empresa.slug, planRow.id_plan, mes]
    );
    idEmpresa = ins.insertId;
  }

  let adminUserId = null;
  for (const u of tenant.usuarios) {
    const password_hash = await bcrypt.hash(u.password, 12);
    const [existingUser] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [
      u.correo
    ]);
    if (existingUser.length > 0) {
      await pool.execute(
        'UPDATE usuarios SET id_empresa = ?, nombre = ?, password_hash = ?, rol = ? WHERE id_usuario = ?',
        [idEmpresa, u.nombre, password_hash, u.rol, existingUser[0].id_usuario]
      );
      if (u.rol === 'admin') adminUserId = existingUser[0].id_usuario;
    } else {
      const created = await usuarioModel.create({
        nombre: u.nombre,
        correo: u.correo,
        password_hash,
        id_empresa: idEmpresa,
        rol: u.rol
      });
      if (u.rol === 'admin') adminUserId = created.id_usuario;
    }
  }

  for (const doc of tenant.documentos) {
    const cleanText = ragService.cleanText(doc.contenido);
    const hash = ragService.computeContentHash(cleanText);
    const [existingDoc] = await pool.execute(
      'SELECT id_documento FROM documentos WHERE id_empresa = ? AND nombre_archivo = ?',
      [idEmpresa, doc.nombre_archivo]
    );

    let idDocumento;
    if (existingDoc.length > 0) {
      idDocumento = existingDoc[0].id_documento;
    } else {
      const [insDoc] = await pool.execute(
        `INSERT INTO documentos
           (id_empresa, subido_por, nombre_archivo, tipo_archivo, origen, contenido_hash, tamano_bytes, contenido_texto, estado_indexacion, metodo_extraccion)
         VALUES (?, ?, ?, 'txt', ?, ?, ?, ?, 'pendiente', 'texto_nativo')`,
        [
          idEmpresa,
          adminUserId,
          doc.nombre_archivo,
          doc.origen,
          hash,
          Buffer.byteLength(cleanText, 'utf8'),
          cleanText
        ]
      );
      idDocumento = insDoc.insertId;
    }

    await ragService.indexDocument({
      id_documento: idDocumento,
      id_empresa: idEmpresa,
      rawText: cleanText,
      metodo_extraccion: 'texto_nativo'
    });
  }

  console.log(`✓ Tenant sembrado e indexado (384 dims): ${tenant.empresa.nombre} (id_empresa=${idEmpresa}, plan=${tenant.empresa.plan})`);
}

async function runSeedPolicyBot() {
  console.log('============================================================');
  console.log(' PolicyBot SaaS — Sembrado e Indexación Local (384 dims E5)');
  console.log('============================================================');
  try {
    for (const tenant of TENANTS_SEED) {
      await upsertEmpresaSeed(tenant);
    }
    const { reindexedCount } = await ragService.reindexObsoleteEmbeddings();
    console.log(`[OK] Reindexación de vectores obsoletos finalizada (regenerados: ${reindexedCount}).`);
    console.log('[OK] Empresas de prueba Café Montaña S.A. y Logística Pacífico listas.');
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runSeedPolicyBot().catch((err) => {
    console.error('[ERROR] Falló el sembrado de PolicyBot:', err);
    process.exit(1);
  });
}

module.exports = { runSeedPolicyBot, TENANTS_SEED };
