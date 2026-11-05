import api from './api';

export const authService = {
  async register({ nombre, correo, password }) {
    const { data } = await api.post('/auth/register', {
      nombre,
      correo,
      password
    });
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

