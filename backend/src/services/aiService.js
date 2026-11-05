const { pool } = require('../config/db');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-a957d8de6b744a258fbedd86b02f095e';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

/**
 * Obtiene un resumen en vivo del inventario y base de datos del concesionario
 * para inyectarlo como contexto en el prompt del sistema.
 */
async function getLiveDealershipContext() {
  try {
    // 1. Estadísticas de inventario
    const [vehiculosStats] = await pool.query(`
      SELECT 
        estado, 
        COUNT(*) as total,
        COALESCE(SUM(precio), 0) as valor_total
      FROM vehiculos 
      GROUP BY estado
    `);

    // 2. Total de modelos y gama M
    const [modelosStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_modelos,
        SUM(CASE WHEN nombre LIKE '%M%' OR nombre LIKE '%///M%' THEN 1 ELSE 0 END) as total_m
      FROM modelos
    `);

    // 3. Vehículos disponibles destacados (hasta 8)
    const [disponibles] = await pool.query(`
      SELECT 
        v.id_vehiculo, v.vin, v.version, v.anio, v.color, v.precio, v.kilometraje,
        m.nombre as modelo_nombre, m.tipo_carroceria, m.combustible, m.transmision
      FROM vehiculos v
      JOIN modelos m ON v.id_modelo = m.id_modelo
      WHERE v.estado = 'Disponible'
      ORDER BY v.precio DESC
      LIMIT 8
    `);

    // 4. Conteo de ventas y clientes
    const [totales] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM vendedores) as asesores_activos,
        (SELECT COUNT(*) FROM ventas) as total_ventas,
        (SELECT COALESCE(SUM(precio_venta), 0) FROM ventas) as ventas_monto_total
    `);

    const summary = {
      inventario: vehiculosStats,
      modelos: modelosStats[0] || {},
      disponibles_destacados: disponibles,
      metricas_generales: totales[0] || {}
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    console.error('Error al obtener contexto del concesionario para IA:', error.message);
    return 'Contexto en tiempo real no disponible temporalmente.';
  }
}

/**
 * Construye el prompt del sistema corporativo BMW Genius AI
 */
function buildSystemPrompt(dealershipContext) {
  return `Eres **BMW Genius AI**, el asesor ejecutivo de inteligencia artificial corporativo del concesionario oficial **BMW Premium Motors**.
Tu misión es asistir con la más alta sofisticación, precisión técnica, elegancia editorial y cortesía alemana al equipo directivo, asesores de venta, jefes de taller y clientes VIP.

### TUS CAPACIDADES Y ROLES PRINCIPALES:
1. **Asesor de Ventas & Genius Comercial:**
   - Asesorar sobre la gama BMW (Serie 1 a Serie 8, Gama X1 a X7, Gran Coupé, Roadster Z4 y Gama Eléctrica BMW i).
   - Especialista indiscutible en la **División BMW ///M Motorsport** (M2, M3 G80, M4, M5 F90/CS, M8, X5 M, X6 M).
   - **Mención de Honor Especial:** Tienes conocimiento profundo del legendario **BMW X5 M 2012 (Chasis E70)** en acabado exclusivo *Titanium Silver Metallic*, con motor V8 M TwinPower Turbo 4.4L (S63B44), 555 CV, 680 Nm de par motor, tracción xDrive M y aceleración de 0 a 100 km/h en 4.7 segundos.
   - Elaborar argumentos comerciales de venta convincentes basados en dinamismo de conducción (*Freude am Fahren* - El Placer de Conducir), seguridad activa y pasiva, y exclusividad.

2. **Recomendación según Inventario Real:**
   - Tienes acceso directo al inventario en vivo del concesionario BMW Premium Motors. Puedes recomendar unidades disponibles con base en el presupuesto, preferencias y necesidades del cliente.

3. **Simulador y Asesor Financiero (BMW Financial Services):**
   - Explicar esquemas de financiamiento: Plan BMW Select (enganche desde 20%, mensualidades accesibles y valor futuro garantizado), Financiamiento Tradicional (hasta 72 meses) y Arrendamiento Puro (Leasing con beneficios fiscales para personas físicas con actividad empresarial o morales).

4. **Diagnóstico Posventa y Taller Oficial (ISTA+):**
   - Asesorar sobre mantenimientos preventivos y correctivos, fluidos BMW TwinPower Turbo Longlife-04 / 01, kits de frenos cerámicos de carbono M, calibración de suspensión adaptativa M y protocolos del sistema de diagnóstico oficial ISTA+.
   - Términos de garantía BMW Certified Pre-Owned (CPO) con inspección certificada de 110 puntos y pólizas BMW Service Inclusive.

5. **Inteligencia Operativa del Concesionario:**
   - Responder preguntas sobre estadísticas de la empresa, inventario valorizado, rendimiento de asesores y estatus de órdenes.

### DATOS EN VIVO DEL CONCESIONARIO (SNAPSHOT ACTUAL DE BASE DE DATOS):
\`\`\`json
${dealershipContext}
\`\`\`

### ESTILO DE COMUNICACIÓN:
- Profesional, ejecutivo, tecnológico y apasionado por la ingeniería automotriz BMW.
- Estructura tus respuestas con títulos claros, viñetas, tablas o datos numéricos cuando sea oportuno.
- Responde siempre en español fluido y formal.
- Utiliza la terminología oficial de BMW (TwinPower Turbo, xDrive, M Steptronic, Live Cockpit Professional, Laserlight, BMW ConnectedDrive).`;
}

/**
 * Envía un mensaje a DeepSeek Chat API con historial y contexto
 */
async function chatWithAgent({ message, history = [], user = null }) {
  if (!message || typeof message !== 'string') {
    throw new Error('El mensaje del usuario es requerido.');
  }

  // 1. Obtener contexto en vivo de MySQL
  const dealershipContext = await getLiveDealershipContext();
  const systemPrompt = buildSystemPrompt(dealershipContext);

  // 2. Construir lista de mensajes (limitar historial a los últimos 8 turnos para optimizar tokens)
  const safeHistory = Array.isArray(history) 
    ? history.slice(-8).map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content || '')
      }))
    : [];

  const messages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory,
    { role: 'user', content: message }
  ];

  // 3. Invocar DeepSeek API con timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error HTTP ${response.status}:`, errorText);
      throw new Error(`Error en API DeepSeek (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'No se recibió respuesta del modelo.';
    const usage = data.usage || null;

    return {
      reply: assistantMessage,
      usage,
      model: data.model || DEEPSEEK_MODEL,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al consultar el agente de IA de DeepSeek.');
    }
    throw error;
  }
}

/**
 * Sugerencias ejecutivas preconfiguradas para la interfaz de usuario
 */
function getPromptSuggestions() {
  return [
    {
      categoria: 'M Motorsport & Catálogo',
      icono: 'Car',
      titulo: 'Ficha Técnica X5 M 2012 E70',
      prompt: '¿Cuáles son las especificaciones técnicas completas y prestaciones del BMW X5 M 2012 E70 en color Titanium Silver Metallic?'
    },
    {
      categoria: 'Inventario en Vivo',
      icono: 'PackageCheck',
      titulo: 'Unidades Disponibles de Alta Gama',
      prompt: 'Analiza el inventario actual disponible en el concesionario y recomiéndame las 3 unidades más exclusivas con su precio y equipamiento.'
    },
    {
      categoria: 'Ventas & Estrategia',
      icono: 'TrendingUp',
      titulo: 'Argumento de Venta M3 Competition',
      prompt: 'Genera un guion de ventas persuasivo para un cliente VIP interesado en el BMW M3 Competition G80 frente a competidores del segmento.'
    },
    {
      categoria: 'Financiamiento BMW Select',
      icono: 'Calculator',
      titulo: 'Simular Plan BMW Select',
      prompt: 'Explícame cómo funciona el financiamiento BMW Select con enganche del 30%, plazo a 36 meses y opción de valor futuro garantizado para un vehículo de $2,000,000 MXN.'
    },
    {
      categoria: 'Taller & Posventa ISTA+',
      icono: 'Wrench',
      titulo: 'Protocolo de Mantenimiento M TwinPower',
      prompt: '¿Cuál es el protocolo de servicio preventivo y fluidos recomendados para los motores V8 M TwinPower Turbo (S63/S68)?'
    },
    {
      categoria: 'Garantía & CPO',
      icono: 'ShieldCheck',
      titulo: 'Inspección Certificada 110 Puntos CPO',
      prompt: '¿Qué elementos y sistemas mecánicos se revisan en la certificación oficial BMW Certified Pre-Owned de 110 puntos?'
    }
  ];
}

module.exports = {
  chatWithAgent,
  getPromptSuggestions,
  getLiveDealershipContext
};
