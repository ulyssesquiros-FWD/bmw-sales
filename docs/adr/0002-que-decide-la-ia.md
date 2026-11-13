# ADR-0002: La IA asesora; la persona decide, valida y autoriza

- Estado: Aceptado
- Fecha: 2026-11-13
- Decide: Responsable de negocio del concesionario y equipo técnico

## Contexto

BMW Premium Motors integra un asistente de IA para consultas de inventario, diagnóstico comercial, sugerencias de modelos, recomendaciones de financiamiento y soporte de atención. El asistente puede consultar datos operativos del negocio en tiempo real, pero el sistema no debe automatizar decisiones legales, financieras, de ventas críticas o de eliminación de información sin supervisión humana.

## Decisión

| Acción | Qué puede hacer la IA | Qué requiere aprobación humana | Responsable |
| --- | --- | --- | --- |
| Consulta de inventario y métricas | Analizar disponibilidad, precios, kilometraje, modelos y operaciones del concesionario; preparar resúmenes ejecutivos. | Cualquier uso de la información para decisiones comerciales o de inversión. | Operador comercial / gerente |
| Resumen de información empresarial | Clasificar, resumir, comparar y estructurar información de ventas, cliente, gestión y operación. | Revisión antes de compartirlo con clientes, proveedores o dirección. | Responsable de negocio |
| Generación de propuestas y borradores | Preparar mensajes de venta, propuestas de oferta, borradores de respuesta y recomendaciones iniciales. | Aprobación antes de enviar mensajes o propuestas oficiales. | Asesor comercial / gerente |
| Recomendación de vehículos o financiamiento | Sugerir modelos, configuraciones y lineamientos comerciales basados en inventario y contexto del negocio. | Aprobación antes de cerrar una oferta o comprometer un acuerdo. | Gerencia / ventas |
| Documentos internos | Redactar apuntes, resúmenes, propuestas preliminares y escenarios de negocio. | Validación del contenido antes de convertirse en decisión oficial o documento externo. | Responsable del área |
| Eliminación o modificación de datos críticos | No debe ejecutar acciones de borrado ni corrección masiva de registros críticos. | Autorización explícita y validación del efecto antes de eliminar o modificar. | Administrador del sistema |
| Operaciones sensibles | No puede ejecutar cambios de inventario, ventas, garantías, facturas, pagos ni autorizaciones. | Aprobación humana obligatoria antes de cualquier acción operativa real. | Gerencia y administrador |
| Decisiones legales o financieras definitivas | No debe decidir responsabilidades legales, descuentos definitivos, condiciones contractuales ni ejecución de pagos. | Revisión humana y aprobación formal por parte de la persona responsable. | Dirección / legal / finanzas |

Quedan establecidas las siguientes reglas obligatorias:

- La IA no debe tomar decisiones legales ni financieras definitivas por cuenta propia.
- La IA no debe eliminar información crítica sin autorización explícita del responsable correspondiente.
- La IA no debe enviar comunicaciones oficiales ni propuestas firmes sin aprobación humana cuando corresponda.
- La IA no debe ejecutar operaciones sensibles, como modificar inventario, ventas, garantías o facturas, sin aprobación.
- Las personas conservan la responsabilidad sobre las decisiones finales.
- Debe existir trazabilidad de las acciones relevantes: quién solicitó la información, qué respuesta generó la IA y quién la validó.

## Alternativas descartadas

- Dejar que la IA decida ventas o cambios de inventario sin validación: se descartó por riesgo de error, fraude, pérdida de control operativo y responsabilidad legal.
- Dejar que la IA genere mensajes oficiales directamente: se descartó por riesgo de comunicaciones no autorizadas.
- Utilizar IA sin supervisión para operaciones sensibles: se descartó por su impacto en clientes, negocio y auditoría.

## Consecuencias

La automatización de IA se mantiene segura, transparente y controlada. El costo es un mayor tiempo de revisión por parte de personas, pero se evita la ejecución accidental de decisiones con impacto legal, comercial o operativo. El sistema conserva la trazabilidad y la autoridad final en el negocio.

## Cómo se verifica

La verificación se hace observando que:

- Las rutas de IA en `backend/src/app.js` están protegidas con JWT.
- El controlador de IA en `backend/src/controllers/aiController.js` solo expone chat, sugerencias y estado, no acciones destructivas ni transacciones financieras.
- El frontend en `frontend/src/pages/AsistenteIA.jsx` muestra al usuario interacción de consulta y recomendación, no ejecución real de negocio.
- Los ADR y este documento quedan como referencia para cualquier modificación posterior de la autonomía de la IA.

