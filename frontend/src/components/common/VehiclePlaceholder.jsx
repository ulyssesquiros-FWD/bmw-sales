import { useState, useEffect } from 'react';
import { BmwRoundel } from './BmwLogos';
import { getModelGalleryByText } from '../../utils/bmwCatalogMedia';

export default function VehiclePlaceholder({
  imagenUrl,
  modeloNombre = '',
  version = '',
  anio = 2025,
  color = '',
  alt = 'Vehículo BMW',
  variant = 'thumb'
}) {
  const [imgError, setImgError] = useState(false);

  const fallbackGallery = getModelGalleryByText(modeloNombre, version, anio, color);
  const isExternalGeneric = imagenUrl && (imagenUrl.includes('unsplash.com') || imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://'));
  const safeImageUrl = isExternalGeneric ? null : imagenUrl;
  const resolvedSrc =
    safeImageUrl && safeImageUrl.trim() && !imgError ? safeImageUrl.trim() : fallbackGallery[0]?.url;

  useEffect(() => {
    setImgError(false);
  }, [imagenUrl]);

  const containerClass = variant === 'hero' ? 'vehicle-hero-media' : 'vehicle-thumb';

  if (resolvedSrc) {
    return (
      <div className={containerClass} title={alt}>
        <img
          src={resolvedSrc}
          alt={alt}
          onError={() => {
            if (!imgError) setImgError(true);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={containerClass} title={alt}>
      <BmwRoundel size={variant === 'hero' ? 56 : 26} />
    </div>
  );
}
