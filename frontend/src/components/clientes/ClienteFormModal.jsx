import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';

const INITIAL_FORM = {
  nombre: '',
  apellidos: '',
  identificacion: '',
  telefono: '',
  correo: '',
  direccion: ''
};

export default function ClienteFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  submitting = false,
  apiError = ''
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData?.id_cliente);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          apellidos: initialData.apellidos || '',
          identificacion: initialData.identificacion || '',
          telefono: initialData.telefono || '',
          correo: initialData.correo || '',
          direccion: initialData.direccion || ''
        });
      } else {
        setFormData(INITIAL_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios.';

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = 'La identificación es obligatoria.';
    } else if (formData.identificacion.trim().length < 3) {
      newErrors.identificacion = 'Debe tener al menos 3 caracteres.';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (formData.telefono.trim().length < 5) {
      newErrors.telefono = 'Ingrese un teléfono válido.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.correo.trim())) {
      newErrors.correo = 'Ingrese un correo electrónico válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos.trim(),
      identificacion: formData.identificacion.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim().toLowerCase(),
      direccion: formData.direccion.trim() || null
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cliente-form"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
          </button>
        </>
      }
    >
      {apiError && <AlertBanner type="error" message={apiError} />}

      <form id="cliente-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="cli-nombre">
              <span>
                Nombre(s)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="cli-nombre"
              name="nombre"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. Alejandro"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cli-apellidos">
              <span>
                Apellidos<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="cli-apellidos"
              name="apellidos"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. Mendoza Vargas"
              value={formData.apellidos}
              onChange={handleChange}
            />
            {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cli-identificacion">
              <span>
                Documento / Identificación<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="cli-identificacion"
              name="identificacion"
              type="text"
              maxLength={30}
              className="form-control"
              placeholder="Ej. 1020458910"
              value={formData.identificacion}
              onChange={handleChange}
            />
            {errors.identificacion && (
              <span className="field-error">{errors.identificacion}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cli-telefono">
              <span>
                Teléfono de Contacto<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="cli-telefono"
              name="telefono"
              type="text"
              maxLength={20}
              className="form-control"
              placeholder="Ej. +57 310 455 8921"
              value={formData.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <span className="field-error">{errors.telefono}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="cli-correo">
              <span>
                Correo Electrónico<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="cli-correo"
              name="correo"
              type="email"
              maxLength={120}
              className="form-control"
              placeholder="cliente@dominio.com"
              value={formData.correo}
              onChange={handleChange}
            />
            {errors.correo && <span className="field-error">{errors.correo}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="cli-direccion">
              <span>Dirección (Opcional)</span>
            </label>
            <input
              id="cli-direccion"
              name="direccion"
              type="text"
              maxLength={255}
              className="form-control"
              placeholder="Dirección residencial o corporativa"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

