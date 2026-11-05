const { pool } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const BASE_VENTA_SELECT = `
  SELECT
    vt.id_venta,
    vt.id_vehiculo,
    vt.id_cliente,
    vt.id_vendedor,
    vt.fecha_venta,
    vt.precio_venta,
    vt.observaciones,
    vt.created_at,
    vt.updated_at,
    v.vin AS vehiculo_vin,
    v.version AS vehiculo_version,
    v.anio AS vehiculo_anio,
    v.color AS vehiculo_color,
    v.kilometraje AS vehiculo_kilometraje,
    v.precio AS vehiculo_precio_lista,
    v.estado AS vehiculo_estado,
    v.imagen_url AS vehiculo_imagen_url,
    m.id_modelo,
    m.nombre AS modelo_nombre,
    m.tipo_carroceria AS modelo_carroceria,
    c.nombre AS cliente_nombre,
    c.apellidos AS cliente_apellidos,
    c.identificacion AS cliente_identificacion,
    c.telefono AS cliente_telefono,
    c.correo AS cliente_correo,
    vd.nombre AS vendedor_nombre,
    vd.apellidos AS vendedor_apellidos,
    vd.telefono AS vendedor_telefono,
    vd.correo AS vendedor_correo
  FROM ventas vt
  INNER JOIN vehiculos v ON v.id_vehiculo = vt.id_vehiculo
  INNER JOIN modelos m ON m.id_modelo = v.id_modelo
  INNER JOIN clientes c ON c.id_cliente = vt.id_cliente
  INNER JOIN vendedores vd ON vd.id_vendedor = vt.id_vendedor
`;

async function findAll(search = '') {
  const params = [];
  let whereClause = '';

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClause = `
      WHERE v.vin LIKE ?
         OR v.version LIKE ?
         OR m.nombre LIKE ?
         OR CONCAT(c.nombre, ' ', c.apellidos) LIKE ?
         OR c.identificacion LIKE ?
         OR CONCAT(vd.nombre, ' ', vd.apellidos) LIKE ?
    `;
    params.push(term, term, term, term, term, term);
  }

  const [rows] = await pool.execute(
    `${BASE_VENTA_SELECT}
     ${whereClause}
     ORDER BY vt.fecha_venta DESC, vt.id_venta DESC`,
    params
  );

  return rows;
}

async function findById(id, executor = pool) {
  const [rows] = await executor.execute(
    `${BASE_VENTA_SELECT}
     WHERE vt.id_venta = ?`,
    [id]
  );
  return rows[0] || null;
}

async function createWithTransaction({
  id_vehiculo,
  id_cliente,
  id_vendedor,
  fecha_venta,
  precio_venta,
  observaciones
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Validar existencia de cliente y vendedor
    const [clienteRows] = await connection.execute(
      'SELECT id_cliente FROM clientes WHERE id_cliente = ?',
      [Number(id_cliente)]
    );
    if (clienteRows.length === 0) {
      throw new AppError('El cliente seleccionado no existe.', 400);
    }

    const [vendedorRows] = await connection.execute(
      'SELECT id_vendedor FROM vendedores WHERE id_vendedor = ?',
      [Number(id_vendedor)]
    );
    if (vendedorRows.length === 0) {
      throw new AppError('El vendedor seleccionado no existe.', 400);
    }

    // Bloquear fila del vehículo para garantizar atomicidad
    const [vehiculoRows] = await connection.execute(
      'SELECT id_vehiculo, vin, estado FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE',
      [Number(id_vehiculo)]
    );
    if (vehiculoRows.length === 0) {
      throw new AppError('El vehículo seleccionado no existe.', 400);
    }

    const vehiculo = vehiculoRows[0];
    if (vehiculo.estado !== 'Disponible') {
      throw new AppError(
        `No se puede registrar la venta: el vehículo (${vehiculo.vin}) se encuentra en estado '${vehiculo.estado}'. Solo se permiten vehículos en estado Disponible.`,
        409
      );
    }

    const [ventaExistente] = await connection.execute(
      'SELECT id_venta FROM ventas WHERE id_vehiculo = ?',
      [Number(id_vehiculo)]
    );
    if (ventaExistente.length > 0) {
      throw new AppError('El vehículo seleccionado ya tiene una venta registrada.', 409);
    }

    const [insertResult] = await connection.execute(
      `INSERT INTO ventas (id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(id_vehiculo),
        Number(id_cliente),
        Number(id_vendedor),
        fecha_venta,
        Number(precio_venta),
        observaciones || null
      ]
    );

    await connection.execute(
      "UPDATE vehiculos SET estado = 'Vendido' WHERE id_vehiculo = ?",
      [Number(id_vehiculo)]
    );

    const nuevaVenta = await findById(insertResult.insertId, connection);
    await connection.commit();
    return nuevaVenta;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateWithTransaction(
  id,
  { id_vehiculo, id_cliente, id_vendedor, fecha_venta, precio_venta, observaciones }
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [ventaRows] = await connection.execute(
      'SELECT * FROM ventas WHERE id_venta = ? FOR UPDATE',
      [Number(id)]
    );
    if (ventaRows.length === 0) {
      throw new AppError('La venta solicitada no existe.', 404);
    }

    const ventaActual = ventaRows[0];
    const nuevoVehiculoId = Number(id_vehiculo);
    const vehiculoAnteriorId = Number(ventaActual.id_vehiculo);

    // Validar existencia de cliente y vendedor
    const [clienteRows] = await connection.execute(
      'SELECT id_cliente FROM clientes WHERE id_cliente = ?',
      [Number(id_cliente)]
    );
    if (clienteRows.length === 0) {
      throw new AppError('El cliente seleccionado no existe.', 400);
    }

    const [vendedorRows] = await connection.execute(
      'SELECT id_vendedor FROM vendedores WHERE id_vendedor = ?',
      [Number(id_vendedor)]
    );
    if (vendedorRows.length === 0) {
      throw new AppError('El vendedor seleccionado no existe.', 400);
    }

    if (nuevoVehiculoId !== vehiculoAnteriorId) {
      // Bloquear ambos vehículos en orden determinista de ID para prevenir interbloqueos
      const idsOrdenados = [vehiculoAnteriorId, nuevoVehiculoId].sort((a, b) => a - b);
      for (const vehId of idsOrdenados) {
        await connection.execute(
          'SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE',
          [vehId]
        );
      }

      const [nuevoVehRows] = await connection.execute(
        'SELECT id_vehiculo, vin, estado FROM vehiculos WHERE id_vehiculo = ?',
        [nuevoVehiculoId]
      );
      if (nuevoVehRows.length === 0) {
        throw new AppError('El nuevo vehículo seleccionado no existe.', 400);
      }

      const nuevoVehiculo = nuevoVehRows[0];
      if (nuevoVehiculo.estado !== 'Disponible') {
        throw new AppError(
          `El nuevo vehículo seleccionado (${nuevoVehiculo.vin}) no está disponible para la venta (estado actual: '${nuevoVehiculo.estado}').`,
          409
        );
      }

      const [otraVenta] = await connection.execute(
        'SELECT id_venta FROM ventas WHERE id_vehiculo = ? AND id_venta <> ?',
        [nuevoVehiculoId, Number(id)]
      );
      if (otraVenta.length > 0) {
        throw new AppError('El nuevo vehículo seleccionado ya pertenece a otra venta.', 409);
      }

      await connection.execute(
        `UPDATE ventas
         SET id_vehiculo = ?,
             id_cliente = ?,
             id_vendedor = ?,
             fecha_venta = ?,
             precio_venta = ?,
             observaciones = ?
         WHERE id_venta = ?`,
        [
          nuevoVehiculoId,
          Number(id_cliente),
          Number(id_vendedor),
          fecha_venta,
          Number(precio_venta),
          observaciones || null,
          Number(id)
        ]
      );

      // Devolver vehículo anterior a Disponible y marcar nuevo vehículo como Vendido
      await connection.execute(
        "UPDATE vehiculos SET estado = 'Disponible' WHERE id_vehiculo = ?",
        [vehiculoAnteriorId]
      );
      await connection.execute(
        "UPDATE vehiculos SET estado = 'Vendido' WHERE id_vehiculo = ?",
        [nuevoVehiculoId]
      );
    } else {
      await connection.execute(
        'SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE',
        [vehiculoAnteriorId]
      );

      await connection.execute(
        `UPDATE ventas
         SET id_cliente = ?,
             id_vendedor = ?,
             fecha_venta = ?,
             precio_venta = ?,
             observaciones = ?
         WHERE id_venta = ?`,
        [
          Number(id_cliente),
          Number(id_vendedor),
          fecha_venta,
          Number(precio_venta),
          observaciones || null,
          Number(id)
        ]
      );

      await connection.execute(
        "UPDATE vehiculos SET estado = 'Vendido' WHERE id_vehiculo = ?",
        [vehiculoAnteriorId]
      );
    }

    const ventaActualizada = await findById(Number(id), connection);
    await connection.commit();
    return ventaActualizada;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteWithTransaction(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [ventaRows] = await connection.execute(
      'SELECT id_venta, id_vehiculo FROM ventas WHERE id_venta = ? FOR UPDATE',
      [Number(id)]
    );
    if (ventaRows.length === 0) {
      throw new AppError('La venta solicitada no existe.', 404);
    }

    const { id_vehiculo } = ventaRows[0];

    await connection.execute(
      'SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ? FOR UPDATE',
      [Number(id_vehiculo)]
    );

    await connection.execute('DELETE FROM ventas WHERE id_venta = ?', [Number(id)]);
    await connection.execute(
      "UPDATE vehiculos SET estado = 'Disponible' WHERE id_vehiculo = ?",
      [Number(id_vehiculo)]
    );

    await connection.commit();
    return { id_venta: Number(id), id_vehiculo_liberado: Number(id_vehiculo) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findById,
  createWithTransaction,
  updateWithTransaction,
  deleteWithTransaction
};

