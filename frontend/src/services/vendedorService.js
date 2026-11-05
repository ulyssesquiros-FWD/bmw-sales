import api from './api';

export const vendedorService = {
  async getAll(search = '') {
    const params = search && search.trim() ? { search: search.trim() } : {};
    const { data } = await api.get('/vendedores', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/vendedores/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/vendedores', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/vendedores/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/vendedores/${id}`);
    return data;
  }
};

