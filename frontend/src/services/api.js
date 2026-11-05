import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Almacenamiento exclusivo en memoria de sesión JS (sin localStorage ni sessionStorage)
let inMemoryAccessToken = null;
let unauthorizedHandler = null;

export function setInMemoryToken(token) {
  inMemoryAccessToken = token || null;
}

export function getInMemoryToken() {
  return inMemoryAccessToken;
}

export function clearInMemoryToken() {
  inMemoryAccessToken = null;
  if (api?.defaults?.headers?.common) {
    delete api.defaults.headers.common.Authorization;
  }
}

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

/**
 * Garantiza que el encabezado Authorization: Bearer nunca se envíe a dominios externos.
 */
function isAuthorizedApiTarget(requestUrl = '', baseURL = API_BASE_URL) {
  if (!requestUrl) return true;
  if (!/^https?:\/\//i.test(requestUrl)) {
    return true; // Ruta relativa hacia baseURL
  }
  try {
    const targetOrigin = new URL(requestUrl).origin;
    const apiOrigin = new URL(baseURL).origin;
    return targetOrigin === apiOrigin;
  } catch {
    return false;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de solicitudes: adjunta Authorization: Bearer <token> desde memoria
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && isAuthorizedApiTarget(config.url, config.baseURL)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: manejo centralizado de HTTP 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isAuthAttempt =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (status === 401 && !isAuthAttempt) {
      clearInMemoryToken();
      if (unauthorizedHandler) {
        unauthorizedHandler(
          'Su sesión ha expirado o el token ya no es válido. Inicie sesión nuevamente para continuar.'
        );
      }
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el servidor Backend (http://localhost:3001). Verifique que el backend y MySQL estén en ejecución.';
  }
  return error?.message || 'Ocurrió un error inesperado al procesar la operación.';
}

export default api;
