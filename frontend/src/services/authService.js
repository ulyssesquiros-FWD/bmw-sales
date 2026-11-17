import api from './api';

export const authService = {
  async register({ nombre, correo, password, empresa_nombre, plan }) {
    const payload = { nombre, correo, password };
    if (empresa_nombre && empresa_nombre.trim()) {
      payload.empresa_nombre = empresa_nombre.trim();
      payload.plan = plan || 'Gratis';
    }
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async login({ correo, password }) {
    const { data } = await api.post('/auth/login', {
      correo,
      password
    });
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.usuario;
  }
};

