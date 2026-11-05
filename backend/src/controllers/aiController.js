const aiService = require('../services/aiService');

/**
 * Controlador de Inteligencia Artificial para BMW Premium Motors
 * Impulsado por DeepSeek AI
 */
class AIController {
  /**
   * Procesa una conversación con el agente BMW Genius AI
   * POST /api/ai/chat
   */
  async chat(req, res) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({
          ok: false,
          error: 'El campo "message" es obligatorio y debe ser una cadena no vacía.'
        });
      }

      const result = await aiService.chatWithAgent({
        message: message.trim(),
        history: history || [],
        user: req.user
      });

      return res.status(200).json({
        ok: true,
        data: result
      });
    } catch (error) {
      console.error('Error en AIController.chat:', error.message);
      return res.status(500).json({
        ok: false,
        error: error.message || 'Error al comunicarse con el Agente de Inteligencia Artificial DeepSeek.'
      });
    }
  }

  /**
   * Obtiene la lista de sugerencias y prompts recomendados
   * GET /api/ai/sugerencias
   */
  async sugerencias(req, res) {
    try {
      const sugerencias = aiService.getPromptSuggestions();
      return res.status(200).json({
        ok: true,
        data: sugerencias
      });
    } catch (error) {
      console.error('Error en AIController.sugerencias:', error.message);
      return res.status(500).json({
        ok: false,
        error: 'Error al obtener sugerencias de IA.'
      });
    }
  }

  /**
   * Retorna el estado operativo del motor DeepSeek y resumen de contexto
   * GET /api/ai/estado
   */
  async estado(req, res) {
    try {
      const contextRaw = await aiService.getLiveDealershipContext();
      let context = {};
      try {
        context = JSON.parse(contextRaw);
      } catch (e) {
        context = { raw: contextRaw };
      }

      return res.status(200).json({
        ok: true,
        servicio: 'BMW Genius AI Advisor',
        motor: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        proveedor: 'DeepSeek AI Platform',
        estado: 'Operativo',
        contexto_resumen: {
          total_modelos: context.modelos?.total_modelos || 0,
          modelos_m: context.modelos?.total_m || 0,
          unidades_disponibles: context.inventario?.find(i => i.estado === 'Disponible')?.total || 0,
          ventas_registradas: context.metricas_generales?.total_ventas || 0
        }
      });
    } catch (error) {
      console.error('Error en AIController.estado:', error.message);
      return res.status(500).json({
        ok: false,
        error: 'Error al consultar estado del servicio de IA.'
      });
    }
  }
}

module.exports = new AIController();

