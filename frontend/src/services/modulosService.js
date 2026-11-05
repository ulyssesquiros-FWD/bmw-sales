import api from './api';

export const modulosService = {
  // Sucursales
  getSucursales: async (params) => {
    const res = await api.get('/sucursales', { params });
    return res.data;
  },
  getSucursalById: async (id) => {
    const res = await api.get(`/sucursales/${id}`);
    return res.data;
  },
  createSucursal: async (payload) => {
    const res = await api.post('/sucursales', payload);
    return res.data;
  },

  // Accesorios M Performance
  getAccesorios: async (params) => {
    const res = await api.get('/accesorios', { params });
    return res.data;
  },
  createAccesorio: async (payload) => {
    const res = await api.post('/accesorios', payload);
    return res.data;
  },

  // Proveedores
  getProveedores: async (params) => {
    const res = await api.get('/proveedores', { params });
    return res.data;
  },

  // Garantías
  getGarantias: async (params) => {
    const res = await api.get('/garantias', { params });
    return res.data;
  },

  // Mantenimientos
  getMantenimientos: async (params) => {
    const res = await api.get('/mantenimientos', { params });
    return res.data;
  },

  // Financiamientos
  getFinanciamientos: async (params) => {
    const res = await api.get('/financiamientos', { params });
    return res.data;
  },

  // Pruebas de manejo
  getPruebasManejo: async (params) => {
    const res = await api.get('/pruebas-manejo', { params });
    return res.data;
  },

  // Seguros
  getSeguros: async (params) => {
    const res = await api.get('/seguros', { params });
    return res.data;
  },

  // Logs de Auditoría
  getAuditoriaLogs: async (params) => {
    const res = await api.get('/auditoria-logs', { params });
    return res.data;
  },

  // Reportes Ejecutivos
  getReportesVentas: async () => {
    const res = await api.get('/reportes/ventas-periodo');
    return res.data;
  },
  getReportesInventario: async () => {
    const res = await api.get('/reportes/inventario-valorizado');
    return res.data;
  },
  getReportesRendimiento: async () => {
    const res = await api.get('/reportes/rendimiento-asesores');
    return res.data;
  },
  getReporteResumen: async () => {
    const res = await api.get('/reportes/resumen-ejecutivo');
    return res.data;
  }
};
