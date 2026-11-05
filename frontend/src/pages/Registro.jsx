import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../components/common/BmwLogos';
import AlertBanner from '../components/common/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registro() {
  const navigate = useNavigate();
  const { register, loading, setSessionNotice } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const errors = {};
    const nombreTrimmed = formData.nombre.trim();
    const correoTrimmed = formData.correo.trim();

    if (!nombreTrimmed) {
      errors.nombre = 'El nombre completo es obligatorio.';
    } else if (nombreTrimmed.length < 2 || nombreTrimmed.length > 100) {
      errors.nombre = 'El nombre debe tener entre 2 y 100 caracteres.';
    }

    if (!correoTrimmed) {
      errors.correo = 'El correo electrónico es obligatorio.';
    } else if (!EMAIL_REGEX.test(correoTrimmed) || correoTrimmed.length > 120) {
      errors.correo = 'Ingrese un correo electrónico válido (máximo 120 caracteres).';
    }

    const passwordBytes = new TextEncoder().encode(formData.password).length;
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener un mínimo de 8 caracteres.';
    } else if (passwordBytes > 72) {
      errors.password = 'La contraseña no puede superar los 72 bytes UTF-8.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar su contraseña.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas ingresadas no coinciden.';
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
    if (name === 'password' && fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
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
      const res = await register({
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password
      });

      setSessionNotice({
        type: 'success',
        message:
          res.message ||
          'Usuario registrado correctamente. Ahora puede iniciar sesión con sus credenciales.'
      });

      navigate('/login', {
        replace: true,
        state: { registeredEmail: formData.correo.trim().toLowerCase() }
      });
    } catch (error) {
      setApiError(extractErrorMessage(error));
    }
  };

  return (
    <div className="auth-portal">
      <div className="auth-portal-backdrop" aria-hidden="true" />

      <div className="auth-card auth-card-register">
        <div className="m-stripe-bar auth-m-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="auth-brand-header">
          <div className="auth-logos-row">
            <BmwRoundel size={44} variant="classic" />
            <span className="auth-logo-sep" aria-hidden="true" />
            <BmwMEmblem height={17} />
          </div>
          <h1 className="auth-brand-title">Crear Cuenta Corporativa</h1>
          <p className="auth-brand-subtitle">
            BMW Premium Motors • Registro de Operador Autorizado
          </p>
        </div>

        {apiError && (
          <AlertBanner
            type="error"
            message={apiError}
            onClose={() => setApiError('')}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-nombre">
              <span>
                Nombre <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <User size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                maxLength={100}
                className={`form-control auth-input ${fieldErrors.nombre ? 'has-error' : ''}`}
                placeholder="Ej. Ulysses"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-correo">
              <span>
                Correo Electrónico <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <Mail size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-correo"
                name="correo"
                type="email"
                autoComplete="email"
                maxLength={120}
                className={`form-control auth-input ${fieldErrors.correo ? 'has-error' : ''}`}
                placeholder="usuario@bmwpremiummotors.com"
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              <span>
                Contraseña (mínimo 8 caracteres) <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <Lock size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-control auth-input auth-input-password ${
                  fieldErrors.password ? 'has-error' : ''
                }`}
                placeholder="Mínimo 8 caracteres"
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

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">
              <span>
                Confirmación de Contraseña <span className="required">*</span>
              </span>
            </label>
            <div className="auth-input-wrap">
              <Lock size={17} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-control auth-input auth-input-password ${
                  fieldErrors.confirmPassword ? 'has-error' : ''
                }`}
                placeholder="Repita su contraseña exactamente"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'
                }
                title={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-inline" />
                <span>Creando cuenta segura...</span>
              </>
            ) : (
              <>
                <UserPlus size={17} />
                <span>Crear cuenta</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/login" className="auth-link auth-back-link">
            <ArrowLeft size={15} />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

