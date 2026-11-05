import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import { formatUSD, getTodayISO } from '../../utils/formatters';

const INITIAL_FORM = {
  id_vehiculo: '',
  id_cliente: '',
  id_vendedor: '',
  fecha_venta: getTodayISO(),
  precio_venta: '',
  observaciones: ''
};

export default function VentaFormModal({
  isOpen,
  onClose,
  onSubmit,
  vehiculos = [],
  clientes = [],
  vendedores = [],
  initialData = null,
  submitting = false,
  apiError = ''
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(initialData?.id_venta);

  // Solo mostrar vehículos Disponibles + el vehículo actual si estamos editando esta venta
  const vehiculosSeleccionables = useMemo(() => {
    return vehiculos.filter((v) => {
      if (v.estado === 'Disponible') return true;
      if (isEdit && Number(v.id_vehiculo) === Number(initialData.id_vehiculo)) return true;
      return false;
    });
  }, [vehiculos, isEdit, initialData]);

  const vehiculoSeleccionado = useMemo(() => {
    if (!formData.id_vehiculo) return null;
    return vehiculos.find((v) => Number(v.id_vehiculo) === Number(formData.id_vehiculo)) || null;
  }, [vehiculos, formData.id_vehiculo]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id_vehiculo: String(initialData.id_vehiculo || ''),
          id_cliente: String(initialData.id_cliente || ''),
          id_vendedor: String(initialData.id_vendedor || ''),
          fecha_venta: String(initialData.fecha_venta || '').slice(0, 10),
          precio_venta: String(initialData.precio_venta ?? ''),
          observaciones: initialData.observaciones || ''
        });
      } else {
        const primerDisponible = vehiculos.find((v) => v.estado === 'Disponible');
        setFormData({
          id_vehiculo: primerDisponible ? String(primerDisponible.id_vehiculo) : '',
          id_cliente: clientes.length > 0 ? String(clientes[0].id_cliente) : '',
          id_vendedor: vendedores.length > 0 ? String(vendedores[0].id_vendedor) : '',
          fecha_venta: getTodayISO(),
          precio_venta: primerDisponible ? String(primerDisponible.precio) : '',
          observaciones: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, vehiculos, clientes, vendedores]);

  const validate = () => {
    const newErrors = {};
    if (!formData.id_vehiculo) newErrors.id_vehiculo = 'Seleccione un vehículo disponible.';
    if (!formData.id_cliente) newErrors.id_cliente = 'Seleccione un cliente comprador.';
    if (!formData.id_vendedor) newErrors.id_vendedor = 'Seleccione el asesor responsable.';
    if (!formData.fecha_venta) newErrors.fecha_venta = 'Ingrese la fecha de la venta.';

    const precioNum = Number(formData.precio_venta);
    if (formData.precio_venta === '' || !Number.isFinite(precioNum) || precioNum <= 0) {
      newErrors.precio_venta = 'El precio de venta en USD debe ser mayor a 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'id_vehiculo' && !isEdit) {
        const found = vehiculos.find((v) => Number(v.id_vehiculo) === Number(value));
        if (found) {
          updated.precio_venta = String(found.precio);
        }
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyListPrice = () => {
    if (vehiculoSeleccionado) {
      setFormData((prev) => ({ ...prev, precio_venta: String(vehiculoSeleccionado.precio) }));
      setErrors((prev) => ({ ...prev, precio_venta: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      id_vehiculo: Number(formData.id_vehiculo),
      id_cliente: Number(formData.id_cliente),
      id_vendedor: Number(formData.id_vendedor),
      fecha_venta: formData.fecha_venta,
      precio_venta: Number(formData.precio_venta),
      observaciones: formData.observaciones.trim() || null
    });
  };

  const missingPrerequisites =
    vehiculosSeleccionables.length === 0 || clientes.length === 0 || vendedores.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? `Editar Venta #${initialData.id_venta}` : 'Registrar Nueva Venta BMW'}
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
            form="venta-form"
            className="btn btn-primary"
            disabled={submitting || missingPrerequisites}
          >
            {submitting ? 'Procesando transacción...' : isEdit ? 'Actualizar Venta' : 'Confirmar Venta'}
          </button>
        </>
      }
    >
      {apiError && <AlertBanner type="error" message={apiError} />}

      {vehiculosSeleccionables.length === 0 && (
        <AlertBanner
          type="info"
          message="No hay vehículos en estado Disponible en este momento. Registre un vehículo disponible o libere una reserva para realizar una venta."
        />
      )}

      <form id="venta-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="venta-vehiculo">
              <span>
                Vehículo BMW (Solo Disponibles)<span className="required-mark">*</span>
              </span>
            </label>
            <select
              id="venta-vehiculo"
              name="id_vehiculo"
              className="form-control"
              value={formData.id_vehiculo}
              onChange={handleChange}
            >
              <option value="">Seleccione un vehículo...</option>
              {vehiculosSeleccionables.map((v) => {
                const esActual = isEdit && Number(v.id_vehiculo) === Number(initialData.id_vehiculo);
                return (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>
                    {v.modelo_nombre} {v.version} ({v.anio}) — VIN: {v.vin} — Lista:{' '}
                    {formatUSD(v.precio)} {esActual ? '[Vehículo actual de esta venta]' : ''}
                  </option>
                );
              })}
            </select>
            {errors.id_vehiculo && <span className="field-error">{errors.id_vehiculo}</span>}
          </div>

          {vehiculoSeleccionado && (
            <div className="form-group full-width">
              <div className="reference-box">
                <div>
                  <div className="reference-box-title">
                    Precio de Lista de Referencia ({vehiculoSeleccionado.modelo_nombre}{' '}
                    {vehiculoSeleccionado.version})
                  </div>
                  <div className="reference-box-price">
                    {formatUSD(vehiculoSeleccionado.precio)} USD
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    VIN: {vehiculoSeleccionado.vin} • Color: {vehiculoSeleccionado.color} • Año:{' '}
                    {vehiculoSeleccionado.anio}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleApplyListPrice}
                >
                  Usar precio de referencia
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="venta-cliente">
              <span>
                Cliente Comprador<span className="required-mark">*</span>
              </span>
            </label>
            <select
              id="venta-cliente"
              name="id_cliente"
              className="form-control"
              value={formData.id_cliente}
              onChange={handleChange}
            >
              <option value="">Seleccione un cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} {c.apellidos} — ID: {c.identificacion}
                </option>
              ))}
            </select>
            {errors.id_cliente && <span className="field-error">{errors.id_cliente}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="venta-vendedor">
              <span>
                Vendedor Responsable<span className="required-mark">*</span>
              </span>
            </label>
            <select
              id="venta-vendedor"
              name="id_vendedor"
              className="form-control"
              value={formData.id_vendedor}
              onChange={handleChange}
            >
              <option value="">Seleccione un vendedor...</option>
              {vendedores.map((vd) => (
                <option key={vd.id_vendedor} value={vd.id_vendedor}>
                  {vd.nombre} {vd.apellidos} ({vd.correo})
                </option>
              ))}
            </select>
            {errors.id_vendedor && <span className="field-error">{errors.id_vendedor}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="venta-fecha">
              <span>
                Fecha de Venta<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="venta-fecha"
              name="fecha_venta"
              type="date"
              className="form-control"
              value={formData.fecha_venta}
              onChange={handleChange}
            />
            {errors.fecha_venta && <span className="field-error">{errors.fecha_venta}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="venta-precio">
              <span>
                Precio Final de Venta (USD)<span className="required-mark">*</span>
              </span>
            </label>
            <input
              id="venta-precio"
              name="precio_venta"
              type="number"
              min="0.01"
              step="0.01"
              className="form-control"
              placeholder="Ej. 64500.00"
              value={formData.precio_venta}
              onChange={handleChange}
            />
            {errors.precio_venta && <span className="field-error">{errors.precio_venta}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="venta-obs">
              <span>Observaciones de Entrega / Acuerdos Comerciales (Opcional)</span>
            </label>
            <textarea
              id="venta-obs"
              name="observaciones"
              className="form-control"
              maxLength={2000}
              placeholder="Accesorios incluidos, garantías extendidas, condiciones de entrega..."
              value={formData.observaciones}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

