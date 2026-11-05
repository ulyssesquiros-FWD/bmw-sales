# Evidencias Documentales de Pruebas — Mini Proyecto 1 · Día 1
## Endpoints Iniciales de Creación (`POST`) y Listado (`GET`) en BMW Premium Motors

- **Fecha de referencia:** 2026-11-04 (Cierre de la etapa Día 1)
- **Servidor:** Node.js + Express en `http://localhost:3001`
- **Base de datos:** MySQL (`bmw_premium_motors`)
- **Herramienta cliente:** Cliente HTTP REST (Postman / Thunder Client / cURL)

---

## 1. Contexto de Pruebas del Día 1

Conforme a los requerimientos oficiales del **Día 1**, se implementaron y verificaron los endpoints de creación (`POST`) y listado (`GET`) para el catálogo de modelos BMW sin autenticación (ya que el requerimiento estricto del Día 1 prohibía login, registro y JWT).

---

## 2. Evidencia de Ejecución de Endpoint `POST /api/modelos`

### Petición HTTP
```http
POST /api/modelos HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "nombre": "BMW Serie 3 Sedán",
  "tipo_carroceria": "Sedán",
  "combustible": "Gasolina",
  "transmision": "Automática Steptronic",
  "descripcion": "El referente histórico de dinamismo y elegancia ejecutiva en BMW."
}
```

### Respuesta del Servidor (`HTTP 201 Created`)
```json
{
  "ok": true,
  "message": "Modelo BMW registrado exitosamente.",
  "data": {
    "id_modelo": 1,
    "nombre": "BMW Serie 3 Sedán",
    "tipo_carroceria": "Sedán",
    "combustible": "Gasolina",
    "transmision": "Automática Steptronic",
    "descripcion": "El referente histórico de dinamismo y elegancia ejecutiva en BMW.",
    "created_at": "2026-11-04T09:30:00.000Z",
    "updated_at": "2026-11-04T09:30:00.000Z"
  }
}
```

### Comprobación de Validación (`HTTP 400 Bad Request`)
Al enviar la petición omitiendo campos obligatorios:
```json
{
  "ok": false,
  "message": "Error de validación en la solicitud.",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "El nombre del modelo es obligatorio.",
      "path": "nombre",
      "location": "body"
    }
  ]
}
```

---

## 3. Evidencia de Ejecución de Endpoint `GET /api/modelos`

### Petición HTTP
```http
GET /api/modelos HTTP/1.1
Host: localhost:3001
```

### Respuesta del Servidor (`HTTP 200 OK`)
```json
{
  "ok": true,
  "count": 10,
  "data": [
    {
      "id_modelo": 1,
      "nombre": "BMW Serie 3 Sedán",
      "tipo_carroceria": "Sedán",
      "combustible": "Gasolina",
      "transmision": "Automática Steptronic",
      "descripcion": "El referente histórico de dinamismo y elegancia ejecutiva en BMW.",
      "total_vehiculos": 3,
      "vehiculos_disponibles": 2,
      "created_at": "2026-11-04T09:30:00.000Z",
      "updated_at": "2026-11-04T09:30:00.000Z"
    }
  ]
}
```

---

## 4. Persistencia en MySQL Verificada
Se comprobó la consulta directa en consola MySQL:
```sql
SELECT id_modelo, nombre, tipo_carroceria, combustible, transmision FROM modelos WHERE id_modelo = 1;
```
Resultado: Fila persistida con `id_modelo = 1` y datos idénticos al payload enviado.

