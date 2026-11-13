# ADR-0001: BMW Genius AI usa DeepSeek en el backend con contexto vivo de negocio

- Estado: Aceptado
- Fecha: 2026-11-13
- Decide: Equipo técnico del proyecto y responsable de negocio del concesionario

## Contexto

El sistema necesita un asistente para responder preguntas de inventario, ventas, finanzas, servicio técnico y atención comercial. La IA debe trabajar sobre información corporativa en tiempo real, sin exponer secretos ni permitir decisiones definitivas sin revisión humana. El modelo debe poder operar en español, mantener contexto empresarial y mantenerse operativo en un entorno con datos sensibles de clientes, vehículos y operaciones.

## Decisión

El proyecto usa el modelo `deepseek-chat` del proveedor DeepSeek a través del endpoint `https://api.deepseek.com/chat/completions`, invocado solo desde el backend de Node.js en `backend/src/services/aiService.js`. La llave se gestiona con la variable de entorno `DEEPSEEK_API_KEY`, y el modelo se configura con `DEEPSEEK_MODEL` (valor por defecto `deepseek-chat`). El sistema construye un prompt con datos en vivo del concesionario extraídos de MySQL y luego envía el texto del usuario y el historial limitado al proveedor.

La integración no se realiza desde el navegador ni desde el cliente React; la llamada se hace en el servidor para evitar exposición de secretos, cumplir con la política de CORS y permitir control de auditoría. El objetivo es asistir en tareas de consulta, resumen, recomendación y preparación de propuestas, no supervisar decisiones legales ni financieras definitivas.

## Alternativas descartadas

- No usar IA: se descartó porque el proyecto ya incluye un asistente empresarial y una necesidad clara de ayuda operativa y comercial.
- Llamar a DeepSeek desde el frontend: se descartó porque implicaría exponer la API key y comprometer la seguridad de la solución.
- Usar otro proveedor de IA sin contexto empresarial: se descartó por falta de evidencia de uso real en este repositorio y por no adaptarse a la arquitectura actual.

## Consecuencias

Se gana velocidad en la consulta de inventario, análisis de datos, preparación de propuestas y soporte comercial. La dependencia del proveedor externo queda clara, y hay riesgo de costo, latencia y disponibilidad. La implementación actual no establece un límite explícito de costo por sesión ni en la infraestructura, por lo que ese punto queda pendiente de confirmar con el responsable del negocio.

El mayor riesgo operativo es que la IA responda con información incorrecta o insuficientemente validada; por eso se exige revisión humana. Si DeepSeek falla o la API cambia, la funcionalidad del asistente se degrada y el sistema sigue sin ejecutar decisiones operativas sin aprobación.

## Cómo se verifica

La decisión se puede verificar en:

- `backend/src/services/aiService.js` — llamadas a la API de DeepSeek.
- `backend/.env.example` — variables `DEEPSEEK_API_KEY` y `DEEPSEEK_MODEL`.
- `backend/src/controllers/aiController.js` — endpoints del asistente IA.
- `frontend/src/pages/AsistenteIA.jsx` — consumo del asistente desde la interfaz.
- `backend/src/app.js` — protección JWT para las rutas de IA.

