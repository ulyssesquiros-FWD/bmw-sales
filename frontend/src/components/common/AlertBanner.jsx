import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null;

  const IconComponent =
    type === 'error' ? AlertCircle : type === 'success' ? CheckCircle2 : Info;

  return (
    <div className={`alert-banner ${type}`} role="alert">
      <div className="alert-banner-content">
        <IconComponent size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-ghost"
          onClick={onClose}
          style={{ padding: '2px', lineHeight: 1 }}
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

