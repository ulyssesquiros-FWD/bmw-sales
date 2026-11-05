import api from './api';

export const dashboardService = {
  async getResumen() {
    const { data } = await api.get('/dashboard/resumen');
    return data.data;
  },

  async getHealth() {
    const { data } = await api.get('/health');
    return data;
  }
};

