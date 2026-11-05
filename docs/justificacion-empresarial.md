# Documento Formal de Descripción y Justificación Empresarial
## Concesionario Oficial BMW Premium Motors

- **Proyecto:** BMW Premium Motors
- **Sector industrial:** Comercialización, financiamiento y posventa de vehículos de gama alta y lujo (BMW Group).
- **Entidades de negocio:** `modelos`, `vehiculos`, `clientes`, `vendedores`, `ventas` (+ `usuarios`).

---

## 1. Planteamiento del Problema Empresarial

En la industria de distribución automotriz de lujo, los concesionarios enfrentan desafíos operativos de alta criticidad financiera y reputacional:

1. **Riesgo de sobreventa o doble asignación de inventario:** Cada vehículo BMW es una unidad de alto valor monetario individual (desde $45,000 USD hasta más de $150,000 USD en la gama BMW M y ediciones como el X5 M E70). La comercialización de una misma unidad física a más de un cliente genera contingencias legales, indemnizaciones y pérdida de prestigio de marca.
2. **Falta de estandarización en especificaciones técnicas:** Los catálogos de BMW abarcan múltiples carrocerías (Sedán, Gran Coupé, SUV / SAV, Sports Activity Coupé), tipos de combustible (Gasolina, Diésel, Mild-Hybrid, 100% Eléctrico BMW i) y transmisiones (Steptronic de 8 velocidades, M Steptronic con Drivelogic). La dispersión manual de datos provoca cotizaciones erróneas.
3. **Pérdida de trazabilidad por número de chasis (VIN):** Cada vehículo posee un identificador global único de 17 caracteres alfanuméricos normado por la ISO 3779. Los errores de captura provocan problemas de importación, matriculación y validación de garantías.
4. **Desconexión entre el equipo comercial y la cartera de clientes:** La asignación informal de clientes a asesores de ventas impide auditar comisiones, evaluar el desempeño de ventas y medir el volumen facturado en tiempo real.
5. **Vulnerabilidad en el control transaccional:** La actualización manual de hojas de cálculo durante el cierre de una venta no ofrece aislamiento ni atomicidad (ACID), permitiendo estados inconsistentes como vehículos entregados que figuran como "Disponibles" o ventas canceladas donde la unidad nunca se reintegra al inventario.

---

## 2. Solución Integral Implementada

**BMW Premium Motors** resuelve de forma automatizada y centralizada cada uno de los dolores de negocio mediante una arquitectura Full Stack robusta, con base de datos relacional MySQL y reglas de negocio respaldadas a nivel de motor de base de datos y API REST.

### 2.1 Módulos y Entidades Empresariales

#### A. Catálogo Técnico de Modelos (`modelos`)
- **Propósito:** Estandarizar la nomenclatura oficial de la gama BMW (ej. *BMW Serie 3 Sedán*, *BMW M3 Competition*, *BMW X5 M E70*, *BMW i4 eDrive40*).
- **Atributos:** Nombre único (`uq_modelos_nombre`), tipo de carrocería, combustible, transmisión y descripción comercial.
- **Impacto de negocio:** Elimina discrepancias en fichas técnicas y permite a los asesores cotizar sobre especificaciones homologadas por la casa matriz.

#### B. Inventario y Control de Unidades Físicas (`vehiculos`)
- **Propósito:** Trazabilidad unitaria de cada unidad en piso o en tránsito.
- **Atributos:** Clave foránea al modelo técnico (`id_modelo`), número VIN único de 17 caracteres (`CHAR(17)` validado por expresión regular y restricción `CHECK`), año (`YEAR`), color, kilometraje, precio en USD (`DECIMAL(12,2)` positivo) y estado operativo (`Disponible`, `Reservado`, `Vendido`).
- **Impacto de negocio:** Prohíbe terminantemente marcar manualmente una unidad como "Vendido", reservando dicho cambio de estado a una operación de venta real. Garantiza inventario en tiempo real para showroom y sala de ventas.

#### C. Cartera de Clientes Exclusivos (`clientes`)
- **Propósito:** Expediente comercial de prospectos y compradores.
- **Atributos:** Documento de identificación único (`identificacion`), nombre, apellidos, teléfono corporativo, correo electrónico y dirección.
- **Impacto de negocio:** Garantiza unicidad por cliente, evita duplicidad de leads y proporciona un historial consolidado de vehículos adquiridos a lo largo de su ciclo de vida con la marca.

#### D. Equipo de Asesores Comerciales (`vendedores`)
- **Propósito:** Gestión y auditoría de la fuerza de ventas especializada en producto BMW.
- **Atributos:** Nombre, apellidos, teléfono, correo corporativo único (`uq_vendedores_correo`) y fecha formal de contratación.
- **Impacto de negocio:** Cálculo automatizado de volumen de ventas cerradas e ingresos brutos generados en USD, facilitando esquemas de comisiones transparentes y métricas de desempeño.

#### E. Registro Transaccional de Ventas (`ventas`)
- **Propósito:** Liquidación y formalización legal de la venta de un vehículo BMW a un cliente por medio de un asesor.
- **Atributos:** `id_vehiculo` (con restricción `UNIQUE`, garantizando a nivel de base de datos que un vehículo solo pueda venderse una vez), `id_cliente`, `id_vendedor`, `fecha_venta`, `precio_venta` y observaciones.
- **Impacto de negocio:**
  - **Atomicidad y Bloqueo Pesimista:** Al registrar una venta, se abre una transacción SQL (`BEGIN`), se bloquea el registro del vehículo con `SELECT ... FOR UPDATE`, se comprueba que esté en estado `Disponible`, se inserta la venta y se actualiza `vehiculos.estado = 'Vendido'` antes del `COMMIT`.
  - **Reversión Automática:** Si la venta se cancela o elimina, la transacción devuelve el vehículo al estado `Disponible`.
  - **Intercambio Seguro:** Si se edita la venta para cambiar de unidad, la unidad anterior se libera a `Disponible` y la nueva se bloquea como `Vendido` previniendo condiciones de carrera (*race conditions*) y *deadlocks*.

---

## 3. Justificación Económica y Operativa

1. **Disminución a cero de incidentes de sobreventa:** Gracias a la restricción `uq_ventas_vehiculo` y al bloqueo `FOR UPDATE`.
2. **Protección de márgenes y auditoría de precios:** Validación estricta de importes positivos y conservación histórica del precio pactado en la venta, independiente de futuras fluctuaciones en el precio de lista del vehículo.
3. **Escalabilidad y Seguridad:** Incorporación de acceso protegido con JSON Web Tokens (`HS256`, 1 hora de vigencia), cifrado `bcrypt` de 12 rondas y almacenamiento de sesión seguro en memoria de React, protegiendo los datos patrimoniales y comerciales del concesionario contra accesos no autorizados y ataques XSS/CSRF.

