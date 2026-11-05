import api from './api';

export const vehiculoService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.id_modelo) params.id_modelo = filters.id_modelo;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const { data } = await api.get('/vehiculos', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/vehiculos/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/vehiculos', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/vehiculos/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/vehiculos/${id}`);
    return data;
  }
};

