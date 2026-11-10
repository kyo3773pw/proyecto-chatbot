# Carga de un evento desde texto pegado (LLM)
Estado: acordado (2026-11-09)

**Problema:** el admin copia el texto de un post o póster y quiere el evento listo para revisar, sin tipear campo por campo.

**Ejemplos:**
1. Pego el texto del post de CONALL → formulario prellenado (nombre, type=congreso, 2026-11-09 a 2026-11-13, Auditorio Magno UNA Puno…) → reviso → Guardar → evento creado.
2. El LLM devuelve una fecha o un enlace que no aparece en el texto → ese campo se marca "no aparece en el texto" para revisarlo.
3. El texto no describe un evento, o el LLM falla o se agotó el límite → mensaje claro; el formulario sigue usable a mano.

**Reglas:** solo admins. El LLM solo propone: nada se guarda sin pulsar Guardar, y se guarda por `POST /api/admin/events` (mismas validaciones). Lo que el texto no dice queda vacío. `fecha_captura` = hoy y `origen` = real por defecto. Proveedor: Gemini Flash-Lite vía `fetch`; clave y modelo en `.env` (`GEMINI_API_KEY`, `LLM_MODEL`). Verificación por código: URLs, correos y teléfonos deben aparecer tal cual en el texto; en fechas, el día y el mes (en número o nombre).

**Fuera de alcance:** imágenes, varios eventos por post, otros proveedores, completar `fuente_url` (la pega el admin), editar eventos existentes.

**Listo cuando:**
- Test con el LLM simulado (sin red): el endpoint devuelve los campos y marca los datos que no aparecen en el texto.
- No admin → 403; texto vacío → 400; LLM caído o sin clave → error claro (no 500 genérico).
- Pego un post real en la página, reviso y guardo.
