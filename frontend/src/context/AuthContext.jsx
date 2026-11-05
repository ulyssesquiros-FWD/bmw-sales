import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  setInMemoryToken,
  clearInMemoryToken,
  registerUnauthorizedHandler
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Estado mantenido estrictamente en memoria de React (sin localStorage ni sessionStorage)
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionNotice, setSessionNotice] = useState(null);

  const isAuthenticated = Boolean(token && usuario);

  const clearAuthState = useCallback(() => {
    clearInMemoryToken();
    setToken(null);
    setUsuario(null);
  }, []);

  // Suscribir manejador centralizado ante respuestas HTTP 401 del interceptor de Axios
  useEffect(() => {
    registerUnauthorizedHandler((expiredMessage) => {
      clearAuthState();
      setSessionNotice({
        type: 'warning',
        message:
          expiredMessage ||
          'Su sesión venció o no es válida. Por favor, inicie sesión nuevamente.'
      });
      navigate('/login', { replace: true });
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [clearAuthState, navigate]);

  const login = useCallback(async ({ correo, password }) => {
    setLoading(true);
    try {
      const response = await authService.login({
        correo: correo.trim().toLowerCase(),
        password
      });

      setInMemoryToken(response.token);
      setToken(response.token);
      setUsuario(response.usuario);
      setSessionNotice(null);

      // Verificar perfil contra GET /api/auth/me usando el nuevo Bearer token en memoria
      try {
        const perfilVerificado = await authService.getMe();
        if (perfilVerificado) {
          setUsuario(perfilVerificado);
        }
      } catch {
        // Si el perfil ya vino de /login, se conserva; cualquier 401 es gestionado por el interceptor
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ nombre, correo, password }) => {
    setLoading(true);
    try {
      const response = await authService.register({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        password
      });
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(
    (customMessage = '') => {
      clearAuthState();
      if (customMessage && typeof customMessage === 'string') {
        setSessionNotice({ type: 'info', message: customMessage });
      } else {
        setSessionNotice(null);
      }
      navigate('/login', { replace: true });
    },
    [clearAuthState, navigate]
  );

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      usuario,
      isAuthenticated,
      loading,
      sessionNotice,
      setSessionNotice,
      clearSessionNotice,
      login,
      register,
      logout
    }),
    [
      token,
      usuario,
      isAuthenticated,
      loading,
      sessionNotice,
      clearSessionNotice,
      login,
      register,
      logout
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un proveedor <AuthProvider>.');
  }
  return context;
}

