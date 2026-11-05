import api from './api';

export const clienteService = {
  async getAll(search = '') {
    const params = search && search.trim() ? { search: search.trim() } : {};
    const { data } = await api.get('/clientes', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/clientes/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/clientes', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/clientes/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/clientes/${id}`);
    return data;
  }
};

