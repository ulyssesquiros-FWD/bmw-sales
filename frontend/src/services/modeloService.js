import api from './api';

export const modeloService = {
  async getAll(search = '') {
    const params = search ? { search } : {};
    const { data } = await api.get('/modelos', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/modelos/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/modelos', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/modelos/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/modelos/${id}`);
    return data;
  }
};

