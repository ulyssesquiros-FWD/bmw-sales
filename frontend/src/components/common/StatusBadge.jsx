export default function StatusBadge({ estado }) {
  const normalized = (estado || '').toLowerCase();
  const statusClass =
    normalized === 'disponible'
      ? 'disponible'
      : normalized === 'reservado'
      ? 'reservado'
      : 'vendido';

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-badge-dot" />
      {estado}
    </span>
  );
}

