import api from './api';

export const aiService = {
  /**
   * Envia un mensaje al Agente BMW Genius AI con el historial de la conversacion
   * Timeout extendido a 60s para respuestas detalladas de DeepSeek
   */
  async sendMessage(message, history = []) {
    const response = await api.post(
      '/ai/chat',
      { message, history },
      { timeout: 60000 }
    );
    return response.data;
  },

  /**
   * Obtiene la lista de sugerencias y prompts recomendados
   */
  async getSuggestions() {
    const response = await api.get('/ai/sugerencias');
    return response.data;
  },

  /**
   * Retorna el estado operativo del servicio y contexto de base de datos
   */
  async getStatus() {
    const response = await api.get('/ai/estado');
    return response.data;
  }
};

export default aiService;
