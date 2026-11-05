import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import { STUDIO_PRESETS } from '../../utils/bmwCatalogMedia';

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_FORM = {
  id_modelo: '',
  vin: '',
  version: '',
  anio: String(CURRENT_YEAR),
  color: '',
  kilometraje: '0',
  precio: '',
  estado: 'Disponible',
  imagen_url: ''
};

export default function VehiculoFormModal({
  isOpen,
  onClose,
  onSubmit,
  modelos = [],
  initialData = null,
  submitting = false,
  apiError = ''
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData?.id_vehiculo);
  const isCurrentlySold = isEdit && initialData?.estado === 'Vendido';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id_modelo: String(initialData.id_modelo || ''),
          vin: initialData.vin || '',
          version: initialData.version || '',
          anio: String(initialData.anio || CURRENT_YEAR),
          color: initialData.color || '',
          kilometraje: String(initialData.kilometraje ?? 0),
          precio: String(initialData.precio ?? ''),
          estado: initialData.estado || 'Disponible',
          imagen_url: initialData.imagen_url || ''
        });
      } else {
        setFormData({
          ...INITIAL_FORM,
          id_modelo: modelos.length > 0 ? String(modelos[0].id_modelo) : ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, modelos]);

  const validate = () => {
    const newErrors = {};
    const vinTrim = formData.vin.trim().toUpperCase();

    if (!formData.id_modelo) {
      newErrors.id_modelo = 'Seleccione un modelo BMW.';
    }

    if (!vinTrim) {
      newErrors.vin = 'El número VIN es obligatorio.';
    } else if (vinTrim.length !== 17) {
      newErrors.vin = `El VIN debe tener exactamente 17 caracteres (actual: ${vinTrim.length}).`;
    } else if (!/^[A-Z0-9]{17}$/.test(vinTrim)) {
      newErrors.vin = 'El VIN solo puede contener letras y números sin espacios.';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'La versión es obligatoria.';
    }

    const anioNum = Number(formData.anio);
    if (!Number.isInteger(anioNum) || anioNum < 1950 || anioNum > 2100) {
      newErrors.anio = 'Ingrese un año válido entre 1950 y 2100.';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'El color es obligatorio.';
    }

    const kmNum = Number(formData.kilometraje);
    if (formData.kilometraje === '' || !Number.isInteger(kmNum) || kmNum < 0) {
      newErrors.kilometraje = 'El kilometraje debe ser un entero mayor o igual a 0.';
    }

    const precioNum = Number(formData.precio);
    if (formData.precio === '' || !Number.isFinite(precioNum) || precioNum <= 0) {
      newErrors.precio = 'El precio en USD debe ser mayor a 0.';
    }

    const imgTrim = formData.imagen_url.trim();
    if (imgTrim && !imgTrim.startsWith('/vehicles/')) {
      try {
        const parsed = new URL(imgTrim);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          newErrors.imagen_url = 'La URL debe iniciar con http://, https:// o /vehicles/...';
        }
      } catch {
        newErrors.imagen_url = 'Ingrese una URL válida (http:// o https://), una ruta /vehicles/... o déjela vacía.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextVal = name === 'vin' ? value.toUpperCase().replace(/\s+/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: nextVal }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id_modelo: Number(formData.id_modelo),
      vin: formData.vin.trim().toUpperCase(),
      version: formData.version.trim(),
      anio: Number(formData.anio),
      color: formData.color.trim(),
      kilometraje: Number(formData.kilometraje),
      precio: Number(formData.precio),
      estado: isCurrentlySold ? 'Vendido' : formData.estado,
      imagen_url: formData.imagen_url.trim() || null
    });
  };

  const vinLength = formData.vin.trim().length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Editar Vehículo BMW' : 'Registrar Vehículo en Showroom'}
      size="lg"
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
            form="vehiculo-form"
            className="btn btn-primary"
            disabled={submitting || modelos.length === 0}
          >
            {submitting ? 'Guardando...' : isEdit ? 'Actualizar Vehículo' : 'Registrar Vehículo'}
          </button>
        </>
      }
    >
      {apiError && <AlertBanner type="error" message={apiError} />}
      {modelos.length === 0 && (
        <AlertBanner
          type="info"
          message="Debe registrar al menos un Modelo BMW antes de poder agregar vehículos al inventario."
        />
      )}

      <form id="vehiculo-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="veh-modelo">
              <span>
                Modelo BMW<span className="required-mark">*</span>
              </span>
            </label>
            <select
              id="veh-modelo"
              name="id_modelo"
              className="form-control"
              value={formData.id_modelo}
              onChange={handleChange}
            >
              <option value="">Seleccione un modelo...</option>
              {modelos.map((m) => (
                <option key={m.id_modelo} value={m.id_modelo}>
                  {m.nombre} ({m.tipo_carroceria})
                </option>
              ))}
            </select>
            {errors.id_modelo && <span className="field-error">{errors.id_modelo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-version">
              <span>
                Versión<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="veh-version"
              name="version"
              type="text"
              maxLength={100}
              className="form-control"
              placeholder="Ej. Competition M xDrive, E70 V8 555 HP"
              value={formData.version}
              onChange={handleChange}
            />
            {errors.version && <span className="field-error">{errors.version}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-vin">
              <span>
                Número VIN (17 caracteres)<span className="required-mark">*</span>
              </span>
              <span className={`char-counter ${vinLength === 17 ? 'valid' : ''}`}>
                {vinLength}/17
              </span>
            </label>
            <input
              id="veh-vin"
              name="vin"
              type="text"
              maxLength={17}
              className="form-control"
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              placeholder="Ej. 5YMGY0C58CLX52012"
              value={formData.vin}
              onChange={handleChange}
            />
            {errors.vin && <span className="field-error">{errors.vin}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-anio">
              <span>
                Año Modelo<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="veh-anio"
              name="anio"
              type="number"
              min="1950"
              max="2100"
              step="1"
              className="form-control"
              value={formData.anio}
              onChange={handleChange}
            />
            {errors.anio && <span className="field-error">{errors.anio}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-color">
              <span>
                Color Exterior<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="veh-color"
              name="color"
              type="text"
              maxLength={50}
              className="form-control"
              placeholder="Ej. Titanium Silver Metallic"
              value={formData.color}
              onChange={handleChange}
            />
            {errors.color && <span className="field-error">{errors.color}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-km">
              <span>
                Kilometraje (km)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="veh-km"
              name="kilometraje"
              type="number"
              min="0"
              step="1"
              className="form-control"
              value={formData.kilometraje}
              onChange={handleChange}
            />
            {errors.kilometraje && <span className="field-error">{errors.kilometraje}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-precio">
              <span>
                Precio de Lista (USD)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="veh-precio"
              name="precio"
              type="number"
              min="0.01"
              step="0.01"
              className="form-control"
              placeholder="Ej. 96500.00"
              value={formData.precio}
              onChange={handleChange}
            />
            {errors.precio && <span className="field-error">{errors.precio}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-estado">
              <span>
                Estado Comercial<span className="required-mark">*</span>
              </span>
            </label>
            {isCurrentlySold ? (
              <>
                <input
                  id="veh-estado"
                  type="text"
                  className="form-control"
                  value="Vendido (Controlado por Ventas)"
                  disabled
                />
                <span className="field-hint">
                  El estado Vendido se gestiona automáticamente mediante el registro de ventas.
                </span>
              </>
            ) : (
              <>
                <select
                  id="veh-estado"
                  name="estado"
                  className="form-control"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Reservado">Reservado</option>
                </select>
                <span className="field-hint">
                  El estado &quot;Vendido&quot; solo se asigna al registrar una venta.
                </span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-preset">
              <span>Galería Oficial de Estudio BMW (Rápido)</span>
            </label>
            <select
              id="veh-preset"
              className="form-control"
              value={
                STUDIO_PRESETS.some((p) => p.url === formData.imagen_url)
                  ? formData.imagen_url
                  : ''
              }
              onChange={(e) => {
                if (e.target.value) {
                  setFormData((prev) => ({ ...prev, imagen_url: e.target.value }));
                  setErrors((prev) => ({ ...prev, imagen_url: '' }));
                }
              }}
            >
              <option value="">Seleccionar fotografía de estudio...</option>
              {STUDIO_PRESETS.map((p) => (
                <option key={p.url} value={p.url}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Opcional: asigne una foto oficial local o ingrese una URL personalizada.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="veh-imagen">
              <span>Ruta / URL de Fotografía (Opcional)</span>
            </label>
            <input
              id="veh-imagen"
              name="imagen_url"
              type="text"
              maxLength={500}
              className="form-control"
              placeholder="/vehicles/x5m-2012-front.jpg o https://..."
              value={formData.imagen_url}
              onChange={handleChange}
            />
            {errors.imagen_url && <span className="field-error">{errors.imagen_url}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
}
