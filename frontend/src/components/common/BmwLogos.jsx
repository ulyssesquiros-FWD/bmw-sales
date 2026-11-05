/**
 * Componentes con los emblemas originales oficiales de BMW AG y BMW M GmbH
 * servidos directamente desde /logos/*.svg (vectores oficiales).
 */

export function BmwRoundel({ size = 40, variant = 'classic', className = '' }) {
  const src = variant === 'flat' ? '/logos/bmw-flat-logo.svg' : '/logos/bmw-roundel.svg';
  return (
    <img
      src={src}
      alt="Logo Oficial BMW"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0
      }}
    />
  );
}

export function BmwMEmblem({ height = 18, className = '' }) {
  const width = Math.round(height * 2.65);
  return (
    <img
      src="/logos/bmw-m-logo.svg"
      alt="BMW M GmbH"
      width={width}
      height={height}
      className={className}
      style={{
        height: `${height}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    />
  );
}

