import api from './api';

export const ventaService = {
  async getAll(search = '') {
    const params = search && search.trim() ? { search: search.trim() } : {};
    const { data } = await api.get('/ventas', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/ventas/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/ventas', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/ventas/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/ventas/${id}`);
    return data;
  }
};

