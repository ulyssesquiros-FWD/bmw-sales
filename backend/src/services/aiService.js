const { pool } = require('../config/db');
const deepseekService = require('./deepseekService');

/**
 * Obtiene un resumen en vivo del inventario y base de datos del concesionario BMW
 * para inyectarlo como contexto en el prompt de BMW Genius AI.
 */
async function getLiveDealershipContext() {
  try {
    const [vehiculosStats] = await pool.query(`
      SELECT 
        estado, 
        COUNT(*) as total,
        COALESCE(SUM(precio), 0) as valor_total
      FROM vehiculos 
      GROUP BY estado
    `);

    const [modelosStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_modelos,
        SUM(CASE WHEN nombre LIKE '%M%' OR nombre LIKE '%///M%' THEN 1 ELSE 0 END) as total_m
      FROM modelos
    `);

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

    const [totales] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM vendedores) as asesores_activos,
        (SELECT COUNT(*) FROM ventas) as total_ventas,
        (SELECT COALESCE(SUM(precio_venta), 0) FROM ventas) as ventas_monto_total
    `);

    return JSON.stringify(
      {
        inventario: vehiculosStats,
        modelos: modelosStats[0] || {},
        disponibles_destacados: disponibles,
        metricas_generales: totales[0] || {}
      },
      null,
      2
    );
  } catch (error) {
    console.error('Error al obtener contexto del concesionario para IA:', error.message);
    return 'Contexto en tiempo real no disponible temporalmente.';
  }
}

function buildSystemPrompt(dealershipContext) {
  return `Eres **BMW Genius AI**, el asesor ejecutivo de inteligencia artificial corporativo del concesionario oficial **BMW Premium Motors**.
Tu misión es asistir con la más alta sofisticación, precisión técnica, elegancia editorial y cortesía alemana al equipo directivo, asesores de venta, jefes de taller y clientes VIP.

### TUS CAPACIDADES Y ROLES PRINCIPALES:
1. **Asesor de Ventas & Genius Comercial:**
   - Asesorar sobre la gama BMW (Serie 1 a Serie 8, Gama X1 a X7, Gran Coupé, Roadster Z4 y Gama Eléctrica BMW i).
   - Especialista indiscutible en la **División BMW ///M Motorsport** (M2, M3 G80, M4, M5 F90/CS, M8, X5 M, X6 M).
   - **Mención de Honor Especial:** Conocimiento profundo del **BMW X5 M 2012 (Chasis E70)** en acabado exclusivo *Titanium Silver Metallic*, motor V8 M TwinPower Turbo 4.4L (S63B44), 555 CV, 680 Nm, tracción xDrive M y 0-100 km/h en 4.7 s.
2. **Recomendación según Inventario Real:**
   - Recomendar unidades disponibles en BMW Premium Motors según presupuesto y preferencias del cliente.
3. **Simulador y Asesor Financiero (BMW Financial Services):**
   - Planes BMW Select, Financiamiento Tradicional y Arrendamiento Puro (Leasing).
4. **Diagnóstico Posventa y Taller Oficial (ISTA+):**
   - Fluidos BMW TwinPower Turbo, frenos cerámicos M, suspensión adaptativa M y certificación CPO de 110 puntos.
5. **Inteligencia Operativa del Concesionario:**
   - Responder consultas sobre métricas, inventario valorizado y rendimiento de asesores.

### DATOS EN VIVO DEL CONCESIONARIO (MYSQL bmw_premium_motors):
\`\`\`json
${dealershipContext}
\`\`\`

### ESTILO DE COMUNICACIÓN:
- Profesional, ejecutivo, tecnológico y formal en español. Utiliza terminología oficial BMW.`;
}

/**
 * Reutiliza el cliente compartido de DeepSeek (`deepseekService`) manteniendo aislado
 * el contexto y las conversaciones de BMW Genius AI respecto a PolicyBot.
 */
async function chatWithAgent({ message, history = [] }) {
  if (!message || typeof message !== 'string') {
    throw new Error('El mensaje del usuario es requerido.');
  }

  const dealershipContext = await getLiveDealershipContext();
  const systemPrompt = buildSystemPrompt(dealershipContext);

  const safeHistory = Array.isArray(history)
    ? history.slice(-8).map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content || '')
      }))
    : [];

  const messages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory,
    { role: 'user', content: message }
  ];

  const completion = await deepseekService.createChatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 1500
  });

  return {
    reply: completion.reply,
    usage: completion.usage,
    model: completion.model,
    timestamp: new Date().toISOString()
  };
}

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
