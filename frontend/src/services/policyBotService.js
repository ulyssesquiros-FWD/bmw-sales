import api, { getInMemoryToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const policyBotService = {
  async getMiEmpresa() {
    const { data } = await api.get('/empresa/mi-empresa');
    return data.data;
  },

  async updatePlan(plan) {
    const { data } = await api.put('/empresa/plan', { plan });
    return data;
  },

  async getColaboradores() {
    const { data } = await api.get('/empresa/colaboradores');
    return data.data || [];
  },

  async createColaborador(payload) {
    const { data } = await api.post('/empresa/colaboradores', payload);
    return data;
  },

  async deleteColaborador(id) {
    const { data } = await api.delete(`/empresa/colaboradores/${id}`);
    return data;
  },

  async getDocumentos() {
    const { data } = await api.get('/documentos');
    return data.data || [];
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('archivo', file);
    const { data } = await api.post('/documentos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000
    });
    return data;
  },

  async uploadTextDocument({ nombre_archivo, contenido_texto }) {
    const { data } = await api.post(
      '/documentos/upload',
      { nombre_archivo, contenido_texto },
      { timeout: 60000 }
    );
    return data;
  },

  async reindexDocumento(id) {
    const { data } = await api.post(`/documentos/${id}/reindex`, {}, { timeout: 60000 });
    return data;
  },

  async deleteDocumento(id) {
    const { data } = await api.delete(`/documentos/${id}`);
    return data;
  },

  async getDriveStatus() {
    const { data } = await api.get('/drive/status');
    return data.data;
  },

  async startDriveOAuth() {
    const { data } = await api.get('/drive/oauth');
    return data.data;
  },

  async connectDriveFolder({ folder_id, folder_name }) {
    const { data } = await api.post('/drive/connect-folder', { folder_id, folder_name });
    return data;
  },

  async syncDriveNow() {
    const { data } = await api.post('/drive/sync', {}, { timeout: 90000 });
    return data;
  },

  async disconnectDrive() {
    const { data } = await api.delete('/drive/disconnect');
    return data;
  },

  async getChatHistorial(sessionId = null) {
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
    const { data } = await api.get(`/chat/historial${query}`);
    return data.data || [];
  },

  async clearChatHistorial() {
    const { data } = await api.delete('/chat/historial');
    return data;
  },

  async streamChat({
    message,
    session_id = 'default',
    signal,
    onMeta,
    onCitations,
    onToken,
    onUsage,
    onDone
  }) {
    const token = getInMemoryToken();
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ message, session_id }),
      signal
    });

    if (!response.ok) {
      let errPayload = null;
      try {
        errPayload = await response.json();
      } catch {
        errPayload = null;
      }
      const err = new Error(errPayload?.error || errPayload?.message || `HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        const lines = block.split('\n');
        let eventName = 'message';
        let dataRaw = '';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataRaw += line.slice(5).trim();
          }
        }
        if (!dataRaw) continue;
        let parsed;
        try {
          parsed = JSON.parse(dataRaw);
        } catch {
          parsed = { raw: dataRaw };
        }

        if (eventName === 'meta' && onMeta) onMeta(parsed);
        else if (eventName === 'citations' && onCitations) onCitations(parsed.citas || []);
        else if (eventName === 'token' && onToken) onToken(parsed.text || '');
        else if (eventName === 'usage' && onUsage) onUsage(parsed);
        else if (eventName === 'done' && onDone) onDone(parsed);
        else if (eventName === 'error') {
          throw new Error(parsed.message || 'Error en el flujo SSE');
        }
      }
    }
  }
};

export default policyBotService;
