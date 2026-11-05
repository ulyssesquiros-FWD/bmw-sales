const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedGrande() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME || 'bmw_premium_motors';

  const connection = await mysql.createConnection({ host, port, user, password, database });

  try {
    console.log('[SEED-GRANDE] Conectado a MySQL bmw_premium_motors. Iniciando expansión integral...');

    // ==========================================
    // 1. MODELOS BMW
    // ==========================================
    const nuevosModelos = [
      {
        nombre: 'BMW Serie 2 Gran Coupé',
        tipo_carroceria: 'Gran Coupé',
        combustible: 'Gasolina',
        transmision: 'Automática Steptronic',
        descripcion: 'Coupé compacto de 4 puertas con tracción delantera o xDrive, dinamismo urbano y silueta deportiva y atlética.'
      },
      {
        nombre: 'BMW Serie 4 Gran Coupé',
        tipo_carroceria: 'Gran Coupé Deportivo',
        combustible: 'Gasolina TwinPower Turbo',
        transmision: 'Automática Deportiva Steptronic',
        descripcion: 'Elegancia de un coupé con la practicidad de 5 puertas, parrilla vertical emblemática y centro de gravedad rebajado.'
      },
      {
        nombre: 'BMW Serie 7 Sedán Limousine',
        tipo_carroceria: 'Sedán de Gran Lujo',
        combustible: 'Híbrido Ligero (MHEV)',
        transmision: 'Automática Steptronic 8 Velocidades',
        descripcion: 'El buque insignia del lujo automotriz con BMW Theatre Screen de 31.3 pulgadas en 8K y suspensión neumática adaptativa bi-eje.'
      },
      {
        nombre: 'BMW Serie 8 Coupé',
        tipo_carroceria: 'Coupé Gran Turismo',
        combustible: 'Gasolina V8 TwinPower Turbo',
        transmision: 'Automática Deportiva Steptronic',
        descripcion: 'El pináculo del diseño deportivo de BMW, con acabado en cristal CraftedClarity y prestaciones GT superlativas.'
      },
      {
        nombre: 'BMW X1',
        tipo_carroceria: 'SUV Compacto (SAV)',
        combustible: 'Gasolina TwinPower Turbo',
        transmision: 'Doble Embrague Steptronic 7 vel',
        descripcion: 'SAV compacto versátil de última generación, cabina digital BMW Curved Display y espacio interior optimizado.'
      },
      {
        nombre: 'BMW X7',
        tipo_carroceria: 'SUV Presidencial 7 Plazas (SAV)',
        combustible: 'Híbrido Ligero (MHEV)',
        transmision: 'Automática Deportiva Steptronic',
        descripcion: 'Máxima presencia y confort sin límites para 7 pasajeros, techo panorámico Sky Lounge con iluminación LED y tracción xDrive.'
      },
      {
        nombre: 'BMW XM',
        tipo_carroceria: 'SUV High-Performance M (SAV M)',
        combustible: 'Híbrido Enchufable (PHEV)',
        transmision: 'M Steptronic de 8 vel con Drivelogic',
        descripcion: 'El primer vehículo BMW M independiente desde el M1: motor M HYBRID V8 con 653 HP y diseño esculpido futurista.'
      },
      {
        nombre: 'BMW Z4 Roadster',
        tipo_carroceria: 'Roadster Descapotable',
        combustible: 'Gasolina TwinPower Turbo',
        transmision: 'Automática Deportiva Steptronic',
        descripcion: 'Roadster biplaza clásico con capota de lona textil eléctrica, distribución de peso 50:50 y agilidad pura de tracción trasera.'
      },
      {
        nombre: 'BMW iX',
        tipo_carroceria: 'SUV 100% Eléctrico (SAV i)',
        combustible: '100% Eléctrico',
        transmision: 'Automática Eléctrica de Engranaje Fijo',
        descripcion: 'Pionero de la era eléctrica de BMW construido con plástico reforzado con fibra de carbono (CFRP) y más de 600 km de autonomía.'
      },
      {
        nombre: 'BMW i7',
        tipo_carroceria: 'Sedán Eléctrico Presidencial',
        combustible: '100% Eléctrico',
        transmision: 'Automática Eléctrica de Alta Eficiencia',
        descripcion: 'Movilidad ejecutiva cero emisiones con propulsión dual BMW eDrive de quinta generación y puertas de apertura automática.'
      }
    ];

    for (const m of nuevosModelos) {
      const [existe] = await connection.execute('SELECT id_modelo FROM modelos WHERE nombre = ?', [m.nombre]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO modelos (nombre, tipo_carroceria, combustible, transmision, descripcion, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [m.nombre, m.tipo_carroceria, m.combustible, m.transmision, m.descripcion]);
        console.log(`[MODELOS] + Agregado: ${m.nombre}`);
      }
    }

    // Mapa de modelos
    const [modelosDB] = await connection.execute('SELECT id_modelo, nombre FROM modelos');
    const modeloMap = {};
    modelosDB.forEach((row) => {
      modeloMap[row.nombre] = row.id_modelo;
    });

    // ==========================================
    // 2. VEHÍCULOS ADICIONALES DE ALTA GAMA
    // ==========================================
    const nuevosVehiculos = [
      {
        id_modelo: modeloMap['BMW Serie 2 Gran Coupé'],
        vin: 'WBA11AK04RFG20011',
        version: '220i Gran Coupé M Sport',
        anio: 2025,
        color: 'Azul Misano Metalizado',
        kilometraje: 120,
        precio: 46800.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Serie 4 Gran Coupé'],
        vin: 'WBA44AG08RFG40022',
        version: '430i Gran Coupé M Sport Pro',
        anio: 2025,
        color: 'Verde San Remo Metalizado',
        kilometraje: 350,
        precio: 67900.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Serie 7 Sedán Limousine'],
        vin: 'WBA77AL02RFG70033',
        version: '740i Pure Excellence Lounge',
        anio: 2025,
        color: 'Negro Zafiro Metalizado / Dravit Grey Two-Tone',
        kilometraje: 1500,
        precio: 124500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Serie 8 Coupé'],
        vin: 'WBA88AM07RFG80044',
        version: 'M850i xDrive Coupé V8 530 HP',
        anio: 2025,
        color: 'Azul Barcelona Metalizado',
        kilometraje: 4200,
        precio: 139000.00,
        estado: 'Reservado',
        imagen_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW X1'],
        vin: 'WBA11XN05RFG10055',
        version: 'xDrive28i xLine',
        anio: 2025,
        color: 'Blanco Alpino',
        kilometraje: 50,
        precio: 44900.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW X7'],
        vin: '5YM77XU06RFG70066',
        version: 'M60i xDrive 7 Plazas 530 HP',
        anio: 2025,
        color: 'Gris Brooklyn M Metalizado',
        kilometraje: 2100,
        precio: 128900.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1542362567-b07e5359815e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW XM'],
        vin: '5YM99XM01RFG90077',
        version: 'M HYBRID V8 653 HP Red Label Interior',
        anio: 2025,
        color: 'Negro Carbón M con Acentos Gold',
        kilometraje: 890,
        precio: 168000.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Z4 Roadster'],
        vin: 'WBA24ZR03RFG40088',
        version: 'M40i Descapotable 382 HP',
        anio: 2024,
        color: 'Rojo San Francisco Metalizado',
        kilometraje: 6300,
        precio: 72500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW iX'],
        vin: 'WBX55IX09RFG50099',
        version: 'xDrive50 Dual Motor 523 HP',
        anio: 2025,
        color: 'Gris Óxido Metalizado',
        kilometraje: 800,
        precio: 104500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW i7'],
        vin: 'WBY77I704RFG70100',
        version: 'xDrive60 Limousine Individual 544 HP',
        anio: 2025,
        color: 'Negro Zafiro con Techo Plata Bicolor',
        kilometraje: 1200,
        precio: 148500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW M3 Sedán'],
        vin: 'WBS33M309RFG30111',
        version: 'CS Special Edition 550 HP Lightweight',
        anio: 2025,
        color: 'Blanco Frozen Brilliant M (Mate)',
        kilometraje: 450,
        precio: 129500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW M4 Coupé'],
        vin: 'WBS44M402RFG40122',
        version: 'CSL Heritage Lightweight Limited Edition',
        anio: 2024,
        color: 'Gris Frozen Brooklyn Mate con Franjas Rojas',
        kilometraje: 1800,
        precio: 142000.00,
        estado: 'Reservado',
        imagen_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW X5 M'],
        vin: '5YM55XM08RFG50133',
        version: 'Competition LCI V8 625 HP M Carbon',
        anio: 2025,
        color: 'Azul Marina Bay Metalizado',
        kilometraje: 2800,
        precio: 138900.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Serie 3'],
        vin: 'WBA33S301RFG30144',
        version: '330e M Sport Híbrido Enchufable',
        anio: 2025,
        color: 'Gris Skyscraper Metalizado',
        kilometraje: 950,
        precio: 59800.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
      },
      {
        id_modelo: modeloMap['BMW Serie 5'],
        vin: 'WBA55S503RFG50155',
        version: '540i xDrive M Sport Pro Línea Ejecutiva',
        anio: 2025,
        color: 'Negro Carbón Metalizado',
        kilometraje: 1600,
        precio: 79500.00,
        estado: 'Disponible',
        imagen_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
      }
    ];

    for (const v of nuevosVehiculos) {
      if (!v.id_modelo) continue;
      const [existe] = await connection.execute('SELECT id_vehiculo FROM vehiculos WHERE vin = ?', [v.vin]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO vehiculos (id_modelo, vin, version, anio, color, kilometraje, precio, estado, imagen_url, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [v.id_modelo, v.vin, v.version, v.anio, v.color, v.kilometraje, v.precio, v.estado, v.imagen_url]);
        console.log(`[VEHICULOS] + Agregado: ${v.version} (VIN: ${v.vin})`);
      }
    }

    // ==========================================
    // 3. CLIENTES VIP ADICIONALES
    // ==========================================
    const nuevosClientes = [
      {
        nombre: 'Mauricio',
        apellidos: 'Gómez Tagle',
        identificacion: 'RFC-GOMA850412M1',
        telefono: '+52 55 4123 9988',
        correo: 'mgomez@taglegroup.mx',
        direccion: 'Campos Elíseos 385, Polanco Chapultepec, CDMX'
      },
      {
        nombre: 'Sofía',
        apellidos: 'Villarreal Garza',
        identificacion: 'RFC-VIGS910825K2',
        telefono: '+52 81 1234 5678',
        correo: 'sofia.villarreal@innovanorte.com',
        direccion: 'Calzada San Pedro 400, Del Valle, San Pedro Garza García, NL'
      },
      {
        nombre: 'Fernando',
        apellidos: 'Covarrubias Peón',
        identificacion: 'RFC-COPF880219J3',
        telefono: '+52 33 9876 5432',
        correo: 'fcovarrubias@agrovalle.com.mx',
        direccion: 'Av. Américas 1500, Providencia, Guadalajara, JAL'
      },
      {
        nombre: 'Elena',
        apellidos: 'De la Mora Rivas',
        identificacion: 'RFC-MORE931104H4',
        telefono: '+52 55 8899 7766',
        correo: 'elena.delamora@studioarquitectura.com',
        direccion: 'Paseo de las Palmas 750, Lomas de Chapultepec, CDMX'
      },
      {
        nombre: 'Rodrigo',
        apellidos: 'Barrientos Alatorre',
        identificacion: 'RFC-BAAR800615L5',
        telefono: '+52 99 8765 4321',
        correo: 'rbarrientos@rivierahotels.mx',
        direccion: 'Blvd. Kukulcán Km 12.5, Zona Hotelera, Cancún, Q.Roo'
      }
    ];

    for (const c of nuevosClientes) {
      const [existe] = await connection.execute('SELECT id_cliente FROM clientes WHERE identificacion = ?', [c.identificacion]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO clientes (nombre, apellidos, identificacion, telefono, correo, direccion, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [c.nombre, c.apellidos, c.identificacion, c.telefono, c.correo, c.direccion]);
        console.log(`[CLIENTES] + Agregado: ${c.nombre} ${c.apellidos}`);
      }
    }

    // ==========================================
    // 4. ASESORES / VENDEDORES CERTIFICADOS
    // ==========================================
    const nuevosVendedores = [
      {
        nombre: 'Emiliano',
        apellidos: 'Zepeda Morales',
        telefono: '+52 55 9123 4455',
        correo: 'emiliano.zepeda@bmwpremiummotors.com',
        fecha_contratacion: '2023-01-10'
      },
      {
        nombre: 'Mariana',
        apellidos: 'Salgado De la Peña',
        telefono: '+52 81 8234 1122',
        correo: 'mariana.salgado@bmwpremiummotors.com',
        fecha_contratacion: '2023-06-15'
      },
      {
        nombre: 'Alejandro',
        apellidos: 'Kauffmann Krause',
        telefono: '+52 55 9345 6677',
        correo: 'alejandro.kauffmann@bmwpremiummotors.com',
        fecha_contratacion: '2022-09-01'
      }
    ];

    for (const v of nuevosVendedores) {
      const [existe] = await connection.execute('SELECT id_vendedor FROM vendedores WHERE correo = ?', [v.correo]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO vendedores (nombre, apellidos, telefono, correo, fecha_contratacion, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [v.nombre, v.apellidos, v.telefono, v.correo, v.fecha_contratacion]);
        console.log(`[VENDEDORES] + Agregado: ${v.nombre} ${v.apellidos}`);
      }
    }

    // ==========================================
    // 5. RED DE SUCURSALES EXPANDIDA
    // ==========================================
    const nuevasSucursales = [
      {
        nombre: 'BMW Santa Fe Sky Flagship',
        ciudad: 'Ciudad de México',
        direccion: 'Prolongación Paseo de la Reforma 1236, Santa Fe, Cuajimalpa',
        telefono: '+52 55 5089 7000',
        capacidad_vehiculos: 75
      },
      {
        nombre: 'BMW Marina Bay Luxury Showroom',
        ciudad: 'Cancún',
        direccion: 'Blvd. Kukulcán Km 4.5, Puerto Cancún Marina Town Center',
        telefono: '+52 99 8881 2200',
        capacidad_vehiculos: 35
      },
      {
        nombre: 'BMW Angelópolis Executive Center',
        ciudad: 'Puebla',
        direccion: 'Blvd. del Niño Poblano 2510, Reserva Territorial Atlixcáyotl',
        telefono: '+52 22 2214 8800',
        capacidad_vehiculos: 40
      },
      {
        nombre: 'BMW Campanario Premier Motors',
        ciudad: 'Querétaro',
        direccion: 'Blvd. Bernardo Quintana 4100, Álamos 3ra Sección',
        telefono: '+52 44 2238 9000',
        capacidad_vehiculos: 35
      }
    ];

    for (const s of nuevasSucursales) {
      const [existe] = await connection.execute('SELECT id_sucursal FROM sucursales WHERE nombre = ?', [s.nombre]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO sucursales (nombre, ciudad, direccion, telefono, capacidad_vehiculos)
          VALUES (?, ?, ?, ?, ?)
        `, [s.nombre, s.ciudad, s.direccion, s.telefono, s.capacidad_vehiculos]);
        console.log(`[SUCURSALES] + Agregado: ${s.nombre} (${s.ciudad})`);
      }
    }

    // ==========================================
    // 6. ACCESORIOS BMW M PERFORMANCE
    // ==========================================
    const nuevosAccesorios = [
      {
        nombre: 'Difusor Trasero en Carbono M Performance',
        categoria: 'Aerodinámica M',
        codigo_parte: 'BMW-MP-5119245',
        precio: 1650.00,
        stock: 7,
        descripcion: 'Difusor aerodinámico inferior en fibra de carbono autoclave de alta densidad con aletas estabilizadoras.'
      },
      {
        nombre: 'Lip Spoiler Delantero Carbono M Competition',
        categoria: 'Aerodinámica M',
        codigo_parte: 'BMW-MP-5119246',
        precio: 1980.00,
        stock: 5,
        descripcion: 'Splitter frontal que optimiza el flujo de aire y aumenta la carga aerodinámica en eje delantero a alta velocidad.'
      },
      {
        nombre: 'Sistema de Frenos M Carbon Ceramic Retrofit Kit',
        categoria: 'Frenos y Rendimiento',
        codigo_parte: 'BMW-MP-3411245',
        precio: 9800.00,
        stock: 2,
        descripcion: 'Discos cerámicos de carburo de silicio con pinzas monobloque doradas de 6 pistones para uso extremo en pista.'
      },
      {
        nombre: 'Carcasas de Espejos Retrovisores en Carbono Forjado',
        categoria: 'Exterior y Estilo',
        codigo_parte: 'BMW-MP-5116245',
        precio: 890.00,
        stock: 12,
        descripcion: 'Cubiertas de retrovisores exteriores estilo ala M elaboradas a mano con tejido de carbono genuino.'
      },
      {
        nombre: 'Juego de Rines Forjados 20" M Performance Estilo 963 M',
        categoria: 'Rines y Neumáticos',
        codigo_parte: 'BMW-MP-3611963',
        precio: 6450.00,
        stock: 4,
        descripcion: 'Rines forjados ultra livianos acabados en Frozen Gunmetal Grey, diseñados para BMW M3 G80 y M4 G82.'
      },
      {
        nombre: 'Sistema de Sonido Bowers & Wilkins Diamond Retrofit',
        categoria: 'Audio y Tecnología',
        codigo_parte: 'BMW-BW-6512988',
        precio: 4950.00,
        stock: 3,
        descripcion: '16 altavoces activos con tweeters de cúpula de diamante e iluminación ambiental integrada.'
      },
      {
        nombre: 'Tapetes de Alta Resistencia M Performance Motorsport',
        categoria: 'Interior',
        codigo_parte: 'BMW-MP-5147980',
        precio: 340.00,
        stock: 20,
        descripcion: 'Tapetes de terciopelo premium con ribete de piel nobuk y bordado oficial BMW M Motorsport.'
      },
      {
        nombre: 'Tapas de Centro de Rin Flotantes BMW M 50 Aniversario',
        categoria: 'Exterior y Estilo',
        codigo_parte: 'BMW-EM-3613680',
        precio: 220.00,
        stock: 25,
        descripcion: 'Tapas de buje con mecanismo auto-nivelante que mantiene el logo vertical incluso en movimiento.'
      },
      {
        nombre: 'Cargador Rápido Residencial BMW Wallbox Gen 3 (22 kW)',
        categoria: 'BMW i Eléctricos',
        codigo_parte: 'BMW-EV-6190500',
        precio: 1250.00,
        stock: 14,
        descripcion: 'Estación de recarga doméstica inteligente con conectividad Wi-Fi, cable de 6m y control mediante My BMW App.'
      }
    ];

    for (const a of nuevosAccesorios) {
      const [existe] = await connection.execute('SELECT id_accesorio FROM accesorios WHERE codigo_parte = ?', [a.codigo_parte]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO accesorios (nombre, categoria, codigo_parte, precio, stock, descripcion)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [a.nombre, a.categoria, a.codigo_parte, a.precio, a.stock, a.descripcion]);
        console.log(`[ACCESORIOS] + Agregado: ${a.nombre}`);
      }
    }

    // ==========================================
    // 7. PROVEEDORES OEM TIER 1
    // ==========================================
    const nuevosProveedores = [
      {
        razon_social: 'Akrapovič d.d. High Performance Exhaust Systems',
        rfc_identificacion: 'SI-AKR-12903',
        contacto_nombre: 'Igor Akrapovič',
        correo: 'oem.sales@akrapovic.com',
        telefono: '+386 1 7878 400',
        pais_origen: 'Eslovenia'
      },
      {
        razon_social: 'ZF Friedrichshafen AG Drivetrain Systems',
        rfc_identificacion: 'DE-ZFF-88046',
        contacto_nombre: 'Markus Lindner',
        correo: 'bmw.drivetrain@zf.com',
        telefono: '+49 7541 77 0',
        pais_origen: 'Alemania'
      },
      {
        razon_social: 'BBS Motorsport GmbH Forged Wheels',
        rfc_identificacion: 'DE-BBS-77761',
        contacto_nombre: 'Stefan Schneider',
        correo: 'motorsport@bbs.com',
        telefono: '+49 7836 52 0',
        pais_origen: 'Alemania'
      },
      {
        razon_social: 'Harman International Premium Automotive Audio',
        rfc_identificacion: 'US-HAR-06901',
        contacto_nombre: 'David Vance',
        correo: 'automotive.bmw@harman.com',
        telefono: '+1 203 555 0199',
        pais_origen: 'Estados Unidos'
      }
    ];

    for (const p of nuevosProveedores) {
      const [existe] = await connection.execute('SELECT id_proveedor FROM proveedores WHERE rfc_identificacion = ?', [p.rfc_identificacion]);
      if (existe.length === 0) {
        await connection.execute(`
          INSERT INTO proveedores (razon_social, rfc_identificacion, contacto_nombre, correo, telefono, pais_origen)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [p.razon_social, p.rfc_identificacion, p.contacto_nombre, p.correo, p.telefono, p.pais_origen]);
        console.log(`[PROVEEDORES] + Agregado: ${p.razon_social}`);
      }
    }

    // ==========================================
    // 8. VENTAS ADICIONALES
    // ==========================================
    const [vehiculosVendidos] = await connection.execute(`
      SELECT id_vehiculo, precio FROM vehiculos 
      WHERE estado = 'Vendido' AND id_vehiculo NOT IN (SELECT id_vehiculo FROM ventas)
    `);
    const [clientesDisponibles] = await connection.execute('SELECT id_cliente FROM clientes ORDER BY id_cliente');
    const [vendedoresDisponibles] = await connection.execute('SELECT id_vendedor FROM vendedores ORDER BY id_vendedor');

    if (vehiculosVendidos.length > 0 && clientesDisponibles.length > 0 && vendedoresDisponibles.length > 0) {
      for (let i = 0; i < vehiculosVendidos.length; i++) {
        const v = vehiculosVendidos[i];
        const cliId = clientesDisponibles[(i + 2) % clientesDisponibles.length].id_cliente;
        const vendId = vendedoresDisponibles[i % vendedoresDisponibles.length].id_vendedor;
        await connection.execute(`
          INSERT INTO ventas (id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones, created_at, updated_at)
          VALUES (?, ?, ?, '2026-03-25', ?, 'Entrega oficial en showroom Masaryk Polanco con paquete M Performance y blindaje de pintura cerámico.', NOW(), NOW())
        `, [v.id_vehiculo, cliId, vendId, v.precio]);
        console.log(`[VENTAS] + Venta registrada para vehículo ${v.id_vehiculo}`);
      }
    }

    // ==========================================
    // 9. MANTENIMIENTOS ADICIONALES (TALLER)
    // ==========================================
    const [todosVehiculos] = await connection.execute('SELECT id_vehiculo FROM vehiculos');
    const [todosClientes] = await connection.execute('SELECT id_cliente FROM clientes');

    if (todosVehiculos.length >= 5 && todosClientes.length >= 3) {
      const citasTaller = [
        {
          id_vehiculo: todosVehiculos[2].id_vehiculo,
          id_cliente: todosClientes[0].id_cliente,
          tipo_servicio: 'Servicio de Rodaje 2,000 km BMW M Performance',
          costo: 780.00,
          fecha_servicio: '2026-03-28',
          estado: 'En Proceso',
          notas: 'Cambio de fluidos de transmisión y diferencial M activo. Calibración de launch control.'
        },
        {
          id_vehiculo: todosVehiculos[3].id_vehiculo,
          id_cliente: todosClientes[1].id_cliente,
          tipo_servicio: 'Actualización de Software BMW iDrive 8.5 & Calibración de Sensores ADAS',
          costo: 350.00,
          fecha_servicio: '2026-04-02',
          estado: 'Programado',
          notas: 'Actualización remota y alineación de radar de control de crucero adaptativo.'
        },
        {
          id_vehiculo: todosVehiculos[4].id_vehiculo,
          id_cliente: todosClientes[2].id_cliente,
          tipo_servicio: 'Instalación Oficial de Sistema de Escape Deportivo M Performance Titanium',
          costo: 4800.00,
          fecha_servicio: '2026-04-05',
          estado: 'Programado',
          notas: 'Montaje en bahía de alta especialidad con homologación alemana TÜV y garantía de fábrica intacta.'
        },
        {
          id_vehiculo: todosVehiculos[0].id_vehiculo,
          id_cliente: todosClientes[3 % todosClientes.length].id_cliente,
          tipo_servicio: 'Diagnóstico Integral de Batería de Alto Voltaje BMW i (SOH 99.4%)',
          costo: 420.00,
          fecha_servicio: '2026-03-12',
          estado: 'Finalizado',
          notas: 'Inspección computarizada ISTA+ completada con satisfacción total. Eficiencia de celda nominal.'
        }
      ];

      for (const c of citasTaller) {
        const [existe] = await connection.execute(
          'SELECT id_mantenimiento FROM mantenimientos WHERE id_vehiculo = ? AND tipo_servicio = ?',
          [c.id_vehiculo, c.tipo_servicio]
        );
        if (existe.length === 0) {
          await connection.execute(`
            INSERT INTO mantenimientos (id_vehiculo, id_cliente, tipo_servicio, costo, fecha_servicio, estado, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [c.id_vehiculo, c.id_cliente, c.tipo_servicio, c.costo, c.fecha_servicio, c.estado, c.notas]);
          console.log(`[TALLER] + Cita registrada: ${c.tipo_servicio}`);
        }
      }
    }

    // ==========================================
    // 10. PRUEBAS DE MANEJO (TEST DRIVES)
    // ==========================================
    if (todosVehiculos.length >= 6 && todosClientes.length >= 4 && vendedoresDisponibles.length >= 2) {
      const pruebas = [
        {
          id_vehiculo: todosVehiculos[4].id_vehiculo,
          id_cliente: todosClientes[2].id_cliente,
          id_vendedor: vendedoresDisponibles[0].id_vendedor,
          fecha_prueba: '2026-04-10 10:00:00',
          duracion_minutos: 60,
          estado: 'Agendada',
          comentarios: 'Ruta trazada en autopista urbana para evaluar el modo Sport Plus y tracción M xDrive.'
        },
        {
          id_vehiculo: todosVehiculos[5].id_vehiculo,
          id_cliente: todosClientes[3].id_cliente,
          id_vendedor: vendedoresDisponibles[1].id_vendedor,
          fecha_prueba: '2026-04-12 15:30:00',
          duracion_minutos: 45,
          estado: 'Agendada',
          comentarios: 'Demostración de aceleración instantánea y tecnología eDrive eléctrica en tráfico metropolitano.'
        },
        {
          id_vehiculo: todosVehiculos[1].id_vehiculo,
          id_cliente: todosClientes[1].id_cliente,
          id_vendedor: vendedoresDisponibles[0].id_vendedor,
          fecha_prueba: '2026-03-22 12:00:00',
          duracion_minutos: 50,
          estado: 'Realizada',
          comentarios: 'Cliente sumamente impresionado con la respuesta del chasis adaptativo. Se generó propuesta de financiamiento.'
        }
      ];

      for (const p of pruebas) {
        const [existe] = await connection.execute(
          'SELECT id_prueba FROM pruebas_manejo WHERE id_vehiculo = ? AND id_cliente = ? AND fecha_prueba = ?',
          [p.id_vehiculo, p.id_cliente, p.fecha_prueba]
        );
        if (existe.length === 0) {
          await connection.execute(`
            INSERT INTO pruebas_manejo (id_vehiculo, id_cliente, id_vendedor, fecha_prueba, duracion_minutos, estado, comentarios)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [p.id_vehiculo, p.id_cliente, p.id_vendedor, p.fecha_prueba, p.duracion_minutos, p.estado, p.comentarios]);
          console.log(`[TEST-DRIVE] + Prueba agendada para vehiculo ${p.id_vehiculo}`);
        }
      }
    }

    // ==========================================
    // 11. FINANCIAMIENTOS ADICIONALES
    // ==========================================
    const [todasVentas] = await connection.execute('SELECT id_venta, precio_venta FROM ventas');
    if (todasVentas.length > 1) {
      for (let i = 1; i < todasVentas.length; i++) {
        const v = todasVentas[i];
        const [existe] = await connection.execute('SELECT id_financiamiento FROM financiamientos WHERE id_venta = ?', [v.id_venta]);
        if (existe.length === 0) {
          const montoFinanciado = Number(v.precio_venta) * 0.65;
          const tasa = 9.45;
          const cuota = (montoFinanciado * (1 + (tasa / 100) * 3)) / 36;
          await connection.execute(`
            INSERT INTO financiamientos (id_venta, entidad_financiera, plazo_meses, tasa_interes_anual, cuota_mensual, monto_financiado, estado)
            VALUES (?, 'BMW Financial Services Select', 36, ?, ?, ?, 'Aprobado')
          `, [v.id_venta, tasa, cuota.toFixed(2), montoFinanciado.toFixed(2)]);
          console.log(`[FINANZAS] + Contrato de crédito registrado para venta ${v.id_venta}`);
        }
      }
    }

    // ==========================================
    // 12. SEGUROS Y GARANTÍAS ADICIONALES
    // ==========================================
    for (let i = 2; i < Math.min(todosVehiculos.length, 8); i++) {
      const vId = todosVehiculos[i].id_vehiculo;
      // Seguro
      const [segExiste] = await connection.execute('SELECT id_seguro FROM seguros WHERE id_vehiculo = ?', [vId]);
      if (segExiste.length === 0) {
        await connection.execute(`
          INSERT INTO seguros (id_vehiculo, aseguradora, numero_poliza, cobertura, prima_anual, fecha_vencimiento, estado)
          VALUES (?, 'AXA Seguros Autos de Alta Gama', ?, 'Cobertura Amplia VIP con Cero Deducible en Robo Parcial', 2450.00, '2027-04-01', 'Vigente')
        `, [vId, `AXA-BMW-2026-90${i}`]);
      }
      // Garantía
      const [garExiste] = await connection.execute('SELECT id_garantia FROM garantias WHERE id_vehiculo = ?', [vId]);
      if (garExiste.length === 0) {
        await connection.execute(`
          INSERT INTO garantias (id_vehiculo, tipo_garantia, cobertura_meses, kilometraje_limite, estado, fecha_inicio)
          VALUES (?, 'BMW Service Inclusive Plus', 60, 100000, 'Activa', '2026-03-01')
        `, [vId]);
      }
    }
    console.log('[SEGUROS & GARANTÍAS] + Pólizas y coberturas de servicio ampliadas.');

    // ==========================================
    // 13. AUDITORÍA LOGS
    // ==========================================
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios LIMIT 1');
    const uId = usuarios.length > 0 ? usuarios[0].id_usuario : 1;
    await connection.execute(`
      INSERT INTO auditoria_logs (id_usuario, accion, entidad_afectada, id_registro, ip_origen, detalle) VALUES
      (?, 'EXPANSION_CATALOGO', 'modelos_vehiculos', 'BATCH_2026', '127.0.0.1', 'Expansión de gama BMW completa: Serie 2, 4, 7, 8, X1, X7, XM, Z4, iX, i7 con 15+ nuevos vehículos y equipamiento M Performance.'),
      (?, 'PARAMETRIZACION_MODULOS', 'financiamiento_taller', 'ENTERPRISE_SUITE', '127.0.0.1', 'Configuración de simulador de crédito BMW Select, calendario de taller ISTA+ y directorio de 7 sucursales.')
    `, [uId, uId]);

    console.log('[EXITO TOTAL] Seeding grande completado con satisfacción.');
  } finally {
    await connection.end();
  }
}

seedGrande().catch((err) => {
  console.error('[ERROR SEED GRANDE]:', err);
  process.exit(1);
});
