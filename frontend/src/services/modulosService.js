import api from './api';

export const modulosService = {
  // 1. Sucursales
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
  updateSucursal: async (id, payload) => {
    const res = await api.put(`/sucursales/${id}`, payload);
    return res.data;
  },
  deleteSucursal: async (id) => {
    const res = await api.delete(`/sucursales/${id}`);
    return res.data;
  },

  // 2. Accesorios M Performance
  getAccesorios: async (params) => {
    const res = await api.get('/accesorios', { params });
    return res.data;
  },
  getAccesorioById: async (id) => {
    const res = await api.get(`/accesorios/${id}`);
    return res.data;
  },
  createAccesorio: async (payload) => {
    const res = await api.post('/accesorios', payload);
    return res.data;
  },
  updateAccesorio: async (id, payload) => {
    const res = await api.put(`/accesorios/${id}`, payload);
    return res.data;
  },
  deleteAccesorio: async (id) => {
    const res = await api.delete(`/accesorios/${id}`);
    return res.data;
  },

  // 3. Proveedores
  getProveedores: async (params) => {
    const res = await api.get('/proveedores', { params });
    return res.data;
  },
  getProveedorById: async (id) => {
    const res = await api.get(`/proveedores/${id}`);
    return res.data;
  },
  createProveedor: async (payload) => {
    const res = await api.post('/proveedores', payload);
    return res.data;
  },
  updateProveedor: async (id, payload) => {
    const res = await api.put(`/proveedores/${id}`, payload);
    return res.data;
  },
  deleteProveedor: async (id) => {
    const res = await api.delete(`/proveedores/${id}`);
    return res.data;
  },

  // 4. Garantías
  getGarantias: async (params) => {
    const res = await api.get('/garantias', { params });
    return res.data;
  },
  getGarantiaById: async (id) => {
    const res = await api.get(`/garantias/${id}`);
    return res.data;
  },
  createGarantia: async (payload) => {
    const res = await api.post('/garantias', payload);
    return res.data;
  },
  updateGarantia: async (id, payload) => {
    const res = await api.put(`/garantias/${id}`, payload);
    return res.data;
  },
  deleteGarantia: async (id) => {
    const res = await api.delete(`/garantias/${id}`);
    return res.data;
  },

  // 5. Mantenimientos (Taller BMW Service)
  getMantenimientos: async (params) => {
    const res = await api.get('/mantenimientos', { params });
    return res.data;
  },
  getMantenimientoById: async (id) => {
    const res = await api.get(`/mantenimientos/${id}`);
    return res.data;
  },
  createMantenimiento: async (payload) => {
    const res = await api.post('/mantenimientos', payload);
    return res.data;
  },
  updateMantenimiento: async (id, payload) => {
    const res = await api.put(`/mantenimientos/${id}`, payload);
    return res.data;
  },
  deleteMantenimiento: async (id) => {
    const res = await api.delete(`/mantenimientos/${id}`);
    return res.data;
  },

  // 6. Financiamientos (BMW Financial Services)
  getFinanciamientos: async (params) => {
    const res = await api.get('/financiamientos', { params });
    return res.data;
  },
  getFinanciamientoById: async (id) => {
    const res = await api.get(`/financiamientos/${id}`);
    return res.data;
  },
  createFinanciamiento: async (payload) => {
    const res = await api.post('/financiamientos', payload);
    return res.data;
  },
  updateFinanciamiento: async (id, payload) => {
    const res = await api.put(`/financiamientos/${id}`, payload);
    return res.data;
  },
  deleteFinanciamiento: async (id) => {
    const res = await api.delete(`/financiamientos/${id}`);
    return res.data;
  },

  // 7. Pruebas de manejo (BMW Test Drives)
  getPruebasManejo: async (params) => {
    const res = await api.get('/pruebas-manejo', { params });
    return res.data;
  },
  getPruebaManejoById: async (id) => {
    const res = await api.get(`/pruebas-manejo/${id}`);
    return res.data;
  },
  createPruebaManejo: async (payload) => {
    const res = await api.post('/pruebas-manejo', payload);
    return res.data;
  },
  updatePruebaManejo: async (id, payload) => {
    const res = await api.put(`/pruebas-manejo/${id}`, payload);
    return res.data;
  },
  deletePruebaManejo: async (id) => {
    const res = await api.delete(`/pruebas-manejo/${id}`);
    return res.data;
  },

  // 8. Seguros (BMW Protection)
  getSeguros: async (params) => {
    const res = await api.get('/seguros', { params });
    return res.data;
  },
  getSeguroById: async (id) => {
    const res = await api.get(`/seguros/${id}`);
    return res.data;
  },
  createSeguro: async (payload) => {
    const res = await api.post('/seguros', payload);
    return res.data;
  },
  updateSeguro: async (id, payload) => {
    const res = await api.put(`/seguros/${id}`, payload);
    return res.data;
  },
  deleteSeguro: async (id) => {
    const res = await api.delete(`/seguros/${id}`);
    return res.data;
  },

  // 9. Logs de Auditoría
  getAuditoriaLogs: async (params) => {
    const res = await api.get('/auditoria-logs', { params });
    return res.data;
  },

  // 10. Reportes Ejecutivos & Business Intelligence
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
