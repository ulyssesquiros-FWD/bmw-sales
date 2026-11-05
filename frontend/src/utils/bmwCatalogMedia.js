/**
 * Catálogo multimedia oficial para galerías multi-ángulo estilo BMW.com
 * Mapea cada unidad y modelo a sus fotografías de estudio (Frontal, Lateral/Trasera e Interior).
 */

export const STUDIO_PRESETS = [
  { label: 'BMW X5 M 2012 (E70) — Titanium Silver Metallic', url: '/vehicles/x5m-2012-front.jpg' },
  { label: 'BMW M3 Competition (G80) — Gris Brooklyn', url: '/vehicles/m3-g80-front.jpg' },
  { label: 'BMW M4 Competition Coupé (G82)', url: '/vehicles/m4-g82-front.jpg' },
  { label: 'BMW M5 Competition — Azul Marina Bay', url: '/vehicles/m5-front.jpg' },
  { label: 'BMW X6 M Competition — Gris Dravit', url: '/vehicles/x6m-front.jpg' },
  { label: 'BMW Serie 3 330i M Sport — Blanco Alpino', url: '/vehicles/serie3-white-front.jpg' },
  { label: 'BMW Serie 3 M340i xDrive — Azul Portimao', url: '/vehicles/serie3-blue-front.jpg' },
  { label: 'BMW X5 xDrive40i / M60i (G05)', url: '/vehicles/x5-g05-front.jpg' },
  { label: 'BMW i4 M50 / eDrive40 Gran Coupé', url: '/vehicles/i4-front.jpg' },
  { label: 'BMW X3 xDrive30i (G01)', url: '/vehicles/x3-front.jpg' },
  { label: 'BMW Serie 5 530e M Sport (G60)', url: '/vehicles/serie5-front.jpg' }
];

export function isFullMModel(nombreModelo = '', version = '') {
  const full = `${nombreModelo} ${version}`.toUpperCase();
  return (
    /\bX5\s*M\b/.test(full) ||
    /\bX6\s*M\b/.test(full) ||
    /\bM2\b/.test(full) ||
    /\bM3\b/.test(full) ||
    /\bM4\b/.test(full) ||
    /\bM5\b/.test(full) ||
    /\bM8\b/.test(full) ||
    /\bXM\b/.test(full) ||
    /\bM340I\b/.test(full) ||
    /\bM60I\b/.test(full) ||
    /\bM50\b/.test(full) ||
    /\bM40I\b/.test(full)
  );
}

export function isSpecialX5M2012(vehiculo) {
  if (!vehiculo) return false;
  const mod = (vehiculo.modelo_nombre || vehiculo.nombre || '').toUpperCase();
  const ver = (vehiculo.version || '').toUpperCase();
  return (
    vehiculo.vin === '5YMGY0C58CLX52012' ||
    (mod.includes('X5 M') && Number(vehiculo.anio) === 2012) ||
    ver.includes('E70')
  );
}

export function getModelGalleryByText(nombreModelo = '', version = '', anio = 2025, color = '') {
  const key = `${nombreModelo} ${version}`.toUpperCase();
  const col = (color || '').toUpperCase();

  // Mención Especial: BMW X5 M 2012 (E70)
  if ((key.includes('X5 M') && Number(anio) <= 2013) || key.includes('E70')) {
    return [
      { id: 'front', label: 'Exterior Frontal 3/4', url: '/vehicles/x5m-2012-front.jpg' },
      { id: 'side', label: 'Perfil Lateral M', url: '/vehicles/x5m-2012-side.jpg' },
      { id: 'rear', label: 'Zaga & Escape Cuádruple', url: '/vehicles/x5m-2012-rear.jpg' },
      { id: 'interior', label: 'Cabina M E70', url: '/vehicles/x5m-2012-interior.jpg' }
    ];
  }

  if (key.includes('X5 M')) {
    return [
      { id: 'front', label: 'Exterior Frontal M', url: '/vehicles/x5-g05-front.jpg' },
      { id: 'rear', label: 'Zaga & Difusor M', url: '/vehicles/x5-g05-rear.jpg' },
      { id: 'heritage', label: 'Legado X5 M E70 (2012)', url: '/vehicles/x5m-2012-front.jpg' },
      { id: 'interior', label: 'Cockpit M', url: '/vehicles/bmw-m-interior.jpg' }
    ];
  }

  if (key.includes('M3')) {
    return [
      { id: 'front', label: 'Exterior Frontal 3/4', url: '/vehicles/m3-g80-front.jpg' },
      { id: 'rear', label: 'Zaga & Escape M', url: '/vehicles/m3-g80-rear.jpg' },
      { id: 'interior', label: 'Cockpit M Carbon', url: '/vehicles/bmw-m-interior.jpg' }
    ];
  }

  if (key.includes('M4')) {
    return [
      { id: 'front', label: 'Exterior Frontal Coupé', url: '/vehicles/m4-g82-front.jpg' },
      { id: 'rear', label: 'Zaga & Difusor CFRP', url: '/vehicles/m4-g82-rear.jpg' },
      { id: 'interior', label: 'Cockpit M Carbon', url: '/vehicles/bmw-m-interior.jpg' }
    ];
  }

  if (key.includes('M5')) {
    return [
      { id: 'front', label: 'Exterior Frontal V8 M', url: '/vehicles/m5-front.jpg' },
      { id: 'rear', label: 'Zaga Competition', url: '/vehicles/m5-rear.jpg' },
      { id: 'interior', label: 'Cabina Ejecutiva M', url: '/vehicles/bmw-m-interior.jpg' }
    ];
  }

  if (key.includes('X6 M') || key.includes('X6')) {
    return [
      { id: 'front', label: 'Exterior Frontal SAC M', url: '/vehicles/x6m-front.jpg' },
      { id: 'rear', label: 'Silueta Coupé & Zaga', url: '/vehicles/x6m-rear.jpg' },
      { id: 'interior', label: 'Cabina M Competition', url: '/vehicles/bmw-m-interior.jpg' }
    ];
  }

  if (key.includes('I4')) {
    return [
      { id: 'front', label: 'Exterior Frontal eDrive', url: '/vehicles/i4-front.jpg' },
      { id: 'rear', label: 'Zaga Gran Coupé', url: '/vehicles/i4-rear.jpg' },
      {
        id: 'interior',
        label: 'Curved Display Interior',
        url: key.includes('M50') ? '/vehicles/bmw-m-interior.jpg' : '/vehicles/bmw-luxury-interior.jpg'
      }
    ];
  }

  if (key.includes('SERIE 3') || key.includes('330') || key.includes('M340')) {
    const isBlue = col.includes('AZUL') || key.includes('M340');
    return [
      {
        id: 'front',
        label: 'Exterior Frontal 3/4',
        url: isBlue ? '/vehicles/serie3-blue-front.jpg' : '/vehicles/serie3-white-front.jpg'
      },
      { id: 'rear', label: 'Zaga M Sport', url: '/vehicles/serie3-rear.jpg' },
      { id: 'interior', label: 'Cabina Digital BMW', url: '/vehicles/bmw-luxury-interior.jpg' }
    ];
  }

  if (key.includes('X5')) {
    return [
      { id: 'front', label: 'Exterior Frontal SAV', url: '/vehicles/x5-g05-front.jpg' },
      { id: 'rear', label: 'Zaga 3D LED', url: '/vehicles/x5-g05-rear.jpg' },
      { id: 'interior', label: 'Cabina Executive Lounge', url: '/vehicles/bmw-luxury-interior.jpg' }
    ];
  }

  if (key.includes('X3')) {
    return [
      { id: 'front', label: 'Exterior Frontal SAV', url: '/vehicles/x3-front.jpg' },
      { id: 'rear', label: 'Perfil & Zaga', url: '/vehicles/x3-rear.jpg' },
      { id: 'interior', label: 'Cabina & Confort', url: '/vehicles/bmw-luxury-interior.jpg' }
    ];
  }

  if (key.includes('SERIE 5') || key.includes('530')) {
    return [
      { id: 'front', label: 'Exterior Frontal Ejecutivo', url: '/vehicles/serie5-front.jpg' },
      { id: 'rear', label: 'Detalle & Zaga G60', url: '/vehicles/serie5-rear.jpg' },
      { id: 'interior', label: 'Interaction Bar Interior', url: '/vehicles/bmw-luxury-interior.jpg' }
    ];
  }

  return [
    { id: 'front', label: 'Exterior Frontal', url: '/vehicles/serie3-white-front.jpg' },
    { id: 'rear', label: 'Vista Trasera', url: '/vehicles/serie3-rear.jpg' },
    { id: 'interior', label: 'Cabina BMW', url: '/vehicles/bmw-luxury-interior.jpg' }
  ];
}

export function getVehicleViews(vehiculo) {
  if (!vehiculo) return getModelGalleryByText();
  const baseViews = getModelGalleryByText(
    vehiculo.modelo_nombre || '',
    vehiculo.version || '',
    vehiculo.anio,
    vehiculo.color || ''
  );

  const customUrl = vehiculo.imagen_url && vehiculo.imagen_url.trim();
  if (!customUrl) {
    return baseViews;
  }

  // Si la imagen_url guardada en MySQL ya coincide con la primera vista, devolver galería completa
  if (baseViews[0]?.url === customUrl) {
    return baseViews;
  }

  // Si el usuario asignó una URL personalizada distinta, ponerla como vista principal conservando las demás vistas
  const remaining = baseViews.filter((v) => v.url !== customUrl);
  return [{ id: 'custom-main', label: 'Vista Principal', url: customUrl }, ...remaining];
}

