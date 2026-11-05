import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';

const INITIAL_FORM = {
  nombre: '',
  tipo_carroceria: '',
  combustible: '',
  transmision: '',
  descripcion: ''
};

const CARROCERIAS_SUGERIDAS = [
  'Sedán',
  'Sedán Ejecutivo',
  'SUV (SAV)',
  'SUV Coupé (SAC)',
  'Coupé',
  'Gran Coupé',
  'Cabrio',
  'Touring',
  'Roadster'
];

const COMBUSTIBLES_SUGERIDOS = [
  'Gasolina',
  'Gasolina TwinPower Turbo',
  'Diésel',
  'Híbrido Ligero (MHEV)',
  'Híbrido Enchufable (PHEV)',
  '100% Eléctrico'
];

const TRANSMISIONES_SUGERIDAS = [
  'Automática Steptronic 8 vel.',
  'Automática Steptronic Sport 8 vel.',
  'Automática M Steptronic 8 vel.',
  'Automática de 1 velocidad',
  'Manual de 6 velocidades'
];

export default function ModeloFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  submitting = false,
  apiError = ''
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData?.id_modelo);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          tipo_carroceria: initialData.tipo_carroceria || '',
          combustible: initialData.combustible || '',
          transmision: initialData.transmision || '',
          descripcion: initialData.descripcion || ''
        });
      } else {
        setFormData(INITIAL_FORM);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del modelo es obligatorio.';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'Máximo 100 caracteres.';
    }

    if (!formData.tipo_carroceria.trim()) {
      newErrors.tipo_carroceria = 'El tipo de carrocería es obligatorio.';
    }

    if (!formData.combustible.trim()) {
      newErrors.combustible = 'El tipo de combustible es obligatorio.';
    }

    if (!formData.transmision.trim()) {
      newErrors.transmision = 'La transmisión es obligatoria.';
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
      tipo_carroceria: formData.tipo_carroceria.trim(),
      combustible: formData.combustible.trim(),
      transmision: formData.transmision.trim(),
      descripcion: formData.descripcion.trim() || null
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Editar Modelo BMW' : 'Registrar Nuevo Modelo BMW'}
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
            form="modelo-form"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Modelo'}
          </button>
        </>
      }
    >
      {apiError && <AlertBanner type="error" message={apiError} />}

      <form id="modelo-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="modelo-nombre">
              <span>
                Nombre del Modelo<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="modelo-nombre"
              name="nombre"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. BMW Serie 3, BMW X5, BMW iX"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modelo-carroceria">
              <span>
                Tipo de Carrocería<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="modelo-carroceria"
              name="tipo_carroceria"
              type="text"
              list="carrocerias-list"
              maxLength={50}
              className="form-control"
              placeholder="Ej. Sedán, SUV (SAV), Coupé"
              value={formData.tipo_carroceria}
              onChange={handleChange}
            />
            <datalist id="carrocerias-list">
              {CARROCERIAS_SUGERIDAS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {errors.tipo_carroceria && (
              <span className="field-error">{errors.tipo_carroceria}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modelo-combustible">
              <span>
                Combustible<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="modelo-combustible"
              name="combustible"
              type="text"
              list="combustibles-list"
              maxLength={50}
              className="form-control"
              placeholder="Ej. Gasolina, Híbrido, 100% Eléctrico"
              value={formData.combustible}
              onChange={handleChange}
            />
            <datalist id="combustibles-list">
              {COMBUSTIBLES_SUGERIDOS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {errors.combustible && <span className="field-error">{errors.combustible}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="modelo-transmision">
              <span>
                Transmisión<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="modelo-transmision"
              name="transmision"
              type="text"
              list="transmisiones-list"
              maxLength={50}
              className="form-control"
              placeholder="Ej. Automática Steptronic 8 vel."
              value={formData.transmision}
              onChange={handleChange}
            />
            <datalist id="transmisiones-list">
              {TRANSMISIONES_SUGERIDAS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {errors.transmision && <span className="field-error">{errors.transmision}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="modelo-descripcion">
              <span>Descripción Técnica / Comercial (Opcional)</span>
            </label>
            <textarea
              id="modelo-descripcion"
              name="descripcion"
              className="form-control"
              maxLength={2000}
              placeholder="Características destacadas de la línea o serie..."
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

