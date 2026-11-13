# Registro de riesgos

El nivel de riesgo se calcula como `Probabilidad × Impacto`, usando una escala consistente de 1 a 5. Se aplica la siguiente clasificación:

- 1 a 4: Bajo
- 5 a 9: Medio
- 10 a 14: Alto
- 15 a 25: Crítico

## Matriz de riesgos

| # | Riesgo | Categoría | Descripción | Probabilidad (1-5) | Impacto (1-5) | Nivel de riesgo | Medidas preventivas | Plan de mitigación | Responsable | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Filtración de datos personales | Seguridad y privacidad | La información de clientes, vendedores o usuarios podría exponerse por acceso indebido, logs o mal manejo de datos. | 3 | 5 | 15 (Crítico) | JWT sobre rutas protegidas, control de acceso por roles y mínima exposición en backend | Revisar permisos, limitar logs y aplicar revisión periódica de accesos | Administrador del sistema | En curso |
| R2 | Exposición de credenciales o API keys | Seguridad | La clave de DeepSeek o las credenciales de la base de datos podrían quedar expuestas en el código o en logs. | 2 | 5 | 10 (Alto) | Variables de entorno en servidor, `.env.example` y no se almacenan secretos reales en el repo | Revisar variables de entorno, rotar claves y prohibir commits con secretos | Responsable técnico | En curso |
| R3 | Uso de datos sin autorización | Privacidad y cumplimiento | Un usuario o un proceso podría consultar información del negocio o de clientes sin autorización. | 3 | 4 | 12 (Alto) | Autenticación y middleware `authMiddleware` sobre rutas empresariales | Revisión de permisos, auditoría y políticas por rol | Administrador del sistema | En curso |
| R4 | Respuestas incorrectas o inventadas por la IA | IA y calidad | El asistente puede responder con información no verificada, inventada o poco precisa. | 4 | 4 | 16 (Crítico) | Contexto en vivo desde MySQL y revisión humana antes de decisiones relevantes | Validar contenido con responsable de negocio y mantener console de errores | Responsable de IA / negocio | En curso |
| R5 | Sesgos en resultados generados | IA y equidad | La IA puede producir recomendaciones sesgadas según el contexto o la forma del prompt. | 3 | 4 | 12 (Alto) | Contexto acotado y revisión humana de salidas comerciales | Evaluar sesgos, limitar alcance y no automatizar decisiones clave | Responsable de negocio | Pendiente |
| R6 | Decisiones automatizadas incorrectas | Operación | La IA podría ejecutar o recomendar decisiones operativas sin revisión del negocio. | 2 | 5 | 10 (Alto) | Esta solución no ejecuta transacciones operativas; requiere validación humana | Mantener siempre aprobación humana y trazabilidad | Gerencia / ventas | En curso |
| R7 | Dependencia de proveedores externos | Operación y continuidad | La disponibilidad del proveedor de IA o de la API puede impactar al asistente. | 4 | 4 | 16 (Crítico) | Integración solo desde backend y manejo de errores en el servicio | Definir estrategia de fallback, monitoreo y revisión de SLA | Responsable técnico | En curso |
| R8 | Indisponibilidad de servicios | Disponibilidad | La base de datos o la API de IA pueden caerse y dejar sin servicio al sistema. | 3 | 4 | 12 (Alto) | Healthcheck de backend y validación de conexión a MySQL | Monitoreo básico y planeación de continuidad | Administrador del sistema | Pendiente |
| R9 | Accesos no autorizados | Seguridad | Un actor no autorizado podría acceder a endpoints protegidos o a sesiones activas. | 3 | 5 | 15 (Crítico) | JWT, factores de seguridad y CORS controlado | Revisión de políticas por rol, rotación de credenciales y auditoría | Administrador del sistema | En curso |
| R10 | Falta de trazabilidad | Auditoría | No poder identificar qué usuario, qué dato o qué respuesta generó la IA en un momento dado. | 3 | 4 | 12 (Alto) | Registro de auditoría y control de actividades del sistema | Definir políticas de retención y trazabilidad para prompts y respuestas | Responsable técnico | Pendiente |
| R11 | Pérdida o eliminación accidental de información | Integridad | Un cambio erróneo o una operación manual podría borrar registros importantes. | 3 | 5 | 15 (Crítico) | Control de rutas sensibles, no permitir acciones destructivas sin aprobación | Copias de seguridad, revisión manual y políticas de restauración | Administrador del sistema | Pendiente |
| R12 | Costos inesperados por consumo de IA | Finanzas | El uso masivo del asistente puede elevar los costos del proveedor de IA. | 3 | 3 | 9 (Medio) | En la implementación actual no existe un tope configurable de costo por sesión | Definir límites, alertas y monitoreo financiero del proveedor | Responsable técnico / finanzas | Pendiente |

## Criterios utilizados

- Probabilidad: 1 = rara, 5 = muy probable.
- Impacto: 1 = leve, 5 = crítico para seguridad, operación, cumplimiento o continuidad.
- Nivel de riesgo: se calcula como `Probabilidad × Impacto`.
- Las categorías se interpretan como: bajo = riesgo manejable con control operativo, medio = requiere seguimiento, alto = requiere mitigación urgente, crítico = requiere revisión inmediata del responsable.

## Observaciones y pendientes

- La clasificación se basa en la arquitectura actual del repositorio y en las rutas de acceso, no en una auditoría de terceros.
- La retención de datos, la política de backups y la trazabilidad completa de IA requieren confirmación del responsable de infraestructura y del responsable de datos.
- Se recomienda revisar estos riesgos antes de ampliar el uso del asistente a clientes externos o a procesos con impacto regulatorio.
