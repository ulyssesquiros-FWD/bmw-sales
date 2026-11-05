import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../components/common/BmwLogos';
import AlertBanner from '../components/common/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, sessionNotice, clearSessionNotice } = useAuth();

  const prefilledEmail = location.state?.registeredEmail || '';

  const [formData, setFormData] = useState({
    correo: prefilledEmail,
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (prefilledEmail) {
      setFormData((prev) => ({ ...prev, correo: prefilledEmail }));
    }
  }, [prefilledEmail]);

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = formData.correo.trim();

    if (!trimmedEmail) {
      errors.correo = 'Ingrese su correo electrónico corporativo.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.correo = 'Ingrese un correo electrónico con formato válido.';
    }

    if (!formData.password) {
      errors.password = 'Ingrese su contraseña.';
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      errors.password = 'La contraseña no puede superar los 72 bytes UTF-8.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        correo: formData.correo,
        password: formData.password
      });
      const destination = location.state?.from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    }
  };

  return (
    <div className="auth-portal">
      <div className="auth-portal-backdrop" aria-hidden="true" />

      <div className="auth-card">
        <div className="m-stripe-bar auth-m-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="auth-brand-header">
          <div className="auth-logos-row">
            <BmwRoundel size={48} variant="classic" />
            <span className="auth-logo-sep" aria-hidden="true" />
            <BmwMEmblem height={18} />
          </div>
          <h1 className="auth-brand-title">BMW Premium Motors</h1>
          <p className="auth-brand-subtitle">
            Portal Ejecutivo de Gestión Comercial &amp; Showroom Oficial
          </p>
        </div>

        {sessionNotice?.message && (
          <AlertBanner
            type={sessionNotice.type || 'info'}
            message={sessionNotice.message}
            onClose={clearSessionNotice}
          />
        )}

        {apiError && (
          <AlertBanner
            type="error"
            message={apiError}
            onClose={() => setApiError('')}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-correo">
              <span>
                Correo Electrónico <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <Mail size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="login-correo"
                name="correo"
                type="email"
                autoComplete="email"
                maxLength={120}
                className={`form-control auth-input ${fieldErrors.correo ? 'has-error' : ''}`}
                placeholder="ejecutivo@bmwpremiummotors.com"
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <span>
                Contraseña <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <Lock size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-control auth-input auth-input-password ${
                  fieldErrors.password ? 'has-error' : ''
                }`}
                placeholder="Ingrese su contraseña"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-inline" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Iniciar sesión</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>¿Aún no tiene cuenta en el concesionario?</span>
          <Link to="/registro" className="auth-link">
            Registrarse ahora
          </Link>
        </div>

        <div className="auth-security-note">
          <ShieldCheck size={14} />
          <span>Sesión protegida con JWT HS256 en memoria (vigencia 1 hora)</span>
        </div>
      </div>
    </div>
  );
}

