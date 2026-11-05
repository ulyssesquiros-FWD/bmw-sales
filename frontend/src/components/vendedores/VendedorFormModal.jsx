import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import { getTodayISO } from '../../utils/formatters';

const INITIAL_FORM = {
  nombre: '',
  apellidos: '',
  telefono: '',
  correo: '',
  fecha_contratacion: getTodayISO()
};

export default function VendedorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  submitting = false,
  apiError = ''
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData?.id_vendedor);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          apellidos: initialData.apellidos || '',
          telefono: initialData.telefono || '',
          correo: initialData.correo || '',
          fecha_contratacion: String(initialData.fecha_contratacion || '').slice(0, 10)
        });
      } else {
        setFormData({ ...INITIAL_FORM, fecha_contratacion: getTodayISO() });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios.';
    if (!formData.telefono.trim() || formData.telefono.trim().length < 5) {
      newErrors.telefono = 'Ingrese un teléfono válido.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo corporativo es obligatorio.';
    } else if (!emailRegex.test(formData.correo.trim())) {
      newErrors.correo = 'Ingrese un correo electrónico válido.';
    }

    if (!formData.fecha_contratacion) {
      newErrors.fecha_contratacion = 'La fecha de contratación es obligatoria.';
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
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim().toLowerCase(),
      fecha_contratacion: formData.fecha_contratacion
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Editar Asesor Comercial' : 'Registrar Nuevo Vendedor'}
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
            form="vendedor-form"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Vendedor'}
          </button>
        </>
      }
    >
      {apiError && <AlertBanner type="error" message={apiError} />}

      <form id="vendedor-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="vend-nombre">
              <span>
                Nombre(s)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="vend-nombre"
              name="nombre"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. Carlos Andrés"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vend-apellidos">
              <span>
                Apellidos<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="vend-apellidos"
              name="apellidos"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. Pineda Gómez"
              value={formData.apellidos}
              onChange={handleChange}
            />
            {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vend-telefono">
              <span>
                Teléfono<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="vend-telefono"
              name="telefono"
              type="text"
              maxLength={20}
              className="form-control"
              placeholder="Ej. +57 316 500 1101"
              value={formData.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <span className="field-error">{errors.telefono}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vend-fecha">
              <span>
                Fecha de Contratación<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="vend-fecha"
              name="fecha_contratacion"
              type="date"
              className="form-control"
              value={formData.fecha_contratacion}
              onChange={handleChange}
            />
            {errors.fecha_contratacion && (
              <span className="field-error">{errors.fecha_contratacion}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="vend-correo">
              <span>
                Correo Corporativo (Único)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="vend-correo"
              name="correo"
              type="email"
              maxLength={120}
              className="form-control"
              placeholder="asesor@bmwpremiummotors.com"
              value={formData.correo}
              onChange={handleChange}
            />
            {errors.correo && <span className="field-error">{errors.correo}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}

